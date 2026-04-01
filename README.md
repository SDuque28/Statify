
# Statify

Statify is a music analytics frontend built with React, TypeScript, Vite, and Tailwind CSS v4. It explores the idea of turning listening history into a clean, animated dashboard with a landing page, a personalized home view, and user settings with theme support.

The current version is a frontend prototype: it focuses on UI, routing, theming, and data visualization patterns using mock data.

## Features

- Marketing-style landing page with animated hero content
- Dashboard with top artists, top tracks, and yearly listening summary
- Settings page with profile information and theme preferences
- Light and dark theme support through a shared theme context
- Recharts-based visualizations for music stats
- Responsive layout powered by Tailwind CSS

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS v4`
- `React Router`
- `Motion`
- `Recharts`
- `Lucide React`

## Project Structure

```text
src/
  app/
    components/   Reusable UI pieces such as cards, charts, header, and settings controls
    context/      Theme provider and shared theme hook
    pages/        Route-level screens like Landing, Home, Auth, and Settings
    App.tsx       Root app wrapper
    routes.tsx    Route definitions
  imports/        Static assets such as logos
  styles/         Tailwind entry file and theme variables
  main.tsx        Application entry point
```

## Routes

- `/` landing page
- `/auth` placeholder authentication screen
- `/home` dashboard
- `/settings` user settings and preferences

## Getting Started

### Prerequisites

- `Node.js` 20+ recommended
- `npm` 10+ recommended

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Lint the project

```bash
npm run lint
```

### Preview the production build

```bash
npm run preview
```

## Styling and Theming

Statify uses Tailwind CSS v4 together with custom CSS variables defined in `src/styles/theme.css`.

- Global Tailwind import lives in `src/styles/tailwind.css`
- App-wide theme tokens live in `src/styles/theme.css`
- Theme state is managed in `src/app/context/ThemeContext.tsx` and `src/app/context/theme.ts`

This setup makes it easy to keep component styles consistent while still supporting light and dark mode.

## Current Status

This project currently uses static mock data for artists, tracks, user info, and charts. It is a strong base for adding:

- Spotify authentication
- Real user data
- Backend integration
- Persistent user preferences
- More advanced listening insights

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs TypeScript build checks and creates a production bundle
- `npm run lint` runs ESLint
- `npm run preview` serves the production build locally

## Notes

- The project is configured with ESLint and React Fast Refresh friendly patterns
- Tailwind is integrated through `@tailwindcss/vite`
- The UI is already structured in reusable components, which makes future scaling easier

## Authoring Direction

If you continue building Statify, a good next step would be connecting the UI to real Spotify data and replacing the current mock content with authenticated user insights.
