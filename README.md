# Activities API

A RESTful API for managing activities and experiences, built with Node.js, Express, and Sequelize.

## Features

- Experience management (CRUD operations)
- Media handling (images and videos)
- Category and season management
- Site-based experience filtering
- Robust error handling
- File upload support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd activities_api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

4. Create the necessary directories:
```bash
mkdir videos images
```

## Project Structure

```
activities_api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── database/        # Database migrations and seeders
│   ├── middleware/      # Express middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routes
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── images/             # Uploaded images storage
├── videos/             # Uploaded videos storage
├── .env               # Environment variables
├── .gitignore         # Git ignore file
└── package.json       # Project dependencies
```

## API Endpoints

### Experiences
- `POST /api/experience` - Create a new experience
- `PUT /api/experience/:id` - Update an experience
- `GET /api/experience/site/:siteId` - List experiences by site

### Categories
- `POST /api/category` - Create a new category
- `GET /api/category/site/:siteId` - List categories by site

### Seasons
- Various season-related endpoints

## Media Handling

The API supports uploading and managing both images and videos:

- Images are stored in the `images/` directory, organized by experience ID
- Videos are stored in the `videos/` directory, organized by experience ID
- File names include timestamps to ensure uniqueness
- Previous media files are automatically cleaned up when new ones are uploaded

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- File upload errors
- Database errors
- Not found errors
- Server errors

## Development

To start the development server:

```bash
npm run dev
```

## Production

To build and start for production:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.