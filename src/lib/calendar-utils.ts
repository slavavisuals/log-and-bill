import { toast } from "sonner"
import { MAX_HOUR } from "./calendar-constants"
import type { CalendarEvent } from "./calendar-types"

// Validate time range is within bounds
export const validateTimeBounds = (_start: Date, end: Date): boolean => {
	const endHour = end.getHours()
	const endMinutes = end.getMinutes()

	// Check end time (allow up to 23:59 - 11:59 PM)
	if (endHour >= MAX_HOUR && endMinutes > 0) {
		toast.error(`Activities must end by 11:59 PM`)
		return false
	}

	return true
}

// Check for overlapping events
export const checkOverlap = (
	events: CalendarEvent[],
	newStart: Date,
	newEnd: Date,
	excludeId?: string
): boolean => {
	return events.some((event) => {
		if (excludeId && event.id === excludeId) return false
		return newStart < event.end && newEnd > event.start
	})
}
