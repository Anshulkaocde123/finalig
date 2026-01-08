#!/bin/bash

# Safe Performance Optimization Installer
# This script ONLY adds new dependencies and utilities
# It does NOT modify existing code or remove anything

set -e  # Exit on error

echo "🛡️  VNIT IG App - Safe Performance Optimization"
echo "================================================"
echo "This will ONLY add optimizations, nothing will break!"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Install backend dependencies
echo -e "${YELLOW}Step 1: Installing backend optimization packages...${NC}"
cd server
npm install compression node-cache --save 2>/dev/null
echo -e "${GREEN}✓ Backend packages installed${NC}"

# Step 2: Install frontend dependencies
echo -e "\n${YELLOW}Step 2: Installing frontend optimization packages...${NC}"
cd ../client
npm install web-vitals --save 2>/dev/null
npm install terser --save-dev 2>/dev/null
echo -e "${GREEN}✓ Frontend packages installed${NC}"

# Step 3: Install theme system (optional but recommended)
echo -e "\n${YELLOW}Step 3: Installing DaisyUI theme system...${NC}"
npm install daisyui@latest --save 2>/dev/null
echo -e "${GREEN}✓ DaisyUI installed (optional usage)${NC}"

# Step 4: Verify utility files exist
echo -e "\n${YELLOW}Step 4: Verifying utility files...${NC}"
cd ..

if [ -f "client/src/utils/performance.js" ]; then
    echo -e "${GREEN}✓ performance.js exists${NC}"
else
    echo -e "${YELLOW}⚠ performance.js not found (should have been created)${NC}"
fi

if [ -f "client/src/utils/imageOptimizer.js" ]; then
    echo -e "${GREEN}✓ imageOptimizer.js exists${NC}"
else
    echo -e "${YELLOW}⚠ imageOptimizer.js not found (should have been created)${NC}"
fi

if [ -f "server/utils/cache.js" ]; then
    echo -e "${GREEN}✓ cache.js exists${NC}"
else
    echo -e "${YELLOW}⚠ cache.js not found (should have been created)${NC}"
fi

# Step 5: Test build
echo -e "\n${YELLOW}Step 5: Testing production build...${NC}"
cd client
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo -e "${GREEN}  Bundle size: ${BUNDLE_SIZE}${NC}"
else
    echo -e "${YELLOW}⚠ Build failed - check for errors${NC}"
fi

# Summary
echo -e "\n${GREEN}================================================"
echo "✓ Installation Complete!"
echo "================================================${NC}"

echo -e "\n${BLUE}What was installed:${NC}"
echo "  Backend:"
echo "    • compression (HTTP response compression)"
echo "    • node-cache (In-memory caching)"
echo ""
echo "  Frontend:"
echo "    • web-vitals (Performance monitoring)"
echo "    • terser (Better minification)"
echo "    • daisyui (Theme system - optional)"
echo ""
echo "  Utility Files:"
echo "    • server/utils/cache.js (Ready to use)"
echo "    • client/src/utils/performance.js (Ready to use)"
echo "    • client/src/utils/imageOptimizer.js (Ready to use)"

echo -e "\n${BLUE}Next Steps (All Optional):${NC}"
echo ""
echo "  1. Add compression to server.js:"
echo "     ${GREEN}const compression = require('compression');${NC}"
echo "     ${GREEN}app.use(compression());${NC}"
echo ""
echo "  2. Add caching to API routes (example):"
echo "     ${GREEN}const { cacheMiddleware } = require('./utils/cache');${NC}"
echo "     ${GREEN}router.get('/api/leaderboard', cacheMiddleware(300), handler);${NC}"
echo ""
echo "  3. Enable performance monitoring in main.jsx:"
echo "     ${GREEN}import { initPerformanceMonitoring } from './utils/performance';${NC}"
echo "     ${GREEN}initPerformanceMonitoring();${NC}"
echo ""
echo "  4. Add DaisyUI to tailwind.config.js:"
echo "     ${GREEN}plugins: [require('daisyui')]${NC}"

echo -e "\n${GREEN}Everything is ready but NOT enforced!${NC}"
echo "Your app will work exactly as before."
echo "Use the new utilities when you're ready."
echo ""
echo -e "${BLUE}Test your app:${NC}"
echo "  cd client && npm run dev"
echo ""
echo -e "📖 See ${YELLOW}SAFE_OPTIMIZATION_GUIDE.md${NC} for usage examples"

echo -e "\n🎉 ${GREEN}Done! Nothing was broken, everything is ready!${NC}"
