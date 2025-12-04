#!/bin/bash

# Auto-Blog SEO Monster - Quick Setup Script
# Usage: ./setup.sh

set -e

echo "🚀 Auto-Blog SEO Monster - Quick Setup"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.11 or higher"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python 3 found: $(python3 --version)"

# Navigate to backend
cd backend

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv
echo -e "${GREEN}✓${NC} Virtual environment created"

# Activate venv
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate
echo -e "${GREEN}✓${NC} Virtual environment activated"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo -e "${GREEN}✓${NC} Dependencies installed"

# Setup .env
echo ""
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠${NC}  Please edit backend/.env and set:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - ANTHROPIC_API_KEY"
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi

echo ""
echo "======================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your settings"
echo "2. Start PostgreSQL: docker-compose up -d postgres redis"
echo "3. Run migrations: cd backend && alembic upgrade head"
echo "4. Start server: cd backend && uvicorn app.main:app --reload"
echo "5. Open: http://localhost:8000/docs"
echo ""
echo "📖 See PHASE1_TEST.md for detailed testing instructions"
echo ""
