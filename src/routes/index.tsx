import { createFileRoute, Link } from "@tanstack/react-router"
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Clock,
	BarChart3,
	FileText,
	Calendar,
	ArrowRight,
	CheckCircle2,
} from "lucide-react"

export const Route = createFileRoute("/")({
	component: LandingPage,
})

function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<BarChart3 className="text-primary size-6" />
						<span className="text-xl font-bold">Log & Bill</span>
					</div>
					<div className="flex items-center gap-4">
						<SignedOut>
							<SignInButton mode="modal">
								<Button variant="ghost">Sign In</Button>
							</SignInButton>
							<SignInButton mode="modal">
								<Button>Get Started</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<Button asChild>
								<Link to="/app/overview">Go to Dashboard</Link>
							</Button>
						</SignedIn>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="flex-1">
				<div className="container mx-auto px-4 py-24 text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
						Track Your Time.
						<br />
						<span className="text-primary">Bill Your Clients.</span>
					</h1>
					<p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
						A simple, powerful time tracking app that helps freelancers and
						contractors log their hours, manage projects, and create
						professional invoices.
					</p>
					<div className="mt-10 flex justify-center gap-4">
						<SignedOut>
							<SignInButton mode="modal">
								<Button size="lg">
									Start Tracking Free
									<ArrowRight className="ml-2 size-4" />
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<Button size="lg" asChild>
								<Link to="/app/overview">
									Go to Dashboard
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</SignedIn>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-muted/50 border-t py-24">
				<div className="container mx-auto px-4">
					<h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardContent className="pt-6">
								<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-lg">
									<Calendar className="size-6" />
								</div>
								<h3 className="mb-2 font-semibold">Track Time</h3>
								<p className="text-muted-foreground text-sm">
									Log your hours with our intuitive calendar interface. Drag to
									create time entries quickly.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6">
								<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-lg">
									<Clock className="size-6" />
								</div>
								<h3 className="mb-2 font-semibold">Manage Projects</h3>
								<p className="text-muted-foreground text-sm">
									Organize your work by projects and clients. Set hourly rates
									and track billable hours.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6">
								<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-lg">
									<BarChart3 className="size-6" />
								</div>
								<h3 className="mb-2 font-semibold">Analyze Reports</h3>
								<p className="text-muted-foreground text-sm">
									Get insights into your productivity with visual charts and
									detailed reports.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6">
								<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-lg">
									<FileText className="size-6" />
								</div>
								<h3 className="mb-2 font-semibold">Create Invoices</h3>
								<p className="text-muted-foreground text-sm">
									Generate professional invoices from your tracked time with
									taxes and payment details.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl">
						<h2 className="mb-8 text-center text-3xl font-bold">
							Everything You Need
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							{[
								"Visual calendar scheduler",
								"Weekly & monthly hour limits",
								"Project-based time tracking",
								"Multiple tag support",
								"Billable/non-billable hours",
								"Custom hourly rates",
								"Professional invoices",
								"PDF export",
								"Tax calculations (GST/HST/VAT)",
								"Activity insights & charts",
								"Client management",
								"Dark mode support",
							].map((feature) => (
								<div key={feature} className="flex items-center gap-2">
									<CheckCircle2 className="text-primary size-5 shrink-0" />
									<span>{feature}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-primary text-primary-foreground py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-4 text-2xl font-bold">
						Ready to Start Tracking Your Time?
					</h2>
					<p className="mb-8 opacity-90">
						Join freelancers and contractors who use Log & Bill to manage their
						time and invoices.
					</p>
					<SignedOut>
						<SignInButton mode="modal">
							<Button size="lg" variant="secondary">
								Get Started Free
								<ArrowRight className="ml-2 size-4" />
							</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<Button size="lg" variant="secondary" asChild>
							<Link to="/app/overview">
								Go to Dashboard
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</SignedIn>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-8">
				<div className="container mx-auto px-4 text-center">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Log & Bill. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	)
}
