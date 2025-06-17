from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
import io

app = FastAPI()

# Configura CORS para permitir solicitudes desde http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permite solicitudes solo desde tu cliente Next.js
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)

@app.post("/extract_text")
def extract_text(file: UploadFile = File(...)):
    try:
        # Leer el archivo PDF desde el cliente
        pdf_data = file.file.read()  # Método síncrono .file.read()

        # Abrir el archivo PDF desde el contenido cargado
        with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
            extracted_text = ""
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                extracted_text += f"\n--- Página {i + 1} ---\n"
                if text:
                    extracted_text += text + "\n"
                else:
                    extracted_text += "[Página sin texto detectable]\n"

        # Regresar el texto extraído como respuesta
        return JSONResponse(content={"text": extracted_text})

    except Exception as e:
        return JSONResponse(status_code=400, content={"message": f"Error al procesar el archivo PDF: {str(e)}"})
