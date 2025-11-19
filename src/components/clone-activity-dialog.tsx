"use client"

import * as React from "react"
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
import { TimePicker, formatDuration } from "@/components/time-picker"
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

interface CloneActivityData {
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

interface CloneActivityDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	sourceActivity: CloneActivityData | null
	projects: Project[]
	tags: Tag[]
	onSave: (data: CloneActivityData) => void
	currentWeekStart?: Date
	existingEvents?: ExistingEvent[]
}

export function CloneActivityDialog({
	open,
	onOpenChange,
	sourceActivity,
	projects,
	tags,
	onSave,
	currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 }),
	existingEvents = [],
}: CloneActivityDialogProps) {
	const [name, setName] = React.useState("")
	const [projectId, setProjectId] = React.useState<string | null>(null)
	const [selectedTags, setSelectedTags] = React.useState<string[]>([])
	const [isBillable, setIsBillable] = React.useState(true)
	const [startTime, setStartTime] = React.useState(new Date())
	const [endTime, setEndTime] = React.useState(new Date())
	const [tagPopoverOpen, setTagPopoverOpen] = React.useState(false)

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
		(newStart: Date, newEnd: Date): boolean => {
			return existingEvents.some((event) => {
				return newStart < event.end && newEnd > event.start
			})
		},
		[existingEvents]
	)

	// Initialize form with source activity data when dialog opens
	React.useEffect(() => {
		if (open && sourceActivity) {
			setName(sourceActivity.name)
			setProjectId(sourceActivity.projectId)
			setSelectedTags(sourceActivity.tagIds)
			setIsBillable(sourceActivity.isBillable)
			setStartTime(sourceActivity.startTime)
			setEndTime(sourceActivity.endTime)
		}
	}, [open, sourceActivity])

	// Handle day change
	const handleDayChange = (dayIndex: string) => {
		const targetDate = weekDays[parseInt(dayIndex)].date
		const newStartTime = new Date(startTime)
		const newEndTime = new Date(endTime)

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

	// Handle start time change
	const handleStartTimeChange = (newStart: Date) => {
		setStartTime(newStart)
		// If end time is before or equal to start, move it forward
		if (newStart >= endTime) {
			const newEnd = new Date(newStart)
			newEnd.setMinutes(newEnd.getMinutes() + 30)
			setEndTime(newEnd)
		}
	}

	// Handle end time change
	const handleEndTimeChange = (newEnd: Date) => {
		setEndTime(newEnd)
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

		// Check for overlap
		if (checkOverlap(startTime, endTime)) {
			toast.error(
				"There is no time available for new activity. Activities cannot overlap."
			)
			return
		}

		// Always create a new activity (this is cloning)
		onSave({
			name: name.trim(),
			projectId,
			tagIds: selectedTags,
			isBillable,
			startTime,
			endTime,
		})
	}

	const getTagName = (tagId: string) => {
		const tag = tags.find((t) => t.id === tagId)
		if (!tag) return tagId
		return tag.name.length > 8 ? tag.name.slice(0, 8) + "…" : tag.name
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Clone Activity</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Activity Name */}
					<div className="space-y-2">
						<Label htmlFor="clone-activity-name">Activity Name</Label>
						<Input
							id="clone-activity-name"
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
								<Badge key={tagId} variant="secondary" className="gap-1">
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
													id={`clone-tag-${tag.id}`}
													checked={selectedTags.includes(tag.id)}
													onCheckedChange={() => toggleTag(tag.id)}
													disabled={
														!selectedTags.includes(tag.id) &&
														selectedTags.length >= 5
													}
												/>
												<label
													htmlFor={`clone-tag-${tag.id}`}
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
						<Label htmlFor="clone-billable">Billable</Label>
						<Switch
							id="clone-billable"
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
							<Label>From</Label>
							<TimePicker
								value={startTime}
								onChange={handleStartTimeChange}
							/>
						</div>
						<div className="space-y-2">
							<Label>To</Label>
							<TimePicker
								value={endTime}
								onChange={handleEndTimeChange}
							/>
						</div>
					</div>

					{/* Duration Display */}
					<div className="text-muted-foreground text-sm">
						Duration: {formatDuration(startTime, endTime)}
					</div>

					{/* Action Buttons - Only Save and Cancel for cloning */}
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!name.trim()}>
							Save
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
