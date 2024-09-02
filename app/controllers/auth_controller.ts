import Otp from '#models/otp';
import User from '#models/user';
import { registerUserValidator, loginUserValidator, otpValidator, emailValidator, resetPasswordValidator } from '#validators/auth';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'crypto';
import R2Service from '#services/r2_service';

export default class AuthController {
  public async register({ auth, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)
      let avatarKey = null
      let avatarUploadUrl = null

      if (payload.avatar) {
        avatarKey = `profiles/${cuid()}.webp`
        avatarUploadUrl = await R2Service.getUploadUrl(
          avatarKey,
          payload.avatar.headers['content-type'],
          payload.avatar.size
        )
      }

      const user = await User.create({
        uuid: randomUUID(),
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        avatar: avatarKey,
        phoneNumber: payload.phoneNumber,
        role: payload.role ? payload.role : "User",
        isVerified: false
      })

      await auth.use('web').login(user, !!request.input('remember_me'))
      await user.sendVerifyEmail()

      return response.created({
        data: {
          user: user,
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

      if (error.code === '23505') {
        if (error.constraint === 'users_phone_number_unique') {
          return response.conflict({ message: 'Numéro de téléphone existe déjà' })
        }

        return response.conflict({ message: 'L\'email existe déjà' })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'inscription",
      })
    }
  }

  public async verifyOtp({ auth, request, response }: HttpContext) {
    try {
      const { otp, type } = await request.validateUsing(otpValidator);

      const user = await Otp.getUserOtp(otp, type)

      if (!user || !(user?.id === auth.user?.id)) {
        return response.badRequest({
          message: "OTP invalide ou expiré"
        });
      }

      if (type == 'PASSWORD_RESET') {
        await Otp.expireOtp(user, 'passwordResetOtps')
        return response.ok({ message: "Vérification réussie." });
      }

      user.isVerified = true
      await user.save()
      await Otp.expireOtp(user, 'verifyEmailOtps')
      await user.sendWelcomeEmail()

      return response.ok({ message: "Vérification réussie." });
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity({ messages: error.messages })
      }

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
          message: 'Email ou mot de passe invalide'
        })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de la connexion",
      })
    }
  }

  public async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('web').logout()
      return response.ok({})
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de la déconnexion",
      })
    }
  }

  async getuserInfo({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      return response.ok({ data: user })
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'obtention des informations utilisateur",
      })
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)
      const user = await User.findBy('email', email)

      if (!user) {
        return response.badRequest({ message: 'Email non trouvé' })
      }

      await user.sendForgotPasswordEmail()

      return response.ok({
        message: 'OTP envoyé à votre email.'
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity({ messages: error.messages })
      }

      return response.internalServerError({
        message:
          "Une erreur s'est produite lors de la demande de réinitialisation du mot de passe.",
      })
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      const { password, email } = await request
        .validateUsing(resetPasswordValidator)

      const user = await User.findBy('email', email)

      await user!.merge({ password }).save()
      await user!.sendPasswordChangedEmail()

      return response.ok({
        data: 'Le mot de passe a été modifié avec succès.'
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity({ messages: error.messages })
      }

      return response.internalServerError({
        message: "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
      })
    }
  }

  public async sendOtp({ auth, response }: HttpContext) {
    try {
      if (auth.user!.isVerified) {
        return response.badRequest({ message: 'Utilisateur déjà vérifié' })
      }

      await auth.user!.sendVerifyEmail()

      return response.ok({ message: 'OTP envoyé à votre email.' });
    } catch (error) {
      return response.internalServerError({
        message: "Une erreur s'est produite lors de l'envoi de l'OTP.",
      })
    }
  }
}
