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

  // const byteArray = new Uint8Array(EMPTY_RDB_FILE.length / 2);
  // for (let i = 0; i < EMPTY_RDB_FILE.length; i += 2) {
  //   byteArray[i / 2] = parseInt(EMPTY_RDB_FILE.substr(i, 2), 16);
  // }
  // const base64 =
  //   "UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog==";
  //
  // const rdbBuffer = Buffer.from(base64, "base64");
  //
  // const rdbHead = Buffer.from(`$${rdbBuffer.length}\r\n`);
  //
  // console.log(rdbHead.toString() + rdbBuffer.toString());

  // const bytes: number[] = [];
  // for (let i = 0; i < EMPTY_RDB_FILE.length; i += 2) {
  //   const byte = parseInt(EMPTY_RDB_FILE.substring(i, i + 2), 16);
  //   bytes.push(byte);
  // }
  const binaryData = new Uint8Array(EMPTY_RDB_FILE.length / 2);

  for (let i = 0; i < EMPTY_RDB_FILE.length; i += 2) {
    binaryData[i / 2] = parseInt(EMPTY_RDB_FILE.substring(i, i + 2), 16);
  }

  // connection.write(Buffer.concat([rdbHead, rdbBuffer]));
  // const rdbPayload = `$${byteArray.length}\r\n${byteArray.toString()}`;
  connection.write(`$${binaryData.length}\r\n`);
  connection.write(binaryData);
  // Adding a fake timeout because when we send the data at once sometimes it gets considered as a single call.
  // setTimeout(() => {
  //   const rdbPayload = `$${EMPTY_RDB_FILE.length}\r\n${EMPTY_RDB_FILE}`;
  //   connection.write(rdbPayload);
  // }, 500);
}
