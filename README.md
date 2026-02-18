# Campus Connect Backend

Node.js Express API with ES Modules, MongoDB, JWT auth, and file uploads (Multer + Cloudinary).

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI`, `JWT_SECRET`, and optionally Cloudinary keys

3. **Run**
   ```bash
   npm run dev   # development with watch
   npm start     # production
   ```

## API

- **Health:** `GET /health`
- **Auth**
  - `POST /api/auth/register` — body: `fullName`, `email`, `password`, `university`, `department`, `graduationYear` (optional: `bio`, `profilePicture`, `interests`)
  - `POST /api/auth/login` — body: `email`, `password`
- **Upload** (requires `Authorization: Bearer <token>`)
  - `POST /api/upload/profile-picture` — form-data field `image` (file)

## Protected routes

Use the `protect` middleware from `src/middleware/auth.js`. Send JWT in header:

```
Authorization: Bearer <your-jwt-token>
```

## Project structure

```
src/
  config/       db.js, cloudinary.js, multer.js
  controllers/  authController, uploadController
  models/       User
  routes/       authRoutes, uploadRoutes
  middleware/   auth (JWT), errorHandler, uploadToCloudinary
  socket/       placeholder for real-time
```
