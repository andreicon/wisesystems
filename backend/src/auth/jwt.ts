import { SignJWT, jwtVerify } from "jose";
import { loadEnv } from "../config/env.js";

type AuthTokenUser = {
  id: string;
  email: string;
  fname?: string | null;
  lname?: string | null;
};

const encoder = new TextEncoder();

function getJwtSecret(): Uint8Array {
  const env = loadEnv();
  return encoder.encode(env.JWT_SECRET);
}

export async function signAuthToken(user: AuthTokenUser): Promise<string> {
  const env = loadEnv();

  return await new SignJWT({
    email: user.email,
    fname: user.fname ?? null,
    lname: user.lname ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenUser> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    id: payload.sub,
    email: payload.email,
    fname: typeof payload.fname === "string" ? payload.fname : null,
    lname: typeof payload.lname === "string" ? payload.lname : null,
  };
}
