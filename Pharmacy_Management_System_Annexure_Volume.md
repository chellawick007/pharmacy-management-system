# Pharmacy Management System
## Annexure Volume for Major Project Report

**Purpose:** This annexure extends the core report with detailed technical and academic material suitable for long-form submission, viva preparation, and evaluation.

---

## TABLE OF CONTENTS

1. Extended Abstract Narrative  
2. Extended Literature Insights  
3. Complete Software Requirement Specification (SRS)  
4. Detailed System Design Notes  
5. Implementation Deep-Dive by Module  
6. End-to-End Workflow Narratives  
7. Extended Results Interpretation  
8. Detailed Experimental Matrix  
9. Security, Privacy, and Compliance Considerations  
10. Risk Register and Mitigation Plan  
11. Maintenance and DevOps Playbook  
12. User Manual (Operations Guide)  
13. API Payload Catalog with Examples  
14. Data Dictionary and Validation Rules  
15. Comprehensive Test Case Compendium  
16. Viva and Review Preparation Notes

---

# 1. EXTENDED ABSTRACT NARRATIVE

The Pharmacy Management System was conceptualized to answer a practical, recurring challenge: pharmacies require software that is not only transaction-capable but also decision-aware. Existing solutions in many environments either prioritize speed of billing or basic stock entry, but often ignore the lifecycle relationship between procurement, sales, expiry exposure, and demand behavior. This creates operational blind spots, especially under fluctuating demand patterns and constrained working capital.

The project therefore adopts an integrated approach where inventory, sales, billing, customer interactions, supplier operations, purchase order tracking, and analytics are tightly linked through a common data backbone. The design philosophy emphasizes: (a) immediate operational clarity, (b) consistency in data updates across modules, and (c) incremental intelligence through forecasting and alerts.

The backend architecture is API-first and modular, implemented with FastAPI and MongoDB. FastAPI provides type-safe contracts and rapid endpoint development, while MongoDB supports flexible schema evolution required during iterative module expansion. The frontend is developed with React and Tailwind CSS, ensuring responsive interfaces suitable for daily pharmacy operations where task speed and visual clarity are both critical.

The project includes demand forecasting using linear regression over historical sales records. While intentionally lightweight, the model serves a meaningful operational role by introducing evidence-based reorder signaling. In future releases, model sophistication can evolve without restructuring the full application due to service modularity.

A distinguishing capability of the platform is transactional synchronization. Billing and sales are treated as inventory-affecting events; purchase order receipt is treated as replenishment with status-tracked traceability; notifications are rule-driven from stock and expiry states. This relational architecture reduces data inconsistency and strengthens trust in system outputs.

The final system is deployable through Docker Compose and supports straightforward setup for academic demonstration and pilot use. The codebase is structured for maintainability and extension, making it a viable foundation for production-hardening roadmaps.

---

# 2. EXTENDED LITERATURE INSIGHTS

## 2.1 Research Landscape in Pharmacy Digitization

The pharmacy technology ecosystem can be grouped into four generations:

1. Manual and spreadsheet-driven operations
2. Standalone billing desktop systems
3. Integrated inventory and billing systems
4. Intelligent, analytics-supported pharmacy platforms

This project is aligned with generation 4, but with practical complexity boundaries to remain deployable for medium-scale businesses.

## 2.2 Academic Trends Relevant to This Work

Observed trends in published and industrial practice include:

- Increasing emphasis on inventory visibility in near real time
- Demand forecasting as a response to volatility and expiry risk
- API-first architectures for interoperability
- Movement toward cloud or containerized deployment
- Rising focus on healthcare data governance and auditability

## 2.3 Knowledge Gap Addressed by This Project

Many solutions provide partial functionality. This project explicitly integrates:

- Stock events from both sales and billing channels
- Purchase order lifecycle with state transitions and receiving logic
- Notification logic connected to inventory risk states
- Forecasting and reporting layers over transactional data

## 2.4 Comparative Analytical Framework

