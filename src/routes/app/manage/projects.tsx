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

export const Route = createFileRoute("/app/manage/projects")({
	component: ProjectsPage,
})

function ProjectsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Projects</h1>
					<p className="text-muted-foreground">
						Manage your projects for time tracking
					</p>
				</div>
				<Button>
					<Plus className="mr-2 size-4" />
					New Project
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Projects</CardTitle>
					<CardDescription>
						A list of all your projects. Deleting a project will also remove all
						related activities.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Client</TableHead>
								<TableHead>Hourly Rate</TableHead>
								<TableHead>Billable</TableHead>
								<TableHead>Total Hours</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-muted-foreground text-center"
								>
									No projects yet. Create your first project to get started.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
