export enum ConfigKey {
  // Name of the database file
  dbfilename = "dbfilename",
  // Location of the database file
  dir = "dir",
  // Listening port
  port = "port",
  // Address of the master server (if this one is a replica)
  // Ex: --replicaof "localhost 6379"
  replicaof = "replicaof",
}

export type ConfigMap = Record<ConfigKey, string>;
