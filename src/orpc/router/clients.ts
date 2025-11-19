import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

// List all active clients for user
export const listClients = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const clients = await prisma.log_and_bill_clients.findMany({
			where: {
				userId: user.id,
				isDeleted: false,
			},
			include: {
				_count: {
					select: { projects: true, invoices: true },
				},
			},
			orderBy: { createdAt: "desc" },
		})

		return clients
	})

// Create a new client
export const createClient = os
	.input(
		z.object({
			clerkId: z.string(),
			name: z.string().min(1),
			email: z.string().email().nullable().optional(),
			phone: z.string().nullable().optional(),
			address: z.string().nullable().optional(),
			notes: z.string().nullable().optional(),
			color: z.string().nullable().optional(),
		})
	)
	.handler(async ({ input }) => {
		const { clerkId, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const client = await prisma.log_and_bill_clients.create({
			data: {
				userId: user.id,
				...data,
			},
		})

		return client
	})

// Update a client
export const updateClient = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
			name: z.string().min(1).optional(),
			email: z.string().email().nullable().optional(),
			phone: z.string().nullable().optional(),
			address: z.string().nullable().optional(),
			notes: z.string().nullable().optional(),
			color: z.string().nullable().optional(),
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

		const client = await prisma.log_and_bill_clients.update({
			where: { id, userId: user.id },
			data,
		})

		return client
	})

// Soft delete a client
export const deleteClient = os
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

		await prisma.log_and_bill_clients.update({
			where: { id: input.id, userId: user.id },
			data: {
				isDeleted: true,
				deletedAt: new Date(),
			},
		})

		return { success: true }
	})
