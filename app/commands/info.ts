import { replicationCommand } from "../replication";
import { encodeError } from "../resp/encode";

export default function (data: Array<string>) {
  if (data[0] === "replication") {
    return replicationCommand();
  }

  return encodeError("Not implemented: INFO");
}
