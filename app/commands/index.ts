import echo from "./echo";
import ping from "./ping";

function handleCommand(data: Buffer): string {
  console.log("Data:", data.toString());
  const splitData = data.toString().split("\r\n");
  console.log("Split Data", splitData);
  const length = splitData[0].slice(1);
  console.log("Length:", length);
  const commandLength = splitData[1].slice(1);
  console.log("Command length:", commandLength);
  const command = splitData[2].toLowerCase();
  console.log("Command", command);

  if (command === "ping") {
    return ping();
  }

  // if (command === "echo") {
  //   return echo(data.toString());
  // }

  return "Unknown command\r\n";
}

export default handleCommand;
