import * as net from "net";
import handleCommand from "../commands";
import { readConfig } from "../config";
import { ConfigKey } from "../types/config";

const activeConnections = new Map<string, net.Socket>();

export function startServer() {
  const PORT = parseInt(readConfig(ConfigKey.port));

  const server = net.createServer((connection: net.Socket) => {
    const clientKey = `${connection.remoteAddress}:${connection.remotePort}`;
    activeConnections.set(clientKey, connection);
    console.log(`[server]\tConnected: ${clientKey}`);

    connection.on("data", (data: Buffer) => {
      const response = handleCommand(data, connection);
      if (response) {
        connection.write(response);
      }
    });

    connection.on("close", () => {
      activeConnections.delete(clientKey);
      console.log(`[server]\tConnection closed: ${clientKey}`);
    });

    connection.on("end", () => {
      activeConnections.delete(clientKey);
      console.log(`[server]\tDisconnected: ${clientKey}`);
    });
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`[server]\tServer listening on ${PORT}`);
  });
}
