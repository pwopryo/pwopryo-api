import User from '#models/user'
import UserPolicy from '#policies/user_policy';
import R2Service from '#services/r2_service';
import { updateUserValidator } from '#validators/user';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    /**
     * Display a list of resource
     */
    async index({ bouncer, response, request }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        try {
            if (await bouncer.with(UserPolicy).denies('index')) {
                return response.forbidden({ message: 'Accès refusé' })
            }

            const users = await User.query()
                .select('*')
                .orderBy('createdAt', 'desc')
                .paginate(page, limit)

            return response.ok({ data: users })
        } catch (error) {
            return response.internalServerError({
                message: 'Erreur lors de la récupération des utilisateurs.',
            })
        }
    }

    /**
     * Show individual record
     */
    async show({ bouncer, params, response }: HttpContext) {
        try {
            const userFound = await User.find(params.id)

            if (!userFound) {
                return response.notFound({ message: 'Utilisateur non trouvé' })
            }

            if (await bouncer.with(UserPolicy).denies('show', userFound)) {
                return response.forbidden({ message: 'Accès refusé' })
            }

            return response.ok({ data: userFound })
        } catch (error) {
            return response.internalServerError({
                message: 'Erreur lors de la récupération de l\'utilisateur.'
            })
        }
    }

    /**
     * Handle form submission for the edit action
     */
    async update({ bouncer, params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(updateUserValidator)
            const user = await User.find(params.id)

            if (!user) {
                return response.notFound({ message: 'Utilisateur non trouvé' })
            }

            if (await bouncer.with(UserPolicy).denies('edit', user)) {
                return response.forbidden({ message: 'Accès refusé' })
            }

            let avatarUploadUrl = null
            if (payload.avatar) {
                const newAvatarKey = `profiles/${cuid()}.webp`
                avatarUploadUrl = await R2Service.getUploadUrl(
                    newAvatarKey,
                    payload.avatar.headers['content-type'],
                    payload.avatar.size
                )

                if (user.avatar) {
                    await R2Service.deleteObject(user.avatar)
                }

                user.avatar = newAvatarKey
            }

            const userUpdated = await user.merge({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
            }).save()

            return response.ok({
                data: {
                    user: userUpdated,
                    avatarUploadUrl: avatarUploadUrl,
                },
            })
        } catch (error) {
            if (error.message === 'Type de fichier invalide' || error.message === 'La taille du fichier dépasse la limite') {
                return response.badRequest({ message: error.message })
            }

            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            return response.internalServerError({
                message: 'Erreur lors de la mise à jour de l\'utilisateur.'
            })
        }
    }

    /**
     * Delete record
     */
    async destroy({ bouncer, params, response }: HttpContext) {
        try {
            const user = await User.find(params.id)

            if (!user) {
                return response.notFound({ message: 'Utilisateur non trouvé' })
            }

            if (await bouncer.with(UserPolicy).denies('delete')) {
                return response.forbidden({ message: 'Accès refusé' })
            }

            await user.delete()

            return response.ok({ message: "Utilisateur supprimé avec succès." })
        } catch (error) {
            return response.internalServerError({
                message: 'Erreur lors de la suppression de l\'utilisateur.',
            })
        }
    }
}