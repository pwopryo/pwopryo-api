import vine from '@vinejs/vine'

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
