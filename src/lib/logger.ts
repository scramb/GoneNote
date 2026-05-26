const ALLOWED_FIELDS = new Set(['op', 'outcome', 'duration', 'ttl']);

export interface LogEntry {
  op: string;
  outcome: 'success' | 'failure';
  duration?: number;
  ttl?: number;
}

export function log(entry: LogEntry): void {
  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(entry)) {
    if (ALLOWED_FIELDS.has(key)) {
      sanitized[key] = (entry as unknown as Record<string, unknown>)[key];
    }
  }
  console.log(JSON.stringify(sanitized));
}
