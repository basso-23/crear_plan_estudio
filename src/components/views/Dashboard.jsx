"use client";
import { useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [jsonResponse, setJsonResponse] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Por favor, selecciona un archivo PDF");

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/process_pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text); // Texto extraído del PDF
        setJsonResponse(data.json); // JSON generado por OpenAI
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="upload-container mx-auto mt-32">
        <h1>Subir archivo</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <div className="add-icon">
              <IoAddCircleOutline />
            </div>
            <span>Click para añadir un archivo</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
          <button type="submit">Enviar PDF</button>
        </form>

        {jsonResponse && (
          <div>
            <pre>data descargada</pre>
          </div>
        )}
      </div>

      <div className=" mt-96">tabla abajo</div>
    </div>
  );
}
