import shops from '../prisma/shops.js'
import shopify from '../shopify.js'

const GET_SHOP_DATA = `{
  shop {
    id
    name
    ianaTimezone
    email
    url
    currencyCode
    primaryDomain {
      url
      sslEnabled
    }
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    billingAddress {
      address1
      address2
      formatted
      company
      city
      country
      zip
      phone
    }
  }
}`

async function updateShopData(session) {
	const existingShop = await shops.getShop(session.shop)
	console.log('Get shop data returned:', existingShop)
	let fetchShopData = true

	if (!existingShop) {
		console.log(`Event: Install on new shop ${session.shop}`)
		await shops.createShop({
			shop: session.shop,
			scopes: session.scope,
			isInstalled: true,
			installedAt: new Date(),
			uninstalledAt: null,
			installCount: 1,
			showOnboarding: true,
		})
	} else {
		if (existingShop.shopData) {
			fetchShopData = false
		}

		if (!existingShop.isInstalled) {
			// This is a REINSTALL
			console.log(`Event: Reinstall on existing shop ${session.shop}`)
			await shops.updateShop({
				shop: session.shop,
				scopes: session.scope,
				isInstalled: true,
				installedAt: new Date(),
				uninstalledAt: null,
				installCount: existingShop.installCount + 1,
				showOnboarding: true,
				// settings: { beta: betaUsers.includes(shop) ? true : false },
				subscription: {
					update: {
						active: true,
						plan: 'TRIAL',
						createdAt: new Date(),
						upgradedAt: null,
						currentPeriodEnd: null,
						chargeId: null,
					},
				},
			})
		}
	}

	if (fetchShopData) {
		try {
			const client = new shopify.api.clients.Graphql({ session })

			const res = await client.query({ data: GET_SHOP_DATA })

			if (!res?.body?.data?.shop) {
				console.warn(`Missing shop data on ${session.shop}`)
			} else {
				const shopData = res.body.data.shop
				console.log('Got shops data', shopData)

				await shops.updateShop({
					shop: session.shop,
					shopData: {
						upsert: {
							create: shopData,
							update: shopData,
						},
					},
				})
			}
		} catch (error) {
			console.log('Failed to fetch shop data:', error)
			console.log('Error Response:', error.response)
		}
	}
}

export default function updateShopDataMiddleware() {
	return async (_req, res, next) => {
		const { session } = res.locals.shopify
		// Update db and mark shop as active
		await updateShopData(session)
		return next()
	}
}
