'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PlusCircle, Trash2, LayoutDashboard, Save, FolderPlus, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [nominados, setNominados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [nuevaCat, setNuevaCat] = useState('')
  
  const [form, setForm] = useState({
    titulo: '',
    url_media: '',
    tipo: 'video',
    categoria_id: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: catData } = await supabase.from('categorias').select('*')
    const { data: nomData } = await supabase.from('clips').select('*, categorias(nombre)')
    if (catData) setCategorias(catData)
    if (nomData) setNominados(nomData)
  }

  // Crear nueva categoría
  const crearCategoria = async () => {
    if (!nuevaCat) return
    const { error } = await supabase.from('categorias').insert([{ nombre: nuevaCat }])
    if (!error) {
      setNuevaCat('')
      loadData()
    }
  }

  // Guardar Nominado
  const guardarNominado = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('clips').insert([form])
    if (error) alert("Error: " + error.message)
    else {
      setForm({ ...form, titulo: '', url_media: '' })
      loadData()
    }
    setLoading(false)
  }

  // Borrar Nominado
  const borrarNominado = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar este nominado?")) {
      await supabase.from('clips').delete().eq('id', id)
      loadData()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-10 text-white space-y-12">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <LayoutDashboard className="text-yellow-500" size={40} />
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA 1: GESTIÓN DE CATEGORÍAS */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FolderPlus size={20} className="text-yellow-500" /> Categorías
            </h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 bg-black border border-slate-800 p-2 rounded-lg text-sm outline-none focus:border-yellow-500"
              />
              <button onClick={crearCategoria} className="bg-yellow-500 text-black px-4 rounded-lg font-bold">＋</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categorias.map(c => (
                <div key={c.id} className="text-xs bg-black/50 p-2 rounded border border-slate-800 flex justify-between uppercase font-bold">
                  {c.nombre}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: FORMULARIO NOMINADOS */}
        <div className="lg:col-span-2">
          <form onSubmit={guardarNominado} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PlusCircle size={20} className="text-yellow-500" /> Añadir Nominado
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Categoría</label>
                <select 
                  className="w-full bg-black border border-slate-800 p-3 rounded-xl focus:border-yellow-500 outline-none"
                  value={form.categoria_id}
                  onChange={(e) => setForm({...form, categoria_id: e.target.value})}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">Título del Clip/Arte</label>
                <input 
                  type="text"
                  className="w-full bg-black border border-slate-800 p-3 rounded-xl focus:border-yellow-500 outline-none"
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">Tipo</label>
              <div className="flex gap-4">
                {['video', 'foto', 'texto'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({...form, tipo: t as any})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                      form.tipo === t ? 'bg-yellow-500 text-black border-yellow-500' : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">URL del Media</label>
              <input 
                type="text"
                placeholder="https://..."
                className="w-full bg-black border border-slate-800 p-3 rounded-xl focus:border-yellow-500 outline-none"
                value={form.url_media}
                onChange={(e) => setForm({...form, url_media: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Guardar Nominado</>}
            </button>
          </form>
        </div>
      </div>

      {/* TABLA DE GESTIÓN RÁPIDA */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              <th className="p-4">Categoría</th>
              <th className="p-4">Nominado</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {nominados.map(n => (
              <tr key={n.id} className="border-t border-slate-800 hover:bg-white/5 transition-colors">
                <td className="p-4 text-yellow-500 font-bold uppercase">{n.categorias?.nombre}</td>
                <td className="p-4 font-bold">{n.titulo}</td>
                <td className="p-4 italic text-slate-400">{n.tipo}</td>
                <td className="p-4 text-right">
                  <button onClick={() => borrarNominado(n.id)} className="text-red-500 hover:text-red-400 p-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}