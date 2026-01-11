# 🏥 Pharmacy Management System

A comprehensive full-stack pharmacy management system with AI-powered demand forecasting, inventory management, customer relationship management, and intelligent billing system with GST support.

## 🌟 Features

- **👤 Authentication & Authorization**: Secure login/signup with role-based access (Admin, Pharmacist, Cashier)
- **📊 Dashboard**: Real-time analytics with sales trends, revenue charts, and quick actions
- **💊 Stock Management**: Complete medicine inventory with search, filters, status badges, and low stock alerts
- **🧑 Customer Management**: CRM with customer profiles, purchase history, and contact management
- **🧾 Billing System**: Professional invoice generation with GST calculations, multiple payment modes, and print functionality
- **🔮 AI Predictions**: Machine learning-based demand forecasting for inventory optimization
- **💬 AI ChatBot**: Intelligent pharmacy assistant for medicine queries, billing help, and stock information
- **🌓 Dark Mode**: Complete dark/light theme support across all pages
- **📱 Responsive Design**: Mobile-friendly interface with modern UI/UX

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI library
- **Vite 5.0** - Fast build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Recharts 2.10** - Chart library for data visualization
- **Lucide React 0.263** - Beautiful icon library

### Backend
- **FastAPI 0.104** - Modern Python web framework
- **MongoDB 7.0** - NoSQL database
- **Motor 3.3** - Async MongoDB driver
- **Pydantic 2.5** - Data validation
- **Scikit-learn 1.3** - Machine learning library
- **Pandas 2.1 & NumPy 1.26** - Data processing

