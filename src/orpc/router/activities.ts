import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

const MAX_TAGS_PER_ACTIVITY = 5

// List activities for a date range
export const listActivities = os
	.input(
		z.object({
			clerkId: z.string(),
			startDate: z.string().datetime(),
			endDate: z.string().datetime(),
		})
	)
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const activities = await prisma.log_and_bill_activities.findMany({
			where: {
				userId: user.id,
				startTime: {
					gte: new Date(input.startDate),
				},
				endTime: {
					lte: new Date(input.endDate),
				},
			},
			include: {
				project: {
					select: { id: true, name: true, color: true, hourlyRate: true },
				},
				tags: {
					include: {
						tag: true,
					},
				},
			},
			orderBy: { startTime: "asc" },
		})

		return activities
	})

// Create a new activity
export const createActivity = os
	.input(
		z.object({
			clerkId: z.string(),
			name: z.string().min(1),
			description: z.string().nullable().optional(),
			projectId: z.string().uuid().nullable().optional(),
			startTime: z.string().datetime(),
			endTime: z.string().datetime(),
			isBillable: z.boolean().optional(),
			tagIds: z.array(z.string().uuid()).max(MAX_TAGS_PER_ACTIVITY).optional(),
		})
	)
	.handler(async ({ input }) => {
		const { clerkId, tagIds, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		// Calculate duration in minutes
		const start = new Date(data.startTime)
		const end = new Date(data.endTime)
		const duration = Math.round((end.getTime() - start.getTime()) / 60000)

		if (duration <= 0) {
			throw new Error("End time must be after start time")
		}

		const activity = await prisma.log_and_bill_activities.create({
			data: {
				userId: user.id,
				name: data.name,
				description: data.description,
				projectId: data.projectId,
				startTime: start,
				endTime: end,
				duration,
				isBillable: data.isBillable ?? true,
				tags: tagIds
					? {
							create: tagIds.map((tagId) => ({ tagId })),
						}
					: undefined,
			},
			include: {
				project: {
					select: { id: true, name: true, color: true, hourlyRate: true },
				},
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		return activity
	})

// Update an activity
export const updateActivity = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
			name: z.string().min(1).optional(),
			description: z.string().nullable().optional(),
			projectId: z.string().uuid().nullable().optional(),
			startTime: z.string().datetime().optional(),
			endTime: z.string().datetime().optional(),
			isBillable: z.boolean().optional(),
			tagIds: z.array(z.string().uuid()).max(MAX_TAGS_PER_ACTIVITY).optional(),
		})
	)
	.handler(async ({ input }) => {
		const { id, clerkId, tagIds, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		// Get current activity for duration calculation
		const current = await prisma.log_and_bill_activities.findUnique({
			where: { id, userId: user.id },
		})

		if (!current) {
			throw new Error("Activity not found")
		}

		// Calculate new duration if times changed
		const start = data.startTime ? new Date(data.startTime) : current.startTime
		const end = data.endTime ? new Date(data.endTime) : current.endTime
		const duration = Math.round((end.getTime() - start.getTime()) / 60000)

		if (duration <= 0) {
			throw new Error("End time must be after start time")
		}

		// Update activity with tags if provided
		const activity = await prisma.log_and_bill_activities.update({
			where: { id, userId: user.id },
			data: {
				...data,
				startTime: start,
				endTime: end,
				duration,
				tags: tagIds
					? {
							deleteMany: {},
							create: tagIds.map((tagId) => ({ tagId })),
						}
					: undefined,
			},
			include: {
				project: {
					select: { id: true, name: true, color: true, hourlyRate: true },
				},
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		return activity
	})

// Delete an activity
export const deleteActivity = os
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

		await prisma.log_and_bill_activities.delete({
			where: { id: input.id, userId: user.id },
		})

		return { success: true }
	})

// Duplicate an activity
export const duplicateActivity = os
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

		// Get original activity
		const original = await prisma.log_and_bill_activities.findUnique({
			where: { id: input.id, userId: user.id },
			include: {
				tags: true,
			},
		})

		if (!original) {
			throw new Error("Activity not found")
		}

		// Create duplicate with same duration, shifted by duration
		const newStart = new Date(original.endTime)
		const newEnd = new Date(newStart.getTime() + original.duration * 60000)

		const duplicate = await prisma.log_and_bill_activities.create({
			data: {
				userId: user.id,
				name: original.name,
				description: original.description,
				projectId: original.projectId,
				startTime: newStart,
				endTime: newEnd,
				duration: original.duration,
				isBillable: original.isBillable,
				tags: {
					create: original.tags.map((t) => ({ tagId: t.tagId })),
				},
			},
			include: {
				project: {
					select: { id: true, name: true, color: true, hourlyRate: true },
				},
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})

		return duplicate
	})

// Get activity statistics for a date range
export const getActivityStats = os
	.input(
		z.object({
			clerkId: z.string(),
			startDate: z.string().datetime(),
			endDate: z.string().datetime(),
		})
	)
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const activities = await prisma.log_and_bill_activities.findMany({
			where: {
				userId: user.id,
				startTime: {
					gte: new Date(input.startDate),
				},
				endTime: {
					lte: new Date(input.endDate),
				},
			},
			include: {
				project: {
					select: { id: true, name: true, hourlyRate: true },
				},
			},
		})

		// Calculate totals
		const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0)
		const billableMinutes = activities
			.filter((a) => a.isBillable)
			.reduce((sum, a) => sum + a.duration, 0)

		// Group by project
		const byProject = activities.reduce(
			(acc, a) => {
				const projectId = a.projectId || "no-project"
				const projectName = a.project?.name || "No Project"
				if (!acc[projectId]) {
					acc[projectId] = { name: projectName, minutes: 0 }
				}
				acc[projectId].minutes += a.duration
				return acc
			},
			{} as Record<string, { name: string; minutes: number }>
		)

		return {
			totalHours: totalMinutes / 60,
			billableHours: billableMinutes / 60,
			activityCount: activities.length,
			byProject: Object.entries(byProject).map(([id, data]) => ({
				id,
				name: data.name,
				hours: data.minutes / 60,
			})),
		}
	})
