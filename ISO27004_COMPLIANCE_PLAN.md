# ISO 27001/27004 Compliance Plan
## ISMS Security Indicator Dashboard — Feature Roadmap

> **Standard reference:** ISO/IEC 27004:2009 — Information security management — Measurement
> **Companion standard:** ISO/IEC 27001:2005 — ISMS Requirements (clauses 4.2.2d, 4.2.3b/c)

---

## 1. Gap Analysis — Current App vs ISO 27004

### What exists today
| Feature | Status |
|---|---|
| Indicator CRUD (name, target, acceptable value, unit, frequency) | ✅ Basic |
| Evaluation submission (value + date) | ✅ Basic |
| GOOD / TOLERABLE / BAD status | ✅ Basic |
| Performance delta (trend vs previous) | ✅ Basic |
| Departments, Users, Roles | ✅ Done |
| Charts (echarts trend line) | ✅ Basic |
| PDF report | ✅ Basic |

### What is missing for ISO 27004 compliance
| Missing Feature | ISO 27004 Reference |
|---|---|
| Full **Measurement Construct** per indicator | §5.4, §7.5, Annex A |
| **Base measures** separated from derived measures | §5.4.2, §5.4.3 |
| Typed **Measurement Method** (objective / subjective) | §5.4.2 |
| **Scale type** (nominal, ordinal, interval, ratio) | §3.15 |
| **Analytical model** definition per indicator | §5.4.4 |
| **Decision criteria** with numerical thresholds | §5.4.5, §7.5.7 |
| **RAG (Red/Amber/Green) thresholds** per indicator | Annex B examples |
| **Trend analysis** over N reporting periods | §9.2 |
| **5 stakeholder types** per construct | §7.5.8 |
| Separate **data collection / analysis / reporting frequencies** | §7.7 |
| **ISO 27001 control reference** (A.x.x.x) per indicator | §7.3, Annex B |
| **Measurement construct templates** (Annex A) | Annex A |
| **Pre-built indicator library** (10 constructs from Annex B) | Annex B |
| **PDCA workflow** (Plan→Do→Check→Act status) | §5.1, Figure 1 |
| **Measurement Programme evaluation** module | §10 |
| **Scorecard / Executive dashboard** reporting view | §7.7 |
| **Collector workflow** — data submission with verification | §8.3 |
| **Audit trail** — who collected, when, issues noted | §8.3b |
| **Measurement revision / expiry tracking** | Annex A |

---

## 2. Data Model Extensions

### 2.1 Enhanced `Indicator` Interface

```typescript
interface Indicator {
  // Existing fields
  id, name, type, category, description, howtomeasure, benefit,
  frequency, valueUnit, performance, acceptableValue, targetValue,
  infoOwner, infoCollector, infoCustomer, apps

  // NEW — Measurement Construct (§7.5, Annex A)
  constructId?: string              // e.g. "B.4.1"
  controlReference?: string         // e.g. "A.8.2.2", "Clause 4.2.2h"
  controlObjective?: string         // Text description of control objective
  purposeOfMeasurement?: string     // Why this measurement was introduced
  objectOfMeasurement?: string      // What entity is being measured
  attribute?: string                // Property of the object being quantified

  // NEW — Measurement Method (§5.4.2)
  measurementMethodType?: 'OBJECTIVE' | 'SUBJECTIVE'
  scaleType?: 'NOMINAL' | 'ORDINAL' | 'INTERVAL' | 'RATIO'

  // NEW — Base & Derived Measures (§5.4.2, §5.4.3)
  baseMeasureDescription?: string
  derivedMeasureDescription?: string
  measurementFunction?: string      // Formula text

  // NEW — Analytical Model & Decision Criteria (§5.4.4, §5.4.5)
  analyticalModel?: string          // Formula or description
  decisionCriteriaGreen?: number    // e.g. >= 90
  decisionCriteriaAmber?: number    // e.g. >= 60
  decisionCriteriaRed?: number      // e.g. < 60
  decisionCriteriaDescription?: string

  // NEW — Frequencies (§7.7, Annex A)
  collectionFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  analysisFrequency?:   'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  reportingFrequency?:  'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  measurementRevisionDate?: string  // When this construct should be reviewed
  periodOfMeasurement?: string      // e.g. "Annual", "Applicable 2 years"

  // NEW — Stakeholders (§7.5.8) - extend existing owner/collector fields
  clientForMeasurement?: string
  reviewerForMeasurement?: string
  informationOwner?: string         // replaces infoOwner
  informationCollector?: string     // replaces infoCollector
  informationCommunicator?: string  // replaces infoCustomer

  // NEW — Reporting
  reportingFormat?: 'BAR_GRAPH' | 'LINE_CHART' | 'GAUGE' | 'SCORECARD' | 'TREND_LINE'
  indicatorInterpretation?: string  // How to read this indicator's result

  // NEW — Programme tracking
  isActive?: boolean
  revisionStatus?: 'CURRENT' | 'UNDER_REVIEW' | 'EXPIRED'
}
```

