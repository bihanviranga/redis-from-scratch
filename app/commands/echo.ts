export default function (data: Array<string>): string {
  const responseLength = data.length;
  let response = `*${responseLength}\r\n`;
  data.forEach((item) => {
    const encoded = `\$${item.length}\r\n${item}\r\n`;
    response += encoded;
  });
  return response;
}
