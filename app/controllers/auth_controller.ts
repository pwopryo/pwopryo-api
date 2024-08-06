import User from '#models/user';
import { registerUserValidator, loginUserValidator, verifyEmailValidator } from '#validators/auth';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';
import mail from '@adonisjs/mail/services/main';

export default class AuthController {
    public async register({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(registerUserValidator)

            if (payload.avatar) {
                await payload.avatar.move(app.makePath('uploads/profiles'), {
                    name: `${cuid()}.webp`
                })
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString()

            const user = await User.create({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                avatar: payload.avatar?.fileName,
                phoneNumber: payload.phoneNumber,
                OTP: otp,
                role: payload.role,
                isVerified: false
            })

            await mail.sendLater((message) => {
                message
                    .to(payload.email)
                    .from('jclayton.trade@gmail.com')
                    .subject('Vérifiez votre nouveau compte Proprio')
                    .htmlView('emails/verify_email', { user })
            })

            return response.created({ data: user });
        } catch (error) {
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            if (error.code === '23505') {
                return response.conflict({ message: `L'email existe déjà.` })
            }

            return response.internalServerError({
                message: "Une erreur s'est produite lors de l'inscription.",
            })
        }
    }

    public async verifyEmail({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(verifyEmailValidator);

            const user = await User.findBy('email', payload.email);

            if (!user) {
                return response.notFound({
                    message: "Utilisateur non trouvé."
                });
            }

            if (user.OTP === payload.otp) {
                user.isVerified = true;
                await user.save();

                return response.ok({ message: "Vérification réussie." });
            } else {
                return response.badRequest({ message: "OTP invalide." });
            }
        } catch (error) {
            return response.internalServerError({
                message: "Erreur lors de la vérification de l'e-mail.",
            });
        }
    }

    public async login({ auth, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(loginUserValidator)

            const user = await User.verifyCredentials(
                payload.email,
                payload.password
            )

            await auth.use('web').login(
                user,
                !!request.input('remember_me')
            )

            return response.ok({ data: user })
        } catch (error) {
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            if (error.code === 'E_INVALID_CREDENTIALS') {
                return response.unauthorized({
                    message: 'Email ou mot de passe invalide.'
                })
            }

            return response.internalServerError({
                message: "Une erreur s'est produite lors de la connexion.",
            })
        }
    }

    public async logout({ auth, response }: HttpContext) {
        try {
            await auth.use('web').logout()
            return response.ok({})
        } catch (error) {
            return response.internalServerError({
                message: "Une erreur s'est produite lors de la déconnexion.",
            })
        }
    }

    async getuserInfo({ auth, response }: HttpContext) {
        try {
            const user = auth.user
            return response.ok({ data: user })
        } catch (error) {
            return response.internalServerError({
                message: "Une erreur s'est produite lors de l'obtention des informations utilisateur.",
            })
        }
    }
}