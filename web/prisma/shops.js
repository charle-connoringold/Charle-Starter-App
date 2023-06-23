// ts-check
import prisma, { tryCatch } from './client.js'

async function getShop(shop) {
	const { data, error } = await tryCatch(async () => {
		return await prisma.shop.findFirst({
			where: {
				shop,
			},
			include: {
				subscription: true,
				shopData: true,
			},
		})
	})
	if (!error) return data
	return undefined
}

async function createShop(data) {
	const { error } = await tryCatch(async () => {
		return await prisma.shop.create({
			data: {
				...data,
				subscription: {
					create: {},
				},
			},
		})
	})
	if (error) return false
	return true
}

async function updateShop(data) {
	const { data: shop, error } = await tryCatch(async () => {
		return await prisma.shop.update({
			where: {
				shop: data.shop,
			},
			data,
		})
	})
	if (!error) return shop
	return undefined
}

async function deleteShop(shop) {
	const { error } = await tryCatch(async () => {
		return await prisma.shop.delete({
			where: {
				shop,
			},
		})
	})
	if (error) return false
	return true
}

export default {
	getShop,
	createShop,
	updateShop,
	deleteShop,
}
