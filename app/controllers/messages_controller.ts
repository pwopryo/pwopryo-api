import Message from '#models/message';
import Property from '#models/property';
import { sendMessageValidator } from '#validators/message';
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
    public async sendMessage({ auth, params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(sendMessageValidator)
            const property = await Property
                .query()
                .where('id', params.propertyId)
                .select('id', 'userId', 'title')
                .preload('user', (user) => user.select('fullName', 'email'))
                .first()

            if (!property) {
                return response.notFound({ message: "Propriété introuvable" })
            }

            await Message.create({
                senderId: auth.user!.id,
                receiverId: property.userId,
                content: payload.content
            })

            await auth.user!.sendEmailToPropertyOwner(
                property.user,
                payload.content,
                property.title
            )

            return response.ok({ message: "Message envoyé avec succès" });
        } catch (error) {
            console.log(error);
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            return response.internalServerError({
                message: 'Impossible d\'envoyer le message.',
            });
        }
    }
}