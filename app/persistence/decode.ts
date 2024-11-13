import {
  RDB_LENGTH_ENCODING_TYPES,
  RDB_STRING_ENCODING_TYPES,
  type ParseKeyValueResult,
} from "../types/persistence";

/**
 * Decode length-encoded data.
 * ref: https://rdb.fnordig.de/file_format.html#length-encoding
 */
export function decodeLength(
  buffer: Buffer,
  startIndex: number,
): { value: number; nextIndex: number } {
  let decodedValue: string | number;
  let nextIndex = startIndex;

  const lengthByte = buffer[startIndex];
  const shiftedByte = lengthByte >> 6;
  const mask = 0b00000011;
  const msbs = mask & shiftedByte;

  if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_6_BITS) {
    decodedValue = lengthByte;
    nextIndex += 1;
  } else if (msbs === RDB_LENGTH_ENCODING_TYPES.SPECIAL_ENCODING) {
    const decodeResult = decodeSpecialEncodedLength(buffer, startIndex);
    decodedValue = decodeResult.value;
    nextIndex = decodeResult.nextIndex;
  } else if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_14_BITS) {
    throw new Error(
      "Found length encoding method that is not yet supported in this parser.",
    );
  } else if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_4_BYTES) {
    throw new Error(
      "Found length encoding method that is not yet supported in this parser.",
    );
  } else {
    throw new Error("Unexpected data found in RDB file. File may be invalid.");
  }

  return {
    value: decodedValue,
    nextIndex,
  };
}

/**
 * Decode lengths that are encoded as strings.
 * ref: https://rdb.fnordig.de/file_format.html#string-encoding
 */
export function decodeSpecialEncodedLength(
  buffer: Buffer,
  startIndex: number,
): { value: number; nextIndex: number } {
  let nextIndex = startIndex;
  const lengthByte = buffer[nextIndex];
  const leastSixBitsMask = 0b00111111;
  const encodingType = leastSixBitsMask & lengthByte;

  if (encodingType === RDB_STRING_ENCODING_TYPES.INT_8_BIT) {
    // Value is in the next 8 bits
    const value = buffer[nextIndex + 1];
    nextIndex = nextIndex + 1 + 1; // +1 to account for the value, +1 to point to the next byte.
    return {
      value,
      nextIndex,
    };
  }

  if (encodingType === RDB_STRING_ENCODING_TYPES.INT_32_BIT) {
    // Value is in the next 32 bits
    const value = buffer.readUint32LE(nextIndex + 1);
    nextIndex = nextIndex + 4 + 1; // +4 to account for the value, +1 to point to the next byte.
    return {
      value,
      nextIndex,
    };
  }

  if (encodingType === RDB_STRING_ENCODING_TYPES.INT_16_BIT) {
    throw new Error(
      "Found integer encoding method that is not yet supported in this parser.",
    );
  }

  if (encodingType === RDB_STRING_ENCODING_TYPES.COMPRESSED_STRING) {
    throw new Error(
      "Found integer encoding method that is not yet supported in this parser.",
    );
  }

  // Exeecution should not reach here in a valid file.
  throw new Error("Unexpected data found in RDB file. File may be invalid.");
}

/*
 * Decode a key-value pair where the value is a string.
 */
export function decodeStringValue(
  buffer: Buffer,
  startIndex: number,
): ParseKeyValueResult {
  let nextIndex = startIndex;

  const keyDecodeResult = decodeLength(buffer, nextIndex);
  const keyStartIndex = keyDecodeResult.nextIndex;
  const keyEndIndex = keyStartIndex + keyDecodeResult.value;
  const key = buffer.subarray(keyStartIndex, keyEndIndex);
  nextIndex = keyEndIndex;

  const valueDecodeResult = decodeLength(buffer, nextIndex);
  const valueStartIndex = valueDecodeResult.nextIndex;
  const valueEndIndex = valueStartIndex + valueDecodeResult.value;
  const value = buffer.subarray(valueStartIndex, valueEndIndex);
  nextIndex = valueEndIndex;

  return { key: key.toString(), value: value.toString(), nextIndex };
}
