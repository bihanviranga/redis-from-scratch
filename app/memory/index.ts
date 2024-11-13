import type { RedisRecord } from "../types/RedisRecord";

// This is the master object which will contain all key/value pairs.
const memory: { [key: string]: RedisRecord } = {};

// Returns true after saving successfully.
export function set(key: string, value: RedisRecord): boolean {
  memory[key] = value;

  return true;
}

export function get(key: string): RedisRecord {
  return memory[key];
}

export function getKeysByPattern(pattern: string): Array<string> {
  if (pattern === "*") {
    return Object.keys(memory);
  }

  return [];
}
