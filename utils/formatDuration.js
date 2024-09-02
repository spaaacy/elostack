export function formatDuration(duration_length, duration_type) {
  const pluralSuffix = duration_length > 1 ? "s" : "";
  return `${duration_length} ${duration_type}${pluralSuffix}`;
}
