import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/app/overview")({
	component: OverviewPage,
})

function OverviewPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Overview</h1>
				<p className="text-muted-foreground">
					Your weekly totals and visual insights
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Weekly Hours</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-muted-foreground flex h-[300px] items-center justify-center">
							Bar chart will be displayed here
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Activity Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-muted-foreground flex h-[300px] items-center justify-center">
							Pie/Donut chart will be displayed here
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
