import * as fs from "fs";
import { readConfig } from "../config";
import { ConfigKey } from "../types/config";
import {
  MAGIC_NUMBER_VALUE,
  type ParseMetadataResult,
  RDB_LENGTH_ENCODING_TYPES,
  RDB_OP_CODES,
  RDB_STRING_ENCODING_TYPES,
  RDB_VALUE_TYPES,
} from "../types/persistence";
import { decodeLength, decodeSpecialEncodedLength } from "./decode";

const RDB_VERSION_NUMBER_LENGTH = 4;

// If a value not in this array is found in the main loop, something is wrong.
const MAIN_LOOP_ACCEPTED_VALUES = [
  ...Object.values(RDB_OP_CODES),
  ...Object.values(RDB_VALUE_TYPES),
];

/**
 * Read the database file if exists.
 * If not, fail silently and print a warning.
 */
export function readDatabaseFile() {
  // Read DB file if exists.
  const path = readConfig(ConfigKey.dir) + readConfig(ConfigKey.dbfilename);

  if (!fs.existsSync(path)) {
    console.warn(
      `[WARN]\t[persistence]\tFile ${path} does not exist. Skipping reading from file.`,
    );
    return;
  } else {
    console.log(`[persistence]\tReading RDB file at ${path}`);
  }

  const fileBuffer = fs.readFileSync(path);

  // Read and verify the magic number header
  const magicNumber = fileBuffer.subarray(0, MAGIC_NUMBER_VALUE.length);
  if (magicNumber.toString() !== MAGIC_NUMBER_VALUE) {
    console.warn(
      `[WARN]\t[persistence]\tInvalid file header in ${path}. Aborting reading.`,
    );
    return;
  }

  // Read the RDB version number
  const rdbVersionNumberEndIndex =
    MAGIC_NUMBER_VALUE.length + RDB_VERSION_NUMBER_LENGTH;
  const rdbVersionNumberBytes = fileBuffer.subarray(
    MAGIC_NUMBER_VALUE.length,
    rdbVersionNumberEndIndex,
  );
  const rdbVersionNumber = parseInt(rdbVersionNumberBytes.toString(), 2);
  console.log("[persistence]\tRDB version:", rdbVersionNumber);

  const metadata: Array<ParseMetadataResult> = [];

  try {
    for (let i = rdbVersionNumberEndIndex; i < fileBuffer.length; ) {
      const byte = fileBuffer[i];
      console.log("index", i, "byte", byte.toString(16));
      if (!MAIN_LOOP_ACCEPTED_VALUES.includes(byte)) {
        throw new Error(
          "Unexpected data found in RDB file. File may be invalid.",
        );
      }

      switch (byte) {
        case RDB_OP_CODES.AUX: {
          // Auxiliary fields
          const metadataRecord = parseMetadata(fileBuffer, i + 1);
          metadata.push(metadataRecord);
          i = metadataRecord.endIndex;
          break;
        }
        case RDB_OP_CODES.SELECTDB: {
          const nextIndex = parseDatabaseSelector(fileBuffer, i + 1);
          i = nextIndex;
          break;
        }
        case RDB_OP_CODES.EXPIRETIMEMS:
        case RDB_OP_CODES.EXPIRETIME: {
          // TODO: return result and actually use this
          const nextIndex = parseExpiryTime(fileBuffer, i + 1);
          i = nextIndex;
          break;
        }
        case RDB_OP_CODES.RESIZEDB: {
          const nextIndex = parseResizedb(fileBuffer, i + 1);
          i = nextIndex;
          break;
        }
        case RDB_OP_CODES.EOF: {
          throw new Error(
            `Support for opcode ${RDB_OP_CODES[byte]} is not yet implemented in this parser.`,
          );
        }
        case RDB_VALUE_TYPES.STRING: {
          const decoded = decodeStringValue(fileBuffer, i + 1);
          console.log("Decoded string:", decoded);
          i = decoded.nextIndex;
          break;
        }
        default: {
          i++;
        }
      }
    }
  } catch (error: any) {
    console.error("[persistence]\tFailed to read RDB file:", error.message);
    return;
  }
}

