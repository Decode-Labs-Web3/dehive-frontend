export interface FingerprintResult {
  fingerprint_hashed: string;
  browser: string;
  device: string;
}

export interface UserAgentData {
  brands: Array<{ brand: string; version: string }>;
}

export interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: UserAgentData;
}