| Criteria | Legacy Billing Software | Inventory-Only Tools | Proposed System |
|---|---|---|---|
| Invoice Quality | High | Low | High |
| Stock Risk Alerts | Low | Medium | High |
| Supplier and PO Control | Low | Medium | High |
| Analytics Maturity | Low | Low | Medium-High |
| Forecasting | Rare | Rare | Present |
| Deployment Simplicity | Medium | Medium | High (Docker) |

## 2.5 Practical Implications for Healthcare Retail

- Better medicine availability continuity
- Lower loss due to expiry and overstock
- Faster operational decision-making
- Better traceability and management confidence

---

# 3. COMPLETE SOFTWARE REQUIREMENT SPECIFICATION (SRS)

## 3.1 Scope Definition

The software supports daily pharmacy operations with intelligent decision support. It is intended for administrators, pharmacists, and cashiers in single-location or small multi-location settings.

## 3.2 User Classes and Characteristics

### Administrator

- Views all dashboards and reports
- Manages users, suppliers, and procurement workflow
- Monitors KPIs and business risk indicators

### Pharmacist

- Manages medicines and stock updates
- Monitors expiry and reorder alerts
- Supports billing and customer interactions

### Cashier

- Creates bills
- Handles transaction closures and customer interactions
- Uses lightweight views for speed and accuracy

## 3.3 Use Case Inventory

| UC ID | Use Case Name | Primary Actor | Trigger | Outcome |
|---|---|---|---|---|
| UC-01 | User Login | All | Credential submission | Token issued |
| UC-02 | Add Medicine | Pharmacist/Admin | New stock item | Medicine stored |
| UC-03 | Update Medicine | Pharmacist/Admin | Stock correction | Record updated |
| UC-04 | Create Bill | Cashier/Pharmacist | Checkout request | Bill generated, stock reduced |
| UC-05 | Delete Bill | Admin | Correction request | Bill removed, stock restored |
| UC-06 | Add Customer | Cashier/Pharmacist | New customer | Profile created |
| UC-07 | Create Supplier | Admin | Vendor onboarding | Supplier stored |
| UC-08 | Create PO | Admin/Pharmacist | Replenishment need | PO in pending state |
| UC-09 | Approve PO | Admin | PO validation | Status set ordered |
| UC-10 | Receive PO | Pharmacist | Goods arrival | Status delivered, stock increased |
| UC-11 | Generate Notifications | Admin/System | Rule execution | Alerts created |
| UC-12 | View Reports | Admin | Date range selection | Aggregated insights |
| UC-13 | Get Predictions | Admin/Pharmacist | Forecast request | Demand estimate returned |

## 3.4 Functional Requirement Matrix

| FR ID | Requirement | Priority | Dependency |
|---|---|---|---|
| FR-01 | Authentication workflow | High | None |
| FR-02 | Medicine CRUD | High | FR-01 |
| FR-03 | Sales recording | High | FR-01, FR-02 |
| FR-04 | Customer CRUD | High | FR-01 |
| FR-05 | Billing with GST | High | FR-01, FR-02, FR-04 |
| FR-06 | Supplier management | Medium-High | FR-01 |
| FR-07 | PO lifecycle | High | FR-01, FR-02, FR-06 |
| FR-08 | Notification center | Medium-High | FR-02 |
| FR-09 | Reports | Medium-High | FR-03, FR-05 |
| FR-10 | Demand prediction | Medium | FR-03 |

## 3.5 Non-Functional Requirement Matrix

| NFR ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Interactive workflows should remain responsive under expected load |
| NFR-02 | Reliability | Business rules must prevent invalid stock states |
| NFR-03 | Usability | UI should support fast daily operations with clear labels |
| NFR-04 | Security | Authentication, validation, and secure configuration required |
| NFR-05 | Maintainability | Modular route/component structure must be preserved |
| NFR-06 | Portability | Containerized run path should remain available |
| NFR-07 | Observability | Operational events should be monitorable in future extensions |

## 3.6 Assumptions and Dependencies

- Data integrity assumes valid IDs and operational discipline
- Prediction quality depends on historical sales depth
- Time zone consistency depends on deployment configuration

