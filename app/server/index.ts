import * as net from "net";
import handleCommand from "../commands";

const PORT = 6379;

export function startServer() {
  const server: net.Server = net.createServer((connection: net.Socket) => {
    console.log(
      `[server]\tConnected: ${connection.remoteAddress}:${connection.remotePort}`,
    );

    connection.on("data", (data: Buffer) => {
      const response = handleCommand(data);
      connection.write(response);
    });

    connection.on("close", () => {
      console.log(`[server]\tConnection closed`);
    });

    connection.on("end", () => {
      console.log(
        `[server]\tDisconnected: ${connection.remoteAddress}:${connection.remotePort}`,
      );
    });
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`[server]\tServer listening on ${PORT}`);
  });
}
