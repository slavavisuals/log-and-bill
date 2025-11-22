import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"

interface CalendarHeaderProps {
	weekStart: Date
	weekEnd: Date
	weekNumber: number
	onPreviousWeek: () => void
	onNextWeek: () => void
	onToday: () => void
}

export function CalendarHeader({
	weekStart,
	weekEnd,
	weekNumber,
	onPreviousWeek,
	onNextWeek,
	onToday,
}: CalendarHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon" onClick={onPreviousWeek}>
					<ChevronLeft className="size-4" />
				</Button>
				<Button variant="outline" size="icon" onClick={onNextWeek}>
					<ChevronRight className="size-4" />
				</Button>
				<Button variant="outline" onClick={onToday}>
					Today
				</Button>
			</div>
			<CardTitle className="text-lg">
				{format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
				<span className="text-muted-foreground ml-2 font-normal">
					Week {weekNumber}
				</span>
			</CardTitle>
			<div />
		</div>
	)
}
