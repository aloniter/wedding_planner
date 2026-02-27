# חתונה שלנו — PRD
**אפליקציית ניהול חתונה מלאה לשוק הישראלי**

**תיאור:** אפליקציית ווב בעברית לניהול כל תהליך החתונה — מרשימת האורחים ועד ניהול ספקים ותקציב — עם ייחוד של ייבוא אנשי קשר חכם מהטלפון/וואטסאפ.

---

## שלוש השאלות

**למי זה?**
זוגות ישראלים בגיל 22–35 שמתכננים חתונה, עם 150–400 אורחים, שמנהלים הכל היום בין אקסל, WhatsApp ורשימות נייר.

**איזה בעיה אחת זה פותר?**
ניהול רשימת האורחים + תקציב + ספקים בפלטפורמה עברית אחת, עם ייבוא קשרים חכם שחוסך שעות של הקלדה ידנית.

**איך נדע שזה עובד?**
10 זוגות ישתמשו באפליקציה לניהול האורחים האמיתיים שלהם ו-70%+ יאמרו שזה עדיף על האקסל.

---

## לולאת המשתמש המרכזית (Core User Loop)

1. **ייבוא** — זוג מייבא אנשי קשר מהטלפון (CSV/vCard) ורואה רשימה ראשונית
2. **ניהול אורחים** — מסמנים מי מוזמן, מי אישר, מי ביטל, מי שייך לצד מי
3. **מעקב RSVP** — רואים סיכום חי: כמה אישרו / ממתינים / ביטלו
4. **תקציב** — מזינים ספקים, מחירים, מה שולם / מה נשאר לשלם
5. **Dashboard** — מסך אחד שמראה סטטוס החתונה בשניה

---

## פיצ'רים MVP — שבוע 1

### חייב להיות (Must Have)

**ניהול אורחים:**
- [ ] ייבוא אנשי קשר מקובץ CSV / vCard (ייבוא מאנשי קשר של iOS/Android)
- [ ] הוספת אורח ידנית (שם, טלפון, צד — חתן/כלה, מספר מוזמנים עם ילדים)
- [ ] סטטוס RSVP לכל אורח: ✅ אישר / ❌ ביטל / ⏳ ממתין
- [ ] חיפוש וסינון לפי שם, צד, סטטוס
- [ ] ייצוא רשימה ל-Excel/CSV

**תקציב:**
- [ ] הוספת ספק (שם, קטגוריה, מחיר כולל, מקדמה ששולמה, יתרה)
- [ ] מחשבון חי: כמה הוצאנו / כמה נשאר לשלם / כמה מהתקציב נוצל
- [ ] קטגוריות ספקים: אולם, DJ/להקה, צלם, קייטרינג, פרחים, הסעות, שמלה/חליפה, אחר

**Dashboard:**
- [ ] כרטיסי סיכום: סה"כ אורחים / אישרו / ביטלו / ממתינים
- [ ] סרגל תקציב: הוצאנו X מתוך Y ₪
- [ ] רשימת ספקים ממתינים לתשלום

**כללי:**
- [ ] ממשק RTL מלא בעברית
- [ ] רספונסיבי למובייל (רוב השימוש יהיה מהטלפון)
- [ ] שמירה אוטומטית ב-Supabase

**זמן משוער:** 5–7 ימי עבודה

---

## לא ב-MVP ❌

| פיצ'ר | למה נדחה |
|---|---|
| ❌ Auth / Login | מוסיף שבוע — נעשה hardcode לזוג אחד ונוסיף אחרי וולידציה |
| ❌ ייבוא מאינסטגרם/טיקטוק | API מוגבל מאוד, מסבך משפטית — שבוע 3+ |
| ❌ מחשבון מקומות ישיבה (seating chart) | פיצ'ר ענק בפני עצמו |
| ❌ אתר חתונה לאורחים | B2C אחר לגמרי |
| ❌ שליחת וואטסאפ / SMS לאורחים | תלות API חיצוני |
| ❌ מודול ספקים עם ביקורות | זה marketplace — שנה 2 |
| ❌ לוח שנה / timeline | לא core loop |
| ❌ רשימת מתנות | שבוע 4+ |
| ❌ Multi-couple / שיתוף | אחרי וולידציה |
| ❌ Push notifications | לא קריטי ל-MVP |

---

## Tech Stack

```
Frontend:   Next.js 15 (App Router) — RTL + `dir="rtl"`
Database:   Supabase (Postgres)
Auth:       ❌ נדחה — hardcode חתונה אחת
Styling:    Tailwind CSS + shadcn/ui (RTL-friendly)
Hosting:    Vercel
Icons:      Lucide React
```

