import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomUUID } from 'crypto'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        uuid: randomUUID(),
        fullName: "Tera Byte",
        email: "terabyte1726@gmail.com",
        password: "password123",
        avatar: "image1.jpg",
        phoneNumber: "40679875",
        role: "Admin",
        isVerified: true,
      },
      {
        uuid: randomUUID(),
        fullName: "John Clayton",
        email: "jclaytonblanc@gmail.com",
        password: "password123",
        avatar: "image3.png",
        phoneNumber: "31869740",
        role: "User",
        isVerified: true,
      }
    ])
  }
}
