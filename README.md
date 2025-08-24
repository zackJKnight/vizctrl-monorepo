# VizCtrl Monorepo

A monorepo for interactive visualization controls built with React and TypeScript.

## Packages

- `@vizctrl/core` - Core utilities and types
- `@vizctrl/react` - React components for visualization controls  
- `@vizctrl/maps-openlayers` - OpenLayers integration components

## Demo App

Interactive demo showcasing all the visualization controls.

- **Live Demo**: [Deployed on Vercel](https://your-app-url.vercel.app)
- **Local Development**: `yarn dev:app`

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run demo app locally
yarn dev:app

# Run tests
yarn test
```

## Deployment

### Automatic Deployment

- **Production**: Pushes to `main` branch automatically deploy to production
- **Preview**: Pull requests automatically generate preview deployments

### Manual Deployment

```bash
# Deploy to production
yarn deploy

# Deploy preview
yarn preview
```

### Vercel Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Follow prompts to link your project
4. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID  
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Architecture

This monorepo uses:

- **Turborepo** for build orchestration
- **TypeScript** for type safety
- **Vite** for fast builds and development
- **React 18** with modern hooks
- **OpenLayers** for mapping functionality
- **Vercel** for deployment

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if needed
4. Create a pull request
5. Preview deployment will be automatically generated