## 3.7 Out-of-Scope in Current Version

- Full hospital information system integration
- Advanced prescription digitization workflows
- Multi-tenant enterprise role policy engine
- Complete compliance automation for all jurisdictions

---

# 4. DETAILED SYSTEM DESIGN NOTES

## 4.1 Design Principles

- Modularity: Each business capability has an isolated route/module area.
- Cohesion: Components map directly to pharmacy tasks.
- Traceability: IDs and status fields support lifecycle tracking.
- Extensibility: Predictive and reporting modules can evolve independently.

## 4.2 Logical Architecture Detail

Layers:

1. Presentation Layer (React)
2. API Communication Layer (service abstraction)
3. Application Layer (FastAPI routes)
4. Domain Validation Layer (Pydantic models)
5. Data Persistence Layer (MongoDB)
6. Intelligence Layer (prediction service)

## 4.3 Key Design Decisions

### Decision D1: Use document database with structured validation

Rationale:

- Fast iteration for evolving modules
- Flexible nested item structures in billing/POs

Impact:

- Requires careful consistency checks in app logic

### Decision D2: Route decomposition by domain

Rationale:

- Easier maintainability
- Better team collaboration boundaries

### Decision D3: Keep forecast model simple in V1

Rationale:

- Interpretability and low complexity
- Easy deployment in low-resource environments

## 4.4 Data Consistency Strategies

- Validate stock before any decrement operation
- Apply updates only after successful business-rule pass
- Restore stock on rollback-like operations such as bill deletion
- Use status checks before PO transitions

## 4.5 Scalability Design Considerations

- Add indexes on frequent query fields (date, status, medicine name)
- Introduce pagination for high-volume endpoints
- Move notifications and prediction triggers to async jobs if scale increases

---

# 5. IMPLEMENTATION DEEP-DIVE BY MODULE

## 5.1 Auth Module Deep-Dive

Implementation concerns:

- Credential validation
- Password hashing verification
- Token generation and expiry model

Improvement direction:

- JWT and refresh token rotation
- Account lockout and brute force throttling

## 5.2 Inventory Module Deep-Dive

Implementation concerns:

- Input validation and normalization
- Category constraints and reorder thresholds
- Expiry-aware list and filtering behavior

Improvement direction:

- Batch-level stock movement history
- FIFO/FEFO stock release policy support

## 5.3 Billing Module Deep-Dive

Implementation concerns:

- Pre-bill stock sufficiency check
- GST calculation and rounding policy
- Bill number generation uniqueness

Improvement direction:

- Digital signature and e-invoice formats
- Payment gateway callback integration

## 5.4 Sales Module Deep-Dive

Implementation concerns:

- Medicine identity integrity
- Totals correctness
- Date-based sort and report feed consistency

## 5.5 Customer Module Deep-Dive

Implementation concerns:

- Phone uniqueness and contact consistency
- Purchase metrics aggregation

Improvement direction:

- Loyalty scoring and segmentation

## 5.6 Supplier Module Deep-Dive

Implementation concerns:

- Supplier profile integrity and status management
- Linkage to procurement history

Improvement direction:

- Vendor reliability scoring and SLA tracking

## 5.7 Purchase Order Module Deep-Dive

Implementation concerns:

- Controlled status transitions
- Receive workflow inventory updates
- Partial receive behavior handling

Improvement direction:

- Multi-stage approvals
- Lead-time prediction and supplier comparison

## 5.8 Notification Module Deep-Dive

Implementation concerns:

- Rule clarity and priority mapping
- Duplicate suppression strategy
- Read-state lifecycle

Improvement direction:

- Notification channels (email, SMS, app push)

## 5.9 Reports Module Deep-Dive

Implementation concerns:

- Aggregation correctness and date filtering
- Unified representation from multiple transaction sources

Improvement direction:

- Scheduled exports and custom report templates

## 5.10 Prediction Module Deep-Dive

Implementation concerns:

- Data sufficiency threshold
- Prediction horizon selection
- Confidence value semantics

Improvement direction:

- Rolling-window validation
- Ensemble modeling for robustness

