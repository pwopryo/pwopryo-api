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

            await payload.avatar.move(app.makePath('uploads/profiles'), {
                name: `${cuid()}.webp`
            })

            const otp = Math.floor(100000 + Math.random() * 900000).toString()

            const user = await User.create({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                avatar: payload.avatar.fileName,
                phoneNumber: payload.PhoneNumber,
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

            return response
                .status(201)
                .json({ message: "User successfully created" });
        } catch (error) {
            return response
                .status(422)
                .json({
                    error: error
                });
        }
    }

    public async verifyEmail({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(verifyEmailValidator);

            const user = await User.findBy('email', payload.email);

            if (!user) {
                return response.status(404).json({ message: "User not found." });
            }

            if (user.OTP === payload.otp) {
                user.isVerified = true;
                await user.save();

                return response
                    .status(200)
                    .json({ message: "OTP verified successfully." });
            } else {
                return response.status(400).json({ message: "Invalid OTP." });
            }
        } catch (error) {
            return response.status(500).json({
                message: "Error verifying OTP.",
                error: error,
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

        } catch (error) {
            return response
                .status(error.status)
                .json({
                    message: error.name,
                });
        }
    }

    public async logout({ auth, response }: HttpContext) {
        try {
            await auth.use('web').logout()
            return response.status(204)
        } catch (error) {
            return response
                .status(error.status)
                .json({
                    message: error.name,
                });
        }
    }
}