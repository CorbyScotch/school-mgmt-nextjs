export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function normalizeName(value) {
  return String(value ?? "").trim();
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

export function isStrongPassword(value) {
  const password = String(value ?? "");
  return (
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  );
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown-client";
}
