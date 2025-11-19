import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

// List all active projects for user
export const listProjects = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const projects = await prisma.log_and_bill_projects.findMany({
			where: {
				userId: user.id,
				isDeleted: false,
			},
			include: {
				client: {
					select: { id: true, name: true },
				},
				_count: {
					select: { activities: true },
				},
			},
			orderBy: { createdAt: "desc" },
		})

		return projects
	})

// Create a new project
export const createProject = os
	.input(
		z.object({
			clerkId: z.string(),
			name: z.string().min(1),
			clientId: z.string().uuid().nullable().optional(),
			color: z.string().nullable().optional(),
			hourlyRate: z.number().nullable().optional(),
			isBillable: z.boolean().optional(),
		})
	)
	.handler(async ({ input }) => {
		const { clerkId, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
			include: { settings: true },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const project = await prisma.log_and_bill_projects.create({
			data: {
				userId: user.id,
				name: data.name,
				clientId: data.clientId,
				color: data.color,
				hourlyRate: data.hourlyRate,
				isBillable: data.isBillable ?? user.settings?.newProjectsBillable ?? true,
			},
			include: {
				client: {
					select: { id: true, name: true },
				},
			},
		})

		return project
	})

// Update a project
export const updateProject = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
			name: z.string().min(1).optional(),
			clientId: z.string().uuid().nullable().optional(),
			color: z.string().nullable().optional(),
			hourlyRate: z.number().nullable().optional(),
			isBillable: z.boolean().optional(),
		})
	)
	.handler(async ({ input }) => {
		const { id, clerkId, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const project = await prisma.log_and_bill_projects.update({
			where: { id, userId: user.id },
			data,
			include: {
				client: {
					select: { id: true, name: true },
				},
			},
		})

		return project
	})

// Soft delete a project
export const deleteProject = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
		})
	)
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		await prisma.log_and_bill_projects.update({
			where: { id: input.id, userId: user.id },
			data: {
				isDeleted: true,
				deletedAt: new Date(),
			},
		})

		return { success: true }
	})
