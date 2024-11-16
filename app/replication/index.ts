import { encodeBulkString } from "../resp/encode";
import { ReplicationDataKey } from "../types/replication";

// TODO: move the replication data keys to an enum
const replicationData: Record<ReplicationDataKey, string | number> = {
  [ReplicationDataKey.role]: "master",
  [ReplicationDataKey.connected_slaves]: 0,
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