---

# 6. END-TO-END WORKFLOW NARRATIVES

## 6.1 New Medicine Onboarding Workflow

1. Pharmacist opens stock module.
2. Enters medicine details including batch and expiry.
3. System validates category and required fields.
4. Record persists in medicines collection.
5. Dashboard stock cards reflect updated inventory.

## 6.2 Customer Billing Workflow

1. Cashier selects customer or captures walk-in details.
2. Adds one or more medicines to bill cart.
3. System validates stock for each medicine.
4. Subtotal, GST, and grand total computed.
5. Bill stored, stock decremented, customer metrics updated.

## 6.3 Stock Replenishment Workflow

1. Admin creates PO for selected supplier.
2. PO remains pending until approved.
3. On goods arrival, user performs receive action.
4. System updates status to delivered and increments stock.
5. Procurement statistics update in reports.

## 6.4 Notification Monitoring Workflow

1. System scans medicines for rule conditions.
2. Alerts generated for critical and warning conditions.
3. User opens notification center.
4. Marks alerts read after action.
5. Summary panel shows unresolved alert burden.

## 6.5 Demand Planning Workflow

1. Pharmacist opens prediction module.
2. System reads historical sales patterns.
3. Forecast and recommendation generated.
4. User aligns PO plans with forecast signals.

---

# 7. EXTENDED RESULTS INTERPRETATION

## 7.1 Outcome Categories

- Correctness outcomes
- Operational efficiency outcomes
- Decision-support outcomes
- Usability outcomes

## 7.2 Correctness Outcomes

Validated outcomes include:

- Stock does not decrement below valid conditions in normal paths
- Bill generation and deletion produce expected inventory impacts
- PO receive flow updates inventory and status coherently

## 7.3 Efficiency Outcomes

Practical gains include:

- Reduced time to generate invoices
- Faster stock risk identification
- Lower effort for manual reconciliation

## 7.4 Decision-Support Outcomes

- Better visibility into top-selling items
- Early warning for stock and expiry conditions
- Baseline forecast guidance for procurement

## 7.5 Discussion of Trade-offs

- Simplicity vs advanced security hardening
- Interpretability vs model sophistication
- Flexibility vs strict schema rigidity

---

# 8. DETAILED EXPERIMENTAL MATRIX

## 8.1 Environment Matrix

| Parameter | Value |
|---|---|
| Backend Framework | FastAPI |
| Database | MongoDB |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Containerization | Docker Compose |
| Forecast Engine | Scikit-learn Linear Regression |

## 8.2 Dataset Characteristics for Testing

- Medicines: Multi-category inventory with varied expiry dates
- Sales: Historical records across multiple dates
- Customers: Repeat and one-time profiles
- Suppliers and POs: Mixed status lifecycle records

## 8.3 Test Coverage Goals

- Endpoint correctness
- Data integrity across linked operations
- Error response quality
- Report output consistency
- Prediction output availability

## 8.4 Extended Validation Checklist

- Input validation for mandatory fields
- Date and category normalization behavior
- Duplicate handling where uniqueness constraints apply
- State transition restrictions in PO module
- Notification deduplication behavior

---

# 9. SECURITY, PRIVACY, AND COMPLIANCE CONSIDERATIONS

## 9.1 Security Posture in Current Implementation

- Password hashing present
- Token-based session logic present
- Pydantic input validation present

## 9.2 Security Improvement Recommendations

- Adaptive password hashing (bcrypt/Argon2)
- JWT with refresh and revocation strategy
- Fine-grained RBAC at endpoint layer
- Rate limiting and account lockout controls
- TLS-only production deployment

## 9.3 Privacy Considerations

- Minimize personally identifiable information retention
- Mask sensitive fields in logs and exports
- Define retention and purge policies

## 9.4 Compliance-Oriented Enhancements

- Immutable audit trail for critical actions
- Role-based visibility for sensitive modules
- Traceable invoice and transaction history retention

---

# 10. RISK REGISTER AND MITIGATION PLAN

