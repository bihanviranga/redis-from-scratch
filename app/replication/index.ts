import { encodeBulkString } from "../resp/encode";

const replicationData = {
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
