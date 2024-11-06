import * as fs from "fs";
import { readConfig } from "../config";
import { ConfigKey } from "../types/config";
import { MAGIC_NUMBER_VALUE } from "../types/persistence";

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

  const magicNumber = fileBuffer.subarray(0, MAGIC_NUMBER_VALUE.length);
  if (magicNumber.toString() !== MAGIC_NUMBER_VALUE) {
    console.error(
      `[WARN]\t[persistence]\tInvalid file header in ${path}. Aborting reading.`,
    );
    return;
  }

  const rdbVersionNumberBytes = fileBuffer.subarray(
    MAGIC_NUMBER_VALUE.length,
    MAGIC_NUMBER_VALUE.length + RDB_VERSION_NUMBER_LENGTH,
  );
  const rdbVersionNumber = parseInt(rdbVersionNumberBytes.toString(), 2);
  console.log("[persistence]\tRDB version:", rdbVersionNumber);
}
