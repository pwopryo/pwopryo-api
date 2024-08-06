import Property from '#models/property'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Property.createMany([
      {
        userId: 1,
        title: "Luxurious Beachfront Villa",
        description: "A stunning villa with a panoramic view of the ocean. Includes 4 bedrooms, 3 bathrooms, a private pool, and direct beach access.",
        address: "123 Ocean Drive",
        city: "Port-au-Prince",
        department: "Ouest",
        type: "Villa",
        price: 500000.00,
        numLivingRooms: 2,
        numBedrooms: 4,
        numBathrooms: 3,
        isAvailable: true,
        disponibility: 'À louer'
      },
      {
        userId: 2,
        title: "Modern City Apartment",
        description: "A sleek and modern apartment located in the heart of the city. Features 2 bedrooms, 2 bathrooms, and a fully equipped kitchen.",
        address: "456 Central Blvd",
        city: "Cap-Haïtien",
        department: "Nord",
        type: "Appartement",
        price: 1200.00,
        numLivingRooms: 1,
        numBedrooms: 2,
        numBathrooms: 2,
        isAvailable: true,
        disponibility: 'À louer'
      },
      {
        userId: 2,
        title: "Cozy Studio in Downtown",
        description: "A cozy and affordable studio apartment perfect for singles or couples. Located in a vibrant neighborhood with easy access to public transportation.",
        address: "789 Main Street",
        city: "Jacmel",
        department: "Sud-Est",
        type: "Studio",
        price: 800.00,
        numLivingRooms: 1,
        numBedrooms: 0,
        numBathrooms: 1,
        isAvailable: true,
        disponibility: 'À vendre'
      },
      {
        userId: 1,
        title: "Spacious Family House",
        description: "A spacious house with a large backyard, perfect for families.Includes 5 bedrooms, 4 bathrooms, and a garage.",
        address: "101 Elm Street",
        city: "Les Cayes",
        department: "Sud",
        type: "Duplex",
        price: 350000.00,
        numLivingRooms: 2,
        numBedrooms: 5,
        numBathrooms: 4,
        isAvailable: false,
        disponibility: 'À vendre'
      },
      {
        userId: 2,
        title: "Office Space in Business District",
        description: "A well- equipped office space located in the business district, ideal for startups and small businesses.Includes meeting rooms and high - speed internet.",
        address: "202 Corporate Ave",
        city: "Port-au-Prince",
        department: "Ouest",
        type: "Bureau",
        price: 2500.00,
        numLivingRooms: 0,
        numBedrooms: 0,
        numBathrooms: 2,
        isAvailable: true,
        disponibility: 'À vendre'
      }
    ])
  }
}