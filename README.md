# Memoria Monorepo

A bun workspace monorepo containing a frontend Angular application and a backend Fastify server.

## Project Structure

```
memoria/
├── apps/
│   ├── front/        # Angular frontend application
│   └── back/         # Fastify backend server
├── bunfig.toml       # Bun workspace configuration
├── package.json      # Root workspace package.json
└── tsconfig.json     # Shared TypeScript config (base)
```

## Apps

### Front (`apps/front`)

Angular 21 application with Tailwind CSS and ngzard UI components.

**Scripts:**

- `bun start` - Start Angular dev server (port 4200)
- `bun build` - Build for production
- `bun test` - Run tests
- `bun watch` - Watch mode

### Back (`apps/back`)

Fastify backend server.

**Scripts:**

- `bun run dev` - Start dev server with hot reload (port 3000)
- `bun run build` - Build for production
- `bun start` - Start production server

## Monorepo Management

This is a bun workspace monorepo. Dependencies are managed at the root level.

### Commands

**Install dependencies:**

```bash
bun install
```

**Run from root (all apps):**

```bash
bun run -r start  # Run start script in all workspaces
```

**Run specific app:**

```bash
cd apps/front
bun start
```

```bash
cd apps/back
bun run dev
```

## Development Workflow

1. Install dependencies from the root:

   ```bash
   bun install
   ```

2. Start the frontend:

   ```bash
   cd apps/front && bun start
   ```

3. In a new terminal, start the backend:
   ```bash
   cd apps/back && bun run dev
   ```

Both services will run on their respective ports:

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
