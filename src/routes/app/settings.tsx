import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/app/settings")({
	component: SettingsPage,
})

function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your application preferences
				</p>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Time Limits</CardTitle>
						<CardDescription>
							Set weekly and monthly hour limits for tracking
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="weekly-limit">Weekly Hour Limit</Label>
							<Input
								id="weekly-limit"
								type="number"
								placeholder="e.g., 40"
								className="max-w-xs"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="monthly-limit">Monthly Hour Limit</Label>
							<Input
								id="monthly-limit"
								type="number"
								placeholder="e.g., 160"
								className="max-w-xs"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Billing</CardTitle>
						<CardDescription>
							Configure your default billing settings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="hourly-rate">Default Hourly Rate</Label>
							<Input
								id="hourly-rate"
								type="number"
								placeholder="e.g., 80"
								className="max-w-xs"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="currency">Currency</Label>
							<Select defaultValue="USD">
								<SelectTrigger className="max-w-xs">
									<SelectValue placeholder="Select currency" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USD">USD ($)</SelectItem>
									<SelectItem value="EUR">EUR (€)</SelectItem>
									<SelectItem value="GBP">GBP (£)</SelectItem>
									<SelectItem value="CAD">CAD ($)</SelectItem>
									<SelectItem value="AUD">AUD ($)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center space-x-2">
							<Switch id="billable-default" defaultChecked />
							<Label htmlFor="billable-default">
								New projects billable by default
							</Label>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Company Information</CardTitle>
						<CardDescription>
							Used in invoices and reports
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="company-name">Company/Contractor Name</Label>
							<Input
								id="company-name"
								placeholder="Your company or name"
								className="max-w-md"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company-address">Address</Label>
							<Input
								id="company-address"
								placeholder="Your business address"
								className="max-w-md"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tax Settings</CardTitle>
						<CardDescription>
							Configure default tax for invoices
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="tax-type">Tax Type</Label>
							<Select>
								<SelectTrigger className="max-w-xs">
									<SelectValue placeholder="Select tax type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="GST">GST</SelectItem>
									<SelectItem value="HST">HST</SelectItem>
									<SelectItem value="VAT">VAT</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="tax-rate">Tax Rate (%)</Label>
							<Input
								id="tax-rate"
								type="number"
								placeholder="e.g., 13"
								className="max-w-xs"
							/>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button>Save Settings</Button>
				</div>
			</div>
		</div>
	)
}
