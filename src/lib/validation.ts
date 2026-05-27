import { z } from 'zod';

const maxLength = Number(process.env.MAX_NOTE_LENGTH || '102400');
const defaultTtl = process.env.DEFAULT_TTL || '604800';

export const TTL_VALUES = ['3600', '86400', '604800', '2592000'] as const;
export type TTL = (typeof TTL_VALUES)[number];

export const createNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty.')
    .max(maxLength, `Note content exceeds the maximum length of ${maxLength} bytes.`),
  ttl: z
    .enum(TTL_VALUES, { message: 'Invalid expiration period selected.' })
    .default(defaultTtl as TTL),
});

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const noteIdSchema = z.string().regex(UUID_V4_REGEX, 'Invalid note identifier format.');

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// Hex color validation
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const hexColor = z.string().regex(HEX_COLOR_REGEX, 'Invalid hex color format. Use #RRGGBB.').nullable();

export const styleTemplateSchema = z
  .object({
    backgroundColor: hexColor,
    primaryColor: hexColor,
    secondaryColor: hexColor,
  })
  .partial()
  .nullable();

export type StyleTemplate = z.infer<typeof styleTemplateSchema>;
