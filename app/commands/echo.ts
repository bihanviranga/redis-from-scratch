export default function (data: Array<string>): string {
  let response = ``;
  data.forEach((item) => {
    const encoded = `\$${item.length}\r\n${item}\r\n`;
    response += encoded;
  });
  return response;
}
