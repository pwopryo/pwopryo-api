import Property from '#models/property';
import PropertyImage from '#models/property_image';
import PropertyPolicy from '#policies/property_policy';
import R2Service from '#services/r2_service';
import { createPropertyValidator, updatePropertyValidator } from '#validators/property';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'


export default class PropertiesController {
    /**
     * Display a list of resource
     */
    async index({ response, request }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        try {
            const properties = await Property
                .query()
                .preload('images', (image) => image.select('image_url', 'is_primary'))
                .where('isAvailable', true)
                .select(
                    'id', 'title', 'address', 'numBedrooms', 'numBathrooms', 'sqft', 'type', 'price', 'disponibility', 'createdAt'
                )
                .orderBy('createdAt', 'desc')
                .paginate(page, limit)

            return response.ok({ data: properties })
        } catch (error) {
            console.log(error)
            return response.internalServerError({
                message: "Erreur lors de la récupération des propriétés.",
            })
        }
    }

    /**
     * Handle form submission for the create action
     */
    async store({ auth, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(createPropertyValidator)

            const property = await Property.create({
                userId: auth.user!.id,
                title: payload.title,
                description: payload.description ?? undefined,
                address: payload.address,
                city: payload.city,
                department: payload.department,
                type: payload.type,
                price: payload.price,
                sqft: payload.sqft,
                numBedrooms: payload.num_bedrooms,
                numBathrooms: payload.num_bathrooms,
                isAvailable: payload.is_available,
                disponibility: payload.disponibility
            })

            await property.related('offers').attach(payload.offers)

            const imageUploadUrls = []
            for (let index = 0; index < payload.images.length; index++) {
                const image = payload.images[index]
                const imageKey = `properties/${cuid()}.webp`

                const uploadUrl = await R2Service.getUploadUrl(
                    imageKey,
                    image.headers['content-type'],
                    image.size
                )
                imageUploadUrls.push(uploadUrl)

                await PropertyImage.create({
                    propertyId: property.id,
                    imageUrl: imageKey,
                    isPrimary: index === 0
                })
            }

            await property.load('images')
            await property.load('offers')

            return response.created({
                data: { property: property, images: imageUploadUrls }
            })
        } catch (error) {
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            return response.internalServerError({
                message: "Erreur lors de la création de la propriété.",
            })
        }
    }

    /**
     * Show individual record
     */
    async show({ params, response }: HttpContext) {
        try {
            const property = await Property
                .query()
                .where('id', params.id)
                .preload('user', (user) => user.select('fullName', 'avatar'))
                .preload('offers', (offer) => offer.select('name'))
                .preload('images', (image) => image.select('imageUrl', 'is_primary'))
                .first()

            if (!property) {
                return response.notFound({ message: 'Propriété introuvable' })
            }

            return response
                .ok({ data: property })
        } catch (error) {
            console.log(error)
            return response.internalServerError({
                message: 'Erreur lors de la récupération de la propriété.',
            })
        }
    }

    /**
     * Handle form submission for the edit action
     */
    async update({ bouncer, params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(updatePropertyValidator)
            const property = await Property.find(params.id)

            if (!property) {
                return response
                    .notFound({ message: 'Propriété introuvable.' })
            }

            if (await bouncer.with(PropertyPolicy).denies('edit', property)) {
                return response.forbidden({ message: 'Accès refusé.' })
            }

            await property.merge({
                title: payload.title,
                description: payload.description ?? payload.description,
                address: payload.address,
                city: payload.city,
                department: payload.department,
                type: payload.type,
                price: payload.price,
                sqft: payload.sqft,
                numBedrooms: payload.num_bedrooms,
                numBathrooms: payload.num_bathrooms,
                disponibility: payload.disponibility,
                isAvailable: payload.is_available
            }).save()

            await property.related('offers').sync(payload.offers)

            // Delete old images
            const oldImages = await property.related('images').query()
            for (const img of oldImages) {
                await R2Service.deleteObject(img.imageUrl)
                await img.delete()
            }

            const imageUploadUrls = []
            for (let index = 0; index < payload.images.length; index++) {
                const image = payload.images[index]
                const imageKey = `properties/${cuid()}.webp`
                const uploadUrl = await R2Service.getUploadUrl(
                    imageKey,
                    image.headers['content-type'],
                    image.size
                )
                imageUploadUrls.push(uploadUrl)

                await PropertyImage.create({
                    propertyId: property.id,
                    imageUrl: imageKey,
                    isPrimary: index === 0
                })
            }

            await property.load('images')
            await property.load('offers')

            return response.created({
                data: { property: property, images: imageUploadUrls }
            })
        } catch (error) {
            if (error.code === 'E_VALIDATION_ERROR') {
                return response.unprocessableEntity({ messages: error.messages })
            }

            return response.internalServerError({
                message: "Erreur lors de la mise à jour de la propriété.",
            })
        }
    }

    /**
     * Delete record
     */
    async destroy({ bouncer, params, response }: HttpContext) {
        try {

            const property = await Property.find(params.id);

            if (!property) {
                return response
                    .notFound({ message: 'Propriété introuvable.' })
            }

            if (await bouncer.with(PropertyPolicy).denies('delete', property)) {
                return response.forbidden({ message: 'Accès refusé.' })
            }

            await property.related('offers').detach()
            await property.delete();

            return response.ok({ message: 'Propriété supprimée avec succès.' })
        } catch (error) {
            return response.internalServerError({
                message: 'Erreur lors de la suppression de la propriété.'
            })
        }
    }

    /**
    * Filter properties based on various criteria
    */
    async filter({ response, request }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        try {
            const {
                city, department, type, minPrice, maxPrice,
                sqft, numBedrooms, numBathrooms, offers, disponibility
            } = request.qs();

            const properties = await Property.query()
                .where('isAvailable', true)
                .preload('images', (image) => image.select('image_url', 'is_primary'))
                .if(city, (query) => query.where({ city }))
                .if(department, (query) => query.where({ department }))
                .if(type, (query) => query.where({ type }))
                .if(minPrice, (query) => query.where('price', '>=', minPrice))
                .if(maxPrice, (query) => query.where('price', '<=', maxPrice))
                .if(sqft, (query) => query.where({ sqft }))
                .if(numBedrooms, (query) => query.where({ numBedrooms }))
                .if(numBathrooms, (query) => query.where({ numBathrooms }))
                .if(disponibility, (query) => query.where({ disponibility }))
                .if(offers, (query) => query.whereHas('offers', (offerQuery) => {
                    offerQuery.whereIn('name', offers);
                }))
                .select(
                    'id', 'title', 'address', 'numBedrooms', 'numBathrooms', 'sqft', 'type', 'price', 'disponibility', 'createdAt'
                )
                .orderBy('createdAt', 'desc')
                .paginate(page, limit)

            return response
                .ok({ data: properties })
        } catch (error) {
            return response.internalServerError({
                message: 'Propriétés de filtrage des erreurs.'
            })
        }
    }
}