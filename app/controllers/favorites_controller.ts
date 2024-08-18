import Favorite from '#models/favorite'
import Property from '#models/property';
import type { HttpContext } from '@adonisjs/core/http'

export default class FavoritesController {
    /**
     * Display a list of resource
     */
    async index({ auth, response, request }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)

        try {
            const favorites = await Favorite
                .query()
                .preload('property', (property) =>
                    property.preload('images', (image) => image.select('imageUrl', 'is_primary'))
                        .where('isAvailable', true)
                        .select(
                            'id', 'title', 'address', 'city', 'department', 'type', 'price', 'createdAt'
                        ))
                .where({ isLiked: true, userId: auth.user!.id, })
                .orderBy('createdAt', 'desc')
                .paginate(page, limit)

            return response.ok({ data: favorites })
        } catch (error) {
            return response.internalServerError({
                message: 'Erreur lors de la récupération des favoris de l\'utilisateur.',
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
                return response.notFound({ message: 'Propriété introuvable' })
            }

            const favorite = await Favorite.create({
                userId: auth.user!.id,
                propertyId: property.id,
                isLiked: true,
            })

            return response.created({ data: favorite })
        } catch (error) {
            return response.internalServerError({
                message: "Erreur lors de la création du favori.",
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
                return response.notFound({ message: 'Favoris introuvable' })
            }

            const favoriteUpdated = await favorite.merge({
                isLiked: !favorite.isLiked,
            }).save()

            return response.ok({ data: favoriteUpdated })
        } catch (error) {
            return response.internalServerError({
                message: "Erreur lors de la mise à jour du favori.",
            });
        }
    }
}