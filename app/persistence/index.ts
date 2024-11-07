import * as fs from "fs";
import { readConfig } from "../config";
import { ConfigKey } from "../types/config";
import {
  MAGIC_NUMBER_VALUE,
  type ParseMetadataResult,
  RDB_LENGTH_ENCODING_TYPES,
  RDB_OP_CODES,
  RDB_STRING_ENCODING_TYPES,
} from "../types/persistence";

const RDB_VERSION_NUMBER_LENGTH = 4;

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
      if (!Object.values(RDB_OP_CODES).includes(byte)) {
        throw new Error(
          "Unexpected data found in RDB file. File may be invalid.",
        );
      }

      switch (byte) {
        case RDB_OP_CODES.AUX: {
          const metadataRecord = parseMetadata(fileBuffer, i + 1);
          metadata.push(metadataRecord);
          i = metadataRecord.endIndex;
          break;
        }
        case RDB_OP_CODES.SELECTDB: {
          const response = parseDatabase(fileBuffer, i + 1);
          i++;
          break;
        }
        case RDB_OP_CODES.RESIZEDB:
        case RDB_OP_CODES.EXPIRETIMEMS:
        case RDB_OP_CODES.EXPIRETIME:
        case RDB_OP_CODES.EOF: {
          throw new Error(
            `Support for opcode ${RDB_OP_CODES[byte]} is not yet implemented in this parser.`,
          );
        }
        default: {
          i++;
        }
      }
    }
  } catch (error: any) {
    console.log("Metadata:", metadata);
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

function parseDatabase(buffer: Buffer, startIndex: number) {
  let readIndex = startIndex;
  const lengthByte = buffer[readIndex];
  const shiftedByte = lengthByte >> 6;
  const mask = 0b00000011;
  const msbs = mask & shiftedByte;

  let databaseSelector = 0;

  if (msbs === RDB_LENGTH_ENCODING_TYPES.READ_6_BITS) {
    databaseSelector = lengthByte;
    readIndex += 1;
  } else if (msbs >= RDB_LENGTH_ENCODING_TYPES.SPECIAL_ENCODING) {
    const decodedLength = decodeSpecialEncodedLength(buffer, readIndex);
    databaseSelector = decodedLength.value;
    readIndex = decodedLength.nextIndex;
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

  console.log("Database selector:", databaseSelector);
}

/**
 * Decode lengths that are encoded as strings.
 * ref: https://rdb.fnordig.de/file_format.html#string-encoding
 */
function decodeSpecialEncodedLength(
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
