import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import { useUser } from "@clerk/clerk-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { useQuery, useMutation } from "@tanstack/react-query"
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
import { ChevronLeft, ChevronRight, Move, Copy, Pencil, Trash2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import { CloneActivityDialog } from "@/components/clone-activity-dialog"
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
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

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

// Create drag and drop calendar
const DragAndDropCalendar = withDragAndDrop(BigCalendar)

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
	const [isCloneDialogOpen, setIsCloneDialogOpen] = React.useState(false)
	const [activityToClone, setActivityToClone] = React.useState<{
		name: string
		projectId: string | null
		tagIds: string[]
		isBillable: boolean
		startTime: Date
		endTime: Date
	} | null>(null)

	// Ref to skip onSelectEvent when handling context menu actions
	const skipSelectEventRef = React.useRef(false)

	// Calculate week range
	const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
	const weekNumber = getWeek(currentDate)

	// Fetch data using correct oRPC pattern
	const { data: projects = [] } = useQuery(
		orpc.listProjects.queryOptions({
			input: { clerkId: user?.id || "" },
		})
	)

	const { data: tags = [] } = useQuery(
		orpc.listTags.queryOptions({
			input: { clerkId: user?.id || "" },
		})
	)

	const { data: activities, refetch: refetchActivities } = useQuery(
		orpc.listActivities.queryOptions({
			input: {
				clerkId: user?.id || "",
				startDate: weekStart.toISOString(),
				endDate: weekEnd.toISOString(),
			},
		})
	)

	// Mutations using correct oRPC pattern
	const { mutateAsync: createActivityMutation } = useMutation({
		mutationFn: orpc.createActivity.call,
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity created")
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create activity")
		},
	})

	const { mutateAsync: updateActivityMutation } = useMutation({
		mutationFn: orpc.updateActivity.call,
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity updated")
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to update activity")
		},
	})

	const { mutateAsync: deleteActivityMutation } = useMutation({
		mutationFn: orpc.deleteActivity.call,
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity deleted")
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to delete activity")
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

	// Check for overlapping events
	const checkOverlap = React.useCallback(
		(newStart: Date, newEnd: Date, excludeId?: string): boolean => {
			return events.some((event) => {
				if (excludeId && event.id === excludeId) return false
				return newStart < event.end && newEnd > event.start
			})
		},
		[events]
	)

	// Handle slot selection (creating new activity)
	const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
		// Check for overlap
		if (checkOverlap(start, end)) {
			toast.error("There is no time available for new activity. Activities cannot overlap.")
			return
		}
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
		// Skip if we're handling a context menu action
		if (skipSelectEventRef.current) {
			skipSelectEventRef.current = false
			return
		}
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
			await updateActivityMutation({
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
			await createActivityMutation({
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

	// Handle clone - opens separate clone dialog
	const handleDuplicate = React.useCallback(
		(event: CalendarEvent) => {
			setActivityToClone({
				name: event.title,
				projectId: event.projectId,
				tagIds: event.tagIds,
				isBillable: event.isBillable,
				startTime: event.start,
				endTime: event.end,
			})
			setIsCloneDialogOpen(true)
		},
		[]
	)

	// Handle save cloned activity
	const handleSaveClone = async (data: {
		name: string
		projectId: string | null
		tagIds: string[]
		isBillable: boolean
		startTime: Date
		endTime: Date
	}) => {
		if (!user?.id) return

		await createActivityMutation({
			clerkId: user.id,
			name: data.name,
			projectId: data.projectId,
			startTime: data.startTime.toISOString(),
			endTime: data.endTime.toISOString(),
			isBillable: data.isBillable,
			tagIds: data.tagIds,
		})

		setIsCloneDialogOpen(false)
		setActivityToClone(null)
	}

	// Handle event drop (drag and drop)
	const handleEventDrop = React.useCallback(
		async ({
			event,
			start,
			end,
		}: {
			event: CalendarEvent
			start: Date
			end: Date
		}) => {
			if (!user?.id) return

			// Check for overlap
			if (checkOverlap(start, end, event.id)) {
				toast.error("Activities cannot overlap.")
				refetchActivities() // Reset to original position
				return
			}

			await updateActivityMutation({
				id: event.id,
				clerkId: user.id,
				name: event.title,
				projectId: event.projectId,
				startTime: start.toISOString(),
				endTime: end.toISOString(),
				isBillable: event.isBillable,
				tagIds: event.tagIds,
			})
		},
		[user?.id, updateActivityMutation, checkOverlap, refetchActivities]
	)

	// Handle event resize
	const handleEventResize = React.useCallback(
		async ({
			event,
			start,
			end,
		}: {
			event: CalendarEvent
			start: Date
			end: Date
		}) => {
			if (!user?.id) return

			// Check for overlap
			if (checkOverlap(start, end, event.id)) {
				toast.error("Activities cannot overlap.")
				refetchActivities() // Reset to original size
				return
			}

			await updateActivityMutation({
				id: event.id,
				clerkId: user.id,
				name: event.title,
				projectId: event.projectId,
				startTime: start.toISOString(),
				endTime: end.toISOString(),
				isBillable: event.isBillable,
				tagIds: event.tagIds,
			})
		},
		[user?.id, updateActivityMutation, checkOverlap, refetchActivities]
	)

	// Handle edit from context menu
	const handleEdit = React.useCallback(
		(event: CalendarEvent) => {
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
		},
		[]
	)

	// Handle delete confirmation
	const handleConfirmDelete = async () => {
		if (!user?.id || !eventToDelete) return
		await deleteActivityMutation({
			id: eventToDelete.id,
			clerkId: user.id,
		})
		setDeleteConfirmOpen(false)
		setEventToDelete(null)
		setSelectedActivity(undefined)
	}

	// Custom event component with context menu and move icon
	const EventComponent = React.useCallback(
		({ event }: { event: CalendarEvent }) => (
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<div
						className="group relative h-full w-full overflow-hidden px-1 py-0.5 text-xs text-white"
						onContextMenu={() => {
							// Set flag to skip onSelectEvent when context menu opens
							skipSelectEventRef.current = true
						}}
					>
						<Move className="absolute right-0.5 top-0.5 size-3 opacity-50 group-hover:opacity-100" />
						<div className="font-medium truncate pr-4">{event.title || "Untitled"}</div>
						{event.projectName && (
							<div className="truncate opacity-80">{event.projectName}</div>
						)}
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						onSelect={() => {
							skipSelectEventRef.current = true
							handleDuplicate(event)
						}}
					>
						<Copy className="mr-2 size-4" />
						Clone
					</ContextMenuItem>
					<ContextMenuItem
						onSelect={() => {
							skipSelectEventRef.current = true
							handleEdit(event)
						}}
					>
						<Pencil className="mr-2 size-4" />
						Edit
					</ContextMenuItem>
					<ContextMenuItem
						onSelect={() => {
							skipSelectEventRef.current = true
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
		),
		[handleDuplicate, handleEdit]
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
						<DragAndDropCalendar
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
							onEventDrop={handleEventDrop as any}
							onEventResize={handleEventResize as any}
							resizable
							step={15}
							timeslots={4}
							min={new Date(0, 0, 0, 0, 0, 0)}
							max={new Date(0, 0, 0, 23, 59, 59)}
							components={{
								event: EventComponent,
							}}
							eventPropGetter={(event) => ({
								style: {
									backgroundColor: event.projectColor || "#3b82f6",
									border: "none",
									borderRadius: "4px",
									cursor: "grab",
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
							draggableAccessor={() => true}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Activity Form Dialog */}
			<ActivityFormDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open)
					if (!open) {
						setSelectedActivity(undefined)
					}
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
				currentWeekStart={weekStart}
				existingEvents={events.map((e) => ({
					id: e.id,
					start: e.start,
					end: e.end,
				}))}
			/>

			{/* Clone Activity Dialog */}
			<CloneActivityDialog
				open={isCloneDialogOpen}
				onOpenChange={(open) => {
					setIsCloneDialogOpen(open)
					if (!open) {
						setActivityToClone(null)
					}
				}}
				sourceActivity={activityToClone}
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
				onSave={handleSaveClone}
				currentWeekStart={weekStart}
				existingEvents={events.map((e) => ({
					id: e.id,
					start: e.start,
					end: e.end,
				}))}
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
