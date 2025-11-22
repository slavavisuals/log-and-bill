import * as React from "react"
import { toast } from "sonner"
import { validateTimeBounds, checkOverlap } from "@/lib/calendar-utils"
import type { CalendarEvent, ActivityFormData } from "@/lib/calendar-types"

interface UseCalendarHandlersProps {
	events: CalendarEvent[]
	userId: string | undefined
	skipSelectEventRef: React.MutableRefObject<boolean>
	setSelectedActivity: React.Dispatch<React.SetStateAction<ActivityFormData | undefined>>
	setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
	setEventToDelete: React.Dispatch<React.SetStateAction<CalendarEvent | null>>
	setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>
	setActivityToClone: React.Dispatch<React.SetStateAction<{
		name: string
		projectId: string | null
		tagIds: string[]
		isBillable: boolean
		startTime: Date
		endTime: Date
	} | null>>
	setIsCloneDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
	updateActivityMutation: (variables: any) => Promise<any>
	deleteActivityMutation: (variables: any) => Promise<any>
	createActivityMutation: (variables: any) => Promise<any>
	refetchActivities: () => void
}

export function useCalendarHandlers({
	events,
	userId,
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
}: UseCalendarHandlersProps) {
	// Handle slot selection (creating new activity)
	const handleSelectSlot = React.useCallback(
		({ start, end }: { start: Date; end: Date }) => {
			// Check time boundaries
			if (!validateTimeBounds(start, end)) {
				return
			}
			// Check for overlap
			if (checkOverlap(events, start, end)) {
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
		},
		[events, setSelectedActivity, setIsDialogOpen]
	)

	// Handle event selection (editing activity)
	const handleSelectEvent = React.useCallback(
		(event: CalendarEvent) => {
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
		},
		[skipSelectEventRef, setSelectedActivity, setIsDialogOpen]
	)

	// Handle save - close dialog immediately for instant feedback
	const handleSave = React.useCallback(
		async (data: ActivityFormData) => {
			if (!userId) return

			// Close dialog immediately
			setIsDialogOpen(false)
			setSelectedActivity(undefined)

			if (data.id) {
				// Update existing
				await updateActivityMutation({
					id: data.id,
					clerkId: userId,
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
					clerkId: userId,
					name: data.name,
					projectId: data.projectId,
					startTime: data.startTime.toISOString(),
					endTime: data.endTime.toISOString(),
					isBillable: data.isBillable,
					tagIds: data.tagIds,
				})
			}
		},
		[userId, setIsDialogOpen, setSelectedActivity, updateActivityMutation, createActivityMutation]
	)

	// Handle delete from dialog
	const handleDeleteFromDialog = React.useCallback(
		(selectedActivityId?: string) => {
			if (selectedActivityId) {
				setEventToDelete(events.find((e) => e.id === selectedActivityId) || null)
				setIsDialogOpen(false)
				setDeleteConfirmOpen(true)
			}
		},
		[events, setEventToDelete, setIsDialogOpen, setDeleteConfirmOpen]
	)

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
		[setActivityToClone, setIsCloneDialogOpen]
	)

	// Handle save cloned activity - close dialog immediately for instant feedback
	const handleSaveClone = React.useCallback(
		async (data: {
			name: string
			projectId: string | null
			tagIds: string[]
			isBillable: boolean
			startTime: Date
			endTime: Date
		}) => {
			if (!userId) return

			// Close dialog immediately
			setIsCloneDialogOpen(false)
			setActivityToClone(null)

			await createActivityMutation({
				clerkId: userId,
				name: data.name,
				projectId: data.projectId,
				startTime: data.startTime.toISOString(),
				endTime: data.endTime.toISOString(),
				isBillable: data.isBillable,
				tagIds: data.tagIds,
			})
		},
		[userId, setIsCloneDialogOpen, setActivityToClone, createActivityMutation]
	)

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
			if (!userId) return

			// Check time boundaries
			if (!validateTimeBounds(start, end)) {
				refetchActivities() // Reset to original position
				return
			}

			// Check for overlap
			if (checkOverlap(events, start, end, event.id)) {
				toast.error("Activities cannot overlap.")
				refetchActivities() // Reset to original position
				return
			}

			await updateActivityMutation({
				id: event.id,
				clerkId: userId,
				name: event.title,
				projectId: event.projectId,
				startTime: start.toISOString(),
				endTime: end.toISOString(),
				isBillable: event.isBillable,
				tagIds: event.tagIds,
			})
		},
		[userId, events, updateActivityMutation, refetchActivities]
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
			if (!userId) return

			// Check time boundaries
			if (!validateTimeBounds(start, end)) {
				refetchActivities() // Reset to original size
				return
			}

			// Check for overlap
			if (checkOverlap(events, start, end, event.id)) {
				toast.error("Activities cannot overlap.")
				refetchActivities() // Reset to original size
				return
			}

			await updateActivityMutation({
				id: event.id,
				clerkId: userId,
				name: event.title,
				projectId: event.projectId,
				startTime: start.toISOString(),
				endTime: end.toISOString(),
				isBillable: event.isBillable,
				tagIds: event.tagIds,
			})
		},
		[userId, events, updateActivityMutation, refetchActivities]
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
		[setSelectedActivity, setIsDialogOpen]
	)

	// Handle delete confirmation - close dialog immediately for instant feedback
	const handleConfirmDelete = React.useCallback(
		async (eventToDelete: CalendarEvent | null) => {
			if (!userId || !eventToDelete) return

			const eventId = eventToDelete.id

			// Close dialog immediately
			setDeleteConfirmOpen(false)
			setEventToDelete(null)
			setSelectedActivity(undefined)

			await deleteActivityMutation({
				id: eventId,
				clerkId: userId,
			})
		},
		[userId, setDeleteConfirmOpen, setEventToDelete, setSelectedActivity, deleteActivityMutation]
	)

	return {
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
	}
}
