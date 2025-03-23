#!/bin/bash

# Create necessary directories
mkdir -p backend/logs

# Install dependencies
echo "Installing dependencies..."
cd backend
npm install

# Run the data import script
echo "Running data import..."
npm run import-data

echo "Data import completed. Check backend/logs for details." 
