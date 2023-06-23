import { BillingInterval, LATEST_API_VERSION } from '@shopify/shopify-api'
import { shopifyApp } from '@shopify/shopify-app-express'
import sessions from './prisma/sessions.js'
import { restResources } from '@shopify/shopify-api/rest/admin/2023-04'

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
	'My Shopify One-Time Charge': {
		// This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
		amount: 3.0,
		currencyCode: 'USD',
		interval: BillingInterval.Every30Days,
	},
}

const shopify = shopifyApp({
	api: {
		apiVersion: LATEST_API_VERSION,
		restResources,
		billing: billingConfig, // or replace with billingConfig above to enable example billing
	},
	auth: {
		path: '/api/auth',
		callbackPath: '/api/auth/callback',
	},
	webhooks: {
		path: '/api/webhooks',
	},
	sessionStorage: {
		storeSession: sessions.storeSession,
		loadSession: sessions.loadSession,
		deleteSession: sessions.deleteSession,
		deleteSessions: sessions.deleteSessions,
		findSessionsByShop: sessions.findSessions,
	},
})

export default shopify
