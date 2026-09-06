import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtHeader, type SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
export interface AuthenticatedUser {
  sub: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback): void {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }

    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticate = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or malformed Authorization header" });
      return;
    }

    const token = authHeader.slice(7);

    jwt.verify(
      token,
      getSigningKey,
      {
        issuer: process.env.KEYCLOAK_ISSUER,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          res.status(401).json({ message: "Invalid or expired token" });
          return;
        }

        if (typeof decoded !== "object" || decoded === null) {
          res.status(401).json({ message: "Malformed token payload" });
          return;
        }

        const sub = typeof decoded.sub === "string" ? decoded.sub : undefined;

        if (!sub) {
          res.status(401).json({ message: "Token missing sub claim" });
          return;
        }


        const realmRoles: string[] =
          (decoded as Record<string, unknown> & { realm_access?: { roles?: string[] } })
            .realm_access?.roles ?? [];

        const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "";
        const clientRoles: string[] =
          (
            decoded as Record<
              string,
              unknown
            > & { resource_access?: Record<string, { roles?: string[] }> }
          ).resource_access?.[clientId]?.roles ?? [];

        req.user = {
          sub,
          roles: [...new Set([...realmRoles, ...clientRoles])],
        };

        next();
      },
    );
  };
};
