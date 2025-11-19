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

export const Route = createFileRoute("/app/manage/clients")({
	component: ClientsPage,
})

function ClientsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Clients</h1>
					<p className="text-muted-foreground">
						Manage your clients for billing and invoicing
					</p>
				</div>
				<Button>
					<Plus className="mr-2 size-4" />
					New Client
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Clients</CardTitle>
					<CardDescription>
						A list of all your clients. Deleting a client will also remove all
						related activities.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Projects</TableHead>
								<TableHead>Total Billed</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-muted-foreground text-center"
								>
									No clients yet. Create your first client to get started.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
