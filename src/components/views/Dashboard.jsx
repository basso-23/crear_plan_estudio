"use client";
import { useState } from "react";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert("Por favor, selecciona un archivo PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      // Enviar el archivo al servidor de FastAPI
      const response = await fetch("http://127.0.0.1:8000/extract_text", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text); // Mostrar el texto extraído en consola y en la interfaz
        console.log(data.text); // Mostrar el texto extraído en consola
      } else {
        console.error("Error al extraer el texto:", await response.text());
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
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
        <pre>{extractedText}</pre>{" "}
        {/* Muestra el texto extraído en la interfaz */}
      </div>
    </div>
  );
}
