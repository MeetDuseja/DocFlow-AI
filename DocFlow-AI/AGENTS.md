# AI Workflow Document

## Tools Used
- Groq API + LLaMA 4 Scout Vision - Document OCR
- ChatGPT / Claude - Development assistance

## Approach
- Groq Vision API processes uploaded images
- Structured JSON with accuracy scores per field
- Strict null-safe JSON prompt engineering
- Regex fallback for malformed responses

## Manual Decisions
- Validation business rules
- Dark theme UI design
- Sidebar layout architecture
- Error handling strategies