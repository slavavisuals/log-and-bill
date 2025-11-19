import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { useEnsureUser } from "@/hooks/use-ensure-user"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/app")({
	beforeLoad: async ({ context }) => {
		// Check if user is authenticated via Clerk
		// This will be handled by Clerk's middleware/hooks
		// For now, we'll let Clerk handle the redirect
	},
	component: AppLayout,
})

function AppLayout() {
	const { isLoading, isReady } = useEnsureUser()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="space-y-4 text-center">
					<Skeleton className="mx-auto h-8 w-32" />
					<Skeleton className="mx-auto h-4 w-48" />
				</div>
			</div>
		)
	}

	return (
		<AppSidebar>
			<Outlet />
		</AppSidebar>
	)
}
