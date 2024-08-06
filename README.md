# Proprio Backend

An application designed to simplify the process of renting and leasing properties in Haiti.

## Technologies

- **Backend Framework**: AdonisJs
- **Database**: PostgreSQL
- **Containerization**: Docker, Traefik

## Features

- User authentication and management
- Property listings with photos and descriptions
- Message system for user communication
- Advanced search and filtering for properties
- User reviews and ratings for properties
- Favorites management

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   https://github.com/pwopryo/pwopryo-api.git
   cd pwopryo-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your database and other configuration details.

4. Run database migrations and Seed data:
   ```bash
   node ace migration:run
   node ace db:seed
   ```

### Running the Application

1. Start the AdonisJs server:

   ```bash
   npm run dev
   ```

2. The API will be available at `http://localhost:3333`.