| Risk ID | Risk Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | Token/session compromise | High | Medium | JWT, secure storage, rotation |
| R2 | Data inconsistency from concurrent writes | High | Medium | Atomic updates and guard checks |
| R3 | Forecast inaccuracy under sparse data | Medium | High | Threshold gating and model fallback |
| R4 | Expiry alert fatigue | Medium | Medium | Deduplication and prioritization |
| R5 | Supplier process errors | Medium | Medium | Status controls and approval steps |
| R6 | Operational downtime | High | Low-Medium | Backups, monitoring, restart strategy |
| R7 | Weak password policy | High | Medium | Strong policy and adaptive hashing |
| R8 | Report misinterpretation | Medium | Medium | KPI definitions and training notes |

---

# 11. MAINTENANCE AND DEVOPS PLAYBOOK

## 11.1 Operational Cadence

Daily:

- Verify service health endpoints
- Check unread critical notifications
- Review failed requests and error logs

Weekly:

- Validate backup integrity
- Review top low-stock and expiry clusters
- Audit open purchase orders

Monthly:

- Performance and index review
- Security configuration review
- Dependency updates and patch audit

## 11.2 Backup and Recovery Guidance

- Schedule periodic MongoDB backups
- Store backups in external durable storage
- Perform restore drills and checksum validation

## 11.3 Release Management Guidance

- Use feature branches and peer review
- Run smoke tests before deployment
- Maintain release notes with migration details

---

# 12. USER MANUAL (OPERATIONS GUIDE)

## 12.1 Login and Session

1. Open frontend URL.
2. Enter registered credentials.
3. On success, navigate through module menu.
4. Logout from profile/control area.

## 12.2 Adding Medicine

1. Open stock/inventory module.
2. Click add medicine.
3. Fill required fields.
4. Save and verify in list with status badge.

## 12.3 Creating a Bill

1. Open billing module.
2. Select customer or enter customer details.
3. Add medicines and quantities.
4. Confirm totals and payment mode.
5. Submit and print/save bill details.

## 12.4 Managing Purchase Orders

1. Open purchase order module.
2. Create PO with supplier and items.
3. Approve PO when validated.
4. Receive PO on goods arrival and verify stock updates.

## 12.5 Handling Notifications

1. Open notification center.
2. Filter by read status or priority.
3. Mark as read after action.
4. Clear completed alert noise periodically.

## 12.6 Running Reports

1. Open reports module.
2. Choose report type and date range.
3. Apply filters (category/period as required).
4. Interpret KPI cards and chart summaries.

---

# 13. API PAYLOAD CATALOG WITH EXAMPLES

## 13.1 Login Example

Request:

```json
{
  "email": "admin@pharmacy.com",
  "password": "admin123"
}
```

Response:

```json
{
  "email": "admin@pharmacy.com",
  "username": "admin",
  "full_name": "System Administrator",
  "role": "admin",
  "token": "<token_value>"
}
```

## 13.2 Add Medicine Example

Request:

```json
{
  "name": "Paracetamol 500mg",
  "batch_no": "PCM-A102",
  "quantity": 120,
  "price": 2.75,
  "expiry_date": "2027-08-30",
  "category": "Tablet",
  "reorder_level": 30
}
```

Response:

```json
{
  "id": "<medicine_id>",
  "message": "Medicine added successfully"
}
```

## 13.3 Create Bill Example

Request:

```json
{
  "bill_number": "BILL-1741530039",
  "customer_name": "Asha R",
  "customer_phone": "9000000001",
  "customer_gstin": "29ABCDE1234F1Z5",
  "billing_address": "Bangalore",
  "payment_mode": "UPI",
  "items": [
    {
      "medicine_id": "<id_1>",
      "medicine_name": "Paracetamol 500mg",
      "quantity": 10,
      "price": 2.75,
      "total": 27.5
    },
    {
      "medicine_id": "<id_2>",
      "medicine_name": "Cough Syrup 100ml",
      "quantity": 2,
      "price": 55,
      "total": 110
    }
  ],
  "subtotal": 137.5,
  "gst_percentage": 18,
  "gst_amount": 24.75,
  "grand_total": 162.25
}
```

