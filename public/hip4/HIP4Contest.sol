// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title HIP4Contest
/// @notice Parimutuel prediction market / contest system on Hyperliquid's HyperEVM.
///         Users deposit native HYPE into contest sides, winners are determined off-chain,
///         and payouts are distributed via merkle proofs.
contract HIP4Contest is Ownable2Step, ReentrancyGuard, Pausable {

    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    struct Contest {
        uint256 entryFee;      // slot+0: fixed entry fee in native HYPE
        uint256 totalPool;     // slot+1: sum of all deposits
        uint256 totalPaidOut;  // slot+2: sum of all claims + fee withdrawals
        bool    isFinalized;   // slot+3: set once contest outcome is determined
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event ContestCreated(uint256 contestId, uint256 entryFee);
    event ContestFinalized(uint256 contestId);
    event Deposit(uint256 contestId, uint256 sideId, address user, uint256 amount);
    event Claimed(uint256 contestId, uint256 sideId, address recipient, uint256 amount);
    event Refunded(uint256 contestId, uint256 sideId, address user, uint256 amount);
    event MerkleRootPublished(uint256 contestId, bytes32 merkleRoot, uint256 rewardPool);
    event FeesWithdrawn(uint256 contestId, uint256 amount);

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    mapping(uint256 => Contest) public contests;
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public deposits;
    mapping(uint256 => bytes32) public merkleRoots;
    mapping(uint256 => uint256) private _rewardPools;
    mapping(uint256 => mapping(uint256 => uint256)) private _claimedBitmap;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address initialOwner) Ownable(initialOwner) {}

    // -------------------------------------------------------------------------
    // Owner-only: contest lifecycle
    // -------------------------------------------------------------------------

    function createContest(uint256 contestId, uint256 entryFee) external onlyOwner {
        require(contests[contestId].entryFee == 0, "Contest already exists");
        require(entryFee > 0, "Entry fee must be > 0");

        contests[contestId] = Contest({
            entryFee: entryFee,
            totalPool: 0,
            totalPaidOut: 0,
            isFinalized: false
        });

        emit ContestCreated(contestId, entryFee);
    }

    function finalizeContest(uint256 contestId) external onlyOwner {
        Contest storage c = contests[contestId];
        require(c.entryFee > 0, "Contest does not exist");
        require(!c.isFinalized, "Contest already finalized");

        c.isFinalized = true;
        emit ContestFinalized(contestId);
    }

    function publishMerkleRoot(
        uint256 contestId,
        bytes32 merkleRoot,
        uint256 rewardPool
    ) external onlyOwner {
        Contest storage c = contests[contestId];
        require(c.isFinalized, "Contest not finalized");
        require(merkleRoots[contestId] == bytes32(0), "Merkle root already published");
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        require(rewardPool <= c.totalPool, "Reward pool exceeds total pool");

        merkleRoots[contestId] = merkleRoot;
        _rewardPools[contestId] = rewardPool;

        emit MerkleRootPublished(contestId, merkleRoot, rewardPool);
    }

    // -------------------------------------------------------------------------
    // Owner-only: financial operations
    // -------------------------------------------------------------------------

    function withdrawPlatformFee(
        uint256 contestId,
        uint256 amount
    ) external onlyOwner nonReentrant whenNotPaused {
        Contest storage c = contests[contestId];
        require(c.isFinalized, "Contest not finalized");
        require(merkleRoots[contestId] != bytes32(0), "Merkle root not published");
        require(amount > 0, "Fee amount must be > 0");

        uint256 platformCut = c.totalPool - _rewardPools[contestId] - c.totalPaidOut;
        require(amount <= platformCut, "Fee exceeds platform cut");

        c.totalPaidOut += amount;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");

        emit FeesWithdrawn(contestId, amount);
    }

    function refund(
        uint256 contestId,
        uint256 sideId,
        address user
    ) external onlyOwner nonReentrant whenNotPaused {
        _refund(contestId, sideId, user, user);
    }

    function refundTo(
        uint256 contestId,
        uint256 sideId,
        address user,
        address recipient
    ) external onlyOwner nonReentrant whenNotPaused {
        _refund(contestId, sideId, user, recipient);
    }

    // -------------------------------------------------------------------------
    // Owner-only: pause
    // -------------------------------------------------------------------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function renounceOwnership() public pure override {
        revert("Renounce disabled");
    }

    // -------------------------------------------------------------------------
    // Public: user actions
    // -------------------------------------------------------------------------

    function deposit(
        uint256 contestId,
        uint256 sideId,
        uint256 deadline
    ) external payable whenNotPaused {
        require(block.timestamp <= deadline, "Deposit deadline passed");

        Contest storage c = contests[contestId];
        require(c.entryFee > 0, "Contest does not exist");
        require(!c.isFinalized, "Contest already finalized");
        require(msg.value == c.entryFee, "Incorrect entry fee");
        require(deposits[contestId][sideId][msg.sender] == 0, "Already deposited for this round");

        deposits[contestId][sideId][msg.sender] = msg.value;
        c.totalPool += msg.value;

        emit Deposit(contestId, sideId, msg.sender, msg.value);
    }

    function claim(
        uint256 contestId,
        uint256 index,
        address recipient,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant whenNotPaused {
        require(!_isClaimed(contestId, index), "Already claimed");
        require(merkleRoots[contestId] != bytes32(0), "No merkle root");

        bytes32 leaf = keccak256(abi.encodePacked(index, recipient, amount));
        require(
            MerkleProof.verify(merkleProof, merkleRoots[contestId], leaf),
            "Invalid proof"
        );

        _setClaimed(contestId, index);

        Contest storage c = contests[contestId];
        c.totalPaidOut += amount;

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");

        emit Claimed(contestId, index, recipient, amount);
    }

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    function getDeposit(
        uint256 contestId,
        uint256 sideId,
        address user
    ) external view returns (uint256) {
        return deposits[contestId][sideId][user];
    }

    function getContestPool(uint256 contestId) external view returns (uint256) {
        return contests[contestId].totalPool;
    }

    function getTotalPaidOut(uint256 contestId) external view returns (uint256) {
        return contests[contestId].totalPaidOut;
    }

    function contestRewardPools(uint256 contestId) external view returns (uint256) {
        return _rewardPools[contestId];
    }

    function isClaimed(uint256 contestId, uint256 index) external view returns (bool) {
        return _isClaimed(contestId, index);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    function _refund(
        uint256 contestId,
        uint256 sideId,
        address user,
        address recipient
    ) internal {
        uint256 amount = deposits[contestId][sideId][user];
        require(amount > 0, "No deposit");

        deposits[contestId][sideId][user] = 0;

        Contest storage c = contests[contestId];
        c.totalPool -= amount;

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");

        emit Refunded(contestId, sideId, user, amount);
    }

    function _isClaimed(uint256 contestId, uint256 index) internal view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = _claimedBitmap[contestId][wordIndex];
        uint256 mask = 1 << bitIndex;
        return word & mask != 0;
    }

    function _setClaimed(uint256 contestId, uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        _claimedBitmap[contestId][wordIndex] |= 1 << bitIndex;
    }
}
