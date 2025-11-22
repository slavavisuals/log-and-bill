import { dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"

// Time boundaries (12:00 AM to 11:59 PM)
export const MAX_HOUR = 23

// Setup date-fns localizer for react-big-calendar
const locales = {
	"en-US": enUS,
}

export const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
})
