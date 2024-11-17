import { NULL_ARRAY } from "../consts/responses";

// https://redis.io/docs/latest/develop/reference/protocol-spec/#arrays
export function encodeArray(data: Array<string>): string {
  if (data.length === 0) {
    return NULL_ARRAY;
  }

  let encoded = `*${data.length}\r\n`;
  data.forEach((value) => {
    encoded += encodeBulkString(value);
  });

  return encoded;
}

// https://redis.io/docs/latest/develop/reference/protocol-spec/#bulk-strings
export function encodeBulkString(data: string): string {
  return `$${data.length}\r\n${data}\r\n`;
}

export function encodeError(data: string): string {
  return `-${data}\r\n`;
}

export function encodeSimpleString(data: string): string {
  return `+${data}\r\n`;
}
