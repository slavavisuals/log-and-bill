import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

const MAX_TAGS_PER_USER = 100

// List all tags for user
export const listTags = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const tags = await prisma.log_and_bill_tags.findMany({
			where: { userId: user.id },
			orderBy: { name: "asc" },
		})

		return tags
	})

// Create a new tag
export const createTag = os
	.input(
		z.object({
			clerkId: z.string(),
			name: z.string().min(1).max(50),
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

		// Check tag count limit
		const tagCount = await prisma.log_and_bill_tags.count({
			where: { userId: user.id },
		})

		if (tagCount >= MAX_TAGS_PER_USER) {
			throw new Error(`Maximum of ${MAX_TAGS_PER_USER} tags allowed`)
		}

		const tag = await prisma.log_and_bill_tags.create({
			data: {
				userId: user.id,
				...data,
			},
		})

		return tag
	})

// Update a tag
export const updateTag = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
			name: z.string().min(1).max(50).optional(),
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

		const tag = await prisma.log_and_bill_tags.update({
			where: { id, userId: user.id },
			data,
		})

		return tag
	})

// Delete a tag
export const deleteTag = os
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

		await prisma.log_and_bill_tags.delete({
			where: { id: input.id, userId: user.id },
		})

		return { success: true }
	})
