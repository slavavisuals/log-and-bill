interface CalendarStatsProps {
	totalHours: number
	totalMinutes: number
}

export function CalendarStats({ totalHours, totalMinutes }: CalendarStatsProps) {
	return (
		<div className="text-right">
			<div className="text-2xl font-bold">
				{totalHours}h {totalMinutes}m
			</div>
			<div className="text-muted-foreground text-sm">Total this week</div>
		</div>
	)
}
