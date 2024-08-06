import Offer from '#models/offer'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Offer.createMany([
      { name: "WiFi" },
      { name: "Électricité" },
      { name: "Eau chaude" },
      { name: "Climatisation" },
      { name: "Réfrigérateur" },
      { name: "Caméra de surveillance" },
      { name: "Parking privé" },
      { name: "Piscine" },
      { name: "Salle de sport" },
      { name: "Jardin privé" },
      { name: "Système de sécurité" },
      { name: "Internet" },
      { name: "Télévision" },
      { name: "Cheminée" },
      { name: "Espace de travail dédié" }
    ])
  }
}