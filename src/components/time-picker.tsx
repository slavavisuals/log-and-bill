"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
	value: Date
	onChange: (date: Date) => void
	label?: string
	minHour?: number
	maxHour?: number
}

export function TimePicker({
	value,
	onChange,
	label,
	minHour = 5,
	maxHour = 23,
}: TimePickerProps) {
	const hours = value.getHours()
	const minutes = value.getMinutes()

	// Round minutes to nearest 10
	const roundedMinutes = Math.round(minutes / 10) * 10

	const updateTime = (newHours: number, newMinutes: number) => {
		// Clamp hours to valid range
		const clampedHours = Math.max(minHour, Math.min(maxHour - 1, newHours))
		const newDate = new Date(value)
		newDate.setHours(clampedHours, newMinutes, 0, 0)
		onChange(newDate)
	}

	const incrementHours = () => {
		const newHours = hours >= maxHour - 1 ? minHour : hours + 1
		updateTime(newHours, roundedMinutes)
	}

	const decrementHours = () => {
		const newHours = hours <= minHour ? maxHour - 1 : hours - 1
		updateTime(newHours, roundedMinutes)
	}

	const incrementMinutes = () => {
		let newMinutes = roundedMinutes + 10
		let newHours = hours
		if (newMinutes >= 60) {
			newMinutes = 0
			newHours = hours >= maxHour - 1 ? minHour : hours + 1
		}
		updateTime(newHours, newMinutes)
	}

	const decrementMinutes = () => {
		let newMinutes = roundedMinutes - 10
		let newHours = hours
		if (newMinutes < 0) {
			newMinutes = 50
			newHours = hours <= minHour ? maxHour - 1 : hours - 1
		}
		updateTime(newHours, newMinutes)
	}

	const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, "")
		if (val === "") {
			updateTime(minHour, roundedMinutes)
			return
		}
		const num = parseInt(val, 10)
		if (num >= minHour && num < maxHour) {
			updateTime(num, roundedMinutes)
		}
	}

	const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, "")
		if (val === "") {
			updateTime(hours, 0)
			return
		}
		const num = parseInt(val, 10)
		// Only allow multiples of 10
		if (num >= 0 && num <= 59) {
			const rounded = Math.round(num / 10) * 10
			updateTime(hours, rounded >= 60 ? 50 : rounded)
		}
	}

	const handleMinutesBlur = () => {
		// Ensure minutes are rounded to 10 on blur
		updateTime(hours, roundedMinutes)
	}

	return (
		<div className="flex items-center gap-1">
			{/* Hours */}
			<div className="flex flex-col items-center">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-6 w-8"
					onClick={incrementHours}
				>
					<ChevronUp className="size-4" />
				</Button>
				<Input
					type="text"
					value={hours.toString().padStart(2, "0")}
					onChange={handleHoursChange}
					className="h-8 w-12 text-center px-1"
					maxLength={2}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-6 w-8"
					onClick={decrementHours}
				>
					<ChevronDown className="size-4" />
				</Button>
			</div>

			<span className="text-lg font-medium">:</span>

			{/* Minutes */}
			<div className="flex flex-col items-center">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-6 w-8"
					onClick={incrementMinutes}
				>
					<ChevronUp className="size-4" />
				</Button>
				<Input
					type="text"
					value={roundedMinutes.toString().padStart(2, "0")}
					onChange={handleMinutesChange}
					onBlur={handleMinutesBlur}
					className="h-8 w-12 text-center px-1"
					maxLength={2}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-6 w-8"
					onClick={decrementMinutes}
				>
					<ChevronDown className="size-4" />
				</Button>
			</div>
		</div>
	)
}

// Helper function to format duration
export function formatDuration(startTime: Date, endTime: Date): string {
	const totalMinutes = Math.round(
		(endTime.getTime() - startTime.getTime()) / 60000
	)

	if (totalMinutes < 0) return "0m"

	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60

	if (hours === 0) {
		return `${minutes}m`
	} else if (minutes === 0) {
		return `${hours}h`
	} else {
		return `${hours}h ${minutes}m`
	}
}
