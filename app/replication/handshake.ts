import { readConfig } from "../config";
import { encodeArray } from "../resp/encode";
import { ConfigKey } from "../types/config";
import { Client } from "../client";
import { PONG } from "../consts/responses";

export async function handshake() {
  console.log("[replication]\tStarting handshake with master");
  const masterData = readConfig(ConfigKey.replicaof).split(" ");
  const masterHost = masterData[0];
  const masterPort = parseInt(masterData[1]);
  console.log(`[replication]\tMaster is at ${masterHost}:${masterPort}`);

  const pingPayload = encodeArray(["PING"]);

  const client = new Client(masterHost, masterPort);
  try {
    const response = await client.send(pingPayload);
    if (response === PONG) {
      console.log("[replication]\t[handshake]\tPING succesfull (1/3)");
    }
  } catch (err: any) {
    // console.error("[replication::handshake]\rERROR", err.message);
    console.error(`[replication]\t[handshake]\tERROR: ${err.message}`);
  } finally {
    client.close();
  }
}
