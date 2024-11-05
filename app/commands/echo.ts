import { encodeBulkString } from "../resp/encode";

export default function (data: Array<string>): string {
  let response = ``;
  data.forEach((item) => {
    const encoded = encodeBulkString(item);
    response += encoded;
  });
  return response;
}
