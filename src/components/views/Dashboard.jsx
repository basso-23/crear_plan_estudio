"use client";
import { useState } from "react";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [jsonResponse, setJsonResponse] = useState("");

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Por favor, selecciona un archivo PDF");

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/extract_text", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text);
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Mostrar el mensaje de error si lo hay
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // Función para enviar texto a la API de FastAPI para convertir a JSON
  const handleConvertTextToJson = async (e) => {
    e.preventDefault();
    if (!extractedText && !ingredient.trim())
      return alert("Por favor, ingresa texto o ingrediente");

    try {
      const response = await fetch("http://127.0.0.1:8000/convert_to_json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: extractedText || ingredient, // Enviar el texto extraído o el ingrediente ingresado
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJsonResponse(data.json); // Guardar la respuesta JSON
      } else {
        const errorData = await response.json();

        // Si el mensaje de error es debido a los tokens excedidos, solo mostramos la alerta
        if (
          errorData.message &&
          errorData.message.includes("El texto excede el límite de tokens")
        ) {
          alert(errorData.message); // Mostrar solo la alerta, no el error en consola
        } else {
          console.error("Error al convertir texto a JSON:", errorData.message);
          alert("Ocurrió un error inesperado, por favor intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Texto copiado al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
      });
  };

  return (
    <div>
      <h1>Sube un archivo PDF</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button type="submit">Enviar PDF</button>
      </form>

      <div>
        <h2>Texto extraído:</h2>
        <pre>{extractedText}</pre>
      </div>
      {extractedText && (
        <button className="my-6" onClick={() => copyToClipboard(extractedText)}>
          Copiar Texto Extraído
        </button>
      )}
      <hr style={{ margin: "40px 0", borderColor: "#555" }} />

      <h1>Convertir texto a JSON</h1>
      <form onSubmit={handleConvertTextToJson}>
        <textarea
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="Ej: Introduce texto o un ingrediente"
          className="text-input"
          rows={6} // Puedes ajustar el número de filas para que el textarea sea más grande
          cols={50} // Ajusta el ancho del textarea
        />
        <button type="submit" className="my-6">
          Convertir a JSON
        </button>
      </form>

      <div>
        <h2>Respuesta JSON:</h2>
        <pre>{jsonResponse}</pre>
        {jsonResponse && (
          <button
            className="my-6"
            onClick={() => copyToClipboard(jsonResponse)}
          >
            Copiar JSON
          </button>
        )}
      </div>
    </div>
  );
}
