# DropIt Web

Coach backoffice for DropIt application, built with React and Tailwind CSS.

## Technologies

- **React**: Frontend library
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Data fetching and caching
- **TanStack Table**: Table management
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: UI component library
- **ts-rest**: Type-safe REST API client
- **Zod**: Schema validation
- **@dropit/contract**: Internal package for API contracts
- **@dropit/schemas**: Internal package for shared schemas
- **DND Kit**: Drag and drop functionality

## Features

- Exercise management
- Complex creation and management
- Drag and drop exercise reordering
- Category management
- Video upload and management

## Available Scripts

```bash
# Start the development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/         # React components
│   ├── complex/       # Complex-related components
│   ├── exercises/     # Exercise-related components
│   ├── ui/           # Shared UI components
│   └── video/        # Video-related components
├── hooks/             # Custom React hooks
├── lib/              # Utilities and configurations
├── routes/           # Application routes
└── main.tsx          # Application entry point
```

## UI Components

The application uses Shadcn/ui components, which are built on top of:
- **Radix UI**: For accessible primitives
- **Tailwind CSS**: For styling
- **Class Variance Authority**: For component variants
- **Lucide Icons**: For iconography

## Styling

Styling is handled through Tailwind CSS with a custom theme configuration:
- Custom color scheme
- Dark mode support
- Responsive design
- CSS variables for theme customization

## Development

The application is configured with:
- TypeScript for type safety
- Vite for fast development
- PostCSS for CSS processing
- Biome for code formatting

## API Integration

API communication is handled through:
- ts-rest for type-safe API calls
- TanStack Query for data fetching and caching
- Shared contracts and schemas from @dropit packages 