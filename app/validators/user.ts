import vine, { SimpleMessagesProvider } from '@vinejs/vine'

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
    fullName: 'Nom complet',
    avatar: 'Avatar',
    phoneNumber: 'Téléphone',
    role: 'Rôle',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)