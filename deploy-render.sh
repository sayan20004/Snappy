#!/bin/bash

# Snappy Todo - Render.com Deployment Guide
# Follow these steps to deploy your app

echo "🚀 Snappy Todo - Render.com Deployment"
echo "======================================"
echo ""

# Step 1: MongoDB Atlas
echo "📦 STEP 1: Setup MongoDB Atlas (5 minutes)"
echo "-------------------------------------------"
echo "1. Go to: https://www.mongodb.com/cloud/atlas/register"
echo "2. Sign up for free account"
echo "3. Create a new project: 'Snappy Todo'"
echo "4. Build a Database → FREE (M0) tier"
echo "5. Cloud Provider: AWS, Region: Choose closest to you"
echo "6. Cluster Name: 'Snappy'"
echo "7. Create Database User:"
echo "   - Username: snappy_admin"
echo "   - Password: (generate strong password, save it!)"
echo "8. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)"
echo "9. Connect → Drivers → Copy connection string"
echo ""
read -p "✅ Have you completed MongoDB Atlas setup? (y/n): " mongo_ready
echo ""

if [[ ! $mongo_ready =~ ^[Yy]$ ]]; then
    echo "❌ Please complete MongoDB Atlas setup first"
    exit 1
fi

# Step 2: Render.com
echo "🌐 STEP 2: Deploy on Render.com (10 minutes)"
echo "--------------------------------------------"
echo "1. Go to: https://render.com/register"
echo "2. Sign up with GitHub"
echo "3. Dashboard → New → Blueprint"
echo "4. Connect repository: https://github.com/sayan20004/Snappy"
echo "5. Render will auto-detect render.yaml"
echo ""
echo "⚙️  STEP 3: Configure Environment Variables"
echo "-------------------------------------------"
echo "In Render Dashboard:"
echo ""
echo "For 'snappy-backend' service:"
echo "  1. Go to Environment tab"
echo "  2. Add MONGODB_URI:"
echo "     Value: (paste your MongoDB Atlas connection string)"
echo "     Example: mongodb+srv://snappy_admin:PASSWORD@snappy.xxxxx.mongodb.net/snappy-todo"
echo "  3. JWT_SECRET is auto-generated ✅"
echo "  4. CORS_ORIGIN will auto-link to frontend ✅"
echo ""
echo "For 'snappy-frontend' service:"
echo "  1. VITE_API_URL will auto-link to backend ✅"
echo ""
read -p "✅ Have you added MONGODB_URI? (y/n): " env_ready
echo ""

if [[ ! $env_ready =~ ^[Yy]$ ]]; then
    echo "⚠️  Remember to add MONGODB_URI in Render dashboard"
fi

echo ""
echo "🎯 STEP 4: Deploy!"
echo "-----------------"
echo "1. Click 'Apply' in Render"
echo "2. Wait 5-10 minutes for build"
echo "3. Both services will show 'Live' status"
echo ""
echo "📍 Your app will be available at:"
echo "   Frontend: https://snappy-frontend.onrender.com"
echo "   Backend:  https://snappy-backend.onrender.com"
echo ""
echo "✅ DONE! Your app is now public and accessible worldwide!"
echo ""
echo "📋 Post-Deployment Checklist:"
echo "  ✓ Test the app"
echo "  ✓ Create your account"
echo "  ✓ Share the link with friends"
echo "  ✓ Optional: Add custom domain in Render settings"
echo ""
echo "🔗 Useful Links:"
echo "  - Render Dashboard: https://dashboard.render.com"
echo "  - MongoDB Atlas: https://cloud.mongodb.com"
echo "  - GitHub Repo: https://github.com/sayan20004/Snappy"
echo ""
echo "🎉 Congratulations! Your app is live!"
