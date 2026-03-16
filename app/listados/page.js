'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ListadoPage() {
  return (
    <Suspense fallback={<p className="text-center py-20 font-bold uppercase">Iniciando Reportes...</p>}>
      <ListadoTurnos />
    </Suspense>
  )
}

function ListadoTurnos() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modoFiltro = searchParams.get('ver')

  const [turnos, setTurnos] = useState([])
  const [opciones, setOpciones] = useState([]) 
  const [seleccion, setSeleccion] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/get-turnos')
      .then(res => res.json())
      .then(data => {
        setTurnos(data)
        let campo = modoFiltro === 'guardia' ? 'nombre' : modoFiltro === 'fecha' ? 'fecha' : modoFiltro === 'instalacion' ? 'instalacion' : modoFiltro === 'gestion' ? 'gestionado_por' : ''
        if (campo) {
          const unicos = [...new Set(data.map(t => t[campo]))].filter(Boolean)
          setOpciones(unicos.sort())
        }
        setLoading(false)
      })
      .catch(() => { setTurnos([]); setLoading(false); })
  }, [modoFiltro])

  const turnosFiltrados = turnos.filter(t => !seleccion || (modoFiltro === 'guardia' && t.nombre === seleccion) || (modoFiltro === 'fecha' && t.fecha === seleccion) || (modoFiltro === 'instalacion' && t.instalacion === seleccion) || (modoFiltro === 'gestion' && t.gestionado_por === seleccion))

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-10 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto">
        
        {/* CABECERA */}
        <div className="bg-blue-900 p-6 rounded-t-3xl text-white flex justify-between items-center shadow-lg print:hidden">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Reporte General</h2>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Gestión de Turnos AJVALENZ</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-green-600 p-2 px-4 rounded-xl text-xs font-bold text-white shadow-md">🖨️ IMPRIMIR</button>
            <button onClick={() => router.push('/')} className="bg-blue-800 p-2 px-4 rounded-xl text-xs font-bold text-white">ATRÁS</button>
          </div>
        </div>

        {/* SELECTOR OPCIONAL */}
        <div className="bg-white p-4 shadow-md border-b print:hidden">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 italic">Filtrar información actual:</label>
          <select 
            className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            onChange={(e) => setSeleccion(e.target.value)}
          >
            <option value="">MOSTRAR TODO EL LISTADO GENERAL</option>
            {opciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* LISTADO DE TURNOS */}
        <div className="space-y-3 mt-4 print:mt-0">
          {loading ? (
            <p className="text-center py-20 text-gray-400 font-bold uppercase animate-pulse">Consultando registros...</p>
          ) : (
            turnosFiltrados.slice().reverse().map((turno, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-blue-600 print:rounded-none print:border-l-2 print:border-black print:border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase print:text-black">{turno.fecha}</span>
                    <h3 className="font-black text-gray-800 uppercase text-sm mt-1">{turno.nombre}</h3>
                    
                    {/* RUT VINCULADO (No guardado, solo mostrado) */}
                    <p className="text-[12px] font-black text-blue-700 uppercase mt-1 print:text-black">RUT: {turno.rut}</p>
                    <p className="text-[9px] font-bold text-gray-400">ID Guardia: {turno.id_guardia}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900">{turno.total_hrs}</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-[9px]">Horas Totales</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] border-t border-gray-100 pt-3">
                  <p><span className="text-gray-400 font-bold uppercase text-[9px] block mb-1">Instalación</span><span className="font-bold text-gray-700 uppercase">{turno.instalacion}</span></p>
                  <p><span className="text-gray-400 font-bold uppercase text-[9px] block mb-1">Motivo</span><span className="font-bold text-gray-700 uppercase">{turno.motivo}</span></p>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-50 flex justify-between items-center text-[9px] italic text-gray-400">
                  <span>Gestionado por: {turno.gestionado_por}</span>
                  <span className="font-black text-gray-600 uppercase not-italic">{turno.turno}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}