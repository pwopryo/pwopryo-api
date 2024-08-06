import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const createPropertyValidator = vine.compile(
    vine.object({
        title: vine.string().trim().minLength(3),
        description: vine.string().trim().nullable(),
        address: vine.string().trim().minLength(8),
        city: vine.string().trim().minLength(3),
        department: vine.enum([
            'Artibonite', 'Centre', 'Grand Anse', 'Nippes', 'Nord', 'Nord-Est',
            'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'
        ]),
        type: vine.enum([
            'Maison', 'Appartement', 'Condo', 'Studio', 'Villa', 'Duplex',
            'Penthouse', 'Chalet', 'Bungalow', 'Guesthouse',
            'Résidence étudiante', 'Local commercial', 'Bureau', 'Atelier',
            'Entrepôt', 'Terrain'
        ]),
        price: vine.number().positive(),
        num_living_rooms: vine.number().positive(),
        num_bedrooms: vine.number().positive(),
        num_bathrooms: vine.number().positive(),
        offers: vine.array(vine.number()),
        is_available: vine.boolean(),
        disponibility: vine.enum(['À vendre', 'À louer']),
        images: vine.array(
            vine.file({
                size: '10mb',
                extnames: ['jpg', 'png', 'jpeg']
            })).minLength(3).maxLength(30)
    })
)

export const updatePropertyValidator = vine.compile(
    vine.object({
        title: vine.string().trim().minLength(3),
        description: vine.string().trim(),
        address: vine.string().trim().minLength(8),
        city: vine.string().trim().minLength(3),
        department: vine.enum([
            'Artibonite', 'Centre', 'Grand Anse', 'Nippes', 'Nord', 'Nord-Est',
            'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'
        ]),
        type: vine.enum([
            'Maison', 'Appartement', 'Condo', 'Studio', 'Villa', 'Duplex',
            'Penthouse', 'Chalet', 'Bungalow', 'Guesthouse',
            'Résidence étudiante', 'Local commercial', 'Bureau', 'Atelier',
            'Entrepôt', 'Terrain'
        ]),
        price: vine.number().positive(),
        num_living_rooms: vine.number().positive(),
        num_bedrooms: vine.number().positive(),
        num_bathrooms: vine.number().positive(),
        offers: vine.array(vine.number()),
        is_available: vine.boolean(),
        disponibility: vine.enum(['À vendre', 'À louer']),
        images: vine.array(
            vine.file({
                size: '10mb',
                extnames: ['jpg', 'png', 'jpeg']
            })).minLength(3).maxLength(30)
    })
)


const messages = {
    required: '{{ field }} est obligatoire',
    string: '{{ field }} doit être une chaîne',
    minLength: '{{ field }} doit contenir {{ min }} caractères',
    maxLength: '{{ field }} doit contenir {{ max }} caractères',
    boolean: 'La valeur doit être un booléen',
    positive: '{{ field }} doit être positif',
    number: '{{ field }} doit être un nombrer',
}

const fields = {
    title: 'titre',
    description: 'description',
    address: 'adresse',
    city: 'ville',
    department: 'département',
    type: 'type',
    price: 'prix',
    num_living_rooms: 'salons',
    num_bedrooms: 'chambres',
    num_bathrooms: 'salles de bains',
    offers: 'offres',
    is_available: 'toujours disponibile',
    disponibility: 'disponibilité',
    images: "images"
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)