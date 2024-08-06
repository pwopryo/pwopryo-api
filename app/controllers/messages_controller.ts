import Message from '#models/message';
import User from '#models/user';
import env from '#start/env';
import { sendMessageValidator } from '#validators/message';
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main';

export default class MessagesController {
    public async sendMessage({ auth, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(sendMessageValidator)
            const user = await User.findOrFail(auth.user!.id)

            await mail.sendLater((message) => {
                message
                    .to(user.email)
                    .from(env.get('EMAIL'))
                    .subject(`Proprio - ${payload.propertyTitle}`)
                    .html(`<p>${payload.content}</p>`)
            })

            await Message.create({
                senderId: auth.user!.id,
                receiverId: user.id,
                content: payload.content
            })

            return response.ok({ message: "Message envoyé avec succès" });
        } catch (error) {
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            return response.internalServerError({
                message: 'Impossible d\'envoyer le message.',
            });
        }
    }
}