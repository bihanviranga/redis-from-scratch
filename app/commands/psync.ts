import { getReplicationData } from "../replication";
import { encodeSimpleString } from "../resp/encode";
import { ReplicationDataKey } from "../types/replication";

export default function (data: Array<string>) {
  console.log("PSYNC", data);
  const replId = getReplicationData(ReplicationDataKey.master_replid);
  const replOffset = getReplicationData(ReplicationDataKey.master_repl_offset);
  const responseToEncode = `OK ${replId} ${replOffset}`;
  const encoded = encodeSimpleString(responseToEncode);
  return encoded;
}
