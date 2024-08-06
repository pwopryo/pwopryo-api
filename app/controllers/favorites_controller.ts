import Favorite from '#models/favorite'
import Property from '#models/property';
import type { HttpContext } from '@adonisjs/core/http'

export default class FavoritesController {
    /**
     * Display a list of resource
     */
    async index({ auth, response }: HttpContext) {
        try {
            const favorites = await Favorite
                .query()
                .preload('property', (property) =>
                    property.preload('images', (image) => image.select('imageName'))
                        .where('isAvailable', true)
                        .select(
                            'id', 'title', 'address', 'city', 'department', 'type', 'price', 'createdAt'
                        ))
                .where({ isLiked: true, userId: auth.user!.id, })


            return response
                .status(200)
                .json({ data: favorites })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: 'Error retrieving user favorites: ',
                    error: error
                });
        }
    }

    /**
     * Handle form submission for the create action
     */
    async store({ auth, params, response }: HttpContext) {
        try {
            const property = await Property.find(params.id)

            if (!property) {
                return response
                    .status(404)
                    .json({ message: 'Property not found.' })
            }

            const favorite = await Favorite.create({
                userId: auth.user!.id,
                propertyId: property.id,
                isLiked: true,
            })

            return response
                .status(201)
                .json({ data: favorite })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: "Error creating favorite",
                    error: error
                });
        }
    }

    /**
     * Handle form submission for the edit action
     */
    async update({ auth, params, response }: HttpContext) {
        try {
            const favorite = await Favorite.findBy({
                userId: auth.user!.id,
                propertyId: params.id,
            })

            if (!favorite) {
                return response
                    .status(404)
                    .json({ message: 'Favorite not found.' })
            }

            const favoriteUpdated = await favorite.merge({
                isLiked: !favorite.isLiked,
            }).save()

            return response
                .status(200)
                .json({ data: favoriteUpdated })
        } catch (error) {
            return response
                .status(500)
                .json({
                    message: "Error updating favorite",
                    error: error
                });
        }
    }
}