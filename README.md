# 🏛️ SATYAKSH (सत्यक्ष)
### See Where Public Money Goes.
*An enterprise-grade public financial intelligence, geospatial auditing, and citizen accountability platform designed to track the lifecycle of MPLADS funds, parliamentary expenditures, and public infrastructure projects across 

## 📖 Executive Summary & Vision
**SATYAKSH** bridges the critical transparency gap between government fund sanctions and on-site execution. By programmatically ingesting and standardizing open datasets from the Ministry of Statistics and Programme Implementation (MoSPI), Public Financial Management System (PFMS), and e-GramSwaraj, the platform empowers journalists, auditors, policymakers, and ordinary citizens to scrutinize how Member of Parliament Local Area Development Scheme (MPLADS) funds are allocated, spent, and audited.

---

## 💎 Core Architecture & Advanced Features

### 1. 🗺️ Geospatial Intelligence & 50-Meter Deduplication Engine
*   **Haversine Geodesic Matrix:** Automatically calculates precise geographical distances between infrastructure projects.
*   **Clause 7.1 Enforcement:** Flags and penalizes overlapping or duplicate public works sanctioned within a mandatory **50-meter radius**, eliminating ghost works and redundant asset reporting.

### 2. 🤖 JanNirmaan Sahayak AI (Gemini Powered)
*   Integrated multi-modal conversational assistant powered by the **Google Gemini API**.
*   Performs real-time parsing of complex technical DPRs (Detailed Project Reports), contractor blacklisting logs, and budget line items in natural regional languages.

### 3. 🔍 Multi-Signal Risk & Anomaly Intelligence Dashboard
*   Computes dynamic composite risk scores for every constituency based on:
    *   *Financial Velocity Gaps:* Discrepancy between disbursed funds vs. utilized escrow balances.
    *   *Timeline Overruns:* Stalled projects exceeding statutory completion windows.
    *   *Contractor Concentration Risks:* Monopolistic allocation patterns to single-source vendors.

### 4. 🔒 Cryptographic Audit Trail & Immutable Logs
*   Simulates a SHA-256 blockchain-backed logging mechanism. Every field inspection, citizen grievance status update, and financial modification creates an unalterable audit ledger entry.

### 5. 🗣️ Pan-India Multilingual Citizen Grievance Portal
*   Native support for all **22 Scheduled Languages of India**.
*   Allows geo-tagged photo uploads and voice-to-text reporting with automated SLA escalation to respective District Magistrate (DM) nodes.

---

## 🛠️ Comprehensive Technology Stack

*   **Frontend Ecosystem:**
    *   **React 19 & TypeScript:** Strict type-safe UI components and advanced state management.
    *   **Tailwind CSS v4:** Modern utility-first styling with custom glassmorphism and dark/light modes.
    *   **Data Visualization & Mapping:** Recharts for analytical drilldowns, Leaflet / Custom SVG geospatial projections.
*   **Backend & Real-Time Services:**
    *   **Node.js & Express:** Robust RESTful and Server-Sent Events (SSE) server (`server.ts`).
    *   **Forensic Analytics Engine:** Automated spatial matrix calculation and anomaly scoring micro-services.
*   **AI & Interoperability Layer:**
    *   Google GenAI SDK (`@google/genai`) for conversational intelligence.
    *   Mock PaddleOCR integration for automated invoice and bill verification.

---

## 📂 Detailed Project Structure

```text
satyaksh/
├── server.ts                 # Express server handling custom analytics, risk scoring, and audit streams
├── metadata.json             # System capability manifest, data schemas, and API configurations
├── package.json              # Project dependencies, build scripts, and execution hooks
├── tsconfig.json             # TypeScript compiler configurations
├── src/
│   ├── App.tsx               # Root component controlling view routing and layout states
│   ├── main.tsx              # Application mount point
│   ├── index.css             # Tailwind CSS imports and custom global variables
│   ├── components/           # Modular UI architecture
│   │   ├── Dashboard.tsx     # Macro-level financial summaries & anomaly tickers
│   │   ├── MPProfile.tsx     # Individual MP ledger, fund utilization, and asset mapping
│   │   ├── ConstituencyMap.tsx# Geospatial inspection and 50-meter deduplication view
│   │   ├── Grievances.tsx    # Citizen reporting & multilingual grievance tracking
│   │   ├── RiskAudit.tsx     # Multi-signal risk intelligence & fraud detection board
│   │   └── Navbar.tsx        # Global navigation & quick language selector
│   ├── data/                 # Static normalized datasets (MoSPI, MPs, Projects, Geo-coords)
│   ├── services/             # Core logic engines (Spatial calculations, risk computation, export utilities)
│   └── i18n/                 # Multilingual localization dictionaries (Hindi, English, Regional)
