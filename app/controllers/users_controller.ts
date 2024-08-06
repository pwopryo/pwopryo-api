import User from '#models/user'
import UserPolicy from '#policies/user_policy';
import { updateUserValidator } from '#validators/user';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';

export default class UsersController {
    /**
     * Display a list of resource
     */
    async index({ bouncer, response }: HttpContext) {
        try {
            if (await bouncer.with(UserPolicy).denies('index')) {
                return response.forbidden('Accès refusé.')
            }

            const users = await User.all()

            return response
                .ok({ data: users })
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
                return response
                    .notFound({ message: 'Utilisateur non trouvé.' })
            }

            if (await bouncer.with(UserPolicy).denies('show', userFound)) {
                return response.forbidden('Accès refusé.')
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
                return response
                    .notFound({ message: 'Utilisateur non trouvé.' })
            }

            if (await bouncer.with(UserPolicy).denies('edit', user)) {
                return response.forbidden('Accès refusé.')
            }

            if (payload.avatar) {
                await payload.avatar?.move(app.makePath('uploads/profiles'), {
                    name: user.avatar,
                    overwrite: true
                })
            }

            const userUpdated = await user.merge({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                avatar: payload.avatar?.fileName,
                phoneNumber: payload.PhoneNumber,
                role: payload.role,
            }).save()

            return response.ok({ user: userUpdated })
        } catch (error) {
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
                return response.notFound({ message: 'Utilisateur non trouvé.' })
            }

            if (await bouncer.with(UserPolicy).denies('delete')) {
                return response.forbidden('Accès refusé.')
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