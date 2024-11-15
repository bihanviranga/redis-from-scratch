import { encodeError } from "../resp/encode";

export default function (data: Array<string>) {
  console.log("INFO", data);

  if (data[0] === "replication") {
  }

  return encodeError("Not implemented: INFO");
}
