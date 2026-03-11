# Ajwa Academy Startup Guide

# Running the Application

This project now runs as a frontend-only Next.js app backed by Supabase.

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:3000/`

## Environment Variables

The project uses the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://aawqtepmkpsiynxxokxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhd3F0ZXBta3BzaXlueHhva3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjkyNTQsImV4cCI6MjA4NDMwNTI1NH0.lxktjbomRd50ysMkobzuOIqyImVbpZysyMWd_ugwhIo
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Notes

- There is no Django backend required.
- Supabase provides the database/auth layer; ensure your tables exist before loading data.
