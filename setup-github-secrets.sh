#!/bin/bash

echo "🔐 GitHub Secrets Setup for Vercel Auto-deployment"
echo "=================================================="

if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Vercel project not found!"
    echo "Please run ./deploy-setup.sh first to deploy to Vercel"
    exit 1
fi

echo "📋 Here are your Vercel project details:"
echo ""

ORG_ID=$(cat .vercel/project.json | grep '"orgId"' | sed 's/.*"orgId": *"\([^"]*\)".*/\1/')
PROJECT_ID=$(cat .vercel/project.json | grep '"projectId"' | sed 's/.*"projectId": *"\([^"]*\)".*/\1/')

echo "VERCEL_ORG_ID: $ORG_ID"
echo "VERCEL_PROJECT_ID: $PROJECT_ID"
echo ""

echo "🚀 To complete the setup:"
echo ""
echo "1. Go to: https://github.com/zackJKnight/vizctrl-monorepo/settings/secrets/actions"
echo ""
echo "2. Add these repository secrets:"
echo "   Name: VERCEL_TOKEN"
echo "   Value: Get from https://vercel.com/account/tokens"
echo ""
echo "   Name: VERCEL_ORG_ID" 
echo "   Value: $ORG_ID"
echo ""
echo "   Name: VERCEL_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "3. Once added, every push to main will auto-deploy!"
echo "   Pull requests will get preview deployments!"
echo ""

# Check if GitHub CLI is available for automatic setup
if command -v gh &> /dev/null; then
    echo "💡 GitHub CLI detected! Would you like to set up the secrets automatically?"
    echo "You'll still need to get your VERCEL_TOKEN from https://vercel.com/account/tokens"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please enter your Vercel token:"
        read -s VERCEL_TOKEN
        
        gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
        gh secret set VERCEL_ORG_ID --body "$ORG_ID"
        gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID"
        
        echo "✅ GitHub secrets configured!"
        echo "🎉 Auto-deployment is now active!"
    fi
else
    echo "💡 Install GitHub CLI (gh) for automatic secret setup:"
    echo "   brew install gh"
fi