## 13.4 Create Supplier Example

```json
{
  "name": "HealthLine Distributors",
  "contact_person": "Ravi Kumar",
  "phone": "9880000000",
  "email": "ravi@healthline.com",
  "address": "MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "gstin": "29AAAAA0000A1Z5",
  "rating": 4.3,
  "notes": "Primary fast-delivery vendor",
  "active": true
}
```

## 13.5 Create Purchase Order Example

```json
{
  "supplier_id": "<supplier_id>",
  "items": [
    {
      "medicine_id": "<medicine_id>",
      "medicine_name": "Amoxicillin 500mg",
      "quantity": 50,
      "unit_price": 9,
      "total_price": 450
    }
  ],
  "order_notes": "Urgent replenishment"
}
```

---

# 14. DATA DICTIONARY AND VALIDATION RULES

## 14.1 Users Collection

| Field | Type | Rule |
|---|---|---|
| email | string | valid email and unique |
| username | string | required |
| password | string | hashed and required |
| full_name | string | required |
| role | string | admin/pharmacist/cashier |
| created_at | string | generated timestamp |

## 14.2 Medicines Collection

| Field | Type | Rule |
|---|---|---|
| name | string | non-empty |
| batch_no | string | non-empty |
| quantity | int | non-negative |
| price | float | positive |
| expiry_date | string | valid date string |
| category | string | allowed category set |
| reorder_level | int | non-negative |

## 14.3 Customers Collection

| Field | Type | Rule |
|---|---|---|
| name | string | required |
| phone | string | required and unique |
| email | string | optional |
| address | string | optional |
| total_purchases | float | default 0 |
| last_purchase_date | string | optional |

## 14.4 Bills Collection

| Field | Type | Rule |
|---|---|---|
| bill_number | string | unique |
| customer_name | string | required |
| payment_mode | string | Cash/Card/UPI |
| items | array | each item must contain medicine_id, quantity, price |
| subtotal | float | computed |
| gst_percentage | float | default 18 |
| gst_amount | float | computed |
| grand_total | float | subtotal + gst |

## 14.5 Purchase Orders Collection

| Field | Type | Rule |
|---|---|---|
| po_number | string | generated unique |
| supplier_id | string | required |
| items | array | non-empty |
| total_amount | float | computed |
| status | string | pending/ordered/delivered/cancelled |
| ordered_by | string | optional during approval |
| order_notes | string | optional |

## 14.6 Notifications Collection

| Field | Type | Rule |
|---|---|---|
| type | string | low_stock/out_of_stock/expiring_soon/expired |
| priority | string | info/warning/critical |
| title | string | required |
| message | string | required |
| medicine_id | string | reference |
| read | bool | default false |

---

# 15. COMPREHENSIVE TEST CASE COMPENDIUM

## 15.1 Authentication Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| AUTH-01 | Signup with valid payload | valid user | success and token |
| AUTH-02 | Signup duplicate email | existing email | conflict/error |
| AUTH-03 | Login valid credentials | correct pair | token issued |
| AUTH-04 | Login invalid password | wrong password | unauthorized |
| AUTH-05 | Verify active token | token | user info |
| AUTH-06 | Verify invalid token | random token | unauthorized |

## 15.2 Inventory Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| INV-01 | Add valid medicine | complete payload | success |
| INV-02 | Add medicine missing name | blank name | validation error |
| INV-03 | Add invalid category | unsupported category | validation error |
| INV-04 | Update medicine quantity | new quantity | success |
| INV-05 | Delete medicine | valid id | success |
| INV-06 | Fetch expiring list | none | expiring subset |

## 15.3 Billing and Sales Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| BILL-01 | Create bill single item | valid stock | success |
| BILL-02 | Create bill multiple items | valid stock | success |
| BILL-03 | Create bill insufficient stock | excessive qty | reject |
| BILL-04 | Delete bill and restore stock | bill id | stock restored |
| SALE-01 | Add sale valid | valid medicine and qty | success |
| SALE-02 | Add sale invalid medicine | wrong id | not found/error |

