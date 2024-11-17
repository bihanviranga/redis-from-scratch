import { readConfig } from "../config";
import { encodeArray } from "../resp/encode";
import { ConfigKey } from "../types/config";
import { Client } from "../client";
import { OK, PONG } from "../consts/responses";
import { COMMAND, SUBCOMMAND } from "../types/command";

export async function handshake() {
  console.log("[replication]\tStarting handshake with master");
  const masterData = readConfig(ConfigKey.replicaof).split(" ");
  const masterHost = masterData[0];
  const masterPort = parseInt(masterData[1]);
  console.log(`[replication]\tMaster is at ${masterHost}:${masterPort}`);

  const pingPayload = encodeArray([COMMAND.PING]);

  const client = new Client(masterHost, masterPort);
  try {
    // Stage 1: send PING command
    const pingResponse = await client.send(pingPayload);
    if (pingResponse === PONG) {
      console.log("[replication]\t[handshake]\tPING successful (1/3)");
    }

    // Stage 2: send REPLCONF with listening-port
    const listeningPort = readConfig(ConfigKey.port);
    const replConfListeningPortPayload = encodeArray([
      COMMAND.REPLCONF,
      SUBCOMMAND.LISTENING_PORT,
      listeningPort,
    ]);
    const replConfListeningPortResponse = await client.send(
      replConfListeningPortPayload,
    );
    if (replConfListeningPortResponse === OK) {
      console.log(
        "[replication]\t[handshake]\tREPLCONF listening-port successful (1.5/3)",
      );
    } else {
      throw new Error(
        `REPLCONF listening-port command failed: ${replConfListeningPortResponse.toString()}`,
      );
    }

    // Stage 3: send REPLCONF with capabilities
    const replConfCapaPayload = encodeArray([
      COMMAND.REPLCONF,
      SUBCOMMAND.CAPA,
      "psync2", // TODO: fix this hard-coded value
    ]);
    const replConfCapaResponse = await client.send(replConfCapaPayload);
    if (replConfCapaResponse === OK) {
      console.log("[replication]\t[handshake]\tREPLCONF capa successful (2/3)");
    } else {
      throw new Error(
        `REPLCONF capa command failed: ${replConfCapaResponse.toString()}`,
      );
    }
  } catch (err: any) {
    // console.error("[replication::handshake]\rERROR", err.message);
    console.error(`[replication]\t[handshake]\tERROR: ${err.message}`);
  } finally {
    client.close();
  }
}
