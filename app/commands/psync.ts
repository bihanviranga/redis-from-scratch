import { getReplicationData } from "../replication";
import { encodeSimpleString } from "../resp/encode";
import { FULLRESYNC, ReplicationDataKey } from "../types/replication";

export default function (data: Array<string>) {
  console.log("PSYNC", data);
  const replId = getReplicationData(ReplicationDataKey.master_replid);
  const replOffset = getReplicationData(ReplicationDataKey.master_repl_offset);
  // TODO: refactor the hard-coded string value
  const responseToEncode = `${FULLRESYNC} ${replId} ${replOffset}`;
  const encoded = encodeSimpleString(responseToEncode);
  return encoded;
}
