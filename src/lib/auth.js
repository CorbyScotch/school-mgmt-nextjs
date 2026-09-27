import { jwtVerify, SignJWT } from "jose";

const getJwtSecret = () => {
  const secretValue = process.env.JWT_SECRET;

  if (!secretValue || secretValue.length < 32) {
    throw new Error(
      "JWT_SECRET must be defined in the environment and at least 32 characters long.",
    );
  }

  return new TextEncoder().encode(secretValue);
};

export async function createToken(payload) {
  const secret = getJwtSecret();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token) {
  const secret = getJwtSecret();
  return await jwtVerify(token, secret);
}
