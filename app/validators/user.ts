import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().trim().minLength(3).maxLength(100).nullable(),
        email: vine.string().trim().email().nullable(),
        password: vine.string().trim().nullable(),
        avatar: vine.file({
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg']
        }).nullable(),
        PhoneNumber: vine.string().trim().mobile().minLength(8).maxLength(8).nullable(),
        role: vine.enum(['User', 'Admin']).nullable(),
    })
)