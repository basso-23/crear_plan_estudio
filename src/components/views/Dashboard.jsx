"use client";
import { useRef, useState } from "react";
import { PiUploadSimpleThin } from "react-icons/pi";
import { RxUpdate } from "react-icons/rx";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jsonObtained, setJsonObtained] = useState([]);
  const [activeJson, setActiveJson] = useState([]);

  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Por favor, selecciona un archivo PDF");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/process_pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        setJsonObtained((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            fileName: pdfFile.name,
            json: data.json,
          },
        ]);

        setPdfFile(null);
        fileInputRef.current.value = "";
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJsonSelection = (id) => {
    setActiveJson((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleViewSelected = () => {
    const selectedJsons = jsonObtained.filter((item) =>
      activeJson.includes(item.id)
    );
    console.log("Contenido de JSON seleccionados:", selectedJsons);
  };

  return (
    <div className="main-container">
      <div className="upload-container mx-auto mt-32">
        <h1>Subir archivo</h1>
        <form onSubmit={handleSubmit}>
          <label className={loading ? "pointer-events-none" : ""}>
            <div className="flex flex-col items-center mt-9">
              <div className="add-icon">
                <PiUploadSimpleThin />
              </div>
              <span>Haz click para añadir un archivo pdf </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>

          <div className="w-full justify-between flex gap-4">
            {pdfFile ? (
              <div className="mt-4 text-center text-sm text-gray-700 ">
                Archivo seleccionado: <strong>{pdfFile.name}</strong>
              </div>
            ) : (
              <div className="mt-4 text-center text-sm text-gray-700 invisible">
                hidden
              </div>
            )}

            {loading ? (
              <button
                type="submit"
                className="pointer-events-none flex justify-center items-center gap-2 loading-btn"
              >
                <div className="animate-spin transition-all">
                  <RxUpdate />
                </div>
                Cargando...
              </button>
            ) : (
              <button type="submit" className="submit-btn">
                Convertir a JSON
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mostrar cada JSON como un rectángulo con el nombre del archivo */}
      <div className="json-rectanggles-container mt-20 flex flex-wrap gap-4">
        {jsonObtained.map((item) => {
          const isActive = activeJson.includes(item.id);

          return (
            <div key={item.id} className="flex flex-col gap-2">
              <div
                onClick={() => toggleJsonSelection(item.id)}
                className={`p-4 border rounded-md w-64 h-40 flex items-center justify-center shadow cursor-pointer transition
                ${
                  isActive
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-blue-50 text-blue-700 border-blue-400"
                }`}
              >
                <div className="text-center font-bold text-sm break-words">
                  {item.fileName}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón para ver el contenido de los seleccionados */}
      <div className="mt-10">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          onClick={handleViewSelected}
        >
          ver consola
        </button>
      </div>

      <div className="mt-96">tabla abajo</div>
    </div>
  );
}
