# End-to-End Prompt: Build a Complete FastAPI + MongoDB Atlas Backend for My E-Commerce Website

You are a senior Python Full Stack Developer.

I already have a frontend e-commerce website. Your task is to build a complete production-ready backend using **Python FastAPI** and **MongoDB Atlas**.

The backend should connect to my existing frontend without changing the frontend design.

---

# Tech Stack

Backend:

* Python 3.12
* FastAPI
* Uvicorn
* Motor (Async MongoDB Driver)
* Pydantic v2
* Beanie ODM (preferred)
* python-dotenv
* passlib[bcrypt]
* python-jose
* python-multipart
* Pillow
* aiofiles

Database

MongoDB Atlas

Authentication

JWT Authentication

Admin Dashboard

Server Side Templates (Jinja2)

Image Upload

Static Folder

---

# MongoDB Connection

Create a .env file.

Store the MongoDB URI inside it.

Variable:

MONGODB_URI=<my MongoDB Atlas connection string>

DATABASE_NAME=neeru1

Never hardcode credentials inside Python files.

Load the environment variables using python-dotenv.

Create:

database.py

that initializes the MongoDB connection.

---

# Project Structure

backend/

app.py

config.py

database.py

models/

product.py

category.py

user.py

order.py

banner.py

wishlist.py

cart.py

schemas/

crud/

routes/

admin.py

products.py

categories.py

cart.py

wishlist.py

orders.py

auth.py

upload.py

templates/

admin/

login.html

dashboard.html

products.html

add_product.html

edit_product.html

categories.html

orders.html

users.html

static/

uploads/

css/

js/

images/

utils/

security.py

response.py

.env

requirements.txt

README.md

---

# Authentication

Create Admin Login.

JWT Authentication.

Password hashing using bcrypt.

Login page.

Logout.

Session protection.

Only logged-in admin can access admin panel.

Create one default admin account automatically.

Username:

admin

Password:

admin123

Password must be stored hashed.

---

# Admin Dashboard

Beautiful dashboard.

Sidebar.

Cards:

Total Products

Total Orders

Total Revenue

Users

Categories

Wishlist

Cart

Latest Orders

Recent Products

Charts

---

# Product Management

Admin can:

Add Product

Edit Product

Delete Product

Enable Product

Disable Product

Duplicate Product

Search Product

Pagination

Sorting

Filters

Upload Multiple Images

Drag & Drop Upload

Image Preview

Image Delete

Product fields:

Product Name

Slug

Description

Short Description

Category

Subcategory

Brand

MRP

Sale Price

Discount %

Stock

SKU

Tags

Color

Size

Weight

Dimensions

Featured Product

Trending Product

Best Seller

Status

Thumbnail

Gallery Images

Created Date

Updated Date

---

# Category Management

CRUD

Nested Categories

Category Image

Category Icon

Slug

Status

---

# Banner Management

Homepage Banner

Offer Banner

Slider

Upload Image

Title

Subtitle

Button Text

Button Link

Sort Order

Status

---

# Orders

Order List

Search

Filter

Pending

Packed

Shipped

Delivered

Cancelled

Order Details

Invoice

Change Status

---

# Users

List Users

User Profile

Address

Phone

Orders

Wishlist

Cart

Block User

Delete User

---

# Cart

Guest Cart

Logged In Cart

Increase Quantity

Decrease Quantity

Remove Product

Clear Cart

Calculate Total

Shipping

GST

Coupon

---

# Wishlist

Add

Remove

Move to Cart

---

# Search

Search Products

Suggestions

Trending Search

---

# API Endpoints

Authentication

POST /api/login

POST /api/logout

GET /api/profile

Products

GET /api/products

GET /api/products/{id}

POST /api/products

PUT /api/products/{id}

DELETE /api/products/{id}

Categories

GET /api/categories

POST /api/categories

PUT /api/categories/{id}

DELETE /api/categories/{id}

Cart

GET /api/cart

POST /api/cart

PUT /api/cart/{id}

DELETE /api/cart/{id}

Wishlist

GET /api/wishlist

POST /api/wishlist

DELETE /api/wishlist/{id}

Orders

GET /api/orders

POST /api/orders

PUT /api/orders/{id}

DELETE /api/orders/{id}

Banner

CRUD

Upload

POST /api/upload

---

# Product Images

Store uploaded images inside:

static/uploads/

Store only image path inside MongoDB.

Automatically resize images.

Generate thumbnails.

Accept:

jpg

jpeg

png

webp

---

# Validation

No negative prices.

Stock cannot be negative.

Unique SKU.

Unique Slug.

Unique Category.

Image validation.

Maximum upload size.

---

# Security

JWT

Password Hashing

CORS

Rate Limiting

Input Validation

File Validation

XSS Protection

CSRF Protection (for admin forms)

---

# Frontend Integration

Do not modify my HTML design.

Only connect backend.

Use Fetch API.

Return JSON.

Create reusable API service.

---

# Database Models

Products

Categories

Orders

Users

Wishlist

Cart

Banner

Admin

Each collection should include:

created_at

updated_at

status

---

# Response Format

Every API should return:

success

message

data

errors

---

# Error Handling

404

422

401

403

500

Custom exception handlers.

---

# Logging

Create logs folder.

Store:

errors.log

access.log

---

# Documentation

Swagger

ReDoc

README.md

Installation Guide

Deployment Guide

API Documentation

---

# Deployment Ready

Requirements.txt

Environment Variables

Dockerfile

docker-compose.yml

Gunicorn/Uvicorn Configuration

Nginx Reverse Proxy Example

---

# Testing

Create sample data.

Create one admin.

Create 20 products.

Create 5 categories.

Create 10 users.

Create 5 banners.

---

# Final Output

Generate a fully working FastAPI backend.

Connect MongoDB Atlas.

Create all models.

Create all APIs.

Create complete admin panel.

Create CRUD operations.

Create authentication.

Create image uploads.

Create pagination.

Create search.

Create filters.

Create logging.

Create validation.

Create documentation.

Create Docker support.

Create README.

Ensure the project runs successfully using:

pip install -r requirements.txt

uvicorn app:app --reload

The final project must be clean, modular, production-ready, well-commented, and scalable. Verify that all API endpoints function correctly and that the admin panel can add, edit, delete, search, and manage products, categories, orders, users, banners, carts, and wishlists without errors.
