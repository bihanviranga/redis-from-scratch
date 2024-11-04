export default function (data: string): string {
  const echoPrefixLength = "ECHO ".length;
  const sliced = data.slice(echoPrefixLength);
  const response = `\$${sliced.length}\r\n${sliced}\r\n`;
  return response;
}
