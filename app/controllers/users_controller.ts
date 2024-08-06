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
                return response.forbidden('Access denied')
            }

            const users = await User.all()

            return response
                .status(200)
                .json({ data: users })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error while fetching the users.',
                    error: error
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
                    .status(404)
                    .json({ message: 'User not found.' })
            }

            if (await bouncer.with(UserPolicy).denies('show', userFound)) {
                return response.forbidden('Access denied')
            }

            return response
                .status(200)
                .json({ data: userFound })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error while fetching the user.',
                    error: error
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
                    .status(404)
                    .json({ message: 'User not found.' })
            }

            if (await bouncer.with(UserPolicy).denies('edit', user)) {
                return response.forbidden('Access denied')
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

            return response
                .status(200)
                .json({ user: userUpdated })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error while updating the user.',
                    error: error
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
                return response
                    .status(404)
                    .json({ message: 'User not found.' })
            }

            if (await bouncer.with(UserPolicy).denies('delete')) {
                return response.forbidden('Access denied')
            }

            await user.delete()

            return response
                .status(204)
                .json({ message: "User successfully deleted" })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error while deleting the user.',
                    error: error
                })
        }
    }
}