import PropertyOffer from '#models/property_offer'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await PropertyOffer.createMany([
      { propertyId: 1, offerId: 1 },
      { propertyId: 1, offerId: 2 },
      { propertyId: 1, offerId: 8 },
      { propertyId: 2, offerId: 1 },
      { propertyId: 2, offerId: 4 },
      { propertyId: 2, offerId: 6 },
      { propertyId: 3, offerId: 1 },
      { propertyId: 3, offerId: 5 },
      { propertyId: 4, offerId: 1 },
      { propertyId: 4, offerId: 10 },
      { propertyId: 5, offerId: 13 },
      { propertyId: 5, offerId: 14 }
    ])
  }
}