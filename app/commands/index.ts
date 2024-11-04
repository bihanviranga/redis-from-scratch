import echo from "./echo";
import ping from "./ping";

function handleCommand(data: Buffer): string {
  console.log("Data:", data.toString());
  const dataLowerCase = data.toString().toLowerCase();

  if (dataLowerCase.startsWith("ping")) {
    return ping();
  }

  if (dataLowerCase.startsWith("echo")) {
    return echo(data.toString());
  }

  return "Unknown command\r\n";
}

export default handleCommand;
