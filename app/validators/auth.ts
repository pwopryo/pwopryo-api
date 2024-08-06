import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().trim().minLength(3).maxLength(100),
        email: vine.string().trim().email(),
        password: vine.string().trim(),
        avatar: vine.file({
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg']
        }),
        PhoneNumber: vine.string().trim().mobile().minLength(8).maxLength(8),
        role: vine.enum(['User', 'Admin']),
    })
)

export const loginUserValidator = vine.compile(
    vine.object({
        email: vine.string().trim().email(),
        password: vine.string().trim(),
    })
)

export const verifyEmailValidator = vine.compile(
    vine.object({
        email: vine.string().trim().email(),
        otp: vine.string().trim(),
    })
)