**הגדרות גלובליות חשובות:**
- `<html dir="rtl" lang="he">` בכל הדפים
- פונט: `Heebo` מ-Google Fonts (הכי יפה לעברית)
- גוונים: ורוד-זהב (`rose-400`, `amber-500`) — אסתטיקה חתונה

---

## Data Model (מינימלי)

### `weddings` (1 שורה ב-MVP)
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
bride_name  text NOT NULL
groom_name  text NOT NULL
wedding_date date
venue_name  text
total_budget integer DEFAULT 0
created_at  timestamp DEFAULT now()
```

### `guests`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
wedding_id   uuid REFERENCES weddings(id)
full_name    text NOT NULL
phone        text
side         text CHECK (side IN ('חתן', 'כלה', 'משותף'))
group_name   text  -- משפחה / חברים / עבודה
adults_count integer DEFAULT 1
kids_count   integer DEFAULT 0
rsvp_status  text CHECK (rsvp_status IN ('ממתין', 'אישר', 'ביטל')) DEFAULT 'ממתין'
notes        text
created_at   timestamp DEFAULT now()
```

### `vendors`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
wedding_id      uuid REFERENCES weddings(id)
name            text NOT NULL
category        text  -- אולם / DJ / צלם / קייטרינג / פרחים / הסעות / שמלה / אחר
contact_phone   text
total_price     integer DEFAULT 0
deposit_paid    integer DEFAULT 0
notes           text
created_at      timestamp DEFAULT now()
```

---

## מסכים (Screens)

### 1. Dashboard (`/`)
```
┌─────────────────────────────────────────────┐
│  חתונת [שם חתן] ו[שם כלה] 🎊  [תאריך]      │
├──────────┬──────────┬──────────┬────────────┤
│ סה"כ אורח│  אישרו   │  ביטלו   │  ממתינים   │
│   247    │   183    │    12    │    52      │
├─────────────────────────────────────────────┤
│ תקציב: ₪85,000 מתוך ₪120,000                │
│ ████████████░░░░░░░░ 71%                    │
├─────────────────────────────────────────────┤
│ ספקים עם יתרה לתשלום:                       │
│ 🎵 DJ מוטי    ₪3,500 נשאר                  │
│ 📷 צלם דביר   ₪5,000 נשאר                  │
└─────────────────────────────────────────────┘
```

### 2. ניהול אורחים (`/guests`)
```
┌────────────────────────────────────────────┐
│ [+ הוסף אורח]  [ייבוא CSV]  [ייצוא Excel] │
│ [חיפוש...]  [הכל ▼] [צד ▼] [סטטוס ▼]     │
├────────────────────────────────────────────┤
│ ✅ משפחת כהן        2+1   צד חתן    [✏️]  │
│ ⏳ שרה לוי          1     צד כלה    [✏️]  │
│ ❌ דוד מזרחי        3     משותף     [✏️]  │
└────────────────────────────────────────────┘
```

### 3. תקציב וספקים (`/budget`)
```
┌────────────────────────────────────────────┐
│ תקציב כולל: ₪120,000  [ערוך]              │
│ שולם: ₪68,500  |  נשאר: ₪51,500           │
├────────────────────────────────────────────┤
│ [+ הוסף ספק]                               │
│                                            │
│ 🏛️ אולם "גן עדן"                           │
│    ₪45,000 כולל  |  שולם ₪15,000          │
│    יתרה: ₪30,000 🔴                        │
│                                            │
│ 🎵 DJ מוטי שמואל                           │
│    ₪8,500 כולל  |  שולם ₪5,000            │
│    יתרה: ₪3,500 🟡                         │
└────────────────────────────────────────────┘
```

### 4. מסך הגדרות חתונה (`/setup`) — מוצג פעם ראשונה בלבד
```
שם החתן + שם הכלה + תאריך + אולם + תקציב כולל
→ שומר ב-Supabase → redirect ל-Dashboard
```

---

## תוכנית וולידציה עם משתמשים

**קהל יעד:** 5–10 זוגות מוכרים שמתכננים חתונה בשנת 2025–2026

**שאלות לבדיקה:**
1. האם ייבוא ה-CSV עבד בלי תקלות?
2. כמה זמן חסך לעומת אקסל?
3. מה חסר שיגרום להם לשמור את האפליקציה?

**טיימליין:** שבוע מהיום — deploy ל-Vercel + לשלוח לינק ל-5 זוגות

---

## Roadmap אחרי וולידציה

| שלב | פיצ'ר | מתי |
|-----|-------|-----|
| שבוע 2 | Auth — Google Login | אחרי 10 משתמשים ראשונים |
| שבוע 3 | שיתוף בין שני בני הזוג (multi-user) | אחרי auth |
| שבוע 3 | שליחת הודעת RSVP בוואטסאפ לאורחים | ביקוש גבוה |
| שבוע 4 | Seating chart — סידור שולחנות | אחרי שרשימת אורחים עובדת |
| שבוע 5 | ייבוא מאינסטגרם (אם API יאפשר) | לפי ביקוש |
| חודש 2 | מנוי Pro — ₪49/חודש | אחרי PMF |
| חודש 3 | דירקטוריית ספקים ישראלית | B2B מודל פרסום |

---

## Claude Code Starter Prompt

העתק את הפרומפט הזה ישירות ל-Claude Code:

```
בנה אפליקציית ניהול חתונה בשם "חתונה שלנו" עבור השוק הישראלי.

