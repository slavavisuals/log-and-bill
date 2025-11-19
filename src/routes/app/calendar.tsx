import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import { useUser } from "@clerk/clerk-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import {
	format,
	parse,
	startOfWeek,
	endOfWeek,
	getDay,
	addWeeks,
	subWeeks,
	getWeek,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { orpc } from "@/orpc/client"
import { toast } from "sonner"

import "react-big-calendar/lib/css/react-big-calendar.css"

export const Route = createFileRoute("/app/calendar")({
	component: CalendarPage,
})

// Setup date-fns localizer for react-big-calendar
const locales = {
	"en-US": enUS,
}

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
})

interface CalendarEvent {
	id: string
	title: string
	start: Date
	end: Date
	projectId: string | null
	projectName: string | null
	projectColor: string | null
	tagIds: string[]
	isBillable: boolean
}

interface ActivityFormData {
	id?: string
	name: string
	projectId: string | null
	tagIds: string[]
	isBillable: boolean
	startTime: Date
	endTime: Date
}

function CalendarPage() {
	const { user } = useUser()
	const [currentDate, setCurrentDate] = React.useState(new Date())
	const [events, setEvents] = React.useState<CalendarEvent[]>([])
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [selectedActivity, setSelectedActivity] = React.useState<ActivityFormData | undefined>()
	const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
	const [eventToDelete, setEventToDelete] = React.useState<CalendarEvent | null>(null)

	// Calculate week range
	const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
	const weekNumber = getWeek(currentDate)

	// Fetch data
	const { data: projects = [] } = orpc.listProjects.useQuery(
		{ clerkId: user?.id || "" },
		{ enabled: !!user?.id }
	)

	const { data: tags = [] } = orpc.listTags.useQuery(
		{ clerkId: user?.id || "" },
		{ enabled: !!user?.id }
	)

	const { data: activities, refetch: refetchActivities } = orpc.listActivities.useQuery(
		{
			clerkId: user?.id || "",
			startDate: weekStart.toISOString(),
			endDate: weekEnd.toISOString(),
		},
		{ enabled: !!user?.id }
	)

	// Mutations
	const createActivity = orpc.createActivity.useMutation({
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity created")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create activity")
		},
	})

	const updateActivity = orpc.updateActivity.useMutation({
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity updated")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update activity")
		},
	})

	const deleteActivity = orpc.deleteActivity.useMutation({
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity deleted")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete activity")
		},
	})

	const duplicateActivity = orpc.duplicateActivity.useMutation({
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity duplicated")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to duplicate activity")
		},
	})

	// Transform activities to calendar events
	React.useEffect(() => {
		if (activities) {
			const calendarEvents: CalendarEvent[] = activities.map((activity: any) => ({
				id: activity.id,
				title: activity.name,
				start: new Date(activity.startTime),
				end: new Date(activity.endTime),
				projectId: activity.projectId,
				projectName: activity.project?.name || null,
				projectColor: activity.project?.color || null,
				tagIds: activity.tags?.map((t: any) => t.tagId) || [],
				isBillable: activity.isBillable,
			}))
			setEvents(calendarEvents)
		}
	}, [activities])

	// Calculate total time for the week
	const totalMinutes = events.reduce((sum, event) => {
		return sum + (event.end.getTime() - event.start.getTime()) / 60000
	}, 0)
	const totalHours = Math.floor(totalMinutes / 60)
	const totalMins = Math.round(totalMinutes % 60)

	// Navigation handlers
	const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1))
	const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
	const goToToday = () => setCurrentDate(new Date())

	// Handle slot selection (creating new activity)
	const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
		setSelectedActivity({
			name: "",
			projectId: null,
			tagIds: [],
			isBillable: true,
			startTime: start,
			endTime: end,
		})
		setIsDialogOpen(true)
	}

	// Handle event selection (editing activity)
	const handleSelectEvent = (event: CalendarEvent) => {
		setSelectedActivity({
			id: event.id,
			name: event.title,
			projectId: event.projectId,
			tagIds: event.tagIds,
			isBillable: event.isBillable,
			startTime: event.start,
			endTime: event.end,
		})
		setIsDialogOpen(true)
	}

	// Handle save
	const handleSave = async (data: ActivityFormData) => {
		if (!user?.id) return

		if (data.id) {
			// Update existing
			await updateActivity.mutateAsync({
				id: data.id,
				clerkId: user.id,
				name: data.name,
				projectId: data.projectId,
				startTime: data.startTime.toISOString(),
				endTime: data.endTime.toISOString(),
				isBillable: data.isBillable,
				tagIds: data.tagIds,
			})
		} else {
			// Create new
			await createActivity.mutateAsync({
				clerkId: user.id,
				name: data.name,
				projectId: data.projectId,
				startTime: data.startTime.toISOString(),
				endTime: data.endTime.toISOString(),
				isBillable: data.isBillable,
				tagIds: data.tagIds,
			})
		}

		setIsDialogOpen(false)
		setSelectedActivity(undefined)
	}

	// Handle delete from dialog
	const handleDeleteFromDialog = () => {
		if (selectedActivity?.id) {
			setEventToDelete(events.find((e) => e.id === selectedActivity.id) || null)
			setIsDialogOpen(false)
			setDeleteConfirmOpen(true)
		}
	}

	// Handle duplicate
	const handleDuplicate = async (event: CalendarEvent) => {
		if (!user?.id) return
		await duplicateActivity.mutateAsync({
			id: event.id,
			clerkId: user.id,
		})
	}

	// Handle delete confirmation
	const handleConfirmDelete = async () => {
		if (!user?.id || !eventToDelete) return
		await deleteActivity.mutateAsync({
			id: eventToDelete.id,
			clerkId: user.id,
		})
		setDeleteConfirmOpen(false)
		setEventToDelete(null)
		setSelectedActivity(undefined)
	}

	// Custom event component with context menu
	const EventComponent = ({ event }: { event: CalendarEvent }) => (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className="h-full w-full overflow-hidden rounded px-1 py-0.5 text-xs"
					style={{
						backgroundColor: event.projectColor || "hsl(var(--primary))",
						color: "white",
					}}
				>
					<div className="font-medium">{event.title}</div>
					{event.projectName && (
						<div className="opacity-80">{event.projectName}</div>
					)}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={() => handleDuplicate(event)}>
					<Copy className="mr-2 size-4" />
					Duplicate
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => {
						setEventToDelete(event)
						setDeleteConfirmOpen(true)
					}}
					className="text-destructive"
				>
					<Trash2 className="mr-2 size-4" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
					<p className="text-muted-foreground">
						Track your time with the calendar scheduler
					</p>
				</div>
				<div className="text-right">
					<div className="text-2xl font-bold">
						{totalHours}h {totalMins}m
					</div>
					<div className="text-muted-foreground text-sm">Total this week</div>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={goToPreviousWeek}>
								<ChevronLeft className="size-4" />
							</Button>
							<Button variant="outline" size="icon" onClick={goToNextWeek}>
								<ChevronRight className="size-4" />
							</Button>
							<Button variant="outline" onClick={goToToday}>
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
				</CardHeader>
				<CardContent>
					<div className="h-[600px]">
						<BigCalendar
							localizer={localizer}
							events={events}
							startAccessor="start"
							endAccessor="end"
							view="week"
							views={["week"]}
							date={currentDate}
							onNavigate={setCurrentDate}
							selectable
							onSelectSlot={handleSelectSlot}
							onSelectEvent={handleSelectEvent}
							step={15}
							timeslots={4}
							min={new Date(0, 0, 0, 6, 0, 0)}
							max={new Date(0, 0, 0, 22, 0, 0)}
							components={{
								event: EventComponent,
							}}
							eventPropGetter={(event) => ({
								style: {
									backgroundColor: event.projectColor || "hsl(var(--primary))",
									border: "none",
									borderRadius: "4px",
								},
							})}
							dayPropGetter={(date) => {
								const isToday =
									format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
								return {
									style: isToday
										? { backgroundColor: "hsl(var(--accent) / 0.3)" }
										: {},
								}
							}}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Activity Form Dialog */}
			<ActivityFormDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open)
					if (!open) setSelectedActivity(undefined)
				}}
				activity={selectedActivity}
				projects={projects.map((p: any) => ({
					id: p.id,
					name: p.name,
					color: p.color,
				}))}
				tags={tags.map((t: any) => ({
					id: t.id,
					name: t.name,
					color: t.color,
				}))}
				onSave={handleSave}
				onDelete={selectedActivity?.id ? handleDeleteFromDialog : undefined}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Activity</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{eventToDelete?.title}"? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
