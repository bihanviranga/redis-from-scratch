import * as fs from "fs";
import { readConfig } from "../config";
import { ConfigKey } from "../types/config";
import {
  MAGIC_NUMBER_VALUE,
  type ParseMetadataResult,
} from "../types/persistence";

const RDB_VERSION_NUMBER_LENGTH = 4;

const RDB_OP_CODES = [0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff];

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

  const magicNumber = fileBuffer.subarray(0, MAGIC_NUMBER_VALUE.length);
  if (magicNumber.toString() !== MAGIC_NUMBER_VALUE) {
    console.warn(
      `[WARN]\t[persistence]\tInvalid file header in ${path}. Aborting reading.`,
    );
    return;
  }

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
      if (!RDB_OP_CODES.includes(byte)) {
        throw new Error(
          "Unexpected data found in RDB file. File may be invalid.",
        );
      }

      if (byte === 0xfa) {
        const metadataRecord = parseMetadata(fileBuffer, i + 1);
        metadata.push(metadataRecord);
        i = metadataRecord.endIndex;
      } else {
        i++;
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
 */
function parseMetadata(
  buffer: Buffer,
  startIndex: number,
): ParseMetadataResult {
  let readIndex = startIndex;
  let metadataKey;
  let metadataValue;

  while (true) {
    // Getting the length encoding method using the two MSBs
    // ref: https://rdb.fnordig.de/file_format.html#length-encoding
    const byte = buffer[readIndex];
    const shiftedByte = byte >> 6;
    const mask = 0b00000011;
    const msbs = mask & shiftedByte;

    if (msbs === 0b00) {
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
    } else if (msbs === 0b01) {
      throw new Error(
        "Found length encoding method that is not yet supported in this parser.",
      );
    } else if (msbs === 0b10) {
      throw new Error(
        "Found length encoding method that is not yet supported in this parser.",
      );
    } else if (msbs >= 0b11) {
      // Special encoding
      const leastSixMask = 0b00111111;
      const leastSix = leastSixMask & byte;
      if (leastSix === 0) {
        // Value is in the next 8 bits
        const value = buffer[readIndex + 1];
        readIndex = readIndex + 1 + 1; // +1 to account for the value, +1 to point to the next byte
        if (metadataKey) {
          metadataValue = value;
          break;
        }
      } else if (leastSix === 1) {
        throw new Error(
          "Found integer encoding method that is not yet supported in this parser.",
        );
      } else if (leastSix === 2) {
        // Value is in the next 32 bits
        const value = buffer.readUint32LE(readIndex + 1);
        readIndex = readIndex + 4 + 1; // +4 to account for the value, +1 to point to the next byte
        if (metadataKey) {
          metadataValue = value;
          break;
        }
      } else {
        throw new Error(
          "Unexpected data found in RDB file. File may be invalid.",
        );
      }
    } else {
      throw new Error(
        "Unexpected data found in RDB file. File may be invalid.",
      );
    }
  }

  return { key: metadataKey, value: metadataValue, endIndex: readIndex };
}
