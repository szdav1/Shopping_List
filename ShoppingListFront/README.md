# Shopping List Frontend

A React and TypeScript frontend for a shared shopping-list application. It uses Material UI for the interface and communicates with the Shopping List API through Vite's `/api` proxy.

## Features

- User login and account registration
- Session persistence across browser reloads
- One-time recovery key display after registration
- Active and archived shopping lists
- Create, rename, archive, and restore lists
- Add and remove items
- Owner-managed list sharing with editor or viewer permissions
- Permission-aware interface for owner, editor, and viewer users

## Prerequisites

- Node.js 20 or newer
- npm
- The Shopping List backend running on `http://localhost:8080`

## Starting the Application

From this directory:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://127.0.0.1:5173/
```

If port `5173` is already in use, Vite will automatically select another port.

The backend must be available for login, registration, and list actions. The frontend forwards requests beginning with `/api` to `http://localhost:8080`.

## Environment Configuration

The development proxy is configured in `vite.config.ts`.

You can also set `VITE_API_BASE_URL` before starting Vite when the API should be reached through a custom base URL:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
npm run dev
```

PowerShell session variables are only available in the terminal where they are set.

## Available Scripts

```powershell
npm run dev      # Start the Vite development server
npm run build    # Type-check and create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build locally
```

## Project Structure

```text
src/
  components/       Reusable login and shopping-list UI components
  App.tsx           Application state and authentication flow
  Workspace.tsx     Active/archived list workspace
  auth.ts           Authentication API and session persistence
  listsApi.ts       Shopping-list API client
  App.css           Application-level auth styles
  Workspace.css     Workspace styles
  main.tsx          React entry point and MUI theme
```

## API Documentation

The API contracts and data model are documented in:

- `docs/ApiDocumentation.txt`
- `docs/DbArchitecture.md`
- `docs/Specifications.pdf`

The API exploration tools are also available when the backend is running:

- Swagger UI: `http://localhost:8080/api-docs`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
