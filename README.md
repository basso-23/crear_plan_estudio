# 📘 Generador de Planes de Estudio desde PDFs

Este repositorio contiene una aplicación web que permite subir archivos PDF, extraer su contenido y generar planes de estudio personalizados utilizando la API de OpenAI. La herramienta ofrece una forma sencilla y automatizada de transformar documentos en planes estructurados que puedes descargar y visualizar.

## 🚀 Funcionalidades

- **Subida de archivos PDF**: El usuario puede subir uno o varios archivos PDF desde la interfaz web.
- **Extracción de contenido**: El texto del PDF es procesado y preparado para su análisis.
- **Generación de plan de estudio con OpenAI**: El contenido extraído es enviado a la API de OpenAI junto con una instrucción para crear un plan de estudio en un formato específico.
- **Visualización de resultados**: Se generan uno o varios archivos JSON con los planes de estudio, los cuales se pueden:
  - Descargar individualmente.
  - Combinar varios en un solo archivo JSON.
  - Visualizar en formato de tabla según el JSON seleccionado.

## 🖼️ Ejemplo de flujo de uso

1. Subes un archivo PDF.
2. El sistema extrae la información del documento.
3. Se envía a OpenAI para generar el plan de estudio.
4. Visualizas los planes en una tabla dinámica.
5. Descargas el plan como JSON individual o combinado.

## 🧰 Tecnologías utilizadas

- **Frontend**: (Ejemplo: React, Vue, HTML/CSS)
- **Backend**: (Ejemplo: Node.js, Flask, Django)
- **API**: OpenAI GPT
- **Otros**: (PDF.js, pandas, etc.)

### Resultados
[Descargar archivo planes_espanol.json](https://drive.google.com/file/d/1qdWSe-YOQFrfTLqevPudFhbKqNjGW1cq/view?usp=sharing).
![Alt text](https://i.imgur.com/vVxn1Qc.png)
