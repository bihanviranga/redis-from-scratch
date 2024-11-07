export const MAGIC_NUMBER_VALUE = "REDIS";

export type ParseMetadataResult = {
  key: string;
  value: string | number;
  endIndex: number;
};

export enum RDB_OP_CODES {
  AUX = 0xfa,
  RESIZEDB = 0xfb,
  EXPIRETIMEMS = 0xfc,
  EXPIRETIME = 0xfd,
  SELECTDB = 0xfe,
  EOF = 0xff,
}
