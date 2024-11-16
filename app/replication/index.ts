import { encodeBulkString } from "../resp/encode";
import { ReplicationDataKey } from "../types/replication";

const replicationData: Record<ReplicationDataKey, string | number> = {
  [ReplicationDataKey.role]: "master",
  [ReplicationDataKey.connected_slaves]: 0,
  // TODO: this should ideally reset everytime the master server restarts. Hard-coding is temporary.
  [ReplicationDataKey.master_replid]:
    "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb",
  [ReplicationDataKey.master_repl_offset]: 0,
};

export function replicationCommand() {
  let response = "# Replication\r\n";
  Object.entries(replicationData).forEach((entry) => {
    response = response + `${entry[0]}:${entry[1]}\r\n`;
  });
  const encoded = encodeBulkString(response);
  return encoded;
}

export function setReplicationData(
  key: ReplicationDataKey,
  value: string | number,
) {
  replicationData[key] = value;
}
