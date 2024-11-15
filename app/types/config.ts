export enum ConfigKey {
  // Name of the database file
  dbfilename = "dbfilename",
  // Location of the database file
  dir = "dir",
  // listening port
  port = "port",
}

export type ConfigMap = Record<ConfigKey, string>;
