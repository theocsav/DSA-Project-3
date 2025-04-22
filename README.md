# DSA-Project-3: Fraud Detection System

Spring 2025 - Amanpreet Kapoor

## Project Overview

This project is an interactive fraud detection system that compares the performance of two algorithms:
- **Random Forest**: A supervised ensemble learning method
- **Isolation Forest**: An unsupervised anomaly detection algorithm

The system provides real-time visualization of fraud detection results with configurable parameters for algorithm optimization, using a dataset of 100,000+ transactions.

## Prerequisites

- Python 3.8+
- Node.js 18+ and npm
- Git

## Getting Started

### Backend Setup

```bash
# Go to the backend directory
cd app/backend

# Create and activate a virtual environment
python -m venv venv

# Activate the virtual environment
# For Windows:
source venv/Scripts/activate  
# For Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r ../../requirements.txt

# Run Django server
python manage.py runserver
```

### Frontend Setup

```bash
# Go to the frontend directory
cd app/frontend/frontend_project

# Install React dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend URL if needed
# Default is: VITE_API_BASE_URL=http://localhost:8000/api

# Run React development server
npm run dev
```

### Running the Application

You need to run both the backend and frontend servers simultaneously:

1. Start the Django backend server in one terminal
2. Start the React frontend server in another terminal
3. Access the application at http://localhost:5173 (or the port shown in your terminal)

You can use split terminals in VS Code or multiple terminal windows to run both servers at once.

## Project Structure

```
DSA-Project-3/
│
├── app/
│   ├── backend/                  # Django project with REST API
│   │   ├── isolation_forest/     # Isolation Forest algorithm implementation
│   │   ├── random_forest/        # Random Forest algorithm implementation
│   │   └── transactions/         # Transaction data models and endpoints
│   │
│   └── frontend/frontend_project # React + TypeScript + Vite frontend
│       ├── src/
│       │   ├── api/              # API integration with React Query
│       │   ├── components/       # React components
│       │   ├── pages/            # Dashboard and homepage
│       │   └── utils/            # Utility functions
│       └── .env.example          # Environment variables template
│
├── data/                         # CSV of datasets (100k+ entries)
├── notebooks/                    
├── src/                          
├── tests/                        # Python tests
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## Features

- Interactive dashboard for visualizing fraud detection
- Comparison of two advanced algorithms
- Configurable algorithm parameters
- Real-time analysis of transaction data
- Performance metrics (accuracy, precision, recall, F1 score)

## Environment Variables

Rename `.env.example` to `.env.local` 

```bash
# Template example
VITE_API_BASE_URL=http://localhost:8000/api
```

The `.env.local` file is excluded from Git to prevent committing sensitive information.

## Contributors

- Cesar Valentin - Algorithm Development
- Colgan Miller - Data Analysis
- Vasco Hinostroza - Frontend Development


This repository is licensed under CC BY-NC-ND 4.0. You may not use the material for commercial purposes or create derivative works. See the LICENSE file for more details.
