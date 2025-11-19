import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute("/app")({
	beforeLoad: async ({ context }) => {
		// Check if user is authenticated via Clerk
		// This will be handled by Clerk's middleware/hooks
		// For now, we'll let Clerk handle the redirect
	},
	component: AppLayout,
})

function AppLayout() {
	return (
		<AppSidebar>
			<Outlet />
		</AppSidebar>
	)
}
