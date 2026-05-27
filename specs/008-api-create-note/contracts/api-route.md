# API Route Contract: POST /api/note

## File: `src/routes/api/note/+server.ts`

### Exports

```typescript
export const POST: RequestHandler = async ({ request, locals }) => {
  // 1. Check Content-Type
  // 2. Check API key (if configured)
  // 3. Parse JSON body
  // 4. Map secret → content
  // 5. Validate with createNoteSchema
  // 6. Generate ID, encrypt, store in Redis
  // 7. Return 201 with noteUrl
};
```

### Flow

```
Request → Content-Type check (415 if not JSON)
       → API key check (401 if API_KEY set and header missing/wrong)
       → JSON.parse (400 if malformed)
       → Map secret → content
       → createNoteSchema.safeParse (400 with Zod message if invalid)
       → generateNoteId() + encrypt() + redis.setex()
       → Return 201 { noteUrl: "/note/<id>" }
```

### Error Handling

| Step | Error | Status |
|------|-------|--------|
| Content-Type | Not `application/json` | 415 |
| API key | `API_KEY` set, no/invalid Bearer | 401 |
| JSON parse | SyntaxError | 400 |
| Validation | Zod failure | 400 |
| Storage | Redis error | 500 |

### Integration with Existing Code

```typescript
import { createNoteSchema } from '$lib/validation';
import { generateNoteId, encrypt } from '$lib/crypto';
import { log } from '$lib/logger';
```

No new modules needed. The handler accesses Redis via `locals.redis` (injected by hooks).
