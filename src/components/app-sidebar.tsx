import { Link, useLocation } from "@tanstack/react-router"
import { useUser, useClerk } from "@clerk/clerk-react"
import {
	LayoutDashboard,
	Calendar,
	BarChart3,
	FolderKanban,
	Settings,
	LogOut,
	Users,
	FileText,
	ChevronDown,
} from "lucide-react"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarTrigger,
	SidebarInset,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"

const mainNavItems = [
	{
		title: "Overview",
		url: "/app/overview",
		icon: LayoutDashboard,
	},
	{
		title: "Calendar",
		url: "/app/calendar",
		icon: Calendar,
	},
	{
		title: "Analyze",
		url: "/app/analyze",
		icon: BarChart3,
	},
]

const manageNavItems = [
	{
		title: "Projects",
		url: "/app/manage/projects",
		icon: FolderKanban,
	},
	{
		title: "Clients",
		url: "/app/manage/clients",
		icon: Users,
	},
	{
		title: "Invoices",
		url: "/app/manage/invoices",
		icon: FileText,
	},
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
	const location = useLocation()
	const { user } = useUser()
	const { signOut } = useClerk()

	const isManageActive = location.pathname.startsWith("/app/manage")

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<Link to="/app/overview">
									<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
										<BarChart3 className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">Log & Bill</span>
										<span className="text-muted-foreground truncate text-xs">
											Time Tracking
										</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Dashboard</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{mainNavItems.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={location.pathname === item.url}
											tooltip={item.title}
										>
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel>Manage</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<Collapsible
									asChild
									defaultOpen={isManageActive}
									className="group/collapsible"
								>
									<SidebarMenuItem>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												tooltip="Manage"
												isActive={isManageActive}
											>
												<FolderKanban />
												<span>Manage</span>
												<ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{manageNavItems.map((item) => (
													<SidebarMenuSubItem key={item.title}>
														<SidebarMenuSubButton
															asChild
															isActive={location.pathname === item.url}
														>
															<Link to={item.url}>
																<item.icon className="size-4" />
																<span>{item.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										isActive={location.pathname === "/app/settings"}
										tooltip="Settings"
									>
										<Link to="/app/settings">
											<Settings />
											<span>Settings</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage
												src={user?.imageUrl}
												alt={user?.fullName || "User"}
											/>
											<AvatarFallback className="rounded-lg">
												{user?.firstName?.charAt(0) || "U"}
												{user?.lastName?.charAt(0) || ""}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.fullName || "User"}
											</span>
											<span className="text-muted-foreground truncate text-xs">
												{user?.primaryEmailAddress?.emailAddress || ""}
											</span>
										</div>
										<ChevronDown className="ml-auto size-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
									side="top"
									align="start"
									sideOffset={4}
								>
									<DropdownMenuItem asChild>
										<Link to="/app/settings">
											<Settings className="mr-2 size-4" />
											Settings
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => signOut({ redirectUrl: "/" })}
									>
										<LogOut className="mr-2 size-4" />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
				</header>
				<main className="flex-1 overflow-auto p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
