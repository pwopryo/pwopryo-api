import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        fullName: "Sell Jo",
        email: "jclaytonblanc@gmail.com",
        password: "password123",
        avatar: "image1.jpg",
        phoneNumber: "40679875",
        role: "Admin",
        OTP: "234594",
        isVerified: true,
      },
      {
        fullName: "Trader King",
        email: "kigntrady@gmail.com",
        password: "password123",
        avatar: "image2.png",
        phoneNumber: "31860927",
        role: "User",
        OTP: "984594",
        isVerified: true,
      },
      {
        fullName: "John Clayton",
        email: "jclayton@gmail.com",
        password: "password123",
        avatar: "image3.png",
        phoneNumber: "31869740",
        role: "User",
        OTP: "237194",
        isVerified: false,
      }
    ])
  }
}
