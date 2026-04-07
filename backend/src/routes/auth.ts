import express from "express";
import bcrypt from "bcrypt";
import { signAuthToken } from "../auth/jwt.js";
import { getPrisma } from "../db/postgres.js";
import { loginQuerySchema, registerQuerySchema } from "../schemas/auth.js";
import { authMiddleware } from "../middleware/auth.js";
const apiRouter = express.Router();

const prisma = getPrisma();
const publicUserSelect = {
    id: true,
    email: true,
    fname: true,
    lname: true,
    created_at: true,
    updated_at: true,
} as const;

apiRouter.post("/register", async (req, res) => {
    const parsedQuery = registerQuerySchema.safeParse(req.body);

    if (!parsedQuery.success) {
        res.status(400).json({
            error: "Invalid request query",
            details: parsedQuery.error.flatten(),
        });
        return;
    }

    const { email, fname, lname, password } = parsedQuery.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fname,
                lname,
            },
            select: publicUserSelect,
        });

        const token = await signAuthToken(user);

        res.json({ user, token });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
  
});

apiRouter.post("/login", async (req, res) => {
    const parsedQuery = loginQuerySchema.safeParse(req.body);

    if (!parsedQuery.success) {
        res.status(400).json({
            error: "Invalid request query",
            details: parsedQuery.error.flatten(),
        });
        return;
    }

    const { email, password } = parsedQuery.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                ...publicUserSelect,
                password: true,
            },
        });

        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const { password: _password, ...safeUser } = user;
        const token = await signAuthToken(safeUser);

        res.json({ user: safeUser, token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Failed to login user" });
    }
});

apiRouter.get("/me", authMiddleware, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    res.json({ user: req.user });
});

export { apiRouter };