import { Session } from '@shopify/shopify-api'
import prisma, { tryCatch } from './client.js'

// function to store the session
async function storeSession(session) {
	console.log('storeCallback called with session:', session)
	const { error } = await tryCatch(async () => {
		return await prisma.session.upsert({
			where: {
				id: session.id,
			},
			update: {
				id: session.id,
				session: JSON.stringify(session.toPropertyArray()),
				shop: session.shop,
			},
			create: {
				id: session.id,
				session: JSON.stringify(session.toPropertyArray()),
				shop: session.shop,
			},
		})
	})
	if (error) return false
	return true
}

// function to load the session
async function loadSession(id) {
	// console.log("loadCallback called with id:", id);
	const { data, error } = await tryCatch(async () => {
		return await prisma.session.findFirst({
			where: {
				id,
			},
		})
	})
	if (!error) {
		if (!data) return undefined
		const session = JSON.parse(data.session)
		return Session.fromPropertyArray(session)
	}
	return undefined
}

// function to find the session
async function findSessions(shop) {
	console.log('findSessions called with shop:', shop)
	const { data, error } = await tryCatch(async () => {
		return await prisma.session.findMany({
			where: {
				shop,
			},
		})
	})
	if (!error) {
		if (!data) return []
		return data.map(d => Session.fromPropertyArray(JSON.parse(d.session)))
	}
	return []
}

// function to delete the session
async function deleteSession(id) {
	console.log('deleteCallback called with id:', id)
	const { error } = await tryCatch(async () => {
		return await prisma.session.delete({
			where: {
				id,
			},
		})
	})
	if (error) return false
	return true
}

// function to delete sessions
async function deleteSessions(ids) {
	console.log('deleteSessions called with ids:', ids)
	for (const id of ids) {
		console.log('deleting session with id:', id)
		const { error } = await tryCatch(async () => {
			return await prisma.session.delete({
				where: {
					id,
				},
			})
		})
		if (error) return false
	}
	return true
}

export default {
	storeSession,
	loadSession,
	deleteSession,
	deleteSessions,
	findSessions,
}
