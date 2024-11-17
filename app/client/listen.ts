import { MAGIC_NUMBER_HEX, MAGIC_NUMBER_VALUE } from "../types/persistence";

/*
 * Listens to data from that is not a response to a sent message.
 */
export function listen(data: Buffer) {
  // If the initial few bytes are the magic number, we have received an RDB file.
  if (
    data.subarray(0, MAGIC_NUMBER_VALUE.length).toString() ===
    MAGIC_NUMBER_VALUE
  ) {
    console.log("[client]\tReceived RDB file");
  }
}