### DevOps
- **Docker & Docker Compose** - Containerization
- **Python 3.9+** - Backend runtime
- **Node.js 16+** - Frontend runtime

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher** ([Download](https://www.python.org/downloads/))
- **Node.js 16.x or higher** and npm ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

### Version Verification

```bash
# Check Python version (should be 3.9+)
python --version  # or python3 --version

# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 7+)
npm --version

# Check Docker version
docker --version
docker-compose --version
```

## 🚀 Installation & Setup

### Option 1: Docker Setup (Recommended)

This is the easiest way to run the entire application.

#### 1. Clone the Repository

```bash
git clone https://github.com/Arjunan24z/PharmacyProject.git
cd PharmacyProject
```

#### 2. Environment Configuration

The backend uses environment variables. The default `.env` file is already configured for Docker:

```env
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=pharmacy_db
```

#### 3. Start All Services

```bash
# Build and start all containers (MongoDB, Backend, Frontend)
docker-compose up -d

# Check if all containers are running
docker-compose ps
```

This will start:
- **MongoDB**: http://localhost:27017
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:5173

#### 4. Seed the Database

Populate the database with sample data:

```bash
# Enter the backend container
docker exec -it pharmacy_backend bash

# Run the seeding script
python seed_data.py

# Exit the container
exit
```

Or run it directly:

```bash
docker exec -it pharmacy_backend python seed_data.py
```

#### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs
- **Backend Redoc**: http://localhost:8000/redoc

**Default Login Credentials:**
- Admin: `admin@pharmacy.com` / `admin123`
- Pharmacist: `pharmacist@pharmacy.com` / `pharma123`
- Cashier: `cashier@pharmacy.com` / `cashier123`

#### 6. Stop the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

---

### Option 2: Local Development Setup

For development without Docker.

#### 1. Clone the Repository

```bash
git clone https://github.com/Arjunan24z/PharmacyProject.git
cd PharmacyProject
```

#### 2. Setup MongoDB

Install MongoDB locally or use a cloud instance:

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Linux (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download and install from: https://www.mongodb.com/try/download/community
```

#### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install passlib[bcrypt]  # For password hashing in seed script

# Update .env file for local MongoDB
echo "MONGODB_URL=mongodb://localhost:27017" > .env
echo "DATABASE_NAME=pharmacy_db" >> .env

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at http://localhost:8000

#### 4. Seed the Database (in a new terminal)

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python seed_data.py
```

#### 5. Frontend Setup (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

#### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs

---

## 📁 Project Structure

```
pharmacy-system/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app initialization
│   │   ├── database.py        # MongoDB connection
│   │   ├── models.py          # Pydantic models
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── medicines.py   # Medicine CRUD
│   │   │   ├── customers.py   # Customer management
│   │   │   ├── billing.py     # Billing operations
│   │   │   ├── sales.py       # Sales tracking
│   │   │   └── predictions.py # AI predictions
│   │   └── services/
│   │       └── ml_model.py    # Machine learning service
│   ├── seed_data.py           # Database seeding script
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── Dockerfile
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Auth.jsx       # Login/Signup
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Stock.jsx      # Inventory management
│   │   │   ├── Customers.jsx  # Customer management
│   │   │   ├── Billing.jsx    # Billing system
│   │   │   ├── Predictions.jsx # AI predictions
│   │   │   └── ChatBot.jsx    # AI assistant
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx # Dark mode context
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── Dockerfile
│
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

## 🎯 Usage Guide

### 1. Authentication
- Navigate to http://localhost:5173
- Use the provided credentials to login
- Different roles have different access levels

### 2. Dashboard
- View real-time sales statistics
- Monitor revenue trends
- Access quick actions for common tasks

### 3. Stock Management
- Add, edit, or delete medicines
- Search and filter by category
- Monitor low stock and expiring items
- View status badges (Expired, Low Stock, Expiring Soon, In Stock)

### 4. Customer Management
- Add and manage customer profiles
- Track purchase history
- Search customers by name, email, or phone
- View customer statistics

### 5. Billing
- Create professional invoices
- Add multiple items per bill
- Automatic GST calculation (18%)
- Support for Cash, Card, and UPI payments
- Print invoices with pharmacy branding
- Edit and view bill history

### 6. AI Predictions
- View demand forecasts for medicines
- Compare predicted demand vs current stock
- Toggle between chart and table views
- Identify items needing reorder

### 7. ChatBot Assistant
- Click the chat icon in the bottom-right corner
- Ask about medicine prices and stock
- Get billing assistance
- Check low stock items
- Get help with customer management

## 🔧 Configuration

### Backend Configuration (.env)

```env
# MongoDB Connection
MONGODB_URL=mongodb://mongodb:27017  # For Docker
# MONGODB_URL=mongodb://localhost:27017  # For local development

# Database Name
DATABASE_NAME=pharmacy_db

# JWT Secret (Optional - add if implementing JWT)
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Configuration

Update API endpoint in `frontend/src/services/api.js`:

```javascript
const API_URL = 'http://localhost:8000/api';  // For local development
// const API_URL = 'http://backend:8000/api';  // For Docker
```

## 📊 Database Seeding

The `seed_data.py` script populates the database with:
- **3 Users** (Admin, Pharmacist, Cashier)
- **20 Medicines** across 8 categories
- **12 Customers** with realistic data
- **50 Sales records** from the last 30 days
- **25 Bills** with multiple items
- **15 AI Predictions** for demand forecasting

### Custom Seeding

Edit `backend/seed_data.py` to customize the data:

```python
# Change MongoDB URL for local development
MONGODB_URL = "mongodb://localhost:27017"  # Default is mongodb://mongodb:27017

# Modify the data arrays (USERS, MEDICINES, CUSTOMERS, etc.)
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend
lsof -i :27017 # MongoDB

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Reset everything
docker-compose down -v
docker system prune -a
```

### Frontend Not Connecting to Backend

1. Check if backend is running: http://localhost:8000/docs
2. Verify CORS settings in `backend/app/main.py`
3. Check API_URL in `frontend/src/services/api.js`

### Database Connection Failed

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 🔒 Security Notes

- **Change default passwords** in production
- **Use environment variables** for sensitive data
- **Implement JWT authentication** for production (currently using basic auth)
- **Add rate limiting** to prevent abuse
- **Use HTTPS** in production
- **Validate and sanitize** all user inputs

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use production MongoDB URI
2. **Security**: Implement proper JWT authentication
3. **CORS**: Update allowed origins
4. **Logging**: Add proper logging and monitoring
5. **Build Frontend**: `npm run build` and serve static files
6. **Reverse Proxy**: Use Nginx for production
7. **SSL**: Add SSL certificates

### Docker Production Build

```bash
# Update docker-compose.yml for production
# Remove --reload flag from backend
# Use production build for frontend
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Arjunan24z** - [GitHub Profile](https://github.com/Arjunan24z)

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React and Vite for the modern frontend stack
- MongoDB for the flexible database solution
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons

---

**Happy Coding! 💻✨**
