import { getReplicationData } from ".";
import { getAllReplicaConnections } from "../server/connection";
import { PROPAGATED_COMMANDS, type COMMAND } from "../types/command";
import { ReplicationDataKey } from "../types/replication";

export function propagate(command: COMMAND, data: Buffer) {
  // TODO: change this 'master' to a type.
  const isMaster = getReplicationData(ReplicationDataKey.role) === "master";
  if (!isMaster) return;

  // Check if this command should be propagated
  const shouldPropagate = isPropagationOk(command);
  if (!shouldPropagate) return;

  const replicas = getAllReplicaConnections();
  replicas.forEach((connection) => {
    try {
      console.log("PROPAGATING...");
      connection.write(data.toString());
    } catch (e) {
      console.error(`[ERR]\t[replication]\t:`, e);
    }
  });
}

function isPropagationOk(command: COMMAND) {
  return PROPAGATED_COMMANDS.includes(command);
}
