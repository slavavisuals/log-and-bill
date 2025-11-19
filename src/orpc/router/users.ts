import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

// Get or create user from Clerk ID
export const getOrCreateUser = os
	.input(
		z.object({
			clerkId: z.string(),
			email: z.string().email(),
			name: z.string(),
		})
	)
	.handler(async ({ input }) => {
		// Check if user exists
		let user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
			include: { settings: true },
		})

		if (!user) {
			// Create new user with default settings
			user = await prisma.log_and_bill_users.create({
				data: {
					clerkId: input.clerkId,
					email: input.email,
					name: input.name,
					settings: {
						create: {
							defaultHourlyRate: 0,
							currency: "USD",
							timeFormat: "24h",
							newProjectsBillable: true,
						},
					},
				},
				include: { settings: true },
			})
		}

		return user
	})

// Get current user by Clerk ID
export const getCurrentUser = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
			include: { settings: true },
		})

		if (!user) {
			throw new Error("User not found")
		}

		return user
	})
