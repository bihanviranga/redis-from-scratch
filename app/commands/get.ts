import { NULL_BULK_STRING } from "../consts/responses";
import { get } from "../memory";

export default function (data: Array<string>) {
  console.log("GET", data);
  const key = data[0];
  const response = get(key);

  if (response) {
    const formattedResponse = `$${response.length}\r\n${response}\r\n`;
    return formattedResponse;
  }

  return NULL_BULK_STRING;
}
