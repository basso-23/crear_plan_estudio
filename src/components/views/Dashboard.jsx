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
    const selected = jsonObtained.filter((item) =>
      activeJson.includes(item.id)
    );

    if (selected.length === 0) {
      alert("No hay archivos seleccionados");
      return;
    }

    try {
      const combined = selected.map((item) => JSON.parse(item.json));

      const blob = new Blob([JSON.stringify(combined, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "planes_espanol.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al combinar JSON:", error);
      alert("Ocurrió un error al procesar los archivos seleccionados.");
    }
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

      <div className="mt-20 font-semibold">
        JSON seleccionado ({activeJson.length})
      </div>
      {/* Mostrar cada JSON como un rectángulo con el nombre del archivo */}
      <div className="json-rectangles-container flex flex-wrap gap-4 mt-5">
        {jsonObtained.map((item) => {
          const isActive = activeJson.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => toggleJsonSelection(item.id)}
              className={`transition-all cursor-pointer flex gap-3 items-center justify-center
                ${isActive ? "active-json" : "inactive-json"}`}
            >
              <div className="json-image"></div>
              <div>
                <div className="text-center break-words">{item.fileName}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className=" flex gap-4 mt-10">
        {/* Botón para ver el contenido de los seleccionados */}
        <button
          className={` tabla-btn
                ${activeJson.length != 0 ? "" : "pointer-events-none"}`}
          onClick={handleViewSelected}
        >
          Ver tabla
        </button>

        <button
          className={`submit-btn
                ${
                  activeJson.length != 0 ? "" : "opacity-50 pointer-events-none"
                }`}
          onClick={handleViewSelected}
        >
          Descargar
        </button>
      </div>

      <div className="mt-96">tabla abajo</div>
    </div>
  );
}
