import express from "express";
import { getPrisma } from "../db/postgres.js";
import {
	createTodoSchema,
	todoIdParamSchema,
	todoPaginationQuerySchema,
	updateTodoSchema,
} from "../schemas/todo.js";
const todoRouter = express.Router();

const prisma = getPrisma();

const todoSelect = {
	id: true,
	title: true,
	description: true,
	completed: true,
	owner_id: true,
	created_at: true,
	updated_at: true,
} as const;

todoRouter.get("/", async (req, res) => {
	const userId = req.user!.id;
	const parsedQuery = todoPaginationQuerySchema.safeParse(req.query);

	if (!parsedQuery.success) {
		res.status(400).json({ error: "Invalid pagination query", details: parsedQuery.error.flatten() });
		return;
	}

	const { page, limit } = parsedQuery.data;
	const skip = (page - 1) * limit;

	try {
		const [todos, total] = await Promise.all([
			prisma.todo.findMany({
				where: { owner_id: userId },
				orderBy: { created_at: "desc" },
				skip,
				take: limit,
				select: todoSelect,
			}),
			prisma.todo.count({
				where: { owner_id: userId },
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		res.json({
			todos,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching todos:", error);
		res.status(500).json({ error: "Failed to fetch todos" });
	}
});

todoRouter.get("/:id", async (req, res) => {
	const userId = req.user!.id;

	const parsedParams = todoIdParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		res.status(400).json({ error: "Invalid todo id", details: parsedParams.error.flatten() });
		return;
	}

	try {
		const todo = await prisma.todo.findFirst({
			where: {
				id: parsedParams.data.id,
				owner_id: userId,
			},
			select: todoSelect,
		});

		if (!todo) {
			res.status(404).json({ error: "Todo not found" });
			return;
		}

		res.json({ todo });
	} catch (error) {
		console.error("Error fetching todo:", error);
		res.status(500).json({ error: "Failed to fetch todo" });
	}
});

todoRouter.post("/", async (req, res) => {
	const userId = req.user!.id;

	const parsedBody = createTodoSchema.safeParse(req.body);

	if (!parsedBody.success) {
		res.status(400).json({ error: "Invalid todo payload", details: parsedBody.error.flatten() });
		return;
	}

	try {
		const todo = await prisma.todo.create({
			data: {
				title: parsedBody.data.title,
				description: parsedBody.data.description,
				completed: parsedBody.data.completed ?? false,
				owner_id: userId,
			},
			select: todoSelect,
		});

		res.status(201).json({ todo });
	} catch (error) {
		console.error("Error creating todo:", error);
		res.status(500).json({ error: "Failed to create todo" });
	}
});

todoRouter.patch("/:id", async (req, res) => {
	const userId = req.user!.id;

	const parsedParams = todoIdParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		res.status(400).json({ error: "Invalid todo id", details: parsedParams.error.flatten() });
		return;
	}

	const parsedBody = updateTodoSchema.safeParse(req.body);

	if (!parsedBody.success) {
		res.status(400).json({ error: "Invalid todo payload", details: parsedBody.error.flatten() });
		return;
	}

	try {
		const existingTodo = await prisma.todo.findFirst({
			where: {
				id: parsedParams.data.id,
				owner_id: userId,
			},
			select: { id: true },
		});

		if (!existingTodo) {
			res.status(404).json({ error: "Todo not found" });
			return;
		}

		const todo = await prisma.todo.update({
			where: { id: parsedParams.data.id },
			data: parsedBody.data,
			select: todoSelect,
		});

		res.json({ todo });
	} catch (error) {
		console.error("Error updating todo:", error);
		res.status(500).json({ error: "Failed to update todo" });
	}
});

todoRouter.delete("/:id", async (req, res) => {
	const userId = req.user!.id;

	const parsedParams = todoIdParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		res.status(400).json({ error: "Invalid todo id", details: parsedParams.error.flatten() });
		return;
	}

	try {
		const existingTodo = await prisma.todo.findFirst({
			where: {
				id: parsedParams.data.id,
				owner_id: userId,
			},
			select: { id: true },
		});

		if (!existingTodo) {
			res.status(404).json({ error: "Todo not found" });
			return;
		}

		await prisma.todo.delete({
			where: { id: parsedParams.data.id },
		});

		res.status(204).send();
	} catch (error) {
		console.error("Error deleting todo:", error);
		res.status(500).json({ error: "Failed to delete todo" });
	}
});



export { todoRouter };