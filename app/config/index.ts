import { setReplicationData } from "../replication";
import { handshake } from "../replication/handshake";
import { ConfigKey, type ConfigMap } from "../types/config";
import { ReplicationDataKey } from "../types/replication";

const config: ConfigMap = {
  [ConfigKey.dir]: "./",
  [ConfigKey.dbfilename]: "dump.rdb",
  [ConfigKey.port]: "6379",
  [ConfigKey.replicaof]: "",
};

export function readCommandLineArguments() {
  if (!process.argv || process.argv.length <= 2) return;

  for (let i = 2; i < process.argv.length; ) {
    // Slice to remove the prefix '--'
    const arg = process.argv[i].slice(2);

    if (Object.values(ConfigKey).includes(arg as ConfigKey)) {
      const argValueIndex = i + 1;
      if (argValueIndex < process.argv.length) {
        const argName = arg as ConfigKey;
        const argValue = process.argv[argValueIndex];
        config[argName] = argValue;
        i += 2;
      }
    } else {
      console.log(
        `[config] Ignoring unsupported parameter '${arg}' and corresponding value '${process.argv[i + 1]}'`,
      );
      i += 2;
    }
  }

  console.log("[config] Configuration:", config);
  processCommandLineArguments();
}

function processCommandLineArguments() {
  // If replicaof value is provided, if means this is a slave instance,
  // and we should start the handshake with the master.
  if (config.replicaof !== "") {
    setReplicationData(ReplicationDataKey.role, "slave");
    handshake();
  }
}

export function readConfig(key: string) {
  return config[key as ConfigKey];
}
