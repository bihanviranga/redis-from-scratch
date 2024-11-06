import * as net from "net";
import handleCommand from "../commands";

const PORT = 6379;

export function startServer() {
  const server: net.Server = net.createServer((connection: net.Socket) => {
    console.log("========================");
    console.log(
      `Connected: ${connection.remoteAddress}:${connection.remotePort}`,
    );

    connection.on("data", (data: Buffer) => {
      const response = handleCommand(data);
      connection.write(response);
    });

    connection.on("close", () => {
      console.log("Connection closed");
    });

    connection.on("end", () => {
      console.log("Client disconnected");
    });
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Server listening on ${PORT}`);
  });
}
