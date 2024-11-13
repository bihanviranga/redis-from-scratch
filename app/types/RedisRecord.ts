export interface RedisRecord {
  value: string;
  created: number;
  ttl?: number | bigint;
}
