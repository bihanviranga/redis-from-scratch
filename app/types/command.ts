export enum COMMAND {
  PING = "ping",
  ECHO = "echo",
  SET = "set",
  GET = "get",
  CONFIG = "config",
  KEYS = "keys",
  INFO = "info",
  REPLCONF = "replconf",
}

export enum SUBCOMMAND {
  LISTENING_PORT = "listening-port",
  CAPA = "capa",
}
