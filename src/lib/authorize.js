export default function authorize(user, allowedRoles) {
  if (!Array.isArray(allowedRoles)) {
    return [allowedRoles].includes(user.role);
  }
  return allowedRoles.includes(user.role);
}
