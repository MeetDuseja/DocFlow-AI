# Architecture & Workflow Overview — DocFlow

## Overview

DocFlow is an AI-powered manufacturing document digitization system designed to convert handwritten or semi-structured operational documents into structured, validated, and searchable operational records.

The system focuses on:
- AI-assisted OCR extraction
- Human review workflows
- Validation and exception handling
- Operational analytics
- Searchable document history

The architecture follows a simple full-stack workflow optimized for rapid execution, usability, and AI-native processing.

---

# System Architecture

## Frontend Layer
Built using:
- React.js
- Tailwind CSS
- Recharts

### Responsibilities
- Document upload UI
- File preview
- Extraction workflow handling
- Editable review forms
- Validation highlighting
- Search & filtering
- Analytics dashboard

### Key Features
- Multi-step upload flow
- Status-based document tracking
- Responsive dark-themed operational UI
- Real-time extraction rendering

---

## Backend Layer
Built using:
- FastAPI
- SQLAlchemy
- SQLite

### Responsibilities
- API management
- File handling
- OCR request orchestration
- Validation logic
- Record persistence
- Analytics aggregation

### Core APIs
- Upload document API
- OCR extraction API
- Save reviewed record API
- Fetch records API
- Dashboard analytics API

---

## AI/OCR Layer

### AI Stack
- Groq API
- LLaMA 4 Scout Vision

### Responsibilities
- Process uploaded manufacturing documents
- Extract structured operational data
- Generate confidence scores
- Return JSON-based outputs

### Extracted Fields
Examples include:
- Date
- Shift
- Employee Number
- Machine Number
- Work Order Number
- Quantity Produced
- Time Taken

### AI Workflow Design Decisions
- Structured JSON prompting
- Null-safe extraction
- Confidence-based field handling
- Regex fallback recovery for malformed outputs

---

## Database Layer

### SQLite Database
Used for lightweight persistent storage.

### Stores
- Uploaded document metadata
- Extracted operational records
- Validation statuses
- Confidence scores
- Processing timestamps

---

# End-to-End Workflow

## Step 1 — Document Upload
User uploads:
- JPG
- PNG
- PDF

The frontend sends the file to the FastAPI backend.

---

## Step 2 — File Storage
The backend:
- Stores uploaded files locally
- Creates document metadata entry
- Generates processing status

---

## Step 3 — AI OCR Processing
The backend sends the document image to the Groq Vision API.

The LLaMA Vision model:
- Reads handwritten/semi-structured text
- Extracts operational fields
- Returns structured JSON data

---

## Step 4 — Validation Engine
The backend validates extracted fields using business rules.

Validation examples:
- Missing required fields
- Invalid shift values
- Incorrect machine formats
- Suspicious quantities
- Duplicate work orders

Failed fields are flagged for review.

---

## Step 5 — Human Review Workflow
The frontend displays:
- Extracted values
- Confidence indicators
- Validation warnings

Users can:
- Edit incorrect values
- Verify records
- Save reviewed data

---

## Step 6 — Record Persistence
Validated records are stored in SQLite and linked to uploaded documents.

---

## Step 7 — Analytics & Dashboard
Dashboard APIs aggregate stored operational records and generate:
- Upload counts
- Validation failure metrics
- Shift-wise summaries
- Quantity analytics
- Machine-wise insights

Displayed using Recharts visualizations.

---

# Search & History Workflow

Users can:
- Search previous uploads
- Filter by extraction status
- Reopen processed records
- Track failed validations

This enables operational traceability and auditability.

---

# Key Product Decisions

## AI-First Extraction
Vision LLMs were preferred over traditional OCR-only systems because handwritten manufacturing documents are inconsistent and semi-structured.

---

## Human-in-the-Loop Design
The system assumes AI extraction may be imperfect and therefore includes:
- Validation workflows
- Confidence scoring
- Editable review interfaces

---

## Rapid Execution Focus
The architecture prioritizes:
- Working end-to-end functionality
- Fast iteration
- Operational usability

over production-scale complexity.

---

# Future Improvements

Potential future enhancements include:
- Multi-user authentication
- Cloud storage integration
- Advanced analytics
- Batch document processing
- Fine-tuned extraction models
- Export to ERP systems
- Real-time monitoring dashboards