/**
 * Parse one key-value pair of metadata starting from the `startIndex` in `buffer`.
 * TODO: change the magic numbers (for msb codes and special encoding methods) to types.
 */
function parseMetadata(
  buffer: Buffer,
  startIndex: number,
): ParseMetadataResult {
  let readIndex = startIndex;
  let metadataKey = "";
  let metadataValue: string | number = "";

  while (true) {
    // Getting the length encoding method using the two MSBs
    // ref: https://rdb.fnordig.de/file_format.html#length-encoding
    const byte = buffer[readIndex];
    const shiftedByte = byte >> 6;
    const mask = 0b00000011;
    const msbs = mask & shiftedByte;

    if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_6_BITS) {
      const metadataLength = byte;
      const metadataEndIndex = readIndex + metadataLength + 1;
      const metadata = buffer.subarray(readIndex + 1, metadataEndIndex); // +1 to skip the byte that contains the length
      readIndex = metadataEndIndex;
      if (!metadataKey) {
        metadataKey = metadata.toString();
      } else {
        metadataValue = metadata.toString();
        break;
      }
    } else if (msbs >= RDB_LENGTH_ENCODING_TYPES.SPECIAL_ENCODING) {
      const decodedLength = decodeSpecialEncodedLength(buffer, readIndex);
      if (!metadataKey) {
        metadataKey = decodedLength.value.toString();
      } else {
        metadataValue = decodedLength.value;
      }
      readIndex = decodedLength.nextIndex;
      break;
    } else if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_14_BITS) {
      throw new Error(
        "Found length encoding method that is not yet supported in this parser.",
      );
    } else if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_4_BYTES) {
      throw new Error(
        "Found length encoding method that is not yet supported in this parser.",
      );
    } else {
      throw new Error(
        "Unexpected data found in RDB file. File may be invalid.",
      );
    }
  }

  return { key: metadataKey, value: metadataValue, endIndex: readIndex };
}

function parseDatabaseSelector(buffer: Buffer, startIndex: number): number {
  const lengthResult = decodeLength(buffer, startIndex);
  const databaseSelector = lengthResult.value;
  const nextIndex = lengthResult.nextIndex;
  return nextIndex;
}

/*
 * Parse the expire time (in seconds or milliseconds).
 */
function parseExpiryTime(buffer: Buffer, startIndex: number): number {
  const byte = buffer[startIndex];

  let value: number | bigint = 0;
  let nextIndex = startIndex;

  if (byte === RDB_OP_CODES.EXPIRETIME) {
    // Expire time is in seconds, stored in the next 4 bytes.
    value = buffer.readUint32LE(startIndex + 1);
    nextIndex = startIndex + 4 + 1; // +4 to account for the value, +1 to point to the next byte.
  } else {
    // Expire time is in milliseconds, stored in the next 8 bytes.
    value = buffer.readBigUInt64LE(startIndex + 1);
    nextIndex = startIndex + 8 + 1; // +8 to account for the value, +1 to point to the next byte.
  }

  console.log("Expire time:", value.toString());
  return nextIndex;
}

/*
 * Parse the resizedb values.
 */
function parseResizedb(buffer: Buffer, startIndex: number): number {
  let nextIndex = startIndex;

  const hashTableSizeResult = decodeLength(buffer, nextIndex);
  const hashTableSize = hashTableSizeResult.value;
  nextIndex = hashTableSizeResult.nextIndex;

  const expiryTableSizeResult = decodeLength(buffer, nextIndex);
  const expiryTableSize = expiryTableSizeResult.value;
  nextIndex = expiryTableSizeResult.nextIndex;

  return nextIndex;
}

/*
 * Decode a key-value pair where the value is a string.
 */
function decodeStringValue(
  buffer: Buffer,
  startIndex: number,
): { key: string; value: string; nextIndex: number } {
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
