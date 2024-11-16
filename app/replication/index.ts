import { encodeBulkString } from "../resp/encode";

// TODO: move the replication data keys to an enum
const replicationData: Record<string, string | number> = {
  role: "master",
  connected_slaves: 0,
};

export function replicationCommand() {
  let response = "# Replication\r\n";
  Object.entries(replicationData).forEach((entry) => {
    response = response + `${entry[0]}:${entry[1]}\r\n`;
  });
  const encoded = encodeBulkString(response);
  return encoded;
}

export function setReplicationData(key: string, value: string | number) {
  replicationData[key] = value;
}
