import Property from '#models/property';
import PropertyImage from '#models/property_image';
import PropertyPolicy from '#policies/property_policy';
import { createPropertyValidator, updatePropertyValidator } from '#validators/property';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';
import fs from 'fs'
import path from 'path'

export default class PropertiesController {
    /**
     * Display a list of resource
     */
    async index({ response }: HttpContext) {
        try {
            const properties = await Property
                .query()
                .preload('images', (image) => image.select('imageName'))
                .where('isAvailable', true)
                .select(
                    'id', 'title', 'address', 'city', 'department', 'type', 'price', 'createdAt'
                )

            return response
                .status(200)
                .json({ data: properties })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error retrieving properties',
                    error: error
                });
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
                numLivingRooms: payload.num_living_rooms,
                numBedrooms: payload.num_bedrooms,
                numBathrooms: payload.num_bathrooms,
                isAvailable: payload.is_available
            })

            await property.related('offers').attach(payload.offers)

            for (let index = 0; index < payload.images.length; index++) {
                const image = payload.images[index]

                await image.move(app.makePath('uploads/properties'), {
                    name: `${cuid()}.webp`
                })

                await PropertyImage.create({
                    propertyId: property.id,
                    imageName: image.fileName,
                    isPrimary: index === 0
                })
            }

            return response
                .status(201)
                .json({ data: property })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: "Error creating property",
                    error: error
                });
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
                .preload('images', (image) => image.select('imageName'))
                .first()

            if (!property) {
                return response
                    .status(404)
                    .json({ message: 'Property not found.' })
            }

            return response
                .status(200)
                .json({ data: property })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error retrieving property',
                    error: error
                });
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
                    .status(404)
                    .json({ message: 'Property not found.' })
            }

            if (await bouncer.with(PropertyPolicy).denies('edit', property)) {
                return response.forbidden('Access denied')
            }

            const propertyUpdated = await property.merge({
                title: payload.title,
                description: payload.description ?? payload.description,
                address: payload.address,
                city: payload.city,
                department: payload.department,
                type: payload.type,
                price: payload.price,
                numLivingRooms: payload.num_living_rooms,
                numBedrooms: payload.num_bedrooms,
                numBathrooms: payload.num_bathrooms,
                isAvailable: payload.is_available
            }).save()

            await propertyUpdated.related('offers').sync(payload.offers)

            const existingImages = await PropertyImage
                .query()
                .where('property_id', property.id)

            for (const img of existingImages) {
                const filePath = path.join('uploads/properties', img.imageName)
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            }

            await PropertyImage.query().where('property_id', property.id).delete()

            for (let index = 0; index < payload.images.length; index++) {
                const image = payload.images[index]

                await image.move(app.makePath('uploads/properties'), {
                    name: `${cuid()}.webp`,
                })

                await PropertyImage.create({
                    propertyId: property.id,
                    imageName: image.fileName,
                    isPrimary: index === 0
                })
            }

            return response
                .status(201)
                .json({ data: property })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: "Error updating property",
                    error: error
                });
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
                    .status(404)
                    .json({ message: 'Property not found.' })
            }

            if (await bouncer.with(PropertyPolicy).denies('delete', property)) {
                return response.forbidden('Access denied')
            }

            await property.related('offers').detach()
            await property.delete();

            return response
                .status(200)
                .json({ message: 'Property deleted successfully' })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error deleting property',
                    error: error,
                });
        }
    }

    /**
    * Filter properties based on various criteria
    */
    async filter({ response, request }: HttpContext) {
        try {
            const {
                city, department, type, minPrice, maxPrice,
                numLivingRooms, numBedrooms, numBathrooms, offers, disponibility
            } = request.qs();

            const properties = await Property.query()
                .where('isAvailable', true)
                .preload('images', (image) => image.select('imageName'))
                .if(city, (query) => query.where({ city }))
                .if(department, (query) => query.where({ department }))
                .if(type, (query) => query.where({ type }))
                .if(minPrice, (query) => query.where('price', '>=', minPrice))
                .if(maxPrice, (query) => query.where('price', '<=', maxPrice))
                .if(numLivingRooms, (query) => query.where({ numLivingRooms }))
                .if(numBedrooms, (query) => query.where({ numBedrooms }))
                .if(numBathrooms, (query) => query.where({ numBathrooms }))
                .if(disponibility, (query) => query.where({ disponibility }))
                .if(offers, (query) => query.whereHas('offers', (offerQuery) => {
                    offerQuery.whereIn('name', offers);
                }))
                .select(
                    'id', 'title', 'address', 'city', 'department', 'type', 'price', 'createdAt'
                )

            return response
                .status(200)
                .json({ data: properties })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error filtering properties',
                    error: error.message,
                });
        }
    }
}