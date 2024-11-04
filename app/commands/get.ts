import { NULL_BULK_STRING } from "../consts/responses";
import { get } from "../memory";

export default function (data: Array<string>) {
  console.log("GET", data);
  const key = data[0];
  const response = get(key);

  if (response) {
    // Validate the record is not expired
    if (response.ttl) {
      const currentTime = Math.floor(Date.now());
      const expirationTime = Math.floor(response.created) + response.ttl;
      if (currentTime >= expirationTime) {
        return NULL_BULK_STRING;
      }
    }

    const formattedResponse = `$${response.value.length}\r\n${response.value}\r\n`;
    return formattedResponse;
  }

  return NULL_BULK_STRING;
}
