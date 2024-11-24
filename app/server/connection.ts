import * as net from "net";

let lastConnectionID = 0;
const activeConnections = new Map<string, net.Socket>();

// Contains the clientKeys of replicas
let replicas: Array<string> = [];

export function generateClientKey(connection: net.Socket) {
  return (++lastConnectionID).toString();
}

function findClientKey(connection: net.Socket) {
  let clientKey: string | null = null;
  activeConnections.forEach((conn, key) => {
    if (conn === connection) {
      clientKey = key;
    }
  });
  return clientKey;
}

export function addActiveConnection(clientKey: string, connection: net.Socket) {
  activeConnections.set(clientKey, connection);
}

export function deleteActiveConnection(clientKey: string) {
  activeConnections.delete(clientKey);
  // If an active connection ended, and it was a replica, remove it from the replica list.
  if (replicas.includes(clientKey)) {
    replicas = replicas.filter((key) => key !== clientKey);
  }
}

export function registerReplica(connection: net.Socket) {
  const clientKey = findClientKey(connection);
  if (!clientKey) {
    console.error("[ERR] [server]\tFailed to get client key for connection.");
    return;
  }

  if (!activeConnections.has(clientKey)) {
    console.warn(
      `[WARN]\t[server]\tAttempted to register replica with key: ${clientKey}, but it is not an active connection.`,
    );
    return;
  }

  if (replicas.includes(clientKey)) {
    console.log(
      `[server]\tReplica with key: ${clientKey} is already registered`,
    );
    return;
  }

  replicas.push(clientKey);
  console.log(`[server]\tRegistered replica with key: ${clientKey}`);
}