## 15.4 Supplier and PO Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| SUP-01 | Add supplier | valid payload | success |
| SUP-02 | Search supplier | query text | filtered list |
| PO-01 | Create PO pending | valid payload | pending status |
| PO-02 | Approve pending PO | po id | ordered status |
| PO-03 | Receive ordered PO | received items | delivered and stock up |
| PO-04 | Cancel PO | reason | cancelled status |

## 15.5 Notification and Report Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| NOTIF-01 | Generate low stock alerts | low quantity meds | alerts created |
| NOTIF-02 | Mark one read | notif id | read true |
| NOTIF-03 | Mark all read | none | all read |
| REP-01 | Sales report by date | range | aggregated metrics |
| REP-02 | Inventory report by category | category | category summary |
| REP-03 | Customer report by date | range | customer stats |

## 15.6 Prediction Test Cases

| ID | Test Description | Input | Expected |
|---|---|---|---|
| PRED-01 | Prediction with sufficient data | valid sales history | prediction set |
| PRED-02 | Prediction with low data | insufficient history | guarded output/error |
| PRED-03 | Recommendation presence | prediction results | reorder/sufficient value |

## 15.7 Regression Test Bundle

- Re-run AUTH, INV, BILL, PO critical paths after each release.
- Validate stock invariants after all write operations.
- Confirm report totals against source transactions.

---

# 16. VIVA AND REVIEW PREPARATION NOTES

## 16.1 Core Storyline for Presentation

- Problem: fragmented pharmacy workflows causing operational inefficiency and risk.
- Approach: integrated web platform with modular architecture.
- Outcome: synchronized operations plus analytics and forecasting support.
- Future: production-grade security and advanced AI pipeline.

## 16.2 20 Likely Questions and Crisp Answers

1. Why FastAPI?  
Because it offers rapid typed API development, strong validation, and good performance.

2. Why MongoDB?  
Because document flexibility suits evolving operational modules with nested billing and PO items.

3. How do you prevent stock mismatch?  
By validating and updating stock at transaction points and restoring stock on bill deletion.

4. Why linear regression for forecasting?  
It is lightweight, interpretable, and practical for baseline demand estimation.

5. What are your biggest limitations?  
Auth hardening, advanced RBAC, and forecasting sophistication in current version.

6. How does notification deduplication help?  
It reduces alert fatigue and improves actionability.

7. What is unique in this project?  
Integrated linkage between billing, inventory, procurement, alerts, and prediction.

8. How can this scale?  
With indexing, background jobs, JWT auth, and modular service evolution.

9. What business value is immediate?  
Reduced stock-outs, faster billing, improved visibility.

10. How do reports support management?  
They provide revenue, inventory risk, and customer behavior insights.

11. How is supplier performance tracked?  
Through linked purchase order history and supplier profile metrics.

12. Why include a chatbot?  
To reduce user friction and provide context-based assistance.

13. How do you handle expiring medicines?  
Expiry-aware detection and notification workflows.

14. What are key non-functional requirements?  
Reliability, usability, maintainability, and deployment portability.

15. How do you test end-to-end flows?  
Scenario-based validation across billing, inventory, and PO lifecycle.

16. Why containerization?  
For reproducible setup and easy demonstration.

17. What is required for production rollout?  
Security hardening, observability, backup policy, and controlled releases.

18. What is your roadmap?  
RBAC, advanced forecasting, multi-branch operations, and external integrations.

19. How does this improve social outcomes?  
By improving medicine availability and reducing operational errors.

20. If extended to hospital chain scale?  
Introduce tenancy boundaries, advanced policy controls, and centralized analytics.

## 16.3 Final Academic Positioning Statement

This project is a complete, modular, and extensible pharmacy operations platform demonstrating practical software engineering, domain relevance, and a clear pathway from prototype to production maturity.

---

## ANNEXURE CLOSING NOTE

This annexure is intentionally exhaustive to support:

- Long-format report printing requirements
- Technical audit and viva preparedness
- Practical deployment and maintenance planning

# END OF ANNEXURE VOLUME
