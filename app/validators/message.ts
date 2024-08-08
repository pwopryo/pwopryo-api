import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const sendMessageValidator = vine.compile(
    vine.object({
        content: vine.string().trim().minLength(2),
    })
)

const messages = {
    required: 'Le {{ field }} est obligatoire',
    string: 'Le {{ field }} doit être une chaîne',
    minLength: 'Le {{ field }} doit contenir {{ min }} caractères.',
}

const fields = {
    propertyTitle: 'titre',
    content: 'message',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)
