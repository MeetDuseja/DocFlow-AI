import groq
import base64
import json
import re
import os
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

EXTRACTION_PROMPT = """
You are an OCR system for manufacturing operational documents.
This document may contain MULTIPLE rows/records.
Extract ALL records and return them as a JSON array.
Return ONLY a valid JSON array like this:
[
  {
    "date": "YYYY-MM-DD or null",
    "shift": "A or B or C or Day or Night or Morning or Evening or I or II or III or null",
    "employee_number": "string or null",
    "operation_code": "string or null",
    "machine_number": "string or null",
    "work_order_number": "string or null",
    "quantity_produced": number or null,
    "time_taken": number in hours or null,
    "accuracy": {
      "date": 0 to 100,
      "shift": 0 to 100,
      "employee_number": 0 to 100,
      "operation_code": 0 to 100,
      "machine_number": 0 to 100,
      "work_order_number": 0 to 100,
      "quantity_produced": 0 to 100,
      "time_taken": 0 to 100
    }
  }
]
Rules:
- Always return an array even if only one record exists
- Use null for fields that cannot be read
- Be honest about accuracy scores
- Return ONLY the JSON array, no extra text
"""

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_from_image(image_path: str) -> list:
    try:
        base64_image = encode_image(image_path)

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": EXTRACTION_PROMPT
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048,
            temperature=0.1
        )

        text = response.choices[0].message.content.strip()
        print("GROQ RESPONSE:", text)

        text = re.sub(r"```json", "", text)
        text = re.sub(r"```", "", text)
        text = text.strip()

        # Try array first
        array_match = re.search(r'\[.*\]', text, re.DOTALL)
        if array_match:
            parsed = json.loads(array_match.group())
            if isinstance(parsed, list):
                return parsed

        # Fallback single object
        obj_match = re.search(r'\{.*\}', text, re.DOTALL)
        if obj_match:
            return [json.loads(obj_match.group())]

        return []

    except Exception as e:
        print(f"OCR Error: {e}")
        return []