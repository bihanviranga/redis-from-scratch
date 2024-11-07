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

export enum RDB_LENGTH_ENCODING_TYPES {
  READ_6_BITS = 0b00,
  READ_14_BITS = 0b01,
  READ_4_BYTES = 0b10,
  SPECIAL_ENCODING = 0b11,
}

export enum RDB_STRING_ENCODING_TYPES {
  INT_8_BIT = 0b00,
  INT_16_BIT = 0b01,
  INT_32_BIT = 0b10,
  COMPRESSED_STRING = 0b11,
}
