'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistroTurno() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [listas, setListas] = useState({ guardias: [], instalaciones: [], supervisores: [], motivos: [], turnos: [] })
  const [formData, setFormData] = useState({ id_guardia: '', nombre: '', fecha: '', turno: '', hora_inicio: '', hora_fin: '', total_hrs: '0', motivo: '', instalacion: '', gestionado_por: '', observaciones: '' })

  useEffect(() => {
    fetch('/api/get-config').then(res => res.json()).then(data => { if (!data.error) setListas(data) })
  }, [])

  const handleGuardiaChange = (e) => {
    const nombreSel = e.target.value;
    const info = listas.guardias?.find(g => g.nombre === nombreSel);
    setFormData({ ...formData, nombre: nombreSel, id_guardia: info ? info.id : '' });
  }

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/save-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) { alert('✅ REGISTRO GUARDADO'); router.push('/'); }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border">
        <div className="bg-blue-900 p-6 text-white text-center">
          <h2 className="font-bold uppercase tracking-widest italic">Ingreso Turno Extra</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase">ID</label>
              <input type="text" value={formData.id_guardia} readOnly className="w-full p-3 bg-gray-100 border rounded-xl font-bold" placeholder="---" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase">Guardia</label>
              <select name="nombre" required onChange={handleGuardiaChange} className="w-full p-3 bg-gray-50 border rounded-xl text-sm font-bold">
                <option value="">Seleccione...</option>
                {listas.guardias?.map((g, i) => <option key={i} value={g.nombre}>{g.nombre}</option>)}
              </select>
            </div>
          </div>
          {/* Aquí van los demás campos (Fecha, Turno, etc.) que ya tenías y funcionaban bien */}
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">
            {loading ? 'ENVIANDO...' : 'GUARDAR REGISTRO'}
          </button>
        </form>
      </div>
    </main>
  )
}