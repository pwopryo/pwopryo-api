import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const registerUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().trim().minLength(3).maxLength(100),
        email: vine.string().trim().email(),
        password: vine.string().trim().minLength(8),
        avatar: vine.file({
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg']
        }).optional(),
        phoneNumber: vine.string().trim().mobile().minLength(8).maxLength(8),
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

const messages = {
    required: '{{ field }} est obligatoire',
    string: '{{ field }} doit être une chaîne',
    minLength: '{{ field }} doit contenir {{ min }} caractères',
    maxLength: '{{ field }} doit contenir {{ max }} caractères',
    email: 'Adresse e-mail invalide',
    mobile: 'Numéro de téléphone invalide'
}

const fields = {
    email: 'Email',
    password: 'Mot de passe',
    otp: 'OTP',
    fullName: 'Nom complet',
    avatar: 'Avatar',
    phoneNumber: 'Téléphone',
    role: 'Rôle',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)