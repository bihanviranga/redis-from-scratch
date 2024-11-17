import * as net from "net";
import { getReplicationData } from "../replication";
import { encodeSimpleString } from "../resp/encode";
import { FULLRESYNC, ReplicationDataKey } from "../types/replication";
import { EMPTY_RDB_FILE } from "../consts/rdb";

export default function (data: Array<string>, connection: net.Socket) {
  const replId = getReplicationData(ReplicationDataKey.master_replid);
  const replOffset = getReplicationData(ReplicationDataKey.master_repl_offset);
  const responseToEncode = `${FULLRESYNC} ${replId} ${replOffset}`;
  const encoded = encodeSimpleString(responseToEncode);
  connection.write(encoded);
  // Adding a fake timeout because when we send the data at once sometimes it gets considered as a single call.
  setTimeout(() => {
    const rdbPayload = `$${EMPTY_RDB_FILE.length}\r\n${EMPTY_RDB_FILE}`;
    connection.write(rdbPayload);
  }, 1000);
}
