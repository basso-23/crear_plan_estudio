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

ALLOW_ORIGIN_URL = os.getenv("ALLOW_ORIGIN_URL")    
ALLOW_ORIGIN_PORT = os.getenv("ALLOW_ORIGIN_PORT")   

builded_url = f"http://{ALLOW_ORIGIN_URL}:{ALLOW_ORIGIN_PORT}"
default_url1 = "http://localhost:3000"
default_url2 = f"http://localhost:{ALLOW_ORIGIN_PORT}"

# ================================
# Configurar FastAPI y CORS
# ================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[builded_url, default_url1, default_url2], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# Extrae la informacion del PDF para luego mandarla a la API de openai
# ================================
@app.post("/process_pdf")
async def process_pdf(file: UploadFile = File(...)):
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

        # Contexto para el modelo
        prompt = f"""
        Quiero que conviertas los texto que te doy a un JSON con el siguiente formato:

        Los textos van a ser planes de estudios de diferentes grados de educacion y asignaturas así que ten eso en cuenta al momento de ordenar la información.

        Formato del JSON:
        Debes incluir la clave "grado" con el nivel de grado del programa, siempre poner "grado" seguido del nivel. Es decir si el grado es octavo deberia ir octavo grado. no octavo solo.
        Debes incluir la clave "areas" que contendrá una lista de áreas de aprendizaje.
        Debes incluir la clave "ano" que contendrá el año al que pertenece el plan de estudio.

        Para cada área de aprendizaje, debes incluir:

        "nombre": El nombre del área.
        "objetivos": Una lista con los objetivos específicos del área.
        "contenidos": Una lista con los contenidos de cada tema (puede ser una lista de objetos con los siguientes atributos):
            "tema": El nombre del tema.
            "conceptual": Explicación conceptual del tema.
            "procedimental": Actividades o procedimientos asociados al tema.
            "actitudinal": Actitudes o valores relacionados con el tema.
            "indicadores": Lista de indicadores o competencias asociadas al tema.
            "actividades": Actividades relacionadas con el tema.

        Instrucciones:

        Si el archivo contiene varias áreas o secciones, asegúrate de dividir la información correctamente.

        Cada área debe ser tratada por separado, con su nombre, objetivos, contenidos, actividades, etc.

        El formato debe ser coherente, sin saltos de formato, y estructurado correctamente.

        Evita los errores de formato como los signos de puntuación fuera de lugar, comillas faltantes o desajustes en las listas de actividades o indicadores.

        Errores a evitar:

        No deben faltar las claves principales del JSON como "grado", "areas", "ano", "nombre", "objetivos", "contenidos", etc.

        Los valores de las claves deben estar completos y no deben estar vacíos o nulos.

        Si en el archivo hay errores de transcripción o secciones ilegibles, intenta hacer una estimación coherente en base al contexto, sin embargo siempre prioriza escribir la informacion tal cual como indica el texto.

        Evita duplicar áreas o temas dentro de un mismo nivel, es decir, cada área debe ser única.

        Importante: Todos los non-whitespace character eliminalos antes de darme la respuesta.

        Aquí está el texto que debes convertir a JSON:

        {extracted_text}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",  
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        # Extrae la respuesta del modelo
        text = response.choices[0].message.content

        # Elimina los delimitadores de código (```json ... ```)
        clean_text = text.strip("```json").strip("```").strip()

        return JSONResponse(content={"json": clean_text, "text": extracted_text})

    except Exception as e:
        if "context_length_exceeded" in str(e):
            return JSONResponse(status_code=400, content={"message": "El texto excede el límite de tokens de OpenAI. Por favor, reduce el tamaño del texto."})
        return JSONResponse(status_code=500, content={"message": f"Error al procesar el archivo PDF: {str(e)}"})
