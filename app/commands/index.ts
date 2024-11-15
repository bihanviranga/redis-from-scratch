import echo from "./echo";
import ping from "./ping";
import set from "./set";
import get from "./get";
import config from "./config";
import keys from "./keys";
import { encodeError } from "../resp/encode";

function handleCommand(input: Buffer): string {
  const { command, data } = parseInput(input);

  if (command === "ping") {
    return ping();
  }

  if (command === "echo") {
    return echo(data);
  }

  if (command === "set") {
    return set(data);
  }

  if (command === "get") {
    return get(data);
  }

  if (command === "config") {
    return config(data);
  }

  if (command === "keys") {
    return keys(data);
  }

  return encodeError(`Unknown command ${command}`);
}

function parseInput(input: Buffer): { command: string; data: Array<string> } {
  console.log("INPUT:", input.toString());
  const lengthIndex = 0;
  // const commandLengthIndex = 1;
  const commandIndex = 2;
  const firstDataIndex = 4;

  const splitData = input.toString().split("\r\n");
  // console.log("Input data", splitData);

  const length = parseInt(splitData[lengthIndex].slice(1));

  // const commandLength = parseInt(splitData[commandLengthIndex].slice(1));

  const command = splitData[commandIndex].toLowerCase();

  const data = [];

  // length means total input length.
  // When we substract one from that we get the length of the data.
  const expectedDataItemsCount = length - 1;
  let dataIndex = firstDataIndex;
  while (dataIndex < splitData.length) {
    if (data.length === expectedDataItemsCount) {
      break;
    }
    data.push(splitData[dataIndex]);
    // We add 2 so we skip over the element containing next data item's length
    dataIndex += 2;
  }

  return { command, data };
}

export default handleCommand;
