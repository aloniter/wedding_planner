-- Saved WhatsApp invite message templates, reusable across all guests for a wedding
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS invite_message_templates JSONB NOT NULL DEFAULT '[]'::jsonb;
