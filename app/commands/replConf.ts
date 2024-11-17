import { OK } from "../consts/responses";

export default function (data: Array<string>) {
  console.log("REPLCONF:", data.toString());

  return OK;
}
