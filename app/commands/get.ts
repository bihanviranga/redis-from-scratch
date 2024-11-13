import { NULL_BULK_STRING } from "../consts/responses";
import { get } from "../memory";
import { encodeBulkString } from "../resp/encode";

export default function (data: Array<string>) {
  console.log("GET", data);
  const key = data[0];
  const response = get(key);

  if (response) {
    // Validate the record is not expired
    if (response.ttl) {
      const currentTime = Date.now();
      if (currentTime >= response.ttl) {
        return NULL_BULK_STRING;
      }
    }

    const formattedResponse = encodeBulkString(response.value);
    return formattedResponse;
  }

  return NULL_BULK_STRING;
}
