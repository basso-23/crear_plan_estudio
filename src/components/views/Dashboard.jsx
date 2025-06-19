"use client";
import { useRef, useState } from "react";
import { PiUploadSimpleThin } from "react-icons/pi";
import { RxUpdate } from "react-icons/rx";

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jsonObtained, setJsonObtained] = useState([]);
  const [activeJson, setActiveJson] = useState([]);
  const [tableData, setTableData] = useState([]);
  const fileInputRef = useRef();

  /// Manejo del form para subir PDF
  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Por favor, selecciona un archivo PDF");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);

    const PYTHON_SERVER_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;
    const PYTHON_SERVER_PORT = process.env.NEXT_PUBLIC_PYTHON_SERVER_PORT;

    let builded_url = `http://${PYTHON_SERVER_URL}:${PYTHON_SERVER_PORT}/process_pdf`;

    try {
      const response = await fetch(builded_url, {
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

  /// Guardar id de JSON seleccionado si no se encuentra; Quitar id de JSON seleccionado si ya se encuentra
  const toggleJsonSelection = (id) => {
    setActiveJson((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  /// Descargar JSONs seleccionado
  const downloadJson = () => {
    const selected = jsonObtained.filter((item) =>
      activeJson.includes(item.id)
    );

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

  /// Guarda los datos de los JSONs seleccionado en un solo JSON
  const saveTableData = () => {
    const selected = jsonObtained.filter((item) =>
      activeJson.includes(item.id)
    );
    const combined = selected.map((item) => JSON.parse(item.json));

    setTableData(combined);
    console.log(combined);
  };

  return (
    <div className="main-container">
      {/*//---- SUBIR PDF CONTAINER ---- */}
      <div className="upload-container mx-auto mt-20">
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
      <div className="text-[13px] w-[600px] mx-auto mt-3 font-medium">
        Nota: Según la cantidad de páginas puede tardar varios minutos.
      </div>

      {/*//---- JSONs OBTENIDOS CONTAINER ---- */}

      {jsonObtained.length > 0 && (
        <>
          <div className="mt-20 font-semibold">
            JSON seleccionado ({activeJson.length})
          </div>
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
                    <div className="text-center break-words">
                      {item.fileName}
                    </div>
                  </div>
                </button>
              );
            })}

            {jsonObtained.length === 0 ? (
              <button className="active-json invisible">
                <div>no json obtained</div>
              </button>
            ) : null}
          </div>
          <button
            className="submit-btn !mt-8"
            onClick={() => {
              if (activeJson.length > 0) {
                downloadJson();
              } else {
                alert("Selecciona un archivo JSON para descargar");
              }
            }}
          >
            Descargar
          </button>
        </>
      )}

      {/*//---- TABLA CONTAINER ---- */}
      {jsonObtained.length > 0 && (
        <>
          <div className="mt-20 font-semibold">
            Visualizando datos JSON en tabla
          </div>
          <div className="flex gap-4">
            <button
              className="tabla-btn"
              onClick={() => {
                if (activeJson.length > 0) {
                  saveTableData();
                } else {
                  alert("Selecciona un archivo JSON para mostar la tabla");
                }
              }}
            >
              Ver tabla
            </button>
          </div>
        </>
      )}
      {tableData.length > 0 && (
        <div className="mt-8 overflow-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Grado</th>
                <th className="border p-2">Año</th>
                <th className="border p-2">Área</th>
                <th className="border p-2">Objetivos</th>
                <th className="border p-2">Contenidos</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, i) =>
                item.areas.map((area, j) => (
                  <tr key={`${i}-${j}`} className="bg-white">
                    <td className="border p-2 align-top capitalize">
                      {item.grado}
                    </td>
                    <td className="border p-2 align-top capitalize">
                      {item.ano}
                    </td>
                    <td className="border p-2 align-top">{area.nombre}</td>
                    <td className="border p-2 align-top">
                      <ul className="list-disc ml-4">
                        {area.objetivos?.map((obj, k) => (
                          <li key={k}>{obj}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border p-2 align-top">
                      <ul className="list-disc mx-4">
                        {area.contenidos?.map((contenido, k) => (
                          <li key={k} className="list-none">
                            <div className="mt-8 bg-[#fdf9e0] tema-style ">
                              <strong>Tema:</strong> {contenido.tema}
                            </div>

                            <br />
                            <strong>Conceptual:</strong>
                            <ul className="list-disc list-inside">
                              {Array.isArray(contenido.conceptual) ? (
                                contenido.conceptual.map((linea, index) => (
                                  <li key={index}>{linea}</li>
                                ))
                              ) : (
                                <li>{contenido.conceptual}</li>
                              )}
                            </ul>
                            <br />
                            {contenido.procedimental && (
                              <>
                                <strong>Procedimental:</strong>

                                <ul className="list-disc list-inside">
                                  {Array.isArray(contenido.procedimental) ? (
                                    contenido.procedimental.map(
                                      (linea, index) => (
                                        <li key={index}>{linea}</li>
                                      )
                                    )
                                  ) : (
                                    <li>{contenido.procedimental}</li>
                                  )}
                                </ul>

                                <br />
                              </>
                            )}
                            {contenido.actitudinal && (
                              <>
                                <strong>Actitudinal:</strong>

                                <ul className="list-disc list-inside">
                                  {Array.isArray(contenido.actitudinal) ? (
                                    contenido.actitudinal.map(
                                      (linea, index) => (
                                        <li key={index}>{linea}</li>
                                      )
                                    )
                                  ) : (
                                    <li>{contenido.actitudinal}</li>
                                  )}
                                </ul>

                                <br />
                              </>
                            )}
                            {contenido.indicadores && (
                              <>
                                <strong>Indicadores:</strong>
                                <ul className="list-disc list-inside">
                                  {Array.isArray(contenido.indicadores) ? (
                                    contenido.indicadores.map(
                                      (linea, index) => (
                                        <li key={index}>{linea}</li>
                                      )
                                    )
                                  ) : (
                                    <li>{contenido.indicadores}</li>
                                  )}
                                </ul>
                                <br />
                              </>
                            )}
                            {contenido.actividades && (
                              <>
                                <strong>Actividades:</strong>
                                <ul className="list-disc list-inside">
                                  {Array.isArray(contenido.actividades) ? (
                                    contenido.actividades.map(
                                      (linea, index) => (
                                        <li key={index}>{linea}</li>
                                      )
                                    )
                                  ) : (
                                    <li>{contenido.actividades}</li>
                                  )}
                                </ul>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
