export interface Token {
    name: string
    logo: string | null
    price: number
    marketCap: number
    volume: number
    change24h: number
    liquidity: number
    supply: number
}

export interface PerpToken {
    name: string
    logo?: string | null
    price: number
    change24h: number
    volume: number
    marketCap: number
    openInterest: number
    funding: number
    maxLeverage: number
    onlyIsolated: boolean
}

export interface Auction {
    time: number
    deployer: string
    name: string
    deployGas: string
}

export interface GasAuction {
    startTimeSeconds: number
    durationSeconds: number
    startGas: string
    currentGas: string | null
    endGas: string
}

export interface AuctionState {
    states: any[]
    gasAuction: GasAuction
}

export interface AuctionHistory {
    time: number
    deployer: string
    name: string
    deployGas: string
    tokenId: string
}

export interface CurrentAuction {
    startTime: number
    endTime: number
    startGas: string
    endGas: string
}

export interface NextAuction {
    startTime: number
    startGas: string
}

export interface AuctionInfo {
    currentAuction: CurrentAuction
    nextAuction: NextAuction
} 