"use client";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHead, KpiRibbon, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumHead } from "@/services/elysium";
import { SNAPSHOT_BASE, SNAPSHOT_POINTER, useElysiumSnapshots } from "@/services/elysium/snapshots";
import { EMPTY, Empty, ExtLink, ago, useNow } from "./shared";

const gb = (bytes: number) => `${(bytes / 1e9).toFixed(1)} GB`;

// Commands below are copied as published in the snapshot documentation.
const NITRO_FLAGS = `--init.latest=archive
--init.latest-base=${SNAPSHOT_BASE}/`;

const DOCKER_RUN = `docker run -d --name elysium-node \\
  -v elysium-data:/home/user/.arbitrum \\
  -v "$PWD/chainInfo.json:/config/chainInfo.json:ro" \\
  -p 127.0.0.1:8547:8547 -p 127.0.0.1:8546:8546 \\
  offchainlabs/nitro-node:v3.9.5-66e42c4 \\
  --conf.file=/config/chainInfo.json \\
  --init.latest=archive \\
  --init.latest-base=${SNAPSHOT_BASE}/ \\
  --init.download-path=/home/user/.arbitrum/snapshot-download \\
  --node.staker.enable=false \\
  --execution.forwarding-target=https://rpc-elysium-testnet.t.conduit.xyz \\
  --node.feed.input.url=wss://relay-elysium-testnet.t.conduit.xyz/ \\
  --parent-chain.connection.url=https://rpc.hyperliquid-testnet.xyz/evm \\
  --node.inbox-reader.max-blocks-to-read=1000 \\
  --node.dangerous.disable-blob-reader \\
  --node.data-availability.enable \\
  --node.data-availability.rest-aggregator.enable \\
  --node.data-availability.rest-aggregator.urls=https://das-elysium-testnet.t.conduit.xyz \\
  --execution.caching.archive \\
  --http.addr=0.0.0.0 --http.api=net,web3,eth --http.vhosts=* --http.corsdomain=* \\
  --ws.addr=0.0.0.0 --ws.port=8546 --ws.api=net,web3,eth --ws.origins=*`;

const MANUAL = `BASE=${SNAPSHOT_BASE}
SNAPSHOT=$(curl -s $BASE/conduit-orbit-deployer/latest-archive.txt)
curl -O $BASE/$SNAPSHOT
echo "$(curl -s $BASE/$SNAPSHOT.sha256)  $SNAPSHOT" | sha256sum -c -
mkdir -p data/conduit-orbit-deployer/nitro
tar -xf $SNAPSHOT -C data/conduit-orbit-deployer/nitro
sudo chown -R 1000:1000 data   # the Nitro image runs as uid 1000
rm $SNAPSHOT`;

const CHAIN_INFO = "https://api.conduit.xyz/file/v1/arbitrum/chaininfo/elysium-testnet";

function Code({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-text-secondary border-b border-border-subtle">
        {title}
        <CopyButton text={children} className="ml-auto" />
      </div>
      <pre className="overflow-x-auto p-3 text-[11.5px] leading-relaxed mono text-text-secondary scrollbar-brand" tabIndex={0}>
        <code className="mono">{children}</code>
      </pre>
    </div>
  );
}

/**
 * Elysium · Run a node: the daily archive snapshot a new node can bootstrap
 * from instead of replaying every batch since genesis. Read live from the
 * public snapshot bucket; the head comes from the public RPC.
 */
