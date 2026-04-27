#!/bin/bash

# =============================================
#   BazaarX - Multi-Vendor E-commerce Platform
#   First-Time Setup Script
# =============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ⬡  BazaarX MERN Setup${NC}"
echo -e "${CYAN}  ─────────────────────────────${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js found: $NODE_VER${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"

# Check MongoDB
if command -v mongod &> /dev/null; then
  echo -e "${GREEN}✓ MongoDB found locally${NC}"
else
  echo -e "${YELLOW}⚠  MongoDB not found locally — make sure MONGO_URI in .env points to MongoDB Atlas${NC}"
fi

echo ""
echo -e "${BOLD}Step 1: Setting up environment variables...${NC}"
if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo -e "${GREEN}✓ Created server/.env from .env.example${NC}"
  echo -e "${YELLOW}  → Open server/.env and set your MONGO_URI and JWT_SECRET${NC}"
else
  echo -e "${GREEN}✓ server/.env already exists${NC}"
fi

echo ""
echo -e "${BOLD}Step 2: Installing dependencies...${NC}"
echo "Installing root dependencies..."
npm install --silent
echo "Installing server dependencies..."
cd server && npm install --silent && cd ..
echo "Installing client dependencies..."
cd client && npm install --silent && cd ..
echo -e "${GREEN}✓ All dependencies installed${NC}"

echo ""
echo -e "${BOLD}Step 3: Seeding the database...${NC}"
cd server && node seed.js && cd ..

echo ""
echo -e "${CYAN}${BOLD}  ✅ Setup Complete!${NC}"
echo -e "${CYAN}  ─────────────────────────────${NC}"
echo ""
echo -e "  ${BOLD}Start the app:${NC}   npm run dev"
echo ""
echo -e "  ${BOLD}Frontend:${NC}        http://localhost:3000"
echo -e "  ${BOLD}Backend API:${NC}     http://localhost:5000/api"
echo ""
echo -e "  ${BOLD}Demo Accounts:${NC}"
echo -e "  Admin      →  admin@demo.com    / admin123"
echo -e "  Vendor     →  vendor@demo.com   / vendor123"
echo -e "  Customer   →  customer@demo.com / cust123"
echo ""
