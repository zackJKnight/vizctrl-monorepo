#!/bin/bash

echo "🚀 VizCtrl Monorepo - Vercel Deployment Setup"
echo "=============================================="

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    echo "Then re-run this script"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"

# Build the project to ensure everything works
echo ""
echo "📦 Building project..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build issues first."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."

# First deployment will set up the project
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your Vercel dashboard to get your project settings"
    echo "2. Add these GitHub repository secrets for automatic deployments:"
    echo "   - VERCEL_TOKEN (from Vercel Account Settings → Tokens)"
    echo "   - VERCEL_ORG_ID (from .vercel/project.json after this deployment)"
    echo "   - VERCEL_PROJECT_ID (from .vercel/project.json after this deployment)"
    echo ""
    echo "3. Future deployments will be automatic on push to main!"
    echo ""
    
    # Show project info if available
    if [ -f ".vercel/project.json" ]; then
        echo "📋 Your project IDs:"
        cat .vercel/project.json | grep -E '"orgId"|"projectId"'
    fi
    
else
    echo "❌ Deployment failed. Please check the error messages above."
fi
