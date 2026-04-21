# Project Instructions: doorx

## Error Handling Patterns
- **API Requests**: Always use `fetchWithRetry` from `@/lib/api` for GET requests to handle server startup states gracefully.
- **Error Boundaries**: The app is wrapped in a global `ErrorBoundary`. For critical components, consider local error boundaries if they can fail independently.
- **Toasts**: Use `sonner` for user-facing feedback on actions (success/error).

## Database & Backend
- **MongoDB**: Ensure `MONGODB_URI` is validated in `server.ts`. Always check `mongoose.connection.readyState` before database operations.
- **API Responses**: Always return JSON. If an error occurs, include a `details` field with the error message for easier debugging.

## UI & Design
- **Icons**: Use `lucide-react`.
- **Animations**: Use `motion/react`.
- **Loading States**: Use skeleton screens for initial data loads and `Loader2` (spin) for action-based loading.
- **Images**: Always use `referrerPolicy="no-referrer"` on `<img>` tags.
