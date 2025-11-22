export interface CalendarEvent {
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

export interface ActivityFormData {
	id?: string
	name: string
	projectId: string | null
	tagIds: string[]
	isBillable: boolean
	startTime: Date
	endTime: Date
}
