import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/app/calendar")({
	component: CalendarPage,
})

function CalendarPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
				<p className="text-muted-foreground">
					Track your time with the calendar scheduler
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Time Tracking Calendar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground flex h-[600px] items-center justify-center">
						Calendar scheduler will be displayed here
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
