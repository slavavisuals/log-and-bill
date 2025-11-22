import { Move, Copy, Pencil, Trash2 } from "lucide-react"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { CalendarEvent } from "@/lib/calendar-types"

interface CalendarEventComponentProps {
	event: CalendarEvent
	onEdit: (event: CalendarEvent) => void
	onClone: (event: CalendarEvent) => void
	onDelete: (event: CalendarEvent) => void
	onContextMenu: () => void
}

export function CalendarEventComponent({
	event,
	onEdit,
	onClone,
	onDelete,
	onContextMenu,
}: CalendarEventComponentProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className="group relative h-full w-full overflow-hidden px-1 py-0.5 text-xs text-white"
					onContextMenu={onContextMenu}
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
						onClone(event)
					}}
				>
					<Copy className="mr-2 size-4" />
					Clone
				</ContextMenuItem>
				<ContextMenuItem
					onSelect={() => {
						onEdit(event)
					}}
				>
					<Pencil className="mr-2 size-4" />
					Edit
				</ContextMenuItem>
				<ContextMenuItem
					onSelect={() => {
						onDelete(event)
					}}
					className="text-destructive"
				>
					<Trash2 className="mr-2 size-4" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
