-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- Table: weddings
-- =====================
CREATE TABLE weddings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_name       TEXT NOT NULL,
  groom_name       TEXT NOT NULL,
  wedding_date     DATE,
  venue_name       TEXT,
  total_budget     INTEGER NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
  estimated_guests INTEGER CHECK (estimated_guests >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- Table: project_members
-- Maps auth.users to weddings for shared access
-- =====================
CREATE TABLE project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id    UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'partner')),
  invited_email TEXT,
  joined_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, user_id)
);

CREATE INDEX idx_project_members_user_id    ON project_members(user_id);
CREATE INDEX idx_project_members_wedding_id ON project_members(wedding_id);

-- =====================
-- Table: wedding_tables (created before guests for FK)
-- =====================
CREATE TABLE wedding_tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id    UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  table_number  INTEGER NOT NULL,
  label         TEXT,
  seat_capacity INTEGER NOT NULL DEFAULT 10 CHECK (seat_capacity > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, table_number)
);

CREATE INDEX idx_wedding_tables_wedding_id ON wedding_tables(wedding_id);

-- =====================
-- Table: guests
-- =====================
CREATE TABLE guests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  side         TEXT NOT NULL CHECK (side IN ('חתן', 'כלה', 'משותף')) DEFAULT 'משותף',
  group_name   TEXT,
  adults_count INTEGER NOT NULL DEFAULT 1 CHECK (adults_count >= 0),
  kids_count   INTEGER NOT NULL DEFAULT 0 CHECK (kids_count >= 0),
  rsvp_status  TEXT NOT NULL CHECK (rsvp_status IN ('ממתין', 'אישר', 'ביטל', 'אולי')) DEFAULT 'ממתין',
  gift_amount  INTEGER CHECK (gift_amount >= 0),
  table_id     UUID REFERENCES wedding_tables(id) ON DELETE SET NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guests_wedding_id  ON guests(wedding_id);
CREATE INDEX idx_guests_rsvp_status ON guests(wedding_id, rsvp_status);
CREATE INDEX idx_guests_table_id    ON guests(table_id);
CREATE INDEX idx_guests_full_name   ON guests(wedding_id, full_name);

-- =====================
-- Table: vendors
-- =====================
CREATE TABLE vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id    UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN (
    'אולם', 'DJ/להקה', 'צלם/וידאו', 'קייטרינג',
    'פרחים', 'הסעות', 'שמלה/חליפה', 'אחר'
  )),
  contact_phone TEXT,
  total_price   INTEGER NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  deposit_paid  INTEGER NOT NULL DEFAULT 0 CHECK (deposit_paid >= 0),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_wedding_id ON vendors(wedding_id);

-- =====================
-- Table: guest_categories
-- =====================
CREATE TABLE guest_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, name)
);

CREATE INDEX idx_guest_categories_wedding_id ON guest_categories(wedding_id);

-- =====================
-- Trigger: auto-update updated_at on every row mutation
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_weddings
  BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_guests
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_vendors
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_wedding_tables
  BEFORE UPDATE ON wedding_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_guest_categories
  BEFORE UPDATE ON guest_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
