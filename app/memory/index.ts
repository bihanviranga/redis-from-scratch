// This is the master object which will contain all key/value pairs.
const memory: { [key: string]: string } = {};

export function set(key: string, value: any): boolean {
  const valueString = value.toString();
  memory[key] = valueString;

  return true;
}

export function get(key: string) {
  return memory[key];
}
