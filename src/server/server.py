from fastapi import FastAPI, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
import io
import os
from openai import OpenAI
from dotenv import load_dotenv

# ================================
# Cargar variables de entorno desde .env
# ================================
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ================================
# Configurar FastAPI y CORS
# ================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Cambia esto si tu frontend tiene otro origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# SECCIÓN 1: API de Extracción de Texto desde PDF
# ================================
@app.post("/extract_text")
def extract_text(file: UploadFile = File(...)):
    try:
        pdf_data = file.file.read()
        with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
            extracted_text = ""
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                extracted_text += f"\n--- Página {i + 1} ---\n"
                if text:
                    extracted_text += text + "\n"
                else:
                    extracted_text += "[Página sin texto detectable]\n"
        return JSONResponse(content={"text": extracted_text})
    except Exception as e:
        return JSONResponse(status_code=400, content={"message": f"Error al procesar el archivo PDF: {str(e)}"})

# ================================
# SECCIÓN 2: API de OpenAI para sugerencias de platillos
# ================================
@app.post("/recipes")
async def get_recipes(ingredient: dict = Body(...)):
    try:
        prompt = f"Dame 5 platillos que se pueden preparar con {ingredient['name']}."

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )

        text = response.choices[0].message.content
        return JSONResponse(content={"recipes": text})

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error al consultar OpenAI: {str(e)}"})
