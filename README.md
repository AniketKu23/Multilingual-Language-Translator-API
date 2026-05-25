# Multilingual Translation API

## Features

- JSON File Upload
- Dynamic Translation
- CSV Export
- JWT Authentication
- Swagger Documentation
- Translation Caching
- Bulk Translation Optimization
- Docker Support

---

## Installation

npm install

---

## Environment Variables

Create .env

PORT=3000
JWT_SECRET=mysecretkey
CACHE_TTL=3600

---

## Run Project

npm run dev

---

## Swagger URL

http://localhost:3000/api-docs

---

## Authentication

Generate JWT token from:

POST /api/auth/login

Use token in Swagger Authorize:

Bearer YOUR_TOKEN

---

## Translation Endpoint

POST /api/translate

### Form Data

- file
- Code
- LanguageCode
- filetype

---

## Docker

Build:

docker build -t multilingual-api .

Run:

docker run -p 3000:3000 -e PORT=3000 -e JWT_SECRET=mysecretkey -e CACHE_TTL=3600 multilingual-api
