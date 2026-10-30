# Estonian EdTech Database — Data Model & Submission Form

## Scope

- **Who's included:** EdTech Estonia **members** and **associate members**. Supportive members are not listed.
- **One record = one company = one solution.**
- **Audience:** foreign buyers and governments first, Estonian teachers second.
- **Language:** the whole site and all content are **English only**.

Legend: **Req** = required to publish · **Filter** = browse/filter facet · **Form** = asked in the submission form (admin fills the rest).

---

## 1. Solution fields

### Identity

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `name` | text | ✅ | | ✅ | Brand name as the company writes it |
| `slug` | slug | ✅ | | | Admin sets it, e.g. `eliis` |
| `tagline` | text (≤ 160 chars) | ✅ | | ✅ | One factual sentence: *"X is a … for … used by …"*. Used on cards, meta description, AEO |
| `description` | rich text (100–300 words) | ✅ | | ✅ | What it does, for whom, key features. Admin edits before publishing |
| `logo` | image (SVG/PNG, square) | ✅ | | ✅ | Stored in R2 |
| `website` | url | ✅ | | ✅ | |
| `founded_year` | number (YYYY) | ✅ | | ✅ | |
| `hq_city` | select | ✅ | | ✅ | Tallinn, Tartu, Other in Estonia, Abroad. Shown on the page, not a filter |
| `membership` | select → **Membership** | ✅ | | ✅ | **Admin-verified** against the EdTech Estonia member list. Associate members get a badge |

### Who it's for

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `categories` | multi-select → **Category** | ✅ | ✅ | ✅ | |
| `education_levels` | multi-select → **Education level** | ✅ | ✅ | ✅ | |
| `target_users` | multi-select → **Target user** | ✅ | ✅ | ✅ | |

### Availability

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `product_languages` | multi-select → **Language** | ✅ | ✅ | ✅ | Languages the product itself is available in |
| `markets` | multi-select → **Country** (ISO 3166-1) | ✅ | ✅ | ✅ | Countries where it's used. The page shows "Used in N countries" |
| `works_offline` | boolean | | ✅ | ✅ | Works offline or on low bandwidth. Shown in the facts box, no badge. Only associate members get a badge |

### Achievements

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `achievements` | list of {type, name, year, url} | | | ✅ | `type`: Award / Certification / Research. e.g. {Certification, "Education Alliance Finland", 2025, link} |

### Cooperation

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `open_to` | multi-select → **Open to** | | ✅ | ✅ | What kind of cooperation the company is looking for |

### Media & contact

| Field | Type | Req | Filter | Form | Notes |
|---|---|---|---|---|---|
| `screenshots` | image list (1–3, 16:9) | | | ✅ | The first one is also the Open Graph (share) image |
| `demo_video_url` | url | | | ✅ | YouTube/Vimeo |
| `contact_email` | email | | | ✅ | Public. Generic inbox preferred (info@, partners@) |
| `linkedin_url` | url | | | ✅ | |

### Admin-only (never public)

| Field | Type | Notes |
|---|---|---|
| `registry_code` | text | Estonian Business Register code. Asked in the form, never published |
| `status` | select: draft / published / inactive / closed | Only `published` is listed. `closed` keeps the URL alive with a notice (good for SEO) |
| `submitter_name` | text | |
| `submitter_email` | email | |
| `source` | select: form / spreadsheet import / admin | |
| `admin_notes` | text | |

---

## 2. Fixed lists

Slugs are used in URLs and filters. Each **Category** and **Education level** term also has a short intro paragraph for its landing page.

### Membership

| slug | Label |
|---|---|
| `member` | Member |
| `associate-member` | Associate member |

### Category
Taken from the EdTech Estonia member list.

| slug | Label |
|---|---|
| `language-learning` | Language Learning |
| `steam` | STEAM |
| `sen` | SEN (Special Educational Needs) |
| `administrative-systems` | Supportive / Administrative Systems |
| `21st-century-skills` | 21st Century Skills |
| `serious-gaming` | Serious Gaming |
| `teacher-support` | Teacher Support |
| `content-provider` | Content Provider |

### Education level
Taken from the EdTech Estonia member list, plus Professional Learning (moved here from categories).

| slug | Label |
|---|---|
| `early-childhood` | Early Childhood / Preschool (age 0–6) |
| `primary-lower-secondary` | Primary and Lower Secondary Education (age 6–14) |
| `upper-secondary` | Upper Secondary Education (age 14–18) |
| `higher-education` | Higher Education |
| `professional-learning` | Professional Learning |