### 2.2 Enhanced `Evaluation` Interface

```typescript
interface Evaluation {
  // Existing fields
  id, value, performance, evaluationDate, status, nextEvaluationDate,
  indicator, resp

  // NEW — Base measure values (§5.4.2)
  baseMeasureValue1?: number        // Raw count/value before function
  baseMeasureValue2?: number        // Second base measure if derived
  derivedMeasureValue?: number      // Result after measurement function

  // NEW — Audit trail (§8.3b)
  collectedBy?: string              // collector username
  collectedAt?: string              // timestamp
  collectionIssues?: string         // any noted issues
  verifiedBy?: string               // reviewer username
  verifiedAt?: string

  // NEW — Analytical model output
  ragStatus?: 'GREEN' | 'AMBER' | 'RED'   // more granular than GOOD/BAD
  indicatorRatio?: number           // e.g. 0.94 meaning 94%
  trendDirection?: 'UPWARD' | 'STABLE' | 'DOWNWARD'
  trendChangePercent?: number
}
```

### 2.3 New `MeasurementProgramme` Interface

```typescript
interface MeasurementProgramme {
  id?: number
  name: string
  scope: string                     // What ISMS processes/controls are covered
  objectives: string
  policy: string
  evaluationCriteria: string        // How effectiveness is measured (§10.2)
  reviewFrequency: string
  lastReviewDate?: string
  nextReviewDate?: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'INACTIVE'
  indicatorIds: number[]            // Which indicators are part of this programme
  createdAt?: string
  ownerId?: number
}
```

### 2.4 New `MeasurementConstructTemplate` (Annex A)

```typescript
interface ConstructTemplate {
  id: string                        // e.g. "B.1.1"
  name: string                      // "ISMS-trained personnel"
  category: string                  // "ISMS Training"
  controlReference: string          // "Clause 5.2.2d"
  controlObjective: string
  objectOfMeasurement: string
  defaultCollectionFrequency: string
  defaultReportingFrequency: string
  analyticalModel: string
  decisionCriteriaGreen: number
  decisionCriteriaAmber: number
  decisionCriteriaRed: number
  reportingFormat: string
  description: string
}
```

---

## 3. Feature Modules to Build

### MODULE 1 — Measurement Construct Builder  *(Priority: HIGH)*
**ISO ref:** §7.5, Annex A

**What it does:**
When creating or editing an indicator, show a full "Measurement Construct" form tab based on the Annex A template.

**UI:** Multi-step stepper (existing `MatStepperModule` can be reused):
- Step 1: Identification (name, control reference, purpose)
- Step 2: Object & Attributes (object of measurement, attributes)
- Step 3: Base Measure (description, method type, scale type, unit)
- Step 4: Derived Measure (formula text, measurement function)
- Step 5: Indicator & Analytical Model (model description, RAG thresholds)
- Step 6: Decision Criteria (numerical thresholds + interpretation text)
- Step 7: Stakeholders (5 roles)
- Step 8: Frequency (collection / analysis / reporting / revision date)

**Backend mock:** Extend `IndicatorService.addIndicator()` / `editIndicator()` to accept new fields.

---

### MODULE 2 — Pre-built Indicator Library  *(Priority: HIGH)*
**ISO ref:** Annex B (10 measurement construct examples)

Seed the system with the 10 constructs from Annex B as ready-to-use templates:

