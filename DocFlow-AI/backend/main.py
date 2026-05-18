from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import json, os, shutil, uuid
from dotenv import load_dotenv

load_dotenv()

from database import SessionLocal, Document, OperationRecord, Base, engine
from ocr import extract_from_image
from validation import validate_record

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("documents", exist_ok=True)
app.mount("/documents", StaticFiles(directory="documents"), name="documents")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "pdf"]:
        raise HTTPException(400, "Only JPG, PNG, PDF files are accepted")

    filename = f"{uuid.uuid4()}.{ext}"
    path = f"documents/{filename}"

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    doc = Document(filename=file.filename, file_path=path, status="pending")
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        if ext == "pdf":
            from pdf2image import convert_from_path
            images = convert_from_path(path)
            img_path = path.replace(".pdf", "_p1.jpg")
            images[0].save(img_path, "JPEG")
            records_data = extract_from_image(img_path)
        else:
            records_data = extract_from_image(path)

        if not records_data:
            doc.status = "failed"
            db.commit()
            raise HTTPException(500, "No data extracted")

        existing_wos = [
            r.work_order_number for r in db.query(OperationRecord).all()
            if r.work_order_number
        ]

        saved_records = []

        for extracted in records_data:
            accuracy = extracted.pop("accuracy", {})
            flags = validate_record(extracted, existing_wos)

            record = OperationRecord(
                document_id=doc.id,
                date=extracted.get("date"),
                shift=extracted.get("shift"),
                employee_number=extracted.get("employee_number"),
                operation_code=extracted.get("operation_code"),
                machine_number=extracted.get("machine_number"),
                work_order_number=extracted.get("work_order_number"),
                quantity_produced=extracted.get("quantity_produced"),
                time_taken=extracted.get("time_taken"),
                accuracy_scores=json.dumps(accuracy),
                validation_flags=json.dumps(flags),
                raw_text=json.dumps(extracted)
            )
            db.add(record)

            if extracted.get("work_order_number"):
                existing_wos.append(extracted["work_order_number"])

            saved_records.append({
                "extracted": extracted,
                "accuracy": accuracy,
                "flags": flags
            })

        doc.status = "extracted"
        db.commit()

        first_record = db.query(OperationRecord).filter(
            OperationRecord.document_id == doc.id
        ).first()

        return {
            "document_id": doc.id,
            "record_id": first_record.id,
            "total_records": len(saved_records),
            "records": saved_records
        }

    except HTTPException:
        raise
    except Exception as e:
        doc.status = "failed"
        db.commit()
        raise HTTPException(500, f"Processing failed: {str(e)}")


@app.get("/documents")
def get_documents(search: str = "", db: Session = Depends(get_db)):
    query = db.query(Document)
    if search:
        query = query.filter(Document.filename.contains(search))
    docs = query.order_by(Document.uploaded_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "status": d.status,
            "uploaded_at": d.uploaded_at,
            "file_path": d.file_path
        }
        for d in docs
    ]


@app.get("/records/{document_id}")
def get_record(document_id: int, db: Session = Depends(get_db)):
    records = db.query(OperationRecord).filter(
        OperationRecord.document_id == document_id
    ).all()

    if not records:
        raise HTTPException(404, "Record not found")

    record = records[0]

    return {
        "id": record.id,
        "document_id": record.document_id,
        "date": record.date,
        "shift": record.shift,
        "employee_number": record.employee_number,
        "operation_code": record.operation_code,
        "machine_number": record.machine_number,
        "work_order_number": record.work_order_number,
        "quantity_produced": record.quantity_produced,
        "time_taken": record.time_taken,
        "accuracy_scores": json.loads(record.accuracy_scores or "{}"),
        "validation_flags": json.loads(record.validation_flags or "[]"),
        "is_verified": record.is_verified,
        "total_records": len(records),
        "all_record_ids": [r.id for r in records]
    }
# Get record by its own ID (not document id)
@app.get("/record-by-id/{record_id}")
def get_record_by_id(record_id: int, db: Session = Depends(get_db)):
    record = db.query(OperationRecord).filter(OperationRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "Record not found")
    return {
        "id": record.id,
        "document_id": record.document_id,
        "date": record.date,
        "shift": record.shift,
        "employee_number": record.employee_number,
        "operation_code": record.operation_code,
        "machine_number": record.machine_number,
        "work_order_number": record.work_order_number,
        "quantity_produced": record.quantity_produced,
        "time_taken": record.time_taken,
        "accuracy_scores": json.loads(record.accuracy_scores or "{}"),
        "validation_flags": json.loads(record.validation_flags or "[]"),
        "is_verified": record.is_verified
    }

class RecordUpdate(BaseModel):
    date: Optional[str] = None
    shift: Optional[str] = None
    employee_number: Optional[str] = None
    operation_code: Optional[str] = None
    machine_number: Optional[str] = None
    work_order_number: Optional[str] = None
    quantity_produced: Optional[float] = None
    time_taken: Optional[float] = None

@app.put("/records/{record_id}")
def update_record(record_id: int, data: RecordUpdate, db: Session = Depends(get_db)):
    record = db.query(OperationRecord).filter(OperationRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "Record not found")

    update_data = data.dict()
    for k, v in update_data.items():
        setattr(record, k, v)

    existing_wos = [
        r.work_order_number for r in db.query(OperationRecord).all()
        if r.work_order_number and r.id != record_id
    ]
    flags = validate_record(update_data, existing_wos)
    record.validation_flags = json.dumps(flags)
    record.is_verified = True

    doc = db.query(Document).filter(Document.id == record.document_id).first()
    if doc:
        doc.status = "verified"

    db.commit()
    return {"success": True, "flags": flags}


@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(Document).count()
    verified = db.query(Document).filter(Document.status == "verified").count()
    failed = db.query(Document).filter(Document.status == "failed").count()
    pending = db.query(Document).filter(Document.status == "extracted").count()
    records = db.query(OperationRecord).all()

    flagged = 0
    shift_data = {}
    machine_data = {}
    total_qty = 0

    for r in records:
        flags = json.loads(r.validation_flags or "[]")
        if flags:
            flagged += 1
        if r.shift:
            shift_data[r.shift] = shift_data.get(r.shift, 0) + 1
        if r.machine_number:
            machine_data[r.machine_number] = (
                machine_data.get(r.machine_number, 0) + (r.quantity_produced or 0)
            )
        total_qty += r.quantity_produced or 0

    return {
        "total_uploads": total,
        "verified": verified,
        "pending": pending,
        "failed": failed,
        "flagged_records": flagged,
        "total_quantity": round(total_qty, 2),
        "shift_data": shift_data,
        "machine_data": machine_data
    }