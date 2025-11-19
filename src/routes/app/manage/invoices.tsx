import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"

export const Route = createFileRoute("/app/manage/invoices")({
	component: InvoicesPage,
})

function InvoicesPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
					<p className="text-muted-foreground">
						Create and manage your invoices
					</p>
				</div>
				<Button>
					<Plus className="mr-2 size-4" />
					New Invoice
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Invoices</CardTitle>
					<CardDescription>
						A list of all your invoices with their status and totals.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice #</TableHead>
								<TableHead>Client</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-muted-foreground text-center"
								>
									No invoices yet. Create your first invoice to get started.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
