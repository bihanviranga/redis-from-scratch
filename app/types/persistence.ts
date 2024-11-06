export const MAGIC_NUMBER_VALUE = "REDIS";

export type ParseMetadataResult = {
  key: string;
  value: string | number;
  endIndex: number;
};
