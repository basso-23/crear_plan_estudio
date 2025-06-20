# 📘 Generador de Planes de Estudio desde PDFs

Este repositorio contiene una aplicación web que permite subir archivos PDF, extraer su contenido y generar planes de estudio personalizados utilizando la API de OpenAI. La herramienta ofrece una forma sencilla y automatizada de transformar documentos en planes estructurados que puedes descargar y visualizar.

> [!NOTE]
> Para archivos con muchas páginas tardará unos 2:30 min aproximadamente; TODO: mejorar rendimiento

## 

![Alt text](https://i.imgur.com/vVxn1Qc.png)

## Funcionalidades

- **Subida de archivos PDF**: El usuario puede subir archivos PDF desde la interfaz web.
- **Extracción de contenido**: El texto del PDF es procesado y preparado para su análisis.
- **Generación de plan de estudio con OpenAI**: El contenido extraído es enviado a la API de OpenAI junto con una instrucción para crear un plan de estudio en un formato específico.
- **Visualización de resultados**: Se generan los archivos JSON con los planes de estudio, los cuales se pueden:
  - Descargar individualmente o agrupados en un solo archivo JSON.
  - Visualizar en formato de tabla uno o más archivos JSON dependiendo de cuales esten seleccionados.

## Ejemplo de flujo de uso

1. Subes un archivo PDF.
2. El sistema extrae la información del documento.
3. Se envía a OpenAI para generar el plan de estudio.
4. Seleccionas los archivos JSON generados.
5. Descargas el plan como JSON individual o combinado.
6. Visualizas los planes en una tabla.

## Razonamiento

El desarrollo del proyecto comenzó con una planificación general de los pasos necesarios para alcanzar el objetivo final. El primer reto fue la **extracción de datos desde archivos PDF**, para eso utilice la librería **`pdfplumber`** de Python, para manejar contenido estructurado dentro de archivos PDF.

Sin embargo, existía otro problema: **cada PDF puede tener una estructura completamente distinta**, lo que hace imposible asumir un formato estándar o posiciones fijas para la información relevante.

Para abordar este problema, la opcion mas eficiente fue **delegar el análisis y estructuración del contenido a un LLM**, utilizando la API de OpenAI. Utilice el modelo **GPT-4.1-mini**, por su capacidad de manejar un mayor número de tokens, lo que nos permite enviar grandes volúmenes de texto en una sola solicitud para obtener una estructura coherente del plan de estudio.

Una vez que ya teníamos las piezas principales del proyecto, solo restaba realizar la conexión entre el backend y el frontend, y estructurar la información obtenida de la API.

## Tecnologías Utilizadas

- **Python + FastAPI**: Se utilizó para construir el backend del proyecto, encargado de la lógica de extracción, procesamiento y comunicación con la API de OpenAI.
- **pdfplumber**: Librería utilizada para extraer texto de los PDFs de forma precisa.
- **OpenAI API (GPT-4.1-mini)**: Procesa el contenido extraído para estructurar automáticamente el plan de estudio.
- **Next.js**: Framework usado en el frontend para crear una interfaz interactiva que se comunica con el backend.

## Resultados

- [Descargar planes_espanol.json](https://drive.google.com/file/d/1qdWSe-YOQFrfTLqevPudFhbKqNjGW1cq/view?usp=sharing)


