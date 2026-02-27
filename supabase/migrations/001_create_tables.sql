-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- Table: weddings
-- =====================
CREATE TABLE weddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_name  TEXT NOT NULL,
  groom_name  TEXT NOT NULL,
  wedding_date DATE,
  venue_name  TEXT,
  total_budget INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: guests
-- =====================
CREATE TABLE guests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  side         TEXT CHECK (side IN ('חתן', 'כלה', 'משותף')) DEFAULT 'משותף',
  group_name   TEXT,
  adults_count INTEGER DEFAULT 1 CHECK (adults_count >= 0),
  kids_count   INTEGER DEFAULT 0 CHECK (kids_count >= 0),
  rsvp_status  TEXT CHECK (rsvp_status IN ('ממתין', 'אישר', 'ביטל')) DEFAULT 'ממתין',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX idx_guests_rsvp_status ON guests(wedding_id, rsvp_status);

-- =====================
-- Table: vendors
-- =====================
CREATE TABLE vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT CHECK (category IN (
    'אולם', 'DJ/להקה', 'צלם/וידאו', 'קייטרינג',
    'פרחים', 'הסעות', 'שמלה/חליפה', 'אחר'
  )),
  contact_phone   TEXT,
  total_price     INTEGER DEFAULT 0 CHECK (total_price >= 0),
  deposit_paid    INTEGER DEFAULT 0 CHECK (deposit_paid >= 0),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vendors_wedding_id ON vendors(wedding_id);
