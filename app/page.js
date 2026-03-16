'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pb-10">
      
      <header className="w-full bg-blue-900 text-white py-8 px-4 shadow-lg mb-8 text-center rounded-b-[3rem]">
        <h1 className="text-2xl font-black tracking-tighter uppercase font-sans">Portal AJVALENZ</h1>
        <p className="text-blue-300 text-[10px] font-bold mt-1 tracking-[0.3em] uppercase">IT Security Management</p>
      </header>

      <div className="w-full max-w-sm px-6 space-y-4">
        
        {/* BOTÓN REGISTRO */}
        <Link href="/registro" className="block w-full mb-8">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-3xl shadow-xl transition-all active:scale-95 flex flex-col items-center border-b-8 border-blue-800">
            <span className="text-4xl mb-2">📝</span>
            <span className="text-lg uppercase">Registrar Turno</span>
          </button>
        </Link>

        <div className="py-2 flex items-center justify-center">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Reportes de Gestión</span>
        </div>

        {/* LOS 4 BOTONES DE LISTADOS */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/listados?ver=fecha">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <span className="mr-4 text-xl">📅</span> Listado por Fecha
            </button>
          </Link>

          <Link href="/listados?ver=guardia">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <span className="mr-4 text-xl">👮</span> Listado por Guardia
            </button>
          </Link>

          <Link href="/listados?ver=instalacion">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <span className="mr-4 text-xl">🏢</span> Listado por Instalación
            </button>
          </Link>

          <Link href="/listados?ver=gestion">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <span className="mr-4 text-xl">👔</span> Listado Gestionado Por...
            </button>
          </Link>
        </div>

      </div>

      <footer className="mt-12 opacity-30 font-black text-[9px] uppercase tracking-[0.5em]">
        AJVALENZ &bull; 2026
      </footer>
    </main>
  )
}