| ID | Name | Control |
|---|---|---|
| B.1.1 | ISMS-trained personnel | Clause 5.2.2d |
| B.1.2 | Information Security Training | A.8.2.2 |
| B.1.3 | IS Awareness Policy Compliance | A.8.2.1, A.8.2.2 |
| B.2.1 | Password Quality (manual) | A.11.3.1 |
| B.2.2 | Password Quality (automated) | A.11.3.1 |
| B.3   | ISMS Review Process | A.6.1.8 |
| B.4.1 | Incident Management Effectiveness | Clause 4.2.2h |
| B.4.2 | Corrective Action Implementation | Clause 8.2 |
| B.5   | Management Commitment | A.6.1.1, A.6.1.2 |
| B.6   | Protection against Malicious Code | A.10.4.1 |
| B.7   | Physical Entry Controls | A.9.1.2 |
| B.8   | Log Files Review | A.10.10.1, A.10.10.2 |
| B.9   | Management of Periodic Maintenance | A.9.2.4 |
| B.10  | Security in Third Party Agreements | A.6.2.3 |

**UI:** "Indicator Library" panel/modal in the Indicators page. User selects a template → all construct fields are pre-filled → user customizes target values and assigns collectors.

---

### MODULE 3 — RAG Decision Criteria Engine  *(Priority: HIGH)*
**ISO ref:** §5.4.5, §7.5.7

Replace the current binary GOOD/TOLERABLE/BAD logic with a proper threshold engine based on each indicator's `decisionCriteriaGreen` / `decisionCriteriaAmber` / `decisionCriteriaRed` values.

**Logic (matching Annex B patterns):**
```
ratio = evaluatedValue / targetValue
if ratio >= greenThreshold  → GREEN  (no action)
if ratio >= amberThreshold  → AMBER  (monitor closely)
if ratio <  amberThreshold  → RED    (intervention required)
```

**Special patterns from Annex B:**
- Incident management: count vs threshold (RED if count > threshold)
- Physical entry: ordinal scale 0–5 (satisfactory at 3+)
- Corrective actions: ratio of implemented vs planned

**UI changes:**
- Replace `GOOD/TOLERABLE/BAD` badges with `GREEN/AMBER/RED` pill badges
- Show the ratio value (e.g. "0.94") alongside the RAG status
- Add interpretation text tooltip (from `indicatorInterpretation` field)

---

### MODULE 4 — Trend Analysis & Analytical Model  *(Priority: HIGH)*
**ISO ref:** §5.4.4, §9.2

Each indicator's detail page must show:
1. **Trend direction** — UPWARD / STABLE / DOWNWARD (computed from last N evaluations)
2. **Ratio chart** — line chart of `indicatorRatio` over time (not raw value)
3. **RAG history** — colour-coded timeline of past statuses
4. **Threshold lines** — horizontal lines on chart for GREEN and AMBER thresholds
5. **Trend interpretation** — text per Annex B (e.g. "Upward trend indicates improved compliance")

**Computation (in `IndicatorService`):**
```typescript
computeTrend(evaluations: Evaluation[]): 'UPWARD' | 'STABLE' | 'DOWNWARD' {
  // Compare last 2 ratio values
  // UPWARD if latest > previous by > 2%
  // DOWNWARD if latest < previous by > 2%
  // STABLE otherwise
}
```

---

### MODULE 5 — Collector Workflow & Audit Trail  *(Priority: MEDIUM)*
**ISO ref:** §8.3

Currently collectors just submit a value. ISO 27004 §8.3 requires documented data collection including: date, collector identity, information owner, issues noted, and verification.

**Changes to `CollectionComponent`:**
- Add "Collection issues / notes" text field
- Add "Confirm data source" checkbox (e.g. "Data extracted from employee database")
- Show `collectedBy` and `collectedAt` on evaluation history

**New `Verification` step for MANAGER/ADMIN:**
- After collector submits, evaluations have status `PENDING_VERIFICATION`
- Manager/Admin can verify (approve) or reject with a comment
- Verified evaluations become `VERIFIED` and feed into the dashboard
- Rejected ones go back to collector

**Evaluation statuses:** `DRAFT → SUBMITTED → VERIFIED → REJECTED`

---

### MODULE 6 — Scorecard & Executive Dashboard  *(Priority: MEDIUM)*
**ISO ref:** §7.7 reporting formats, §9.3

Add a second dashboard view: **Executive Scorecard**

**Layout:**
- Top row: Programme-level KPIs (overall ISMS compliance %, trend arrow, last review date)
- Middle: Control domain cards (one per ISO 27001 domain: A.6, A.8, A.9, A.10, A.11...)
  - Each card shows: domain name, # indicators, aggregate RAG, trend
- Bottom: Table of indicators sorted by RAG status (RED first) — "attention required" list

