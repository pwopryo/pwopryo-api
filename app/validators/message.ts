import vine from '@vinejs/vine'

export const sendMessageValidator = vine.compile(
    vine.object({
        content: vine.string().trim().minLength(3),
        propertyTitle: vine.string().trim().minLength(3),
    })
)