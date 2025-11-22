import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { orpc } from "@/orpc/client"
import type { CalendarEvent } from "@/lib/calendar-types"

interface UseCalendarMutationsProps {
	events: CalendarEvent[]
	setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
	refetchActivities: () => void
	projects: any[]
}

export function useCalendarMutations({
	events,
	setEvents,
	refetchActivities,
	projects,
}: UseCalendarMutationsProps) {
	const { mutateAsync: createActivityMutation } = useMutation({
		mutationFn: (variables: {
			clerkId: string
			name: string
			startTime: string
			endTime: string
			description?: string | null
			projectId?: string | null
			isBillable?: boolean
			tagIds?: string[]
		}) => orpc.createActivity.call(variables),
		onMutate: async (variables) => {
			// Create optimistic event
			const tempId = `temp-${Date.now()}`
			const optimisticEvent: CalendarEvent = {
				id: tempId,
				title: variables.name,
				start: new Date(variables.startTime),
				end: new Date(variables.endTime),
				projectId: variables.projectId ?? null,
				projectName: projects.find((p: any) => p.id === variables.projectId)?.name || null,
				projectColor: projects.find((p: any) => p.id === variables.projectId)?.color || null,
				tagIds: variables.tagIds ?? [],
				isBillable: variables.isBillable ?? true,
			}
			// Immediately add to UI
			setEvents((prev) => [...prev, optimisticEvent])
			return { tempId }
		},
		onSuccess: () => {
			// Replace temp event with real one from server
			refetchActivities()
			toast.success("Activity created")
		},
		onError: (error: any, _variables, context) => {
			// Remove optimistic event on failure
			if (context?.tempId) {
				setEvents((prev) => prev.filter((e) => e.id !== context.tempId))
			}
			toast.error(error.message || "Failed to create activity")
		},
	})

	const { mutateAsync: updateActivityMutation } = useMutation({
		mutationFn: (variables: {
			id: string
			clerkId: string
			name?: string
			description?: string | null
			projectId?: string | null
			startTime?: string
			endTime?: string
			isBillable?: boolean
			tagIds?: string[]
		}) => orpc.updateActivity.call(variables),
		onMutate: async (variables) => {
			// Store previous events for rollback
			const previousEvents = events
			// Optimistically update UI
			setEvents((prev) =>
				prev.map((event) =>
					event.id === variables.id
						? {
								...event,
								title: variables.name ?? event.title,
								start: variables.startTime ? new Date(variables.startTime) : event.start,
								end: variables.endTime ? new Date(variables.endTime) : event.end,
								projectId: variables.projectId !== undefined ? (variables.projectId ?? null) : event.projectId,
								projectName: variables.projectId !== undefined
									? (projects.find((p: any) => p.id === variables.projectId)?.name || null)
									: event.projectName,
								projectColor: variables.projectId !== undefined
									? (projects.find((p: any) => p.id === variables.projectId)?.color || null)
									: event.projectColor,
								tagIds: variables.tagIds ?? event.tagIds,
								isBillable: variables.isBillable ?? event.isBillable,
						  }
						: event
				)
			)
			return { previousEvents }
		},
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity updated")
		},
		onError: (error: any, _variables, context) => {
			// Rollback on error
			if (context?.previousEvents) {
				setEvents(context.previousEvents)
			}
			toast.error(error.message || "Failed to update activity")
		},
	})

	const { mutateAsync: deleteActivityMutation } = useMutation({
		mutationFn: (variables: { id: string; clerkId: string }) =>
			orpc.deleteActivity.call(variables),
		onMutate: async (variables) => {
			// Store previous events for rollback
			const previousEvents = events
			// Optimistically remove from UI
			setEvents((prev) => prev.filter((e) => e.id !== variables.id))
			return { previousEvents }
		},
		onSuccess: () => {
			refetchActivities()
			toast.success("Activity deleted")
		},
		onError: (error: any, _variables, context) => {
			// Rollback on error
			if (context?.previousEvents) {
				setEvents(context.previousEvents)
			}
			toast.error(error.message || "Failed to delete activity")
		},
	})

	return {
		createActivityMutation,
		updateActivityMutation,
		deleteActivityMutation,
	}
}
