"use client"

import * as React from "react"
import { useUser } from "@clerk/clerk-react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { TagIcon, X } from "lucide-react"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Project {
	id: string
	name: string
	color: string | null
}

interface Tag {
	id: string
	name: string
	color: string | null
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

interface ExistingEvent {
	id: string
	start: Date
	end: Date
}

type DialogMode = "create" | "edit" | "clone"

interface ActivityFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	activity?: ActivityFormData
	projects: Project[]
	tags: Tag[]
	onSave: (data: ActivityFormData) => void
	onDelete?: () => void
	timeFormat?: "12h" | "24h"
	mode?: DialogMode
	currentWeekStart?: Date
	existingEvents?: ExistingEvent[]
}

export function ActivityFormDialog({
	open,
	onOpenChange,
	activity,
	projects,
	tags,
	onSave,
	onDelete,
	timeFormat = "24h",
	mode = "create",
	currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 }),
	existingEvents = [],
}: ActivityFormDialogProps) {
	const [name, setName] = React.useState(activity?.name || "")
	const [projectId, setProjectId] = React.useState<string | null>(
		activity?.projectId || null
	)
	const [selectedTags, setSelectedTags] = React.useState<string[]>(
		activity?.tagIds || []
	)
	const [isBillable, setIsBillable] = React.useState(
		activity?.isBillable ?? true
	)
	const [startTime, setStartTime] = React.useState(
		activity?.startTime || new Date()
	)
	const [endTime, setEndTime] = React.useState(
		activity?.endTime || new Date()
	)
	const [tagPopoverOpen, setTagPopoverOpen] = React.useState(false)
	const [newTagName, setNewTagName] = React.useState("")

	const isEditing = mode === "edit"
	const isCloning = mode === "clone"

	// Generate week days for day selector
	const weekDays = React.useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => {
			const date = addDays(currentWeekStart, i)
			return {
				value: i.toString(),
				label: format(date, "EEE, MMM d"),
				date,
			}
		})
	}, [currentWeekStart])

	// Get current selected day index
	const selectedDayIndex = React.useMemo(() => {
		const dayIndex = weekDays.findIndex((day) =>
			isSameDay(day.date, startTime)
		)
		return dayIndex >= 0 ? dayIndex.toString() : "0"
	}, [weekDays, startTime])

	// Check for overlapping events
	const checkOverlap = React.useCallback(
		(newStart: Date, newEnd: Date, excludeId?: string): boolean => {
			return existingEvents.some((event) => {
				// Skip the event being edited
				if (excludeId && event.id === excludeId) return false
				// Check for overlap
				return newStart < event.end && newEnd > event.start
			})
		},
		[existingEvents]
	)

	// Handle day change
	const handleDayChange = (dayIndex: string) => {
		const targetDate = weekDays[parseInt(dayIndex)].date
		const newStartTime = new Date(startTime)
		const newEndTime = new Date(endTime)

		// Update the date while preserving the time
		newStartTime.setFullYear(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate()
		)
		newEndTime.setFullYear(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate()
		)

		setStartTime(newStartTime)
		setEndTime(newEndTime)
	}

	// Reset form when activity changes
	React.useEffect(() => {
		if (activity) {
			setName(activity.name)
			setProjectId(activity.projectId)
			setSelectedTags(activity.tagIds)
			setIsBillable(activity.isBillable)
			setStartTime(activity.startTime)
			setEndTime(activity.endTime)
		} else {
			setName("")
			setProjectId(null)
			setSelectedTags([])
			setIsBillable(true)
		}
	}, [activity])

	const formatTimeForInput = (date: Date) => {
		return format(date, "HH:mm")
	}

	const handleTimeChange = (
		type: "start" | "end",
		timeString: string
	) => {
		const [hours, minutes] = timeString.split(":").map(Number)
		const newDate = new Date(type === "start" ? startTime : endTime)
		newDate.setHours(hours, minutes, 0, 0)

		if (type === "start") {
			setStartTime(newDate)
			// If end time is before start, move it forward
			if (newDate >= endTime) {
				const newEnd = new Date(newDate)
				newEnd.setHours(newEnd.getHours() + 1)
				setEndTime(newEnd)
			}
		} else {
			setEndTime(newDate)
		}
	}

	const toggleTag = (tagId: string) => {
		if (selectedTags.includes(tagId)) {
			setSelectedTags(selectedTags.filter((id) => id !== tagId))
		} else if (selectedTags.length < 5) {
			setSelectedTags([...selectedTags, tagId])
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		// Check for overlap (exclude current activity when editing)
		const excludeId = isEditing ? activity?.id : undefined
		if (checkOverlap(startTime, endTime, excludeId)) {
			toast.error("There is no time available for new activity. Activities cannot overlap.")
			return
		}

		onSave({
			id: isCloning ? undefined : activity?.id, // Don't pass id when cloning
			name: name.trim(),
			projectId,
			tagIds: selectedTags,
			isBillable,
			startTime,
			endTime,
		})
	}

	// Get dialog title based on mode
	const getDialogTitle = () => {
		switch (mode) {
			case "clone":
				return "Clone Activity"
			case "edit":
				return "Edit Activity"
			default:
				return "New Activity"
		}
	}

	const getTagName = (tagId: string) => {
		const tag = tags.find((t) => t.id === tagId)
		if (!tag) return tagId
		// Truncate at 8 characters
		return tag.name.length > 8 ? tag.name.slice(0, 8) + "…" : tag.name
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{getDialogTitle()}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Activity Name */}
					<div className="space-y-2">
						<Label htmlFor="activity-name">Activity Name</Label>
						<Input
							id="activity-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="What are you working on?"
							autoFocus
						/>
					</div>

					{/* Project Selector */}
					<div className="space-y-2">
						<Label>Project</Label>
						<Select
							value={projectId || "none"}
							onValueChange={(v) => setProjectId(v === "none" ? null : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select project" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No Project</SelectItem>
								{projects.map((project) => (
									<SelectItem key={project.id} value={project.id}>
										<div className="flex items-center gap-2">
											{project.color && (
												<div
													className="size-3 rounded-full"
													style={{ backgroundColor: project.color }}
												/>
											)}
											{project.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label>Tags (max 5)</Label>
						<div className="flex flex-wrap gap-2">
							{selectedTags.map((tagId) => (
								<Badge
									key={tagId}
									variant="secondary"
									className="gap-1"
								>
									{getTagName(tagId)}
									<button
										type="button"
										onClick={() => toggleTag(tagId)}
										className="hover:text-destructive"
									>
										<X className="size-3" />
									</button>
								</Badge>
							))}
							<Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={selectedTags.length >= 5}
									>
										<TagIcon className="mr-1 size-3" />
										Add Tag
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-64 p-2">
									<div className="space-y-2">
										{tags.map((tag) => (
											<div
												key={tag.id}
												className="flex items-center space-x-2"
											>
												<Checkbox
													id={`tag-${tag.id}`}
													checked={selectedTags.includes(tag.id)}
													onCheckedChange={() => toggleTag(tag.id)}
													disabled={
														!selectedTags.includes(tag.id) &&
														selectedTags.length >= 5
													}
												/>
												<label
													htmlFor={`tag-${tag.id}`}
													className="flex-1 cursor-pointer text-sm"
												>
													{tag.name}
												</label>
											</div>
										))}
										{tags.length === 0 && (
											<p className="text-muted-foreground text-sm">
												No tags yet. Create one in Settings.
											</p>
										)}
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Billable Toggle */}
					<div className="flex items-center justify-between">
						<Label htmlFor="billable">Billable</Label>
						<Switch
							id="billable"
							checked={isBillable}
							onCheckedChange={setIsBillable}
						/>
					</div>

					{/* Day Selector */}
					<div className="space-y-2">
						<Label>Day</Label>
						<Select value={selectedDayIndex} onValueChange={handleDayChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{weekDays.map((day) => (
									<SelectItem key={day.value} value={day.value}>
										{day.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Time Pickers */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="start-time">From</Label>
							<Input
								id="start-time"
								type="time"
								value={formatTimeForInput(startTime)}
								onChange={(e) => handleTimeChange("start", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="end-time">To</Label>
							<Input
								id="end-time"
								type="time"
								value={formatTimeForInput(endTime)}
								onChange={(e) => handleTimeChange("end", e.target.value)}
							/>
						</div>
					</div>

					{/* Duration Display */}
					<div className="text-muted-foreground text-sm">
						Duration:{" "}
						{Math.round((endTime.getTime() - startTime.getTime()) / 60000)} min
					</div>

					{/* Action Buttons */}
					<div className="flex justify-between pt-4">
						{isEditing && onDelete && !isCloning ? (
							<Button
								type="button"
								variant="destructive"
								onClick={onDelete}
							>
								Delete
							</Button>
						) : (
							<div />
						)}
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={!name.trim()}>
								{isCloning ? "Save" : isEditing ? "Save" : "Add"}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
