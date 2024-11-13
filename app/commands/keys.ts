import { NULL_ARRAY } from "../consts/responses";
import { getKeysByPattern } from "../memory";
import { encodeArray } from "../resp/encode";

export default function (data: Array<string>) {
  console.log("KEYS", data);
  const pattern = data[0];

  // HACK: need proper pattern parsing here. This is a temporary hack.
  if (pattern === "*") {
    const keys = getKeysByPattern("*");
    const encoded = encodeArray(keys);
    console.log("Result:", encoded);
    return encoded;
  }

  return NULL_ARRAY;
}