### Target user

| slug | Label |
|---|---|
| `students` | Students |
| `teachers` | Teachers |
| `parents` | Parents |
| `school-leaders` | School leaders & administrators |
| `hr-ld-teams` | HR / L&D teams |
| `adult-learners` | Adult learners |

### Language
`et` Estonian · `en` English · `ru` Russian · `uk` Ukrainian · `lv` Latvian · `lt` Lithuanian · `fi` Finnish · `de` German · `other`

### Country
ISO 3166-1 country list.

### Open to

| slug | Label |
|---|---|
| `distributors` | Distributors / resellers |
| `implementation-partners` | Implementation partners |
| `government-tenders` | Government tenders |
| `school-pilots` | Pilots with schools |
| `investment` | Investment |

---

## 3. URLs

| Page | URL |
|---|---|
| Home / browse all | `/` |
| Solution | `/solutions/{slug}` |
| Category landing page | `/categories/{slug}` |
| Education level landing page | `/levels/{slug}` |

Other filters (target users, languages, markets, offline, open to) work on the browse page only. Those filtered views are not indexed.

---

## 4. Structured data (SEO / AEO)

Each solution page outputs JSON-LD:

- **`SoftwareApplication`**: `name`, `description` (tagline), `url` (website), `image` (logo), `screenshot`, `applicationCategory` = `"EducationalApplication"`, `inLanguage` (from `product_languages`), `audience` (from `target_users` / `education_levels`), `award` (achievements of type Award), `dateModified` (date of the last edit)
- **`Organization`** (as `publisher`): `name`, `foundingDate`, `address.addressLocality` (`hq_city`), `address.addressCountry` = `"EE"`, `areaServed` (from `markets`), `sameAs` (LinkedIn), `email`, `memberOf` (EdTech Estonia)
- **`BreadcrumbList`**: Home › Category › Solution

Category and education level pages output **`CollectionPage`** + **`ItemList`**.

---

## 5. Google Form

24 questions. Choice lists match section 2 exactly.

> **File uploads in Google Forms need respondents to sign in to a Google account**, which puts some companies off. So the form asks for **links** to the logo and screenshots (press kit, Google Drive or Dropbox folder).

### Section 1 — Company
1. Solution name — *short answer, required*
2. Estonian registry code (not published) — *short answer, required*
3. Website — *short answer (URL validation), required*
4. Year founded — *short answer (number 1990–2026), required*
5. HQ location — *multiple choice: Tallinn, Tartu, Other in Estonia, Abroad; required*
6. EdTech Estonia membership — *multiple choice: Member, Associate member; required*

### Section 2 — Description
7. One-sentence summary (max 160 characters) — *short answer, required*
8. Description (100–300 words) — *paragraph, required*

### Section 3 — Audience
9. Category — *checkboxes (Category list), required*
10. Education level — *checkboxes (Education level list), required*
11. Target users — *checkboxes (Target user list), required*

### Section 4 — Availability
12. Languages the product is available in — *checkboxes (Language list), required*
13. Countries where the product is used — *paragraph, required. Admin maps to the country list*
14. Does the product work offline or on low bandwidth? — *yes/no*

### Section 5 — Achievements
15. Awards, certifications and research studies (one per line: type — name — year — link) — *paragraph*

### Section 6 — Cooperation
16. What kind of cooperation are you open to? — *checkboxes (Open to list)*

### Section 7 — Media & contact
17. Logo link (SVG or PNG, square) — *short answer, required*
18. Screenshots link (1–3 images) — *short answer*
19. Demo video link — *short answer*
20. Public contact email — *short answer (email validation)*
21. LinkedIn — *short answer*

### Section 8 — Submitter (not published)
22. Your name — *short answer, required*
23. Your email — *short answer, required*
24. Consent: *"I confirm the information is accurate and agree to its publication in the database."* — *checkbox, required*

### Mapping the form to fields
Google Sheets responses map 1:1 to the fields above. Q13 → `markets` (admin normalizes to country codes). Q15 → `achievements` (admin parses). Q22–23 → `submitter_*`. `slug`, `status`, `source` and `admin_notes` are set by the admin. `membership` is verified by the admin.

---

## 6. Parked for later

Discussed and left out of the launch. Can be added without restructuring:

- Case stories (schools using a solution)
- Collections (curated lists with an intro)
- Similar solutions block
- Reach numbers and key impact metrics
- Subjects
- Pricing, platforms, free trial, integrations
- Public-sector clients, deployment model, team size