**Calculation:**
```
Domain Compliance % = (GREEN indicators in domain / total in domain) * 100
Overall Score = weighted average across domains
```

**Reporting format selector** (per §7.7):
- Executive Scorecard view
- Operational Dashboard (current view)
- Detailed Report (PDF)

---

### MODULE 7 — Measurement Programme Management  *(Priority: MEDIUM)*
**ISO ref:** §5.2, §10

New route: `/programme`

**Features:**
- Create/edit a Measurement Programme (scope, objectives, policy)
- Assign indicators to the programme
- Track programme evaluation schedule (§10.3)
- Record evaluation results: "Is the programme achieving its objectives?"
- Criteria checklist (§10.2): easy to understand, timely, objective, reproducible
- Improvement actions log

**Access:** ADMIN only

---

### MODULE 8 — Frequency & Scheduling Tracker  *(Priority: MEDIUM)*
**ISO ref:** §7.7, Annex A Frequency/Period section

For each indicator, track three separate frequencies:

**Dashboard widget: "Data Collection Due"**
- List of indicators where `nextCollectionDate <= today + 7 days`
- Shows collector name, expected collection date
- Overdue items highlighted in RED

**Computation:**
```typescript
getNextCollectionDate(lastEvaluationDate: Date, frequency: string): Date {
  // MONTHLY → add 1 month
  // QUARTERLY → add 3 months
  // WEEKLY → add 7 days
  // etc.
}

isOverdue(indicator: Indicator): boolean {
  return getNextCollectionDate(...) < new Date()
}
```

**Sidebar badge:** Show count of overdue collections on the Indicators menu item.

---

### MODULE 9 — Indicator Detail — Full Construct View  *(Priority: LOW)*
**ISO ref:** Annex A template

On the Indicator Details page, add a "Measurement Construct" tab that renders the full Annex A template as a read-only structured card, including:
- All identification fields
- Object of measurement & attributes
- Base/derived measure specification
- Indicator & analytical model
- Decision criteria
- Stakeholders table
- Frequency/period table

This provides the documentation artefact required by §7.8 ("measurement should be documented in an implementation plan").

---

### MODULE 10 — Non-Compliance Alert System  *(Priority: LOW)*
**ISO ref:** §9.2, §10.3

**Logic (from §9.2):**
> "Those indicators that demonstrate non-compliance or poor performance should be identified and classified as: risk treatment plan failure OR risk assessment failure."

**Alert types:**
```
RED_TWO_CYCLES   — RED status for 2+ consecutive reporting periods → requires process review
DOWNWARD_TREND   — Declining for last 2 periods → management intervention required
OVERDUE          — Collection date passed without submission
EXPIRY_WARNING   — Measurement revision date within 30 days
```

**UI:** Notification bell in top bar (TopBarComponent) with unread count badge.
Alert list modal showing type, indicator name, last occurrence, recommended action text.

---

## 4. Navigation & Routing Changes

### New Routes

```typescript
{ path: 'programme',             component: ProgrammeComponent }       // Module 7
{ path: 'indicator-library',     component: IndicatorLibraryComponent } // Module 2
{ path: 'scorecard',             component: ScorecardComponent }        // Module 6
{ path: 'alerts',                component: AlertsComponent }           // Module 10
```

### Sidebar Additions

```
Main
  ├── Dashboard           (existing)
  ├── Scorecard           (NEW — Module 6)
  ├── Indicators          (existing)
  ├── Indicator Library   (NEW — Module 2, admin/manager)
  ├── Departments         (existing)

Measurement
  ├── Measurement Programme  (NEW — Module 7, admin)
  ├── Alerts & Notifications (NEW — Module 10)

Administration
  ├── Applications        (existing)
  ├── Users & Roles       (existing)
```

---

## 5. Dummy Data Updates

### 5.1 Enrich existing indicators with construct fields

Add ISO 27004 Annex B compliant dummy data for at least 5 indicators:

