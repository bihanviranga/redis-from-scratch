import * as net from "net";

const PORT = 6379;

const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log(
    `Connected: ${connection.remoteAddress}:${connection.remotePort}`,
  );

  connection.on("data", () => {
    console.log("Data received");
    const response = "+PONG\r\n";
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
