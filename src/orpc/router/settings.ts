import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

// Get user settings
export const getSettings = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
			include: { settings: true },
		})

		if (!user) {
			throw new Error("User not found")
		}

		return user.settings
	})

// Update user settings
export const updateSettings = os
	.input(
		z.object({
			clerkId: z.string(),
			weeklyHourLimit: z.number().nullable().optional(),
			monthlyHourLimit: z.number().nullable().optional(),
			defaultHourlyRate: z.number().optional(),
			currency: z.string().optional(),
			timeFormat: z.enum(["12h", "24h"]).optional(),
			newProjectsBillable: z.boolean().optional(),
			companyName: z.string().nullable().optional(),
			companyAddress: z.string().nullable().optional(),
			payToDetails: z.string().nullable().optional(),
			defaultTaxType: z.string().nullable().optional(),
			defaultTaxRate: z.number().nullable().optional(),
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

		const settings = await prisma.log_and_bill_user_settings.upsert({
			where: { userId: user.id },
			update: data,
			create: {
				userId: user.id,
				defaultHourlyRate: data.defaultHourlyRate ?? 0,
				currency: data.currency ?? "USD",
				timeFormat: data.timeFormat ?? "24h",
				newProjectsBillable: data.newProjectsBillable ?? true,
				...data,
			},
		})

		return settings
	})
