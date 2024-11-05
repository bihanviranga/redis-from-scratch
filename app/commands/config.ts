import { NULL_ARRAY } from "../consts/responses";
import { readConfig } from "../config";
import { encodeArray } from "../resp/encode";

export default function config(data: Array<string>) {
  if (data[0].toLowerCase() === "get") {
    return getConfig(data[1]);
  }

  return NULL_ARRAY;
}

function getConfig(key: string) {
  const configValue = readConfig(key);
  if (configValue) {
    return encodeArray([key, configValue]);
  }

  return NULL_ARRAY;
}
