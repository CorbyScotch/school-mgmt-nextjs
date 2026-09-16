import bcrypt from "bcryptjs";

export async function savePassword(password) {
  return bcrypt.hash(password, 10);
}
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
