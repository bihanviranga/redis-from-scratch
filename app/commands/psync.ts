import * as net from "net";
import { getReplicationData } from "../replication";
import { encodeSimpleString } from "../resp/encode";
import { FULLRESYNC, ReplicationDataKey } from "../types/replication";
import { EMPTY_RDB_FILE } from "../consts/rdb";
import { getDatabaseAsRDB } from "../persistence/write";

export default function (data: Array<string>, connection: net.Socket) {
  const replId = getReplicationData(ReplicationDataKey.master_replid);
  const replOffset = getReplicationData(ReplicationDataKey.master_repl_offset);
  const responseToEncode = `${FULLRESYNC} ${replId} ${replOffset}`;
  const encoded = encodeSimpleString(responseToEncode);
  connection.write(encoded);

  // Convert the RDB file to binary before sending
  const rdbFile = getDatabaseAsRDB();
  const binaryData = new Uint8Array(rdbFile.length / 2);
  for (let i = 0; i < rdbFile.length; i += 2) {
    binaryData[i / 2] = parseInt(rdbFile.substring(i, i + 2), 16);
  }
  connection.write(`$${binaryData.length}\r\n`);
  connection.write(binaryData);
}
