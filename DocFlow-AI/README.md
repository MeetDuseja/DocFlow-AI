# DocFlow - Manufacturing Document Digitization

## Setup

### Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add GROQ_API_KEY to .env
uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
npm start

### Open
http://localhost:3000

## Stack
- Frontend: React + Tailwind CSS + Recharts
- Backend: FastAPI + SQLAlchemy
- Database: SQLite (auto created)
- AI: Groq + LLaMA 4 Scout Vision

## Notes
- Dark sidebar layout UI
- Uploaded files stored in documents/ folder
- SQLite DB auto created on first run