// User management
import { getOrCreateUser, getCurrentUser } from "./users"

// Settings
import { getSettings, updateSettings } from "./settings"

// Projects
import {
	listProjects,
	createProject,
	updateProject,
	deleteProject,
} from "./projects"

// Clients
import {
	listClients,
	createClient,
	updateClient,
	deleteClient,
} from "./clients"

// Tags
import { listTags, createTag, updateTag, deleteTag } from "./tags"

// Activities
import {
	listActivities,
	createActivity,
	updateActivity,
	deleteActivity,
	duplicateActivity,
	getActivityStats,
} from "./activities"

// Invoices
import {
	listInvoices,
	getInvoice,
	createInvoice,
	updateInvoiceStatus,
	deleteInvoice,
	getNextInvoiceNumber,
} from "./invoices"

export default {
	// Users
	getOrCreateUser,
	getCurrentUser,

	// Settings
	getSettings,
	updateSettings,

	// Projects
	listProjects,
	createProject,
	updateProject,
	deleteProject,

	// Clients
	listClients,
	createClient,
	updateClient,
	deleteClient,

	// Tags
	listTags,
	createTag,
	updateTag,
	deleteTag,

	// Activities
	listActivities,
	createActivity,
	updateActivity,
	deleteActivity,
	duplicateActivity,
	getActivityStats,

	// Invoices
	listInvoices,
	getInvoice,
	createInvoice,
	updateInvoiceStatus,
	deleteInvoice,
	getNextInvoiceNumber,
}
