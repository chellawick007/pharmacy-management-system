#!/bin/bash

# Pharmacy Management System - Quick Setup Script
# This script helps you set up and seed the database

echo "======================================"
echo "  Pharmacy Management System Setup"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for MongoDB to be ready
echo ""
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Check if containers are running
if ! docker-compose ps | grep -q "pharmacy_backend.*Up"; then
    echo "❌ Error: Backend container is not running"
    docker-compose logs backend
    exit 1
fi

if ! docker-compose ps | grep -q "pharmacy_mongodb.*Up"; then
    echo "❌ Error: MongoDB container is not running"
    docker-compose logs mongodb
    exit 1
fi

echo "✅ All containers are running"
echo ""

# Seed the database
echo "🌱 Seeding database with sample data..."
echo ""
docker exec -it pharmacy_backend python seed_data.py

echo ""
echo "======================================"
echo "  Setup Complete! 🎉"
echo "======================================"
echo ""
echo "📋 Access your application:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8000/docs"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:      admin@pharmacy.com / admin123"
echo "   Pharmacist: pharmacist@pharmacy.com / pharma123"
echo "   Cashier:    cashier@pharmacy.com / cashier123"
echo ""
echo "💡 Tips:"
echo "   - If you see the main page instead of login, clear browser storage"
echo "   - Press F12 > Console > Type: localStorage.clear(); location.reload();"
echo "   - Or use Incognito/Private mode"
echo ""
echo "📖 For detailed setup instructions, see README.md"
echo "🚀 For feature recommendations, see FEATURE_RECOMMENDATIONS.md"
echo ""
