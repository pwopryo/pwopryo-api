import Message from '#models/message';
import User from '#models/user';
import { sendMessageValidator } from '#validators/message';
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main';

export default class MessagesController {
    public async sendMessage({ auth, params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(sendMessageValidator)
            const user = await User.findOrFail(params.id)

            await mail.sendLater((message) => {
                message
                    .to(user.email)
                    .from(auth.user!.email)
                    .subject(`Proprio - ${payload.propertyTitle}`)
                    .html(`<p>${payload.content}</p>`)
            })

            await Message.create({
                senderId: auth.user!.id,
                receiverId: user.id,
                content: payload.content
            })

            return response
                .status(200)
                .json({ message: "Message sent successfully" });
        } catch (error) {
            return response
                .status(400)
                .json({
                    message: 'Unable to send message',
                    error: error
                });
        }
    }
}