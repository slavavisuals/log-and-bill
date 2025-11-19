import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/app/analyze")({
	component: AnalyzePage,
})

function AnalyzePage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Analyze</h1>
				<p className="text-muted-foreground">Reports and time insights</p>
			</div>

			<Tabs defaultValue="summary" className="space-y-4">
				<TabsList>
					<TabsTrigger value="summary">Summary</TabsTrigger>
					<TabsTrigger value="detailed">Detailed</TabsTrigger>
					<TabsTrigger value="invoice">Create Invoice</TabsTrigger>
					<TabsTrigger value="export">Export to PDF</TabsTrigger>
				</TabsList>

				<TabsContent value="summary" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">
									Total Hours
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0h</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">
									Billable Hours
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0h</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Average</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0h/day</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Duration by Day</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground flex h-[300px] items-center justify-center">
									Bar chart will be displayed here
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Activity Breakdown</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground flex h-[300px] items-center justify-center">
									Pie/Donut chart will be displayed here
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="detailed">
					<Card>
						<CardContent className="pt-6">
							<div className="text-muted-foreground flex h-[400px] items-center justify-center">
								Detailed report table will be displayed here
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="invoice">
					<Card>
						<CardContent className="pt-6">
							<div className="text-muted-foreground flex h-[400px] items-center justify-center">
								Invoice creation form will be displayed here
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="export">
					<Card>
						<CardContent className="pt-6">
							<div className="text-muted-foreground flex h-[400px] items-center justify-center">
								PDF export options will be displayed here
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
