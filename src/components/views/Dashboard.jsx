"use client";
import { useState } from "react";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [recipes, setRecipes] = useState("");

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
        console.error("Error al extraer texto:", await response.text());
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!ingredient.trim()) return alert("Por favor, ingresa un ingrediente");

    try {
      const response = await fetch("http://127.0.0.1:8000/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ingredient }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes);
      } else {
        console.error("Error al obtener recetas:", await response.text());
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
        <pre>{extractedText}</pre>
      </div>

      <hr style={{ margin: "40px 0", borderColor: "#555" }} />

      <h1>Buscar recetas por ingrediente</h1>
      <form onSubmit={handleRecipeSubmit}>
        <input
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="Ej: tomate"
          className="text-input"
        />
        <button type="submit">Buscar recetas</button>
      </form>

      <div>
        <h2>Recetas sugeridas:</h2>
        <pre>{recipes}</pre>
      </div>
    </div>
  );
}
