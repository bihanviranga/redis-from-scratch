import { readConfig } from "../config";
import { encodeArray } from "../resp/encode";
import { ConfigKey } from "../types/config";
import { Client } from "../client";
import { OK, PONG } from "../consts/responses";
import { COMMAND, SUBCOMMAND } from "../types/command";
import { FULLRESYNC, PSYNC2 } from "../types/replication";

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

    // Stage 2.1: send REPLCONF with listening-port
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
        "[replication]\t[handshake]\tREPLCONF listening-port successful (2/3)",
      );
    } else {
      throw new Error(
        `REPLCONF listening-port command failed: ${replConfListeningPortResponse.toString()}`,
      );
    }

    // Stage 2.2: send REPLCONF with capabilities
    const replConfCapaPayload = encodeArray([
      COMMAND.REPLCONF,
      SUBCOMMAND.CAPA,
      PSYNC2,
    ]);
    const replConfCapaResponse = await client.send(replConfCapaPayload);
    if (replConfCapaResponse === OK) {
      console.log(
        "[replication]\t[handshake]\tREPLCONF capa successful (2.5/3)",
      );
    } else {
      throw new Error(
        `REPLCONF capa command failed: ${replConfCapaResponse.toString()}`,
      );
    }

    // Stage 3: send PSYNC command
    const masterReplId = "?";
    const masterOffset = "-1";
    // The ? and -1 tells the master that the replica has no data yet.
    // The master should acknowledge this by sending a FULLRESYNC response.
    const psyncPayload = encodeArray([
      COMMAND.PSYNC,
      masterReplId,
      masterOffset,
    ]);
    const psyncResponse = await client.send(psyncPayload);
    if (psyncResponse.slice(1, 1 + FULLRESYNC.length) === FULLRESYNC) {
      console.log("[replication]\t[handshake]\tPSYNC executed (3/3)");
    } else {
      throw new Error(`PSYNC failed: ${psyncResponse}`);
    }
  } catch (err: any) {
    console.error(`[replication]\t[handshake]\tERROR: ${err.message}`);
  }
}
