import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default prisma

export async function tryCatch(callback) {
	try {
		return { data: await callback(), error: undefined }
	} catch (error) {
		return { error: processError(error), data: undefined }
	}
}

function processError(error) {
	console.log('errorerror', error)
	if (error) {
		if (error.code === 'P2003') {
			return {
				code: error.code,
				msg: 'There is a unique constraint violation',
			}
		}
	}
	return { code: 'UNKNOWN', msg: 'Unknown error' }
}
