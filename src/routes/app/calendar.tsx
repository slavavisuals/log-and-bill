import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import { useUser } from "@clerk/clerk-react"
import { Calendar as BigCalendar } from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { useQuery } from "@tanstack/react-query"
import {
	startOfWeek,
	endOfWeek,
	addWeeks,
	subWeeks,
	getWeek,
	format,
} from "date-fns"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import { CloneActivityDialog } from "@/components/clone-activity-dialog"
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
import { CalendarEventComponent } from "@/components/calendar-event"
import { CalendarHeader } from "@/components/calendar-header"
import { CalendarStats } from "@/components/calendar-stats"
import { orpc } from "@/orpc/client"
import { localizer, MAX_HOUR } from "@/lib/calendar-constants"
import type { CalendarEvent, ActivityFormData } from "@/lib/calendar-types"
import { useCalendarMutations } from "@/hooks/use-calendar-mutations"
import { useCalendarHandlers } from "@/hooks/use-calendar-handlers"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

export const Route = createFileRoute("/app/calendar")({
	component: CalendarPage,
})

// Create drag and drop calendar with proper typing
const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(BigCalendar)

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

	// Mutations using optimistic updates for instant UI feedback
	const {
		createActivityMutation,
		updateActivityMutation,
		deleteActivityMutation,
	} = useCalendarMutations({
		events,
		setEvents,
		refetchActivities,
		projects,
	})

	// Event handlers
	const {
		handleSelectSlot,
		handleSelectEvent,
		handleSave,
		handleDeleteFromDialog,
		handleDuplicate,
		handleSaveClone,
		handleEventDrop,
		handleEventResize,
		handleEdit,
		handleConfirmDelete,
	} = useCalendarHandlers({
		events,
		userId: user?.id,
		skipSelectEventRef,
		setSelectedActivity,
		setIsDialogOpen,
		setEventToDelete,
		setDeleteConfirmOpen,
		setActivityToClone,
		setIsCloneDialogOpen,
		updateActivityMutation,
		deleteActivityMutation,
		createActivityMutation,
		refetchActivities,
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

	// Custom event component wrapper
	const EventComponent = React.useCallback(
		({ event }: { event: CalendarEvent }) => (
			<CalendarEventComponent
				event={event}
				onEdit={(e) => {
					skipSelectEventRef.current = true
					handleEdit(e)
				}}
				onClone={(e) => {
					skipSelectEventRef.current = true
					handleDuplicate(e)
				}}
				onDelete={(e) => {
					skipSelectEventRef.current = true
					setEventToDelete(e)
					setDeleteConfirmOpen(true)
				}}
				onContextMenu={() => {
					skipSelectEventRef.current = true
				}}
			/>
		),
		[handleEdit, handleDuplicate]
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
				<CalendarStats totalHours={totalHours} totalMinutes={totalMins} />
			</div>

			<Card>
				<CardHeader className="pb-4">
					<CalendarHeader
						weekStart={weekStart}
						weekEnd={weekEnd}
						weekNumber={weekNumber}
						onPreviousWeek={goToPreviousWeek}
						onNextWeek={goToNextWeek}
						onToday={goToToday}
					/>
				</CardHeader>
				<CardContent>
					<div className="h-[700px]">
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
							max={new Date(0, 0, 0, MAX_HOUR, 0, 0)}
							scrollToTime={new Date(0, 0, 0, 8, 0, 0)}
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
				onDelete={selectedActivity?.id ? () => handleDeleteFromDialog(selectedActivity.id) : undefined}
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
						<AlertDialogAction onClick={() => handleConfirmDelete(eventToDelete)}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
