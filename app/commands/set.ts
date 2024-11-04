import { NULL_BULK_STRING, OK } from "../consts/responses";
import { set } from "../memory";
import type { RedisRecord } from "../types/RedisRecord";

export default function (data: Array<string>) {
  console.log("SET", data);

  const keyIndex = 0;
  const valIndex = 1;

  // Determine the PX value, if any.
  // It should be the value after "px" argument.
  let pxValue: number | undefined;
  if (data.length > 2) {
    for (let i = 2; i < data.length; i++) {
      const curValue = data[i];
      if (curValue.toLowerCase() === "px" && i + 1 < data.length) {
        // Found the index
        const readValue = parseInt(data[i + 1]);
        if (isNaN(readValue)) {
          console.log(`Got invalid PX value: ${data[i + 1]}. Skipping PX.`);
        } else {
          pxValue = readValue;
        }
        break;
      }
    }
  }

  const valueString = data[valIndex].toString();
  const created = new Date().getTime();
  const ttl = pxValue;

  const record: RedisRecord = {
    value: valueString,
    created,
    ttl,
  };

  const response = set(data[keyIndex], record);
  if (response) {
    return OK;
  }

  return NULL_BULK_STRING;
}
