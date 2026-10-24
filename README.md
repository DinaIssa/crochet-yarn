# Yarn Craft API

## Overview

Yarn Craft API is a RESTful backend application for a yarn and crochet-related store. It is built with Node.js, Express.js, PostgreSQL, and TypeORM.

The API provides endpoints for authentication, products, categories, and shopping cart management.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- TypeORM
- JSON Web Tokens (JWT)
- bcryptjs
- Jest
- Supertest

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure the required environment variables.

4. Start the development server:

   ```bash
   npm run dev
   ```

To start the server normally:

```bash
npm start
```

## API Endpoints

### General

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome message |
| GET | `/health` | Check API status |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Get the currently authenticated user |

### Shopping Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Retrieve the user's cart |
| POST | `/cart/items` | Add an item to the cart |
| PATCH | `/cart/items/:id` | Update a cart item |
| DELETE | `/cart/items/:id` | Remove an item from the cart |
| DELETE | `/cart` | Clear the cart |

Cart endpoints require authentication.

## Authentication

Protected endpoints use a JWT access token.

Include the token in the request header:

```http
Authorization: Bearer YOUR_TOKEN
```

## Testing

Run the automated tests with:

```bash
npm test -- --runInBand
```

## Environment Variables

Configure the database connection and authentication secret in `.env`. Do not commit `.env` or expose database credentials and JWT secrets in the repository.
