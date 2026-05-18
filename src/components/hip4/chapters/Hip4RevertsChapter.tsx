import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="mb-6">
      <Hip4SectionTitle className="!normal-case !text-[11px] !tracking-normal !text-text-tertiary">
        {title}
      </Hip4SectionTitle>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-md border border-border-subtle bg-surface/20 px-2 py-1 text-[11px] text-text-primary"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hip4RevertsChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <p className="mb-6 text-xs text-text-secondary">
          <strong>V1</strong> strings from bytecode on the V1 address.{" "}
          <strong>V2</strong> from <code className="text-[11px]">HIP4Contest.sol</code> (wording may
          differ, e.g. “Invalid proof”).
        </p>

        <TagGroup
          title="V2 — OpenZeppelin / guards"
          tags={[
            "EnforcedPause",
            "ExpectedPause",
            "ReentrancyGuardReentrantCall",
            "OwnableUnauthorizedAccount",
          ]}
        />
        <TagGroup
          title="Contest management"
          tags={[
            "Contest already exists",
            "Contest does not exist",
            "Contest already finalized",
            "Contest not finalized",
          ]}
        />
        <TagGroup
          title="Deposits"
          tags={["Deposit deadline passed", "Already deposited for this round", "Incorrect entry fee"]}
        />
        <TagGroup
          title="Merkle / claims"
          tags={[
            "Invalid proof",
            "Already claimed",
            "No merkle root",
            "Merkle root already published",
            "Reward pool exceeds total pool",
          ]}
        />
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