השפה: עברית מלאה, RTL.
Stack: Next.js 15 App Router, Supabase, Tailwind CSS, shadcn/ui, Vercel.

CORE FUNCTIONALITY:
1. מסך Dashboard — סיכום: אורחים שאישרו/ביטלו/ממתינים + סרגל תקציב + ספקים עם יתרה
2. ניהול אורחים — הוספה ידנית, ייבוא CSV, עריכת RSVP, חיפוש/סינון, ייצוא Excel
3. ניהול ספקים ותקציב — הוספת ספק עם מחיר/מקדמה, חישוב יתרות אוטומטי
4. Setup wizard — מסך ראשוני להגדרת פרטי החתונה (שם חתן, כלה, תאריך, תקציב)

UI REQUIREMENTS:
- dir="rtl" lang="he" על כל הדפים
- פונט Heebo מ-Google Fonts
- צבעי theme: rose-400 + amber-500 (אסתטיקת חתונה)
- מובייל-first — כל מסך עובד מצוין בטלפון
- shadcn/ui components (Card, Button, Input, Select, Badge, Progress)

SCOPE BOUNDARIES:
- NO authentication — hardcode wedding_id אחד ב-.env.local
- NO seating chart
- NO WhatsApp/SMS integration
- NO Instagram import
- NO multi-user / sharing
- NO email notifications
- Simple CSV parse — שם + טלפון + צד — לא צריך validation מורכב

DATABASE SCHEMA (Supabase):
Table: weddings
- id uuid PK
- bride_name text
- groom_name text  
- wedding_date date
- venue_name text
- total_budget integer
- created_at timestamp

Table: guests
- id uuid PK
- wedding_id uuid FK
- full_name text NOT NULL
- phone text
- side text ('חתן' | 'כלה' | 'משותף')
- group_name text
- adults_count integer DEFAULT 1
- kids_count integer DEFAULT 0
- rsvp_status text ('ממתין' | 'אישר' | 'ביטל') DEFAULT 'ממתין'
- notes text
- created_at timestamp

Table: vendors
- id uuid PK
- wedding_id uuid FK
- name text NOT NULL
- category text ('אולם' | 'DJ/להקה' | 'צלם/וידאו' | 'קייטרינג' | 'פרחים' | 'הסעות' | 'שמלה/חליפה' | 'אחר')
- contact_phone text
- total_price integer DEFAULT 0
- deposit_paid integer DEFAULT 0
- notes text
- created_at timestamp

START HERE:
1. צור Next.js project עם Supabase client ו-Tailwind
2. הגדר schema ב-Supabase + seed עם חתונה אחת לדמו
3. בנה Layout עם navigation (Dashboard / אורחים / תקציב) + RTL
4. Dashboard page — Cards + Progress bar + Vendors list
5. Guests page — Table + Add modal + CSV import + RSVP toggle
6. Budget page — Vendors cards + Add vendor modal + totals
7. Deploy ל-Vercel

This is a 1-week MVP to validate if Israeli couples will use this instead of Excel.
```

---

## הגדרות סביבה נדרשות

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WEDDING_ID=hardcoded-uuid-for-mvp
```

---

## מדדי הצלחה ל-MVP

- ✅ לולאה מרכזית עובדת end-to-end (ייבוא → ניהול → dashboard)
- ✅ ייבוא CSV עובד עם קובץ אמיתי מהטלפון
- ✅ ניהול ספקים + חישוב יתרה נכון
- ✅ רספונסיבי ב-iPhone
- ✅ Deploy פעיל ב-Vercel עם URL שניתן לשלוח
- ✅ 5 זוגות יכולים לבדוק עצמאית

**לא מדדי הצלחה:** UI מושלם, אפס באגים, scalability, כל edge case מטופל.