```typescript
// Example: B.4.1 Incident Management Effectiveness
{
  id: 1,
  name: 'Incident Management Effectiveness',
  constructId: 'B.4.1',
  controlReference: 'Clause 4.2.2h [ISO 27001:2005]',
  controlObjective: 'To enable prompt detection of security events and response to security incidents.',
  objectOfMeasurement: 'ISMS — Individual incidents',
  measurementMethodType: 'OBJECTIVE',
  scaleType: 'ORDINAL',
  analyticalModel: 'RED when incidents exceed threshold; AMBER within 10%; GREEN below threshold by 10%+',
  decisionCriteriaGreen: 0,    // 0% above threshold
  decisionCriteriaAmber: 10,   // within 10% of threshold
  decisionCriteriaRed: 100,    // exceeded threshold
  collectionFrequency: 'MONTHLY',
  analysisFrequency: 'MONTHLY',
  reportingFrequency: 'MONTHLY',
  clientForMeasurement: 'ISMS Management Committee',
  reviewerForMeasurement: 'ISMS Manager',
  informationOwner: 'ISMS Manager',
  informationCollector: 'Incident Management Manager',
  informationCommunicator: 'ISMS Management Committee',
  reportingFormat: 'LINE_CHART',
  indicatorInterpretation: 'If RED for 2 reporting cycles, review of incident management procedures is required.',
  measurementRevisionDate: '2026-12-01',
  periodOfMeasurement: 'Monthly'
}
```

### 5.2 Rich evaluation history

Each indicator should have at least 6 past evaluations (6 months) to enable trend analysis:

```typescript
// For Incident Management — threshold = 5 incidents/month
const evaluations = [
  { value: 3, evaluationDate: '2025-11-01', ragStatus: 'GREEN', indicatorRatio: 0.60 },
  { value: 4, evaluationDate: '2025-12-01', ragStatus: 'GREEN', indicatorRatio: 0.80 },
  { value: 5, evaluationDate: '2026-01-01', ragStatus: 'AMBER', indicatorRatio: 1.00 },
  { value: 6, evaluationDate: '2026-02-01', ragStatus: 'RED',   indicatorRatio: 1.20 },
  { value: 5, evaluationDate: '2026-03-01', ragStatus: 'AMBER', indicatorRatio: 1.00 },
  { value: 3, evaluationDate: '2026-04-01', ragStatus: 'GREEN', indicatorRatio: 0.60 },
]
```

---

## 6. Implementation Priority Order

```
Phase 1 — Core Compliance (High Impact, Standard-Required)
  [1] Data model extensions (Indicator + Evaluation interfaces)
  [2] MODULE 3 — RAG Decision Criteria Engine
  [3] MODULE 4 — Trend Analysis (ratio chart + thresholds)
  [4] MODULE 2 — Pre-built Indicator Library (Annex B constructs)
  [5] Dummy data — rich evaluations with 6-month history

Phase 2 — Measurement Quality
  [6] MODULE 1 — Measurement Construct Builder (stepper form)
  [7] MODULE 5 — Collector Workflow & Audit Trail
  [8] MODULE 8 — Frequency & Scheduling Tracker

Phase 3 — Reporting & Programme Management
  [9]  MODULE 6 — Scorecard & Executive Dashboard
  [10] MODULE 7 — Measurement Programme Management
  [11] MODULE 9 — Full Construct View on Indicator Details
  [12] MODULE 10 — Non-Compliance Alert System
```

---

## 7. Key ISO 27004 Concepts to Reflect in UI Language

| Current term | ISO 27004 correct term |
|---|---|
| "Evaluation" | "Measurement result" |
| "Status: GOOD" | "RAG: GREEN — no action required" |
| "How to measure" | "Measurement method" |
| "Target value" | "Decision criteria threshold (Green)" |
| "Acceptable value" | "Decision criteria threshold (Amber)" |
| "Collector" | "Information Collector (§7.5.8d)" |
| "Owner" | "Information Owner (§7.5.8c)" |
| "Customer" | "Client for measurement (§7.5.8a)" |
| "Performance %" | "Derived measure / trend indicator" |

---

## 8. PDF Report — ISO 27004 §7.7 Compliance

The existing PDF export should be enhanced to match §7.7 reporting formats:

**Executive Summary section:**
- Overall ISMS compliance score
- Number of indicators by RAG status
- Top 3 critical indicators (RED)
- Programme evaluation status

**Per-indicator section (Annex A format):**
- Measurement construct identification
- Indicator value + RAG status
- Trend chart (last 6 periods)
- Decision criteria interpretation text
- Recommended management actions (from `indicatorInterpretation`)

**Metadata required by §8.3b:**
- Report generation date
- Reporting period covered
- Generated by (user name + role)
- Data collection issues (if any)

---

*Plan created: 2026-04-19*
*Standard: ISO/IEC 27004:2009 First Edition*
*Angular project: isofront-end v21*
