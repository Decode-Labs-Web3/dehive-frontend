export const getApiHeaders = (
  fingerprint?: string,
  additionalHeaders?: Record<string, string>
) => {
  return {
    "X-Frontend-Internal-Request": "true",
    ...(fingerprint && { "X-Fingerprint-Hashed": fingerprint }),
    ...additionalHeaders,
  };
};