export function ElysiumNode() {
  const { format } = useNumberFormat();
  const now = useNow(30_000);
  const { data, error } = useElysiumSnapshots();
  const { data: head } = useElysiumHead();
  const latest = data?.latest ?? null;
  const behind = latest && head ? Math.max(0, head - latest.block) : null;

  const cells: KpiCell[] = [
    {
      key: "block",
      label: "Latest snapshot",
      value: latest ? `#${formatNumber(latest.block, format, { maximumFractionDigits: 0 })}` : "…",
      sub: data?.latestBlockMs ? `block time ${ago(data.latestBlockMs, now)} ago` : undefined,
    },
    { key: "pub", label: "Published", value: latest ? `${ago(latest.publishedMs, now)} ago` : "…", sub: "daily, around 03:30 Paris" },
    { key: "size", label: "Archive size", value: latest ? gb(latest.sizeBytes) : "…", sub: latest ? `plan ~${gb(latest.sizeBytes * 2)} free disk` : undefined },
    {
      key: "catch",
      label: "Left to sync",
      value: behind != null ? `${compactCount(behind)} blocks` : "…",
      sub: "from snapshot to current head",
    },
  ];

  return (
    <div className="space-y-4">
      {error && !data ? (
        <Card>
          <Empty>The snapshot bucket is unreachable right now.</Empty>
        </Card>
      ) : null}
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Available archives" tag="last 2 kept" />
          <div className="overflow-x-auto">
            {!data ? (
              <Empty>Loading…</Empty>
            ) : (
              <table className="w-full mono text-[12px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                    <th className="text-left font-semibold px-3.5 py-2">Block</th>
                    <th className="text-right font-semibold px-2 py-2">Size</th>
                    <th className="text-right font-semibold px-2 py-2 hidden sm:table-cell">Published</th>
                    <th className="text-right font-semibold px-3.5 py-2">Files</th>
                  </tr>
                </thead>
                <tbody>
                  {data.files.map((f) => (
                    <tr key={f.name} className="border-t border-border-subtle">
                      <td className="px-3.5 py-1.5 text-text-primary whitespace-nowrap">
                        #{formatNumber(f.block, format, { maximumFractionDigits: 0 })}
                        {f.name === latest?.name ? <span className="ml-2 text-[10px] text-success">latest</span> : null}
                      </td>
                      <td className="px-2 py-1.5 text-right text-text-secondary">{gb(f.sizeBytes)}</td>
                      <td className="px-2 py-1.5 text-right text-text-tertiary whitespace-nowrap hidden sm:table-cell">{ago(f.publishedMs, now)} ago</td>
                      <td className="px-3.5 py-1.5 text-right whitespace-nowrap">
                        <ExtLink href={`${SNAPSHOT_BASE}/${f.name}`} className="text-text-secondary">.tar</ExtLink>
                        <span className="text-text-tertiary"> · </span>
                        <ExtLink href={`${SNAPSHOT_BASE}/${f.name}.sha256`} className="text-text-secondary">.sha256</ExtLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Latest checksum" tag="SHA-256" />
          <div className="px-3.5 py-3 space-y-2 text-[12px]">
            <div className="flex items-center gap-2">
              <code className="mono text-text-primary break-all">{data?.latestSha256 ?? EMPTY}</code>
              {data?.latestSha256 ? <CopyButton text={data.latestSha256} /> : null}
            </div>
            <p className="text-text-tertiary">
              {latest ? <span className="mono text-text-secondary">{latest.name}</span> : null} Nitro verifies it on download; check it yourself
              with <span className="mono">sha256sum -c</span> when you fetch the archive by hand. Pointer file:{" "}
              <ExtLink href={SNAPSHOT_POINTER} className="mono text-text-secondary">latest-archive.txt</ExtLink>
            </p>
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHead title="Option 1: let Nitro download it" tag="Nitro v3.9.x" />
        <div className="p-3.5 space-y-3">
          <p className="text-[12px] text-text-secondary">
            On first start with an empty database, Nitro reads the pointer, downloads the archive, verifies its SHA-256 and extracts it. With an
            existing database the flags are ignored.
          </p>
          <Code title="Flags">{NITRO_FLAGS}</Code>
          <Code title="Docker">{DOCKER_RUN}</Code>
          <p className="text-[11px] text-text-tertiary">
            <span className="mono">chainInfo.json</span> is the Elysium testnet chain config:{" "}
            <ExtLink href={CHAIN_INFO} className="mono text-text-secondary break-all">{CHAIN_INFO}</ExtLink>. Delete{" "}
            <span className="mono">snapshot-download</span> from the volume once the node runs to free the archive space.
          </p>
        </div>
      </Card>
      <Card className="overflow-hidden flex flex-col">
        <CardHead title="Option 2: download and extract it yourself" />
        <div className="p-3.5 space-y-3">
          <Code title="Shell">{MANUAL}</Code>
          <p className="text-[11px] text-text-tertiary">
            The checksum line must print <span className="mono">OK</span>. Then mount <span className="mono">data</span> as{" "}
            <span className="mono">/home/user/.arbitrum</span> and start Nitro: it only syncs the blocks produced since the snapshot. Your node still
            derives every new block from the batches posted on HyperEVM.
          </p>
        </div>
      </Card>
    </div>
  );
}
