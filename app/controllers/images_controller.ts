import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { sep, normalize } from 'node:path'
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

export default class ImagesController {
    async show({ params, request, response }: HttpContext) {
        const filePath = request.param('*').join(sep)
        const normalizedPath = normalize(filePath)

        if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
            return response.badRequest('Malformed path')
        }

        const basePath = params.type === 'profiles' ? 'uploads/profiles' : 'uploads/images'
        const absolutePath = app.makePath(basePath, normalizedPath)
        return response.download(absolutePath)
    }
}