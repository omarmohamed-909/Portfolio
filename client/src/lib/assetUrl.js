export function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

export function resolveAssetUrl(assetValue, fallbackPrefix = "") {
  if (!assetValue || typeof assetValue !== "string") {
    return "";
  }

  const normalizedValue = assetValue.trim();

  if (
    !normalizedValue ||
    normalizedValue === "Nothing" ||
    normalizedValue === "undefined" ||
    normalizedValue === "null"
  ) {
    return "";
  }

  if (isAbsoluteUrl(normalizedValue)) {
    return normalizedValue;
  }

  return `${fallbackPrefix}${normalizedValue}`;
}
