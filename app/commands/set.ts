import { NULL_BULK_STRING, OK } from "../consts/responses";
import { set } from "../memory";

export default function (data: Array<string>) {
  console.log("SET", data);
  const response = set(data[0], data[1]);
  if (response) {
    return OK;
  }

  return NULL_BULK_STRING;
}
