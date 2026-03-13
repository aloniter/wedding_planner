-- Add RSVP columns to guests
ALTER TABLE guests
  ADD COLUMN rsvp_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN rsvp_responded_at TIMESTAMPTZ;

-- Backfill existing guests
UPDATE guests SET rsvp_token = gen_random_uuid() WHERE rsvp_token IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE guests ALTER COLUMN rsvp_token SET NOT NULL;

-- Index for fast public lookup
CREATE INDEX idx_guests_rsvp_token ON guests (rsvp_token);

-- Auto-generate token on INSERT if NULL
CREATE OR REPLACE FUNCTION ensure_guest_rsvp_token()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.rsvp_token IS NULL THEN
    NEW.rsvp_token := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_guest_rsvp_token
  BEFORE INSERT ON guests
  FOR EACH ROW EXECUTE FUNCTION ensure_guest_rsvp_token();
