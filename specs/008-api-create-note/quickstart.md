# Quickstart: API Create Note

## Usage

```bash
# Create a note via the API
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{"secret": "my database password", "ttl": "3600"}'

# Response:
# {"noteUrl": "/note/550e8400-e29b-41d4-a716-446655440000"}

# Open the URL in a browser to view the note

# With API key authentication:
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-key" \
  -d '{"secret": "production db password", "ttl": "3600"}'

# Minimal — just the secret (uses default TTL):
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{"secret": "short-lived token"}'
```

## TTL Values

| Value | Duration |
|-------|----------|
| `3600` | 1 hour |
| `86400` | 1 day |
| `604800` | 7 days (default) |
| `2592000` | 30 days |

## API Key Setup

```bash
# Set in .env or deployment environment
API_KEY=my-secret-key

# Then all API requests require:
# Authorization: Bearer my-secret-key
```

## Error Examples

```bash
# Missing secret
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{}'
# → 400 {"error": "Note content cannot be empty."}

# Wrong Content-Type
curl -X POST http://localhost:3000/api/note \
  -d 'secret=test'
# → 415 {"error": "Content-Type must be application/json."}
```
