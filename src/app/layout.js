import "./globals.css";
import "@fontsource-variable/inter";

export const metadata = {
  title: "Prueba - Ketzai",
  description: "Desafío; Planes de Estudio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
