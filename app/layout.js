import './globals.css'

export const metadata = {
  title: 'Control de Turnos - AJVALENZ',
  description: 'Sistema de Gestión IT Security',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased relative min-h-screen bg-slate-50">
        
        {/* 1. LOGO EN LA ESQUINA SUPERIOR IZQUIERDA */}
        <div className="fixed top-5 left-5 z-50 pointer-events-none print:hidden">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-10 w-auto opacity-80"
          />
        </div>

        {/* 2. MARCA DE AGUA DE FONDO */}
        <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden print:hidden">
          <img 
            src="/logo.png" 
            alt="" 
            className="w-[70%] max-w-2xl opacity-[0.03] grayscale -rotate-12"
          />
        </div>

        {/* 3. CONTENIDO (ENCIMA DE TODO) */}
        <div className="relative z-10">
          {children}
        </div>

      </body>
    </html>
  )
}