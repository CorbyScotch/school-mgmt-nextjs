export default function authorize(user, allowedRoles) {
  if (!user || !user.role) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}
