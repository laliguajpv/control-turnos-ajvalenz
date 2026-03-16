'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistroTurno() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Listas que vienen del Excel
  const [listas, setListas] = useState({ guardias: [], instalaciones: [], supervisores: [], motivos: [], turnos: [] })

  const [formData, setFormData] = useState({
    id_guardia: '', nombre: '', rut: '', fecha: '', turno: '', 
    hora_inicio: '', hora_fin: '', total_hrs: '0', motivo: '', 
    instalacion: '', gestionado_por: '', observaciones: '' // <-- Aquí está
  })

  // Cargar configuración desde Google Sheets
  useEffect(() => {
    fetch('/api/get-config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) { setListas(data); }
      })
      .catch(err => console.error("Error de conexión:", err))
  }, [])

  // Al elegir guardia, se busca su RUT automáticamente
  const handleGuardiaChange = (e) => {
    const nombreSel = e.target.value;
    const info = listas.guardias?.find(g => g.nombre === nombreSel);
    setFormData({ ...formData, nombre: nombreSel, rut: info ? info.rut : '' });
  }

  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  }

  // Cálculo automático de horas
  useEffect(() => {
    if (formData.hora_inicio && formData.hora_fin) {
      const inicio = new Date(formData.hora_inicio);
      const fin = new Date(formData.hora_fin);
      if (fin > inicio) {
        const diffHrs = ((fin - inicio) / (1000 * 60 * 60)).toFixed(1);
        setFormData(prev => ({ ...prev, total_hrs: diffHrs }));
      }
    }
  }, [formData.hora_inicio, formData.hora_fin])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/save-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) { 
      alert('✅ REGISTRO GUARDADO EXITOSAMENTE'); 
      router.push('/'); 
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-10 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="bg-blue-900 p-6 text-white text-center">
          <h2 className="text-xl font-bold uppercase tracking-widest">Ingreso Turno Extra</h2>
          {formData.rut && (
            <div className="mt-2 bg-blue-800 py-1 px-3 rounded-full inline-block border border-blue-400">
              <p className="text-[10px] font-black uppercase tracking-tighter">RUT Detectado: {formData.rut}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SECTOR ID Y NOMBRE */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">ID</label>
              <input type="number" name="id_guardia" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-gray-700 font-bold" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nombre Guardia</label>
              <select name="nombre" required onChange={handleGuardiaChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-gray-700">
                <option value="">Seleccione...</option>
                {listas.guardias?.map((g, i) => <option key={i} value={g.nombre}>{g.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* FECHA Y TURNO */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fecha</label>
              <input type="date" name="fecha" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Turno</label>
              <select name="turno" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-xs text-gray-700">
                <option value="">Seleccione...</option>
                {listas.turnos?.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* HORA INICIO Y FIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Inicio (Fecha/Hora)</label>
              <input type="datetime-local" name="hora_inicio" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-[10px] text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fin (Fecha/Hora)</label>
              <input type="datetime-local" name="hora_fin" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-[10px] text-gray-700" />
            </div>
          </div>

          {/* TOTAL HRS Y MOTIVO */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 text-center">
              <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Total Hrs</label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl font-black text-blue-900 text-lg">
                {formData.total_hrs}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Motivo</label>
              <select name="motivo" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-xs text-gray-700">
                <option value="">Seleccione...</option>
                {listas.motivos?.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* INSTALACIÓN */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Instalación</label>
            <select name="instalacion" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-xs text-gray-700">
              <option value="">Seleccione...</option>
              {listas.instalaciones?.map((ins, i) => <option key={i} value={ins}>{ins}</option>)}
            </select>
          </div>

          {/* GESTIONADO POR */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Gestionado Por</label>
            <select name="gestionado_por" required onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-xs font-bold text-gray-700">
              <option value="">Seleccione...</option>
              {listas.supervisores?.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          {/* OBSERVACIONES (¡YA VOLVÍ!) */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Observaciones / Detalles</label>
            <textarea 
              name="observaciones" 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-gray-700 h-20 text-xs" 
              placeholder="Escribe aquí cualquier detalle adicional..."
            ></textarea>
          </div>

          {/* BOTONES */}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => router.push('/')} className="w-1/3 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl uppercase text-[10px] hover:bg-gray-200 transition-all">Atrás</button>
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-2/3 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
            >
              {loading ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}