import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../auth/jwt.js";

const publicRoutes = new Set(["/auth/register", "/auth/login"]);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (publicRoutes.has(req.path)) {
        next();
        return;
    }

    const authorizationHeader = req.header("authorization");

    if (!authorizationHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();

    try {
        req.user = await verifyAuthToken(token);
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
