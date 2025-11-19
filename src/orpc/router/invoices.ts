import { os } from "@orpc/server"
import * as z from "zod"
import { prisma } from "@/db"

// List all invoices for user
export const listInvoices = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const invoices = await prisma.log_and_bill_invoices.findMany({
			where: { userId: user.id },
			include: {
				client: {
					select: { id: true, name: true },
				},
				_count: {
					select: { items: true },
				},
			},
			orderBy: { invoiceDate: "desc" },
		})

		return invoices
	})

// Get a single invoice with items
export const getInvoice = os
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

		const invoice = await prisma.log_and_bill_invoices.findUnique({
			where: { id: input.id, userId: user.id },
			include: {
				client: true,
				items: {
					orderBy: { date: "asc" },
				},
			},
		})

		if (!invoice) {
			throw new Error("Invoice not found")
		}

		return invoice
	})

// Create a new invoice
export const createInvoice = os
	.input(
		z.object({
			clerkId: z.string(),
			clientId: z.string().uuid().nullable().optional(),
			invoiceNumber: z.string().min(1),
			invoiceDate: z.string().datetime(),
			dueDate: z.string().datetime().nullable().optional(),
			billedTo: z.string().nullable().optional(),
			payTo: z.string().nullable().optional(),
			taxType: z.string().nullable().optional(),
			taxRate: z.number().nullable().optional(),
			currency: z.string().default("USD"),
			notes: z.string().nullable().optional(),
			items: z.array(
				z.object({
					date: z.string().datetime(),
					description: z.string(),
					hours: z.number(),
					rate: z.number(),
					amount: z.number(),
				})
			),
		})
	)
	.handler(async ({ input }) => {
		const { clerkId, items, ...data } = input

		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		// Calculate totals
		const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
		const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0
		const total = subtotal + taxAmount

		const invoice = await prisma.log_and_bill_invoices.create({
			data: {
				userId: user.id,
				clientId: data.clientId,
				invoiceNumber: data.invoiceNumber,
				invoiceDate: new Date(data.invoiceDate),
				dueDate: data.dueDate ? new Date(data.dueDate) : null,
				billedTo: data.billedTo,
				payTo: data.payTo,
				taxType: data.taxType,
				taxRate: data.taxRate,
				currency: data.currency,
				subtotal,
				taxAmount,
				total,
				notes: data.notes,
				items: {
					create: items.map((item) => ({
						date: new Date(item.date),
						description: item.description,
						hours: item.hours,
						rate: item.rate,
						amount: item.amount,
					})),
				},
			},
			include: {
				client: true,
				items: {
					orderBy: { date: "asc" },
				},
			},
		})

		return invoice
	})

// Update invoice status
export const updateInvoiceStatus = os
	.input(
		z.object({
			id: z.string().uuid(),
			clerkId: z.string(),
			status: z.enum(["draft", "sent", "paid"]),
		})
	)
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const invoice = await prisma.log_and_bill_invoices.update({
			where: { id: input.id, userId: user.id },
			data: { status: input.status },
		})

		return invoice
	})

// Delete an invoice
export const deleteInvoice = os
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

		await prisma.log_and_bill_invoices.delete({
			where: { id: input.id, userId: user.id },
		})

		return { success: true }
	})

// Generate next invoice number
export const getNextInvoiceNumber = os
	.input(z.object({ clerkId: z.string() }))
	.handler(async ({ input }) => {
		const user = await prisma.log_and_bill_users.findUnique({
			where: { clerkId: input.clerkId },
		})

		if (!user) {
			throw new Error("User not found")
		}

		const lastInvoice = await prisma.log_and_bill_invoices.findFirst({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			select: { invoiceNumber: true },
		})

		if (!lastInvoice) {
			return "INV-0001"
		}

		// Try to extract number from last invoice number
		const match = lastInvoice.invoiceNumber.match(/(\d+)$/)
		if (match) {
			const num = parseInt(match[1], 10) + 1
			const prefix = lastInvoice.invoiceNumber.replace(/\d+$/, "")
			return `${prefix}${num.toString().padStart(4, "0")}`
		}

		return `INV-0001`
	})
