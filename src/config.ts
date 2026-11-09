export const config = {
  port: parseInt(process.env.PORT || "7080", 10),
  host: process.env.HOST || "0.0.0.0",
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || "7080"}`,
  koolBaseUrl: process.env.KOOL_BASE_URL || "https://kool.ws",
  cache: {
    liveCatalogTtlMs: 10 * 60 * 1000,   // 10 minutes
    vodSourcesTtlMs: 5 * 60 * 1000,     // 5 minutes
    resolvedStreamTtlMs: 15 * 60 * 1000 // 15 minutes
  },
  httpTimeoutMs: 10000,
  maxClientFetchHops: 6
};
