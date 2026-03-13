'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PlusCircle, Trash2, LayoutDashboard, Save, FolderPlus, Loader2, Upload, Film, Eye, EyeOff } from 'lucide-react'

// 1. LISTA DE ADMINISTRADORES ACTUALIZADA
const ADMIN_WHITELIST = [
  "j.luisestrada98@gmail.com", 
  "indira.cachay9@gmail.com",
  "thesoul986@gmail.com",
  "elviscocho1998op@gmail.com"
];

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [categorias, setCategorias] = useState<any[]>([])
  const [nominados, setNominados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [nuevaCat, setNuevaCat] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [resultadosPublicos, setResultadosPublicos] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    url_media: '',
    tipo: 'video' as 'video' | 'foto' | 'texto',
    categoria_id: ''
  })

  useEffect(() => {
    checkUser()
    loadData()
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const { data } = await supabase.from('config_gala').select('*').eq('id', 'main_config').single();
    if (data) setResultadosPublicos(data.resultados_publicos);
  };

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setAuthLoading(false)
  }

  async function loadData() {
    const { data: catData } = await supabase.from('categorias').select('*')
    const { data: nomData } = await supabase.from('clips').select('*, categorias(nombre)')
    if (catData) setCategorias(catData)
    if (nomData) setNominados(nomData)
  }

  const crearCategoria = async () => {
    if (!nuevaCat) return
    const { error } = await supabase.from('categorias').insert([{ nombre: nuevaCat }])
    if (!error) {
      setNuevaCat('')
      loadData()
    }
  }

  const toggleResultados = async () => {
    const nuevoEstado = !resultadosPublicos;
    const { error } = await supabase
      .from('config_gala')
      .update({ resultados_publicos: nuevoEstado })
      .eq('id', 'main_config');

    if (!error) setResultadosPublicos(nuevoEstado);
    else alert("Error al cambiar visibilidad: " + error.message);
  };

  const guardarNominado = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let finalUrl = form.url_media

    if (form.tipo !== 'texto' && file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file)

      if (uploadError) {
        alert("Error al subir archivo: " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName)
      finalUrl = publicUrl
    }

    const { error } = await supabase.from('clips').insert([{
      titulo: form.titulo,
      tipo: form.tipo,
      categoria_id: form.categoria_id,
      url_media: finalUrl
    }])

    if (error) alert("Error en DB: " + error.message)
    else {
      setForm({ ...form, titulo: '', url_media: '' })
      setFile(null)
      loadData()
    }
    setLoading(false)
  }

  const borrarNominado = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar este nominado?")) {
      await supabase.from('clips').delete().eq('id', id)
      loadData()
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-[0.3em] animate-pulse">Verificando Credenciales...</div>

  // 2. CORRECCIÓN CRÍTICA: Ahora verifica si el correo está en la lista permitida
  if (!user || !ADMIN_WHITELIST.includes(user.email)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10 text-center">
        <div className="bg-slate-900 p-12 rounded-[3rem] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <h1 className="text-5xl font-black mb-4 italic uppercase tracking-tighter text-red-500">Acceso Denegado</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm text-balance">Esta zona es exclusiva para los organizadores WSP.</p>
          <p className="text-slate-700 text-[10px] mt-4 font-mono">ID: {user?.email || "No identificado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-10 text-white space-y-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <LayoutDashboard className="text-black" size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Panel</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Sistema de Control Gala WSP</p>
            </div>
        </div>

        {/* INTERRUPTOR DE RESULTADOS */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex items-center gap-6">
            <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Estado Resultados</p>
                <p className={`text-xs font-bold uppercase ${resultadosPublicos ? 'text-green-500' : 'text-red-500'}`}>
                    {resultadosPublicos ? 'Visibles al público' : 'Ocultos al público'}
                </p>
            </div>
            <button 
                onClick={toggleResultados}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${
                    resultadosPublicos ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                }`}
            >
                {resultadosPublicos ? <><EyeOff size={14}/> Bloquear</> : <><Eye size={14}/> Revelar</>}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* GESTIÓN DE CATEGORÍAS */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase italic text-yellow-500">
              <FolderPlus size={20} /> Categorías
            </h2>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 bg-black border border-slate-800 p-3 rounded-xl text-xs outline-none focus:border-yellow-500 transition-all font-bold"
              />
              <button onClick={crearCategoria} className="bg-yellow-500 text-black px-5 rounded-xl font-black hover:bg-yellow-400 transition-colors">＋</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {categorias.map(c => (
                <div key={c.id} className="text-[10px] bg-black/40 p-3 rounded-xl border border-slate-800/50 flex justify-between items-center uppercase font-black tracking-tight text-slate-300">
                  {c.nombre}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FORMULARIO NOMINADOS */}
        <div className="lg:col-span-2">
          <form onSubmit={guardarNominado} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <PlusCircle size={120} />
            </div>

            <h2 className="text-xl font-bold flex items-center gap-2 uppercase italic text-yellow-500">
              <PlusCircle size={20} /> Nuevo Nominado
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Categoría</label>
                <select 
                  className="w-full bg-black border border-slate-800 p-4 rounded-2xl focus:border-yellow-500 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                  value={form.categoria_id}
                  onChange={(e) => setForm({...form, categoria_id: e.target.value})}
                  required
                >
                  <option value="">Seleccionar Categoria...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Título de la Nominación</label>
                <input 
                  type="text"
                  placeholder="Ej: El mejor clip del año"
                  className="w-full bg-black border border-slate-800 p-4 rounded-2xl focus:border-yellow-500 outline-none text-sm font-bold transition-all"
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2 text-center block">¿Qué tipo de contenido es?</label>
              <div className="flex gap-3">
                {['video', 'foto', 'texto'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setForm({...form, tipo: t as any})
                      setFile(null)
                    }}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all active:scale-95 ${
                      form.tipo === t ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2 block">
                {form.tipo === 'texto' ? 'Contenido del Texto' : 'Archivo Multimedia'}
              </label>
              
              {form.tipo === 'texto' ? (
                <textarea 
                  className="w-full bg-black border border-slate-800 p-5 rounded-3xl focus:border-yellow-500 outline-none text-sm font-medium min-h-[120px] transition-all"
                  placeholder="Escribe la frase o el texto aquí..."
                  value={form.url_media}
                  onChange={(e) => setForm({...form, url_media: e.target.value})}
                  required
                />
              ) : (
                <div className="relative group">
                    <input 
                        type="file" 
                        id="file-input"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept={form.tipo === 'video' ? 'video/*' : 'image/*'}
                    />
                    <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4 border-2 border-dashed border-slate-800 rounded-[2rem] p-10 bg-black/40 group-hover:border-yellow-500/50 transition-all">
                        <div className="bg-slate-800 p-4 rounded-full group-hover:bg-yellow-500 group-hover:text-black transition-all">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-black uppercase tracking-widest text-white">
                                {file ? file.name : "Seleccionar Archivo"}
                            </span>
                            <p className="text-[10px] text-slate-600 font-bold mt-1">Máximo 50MB (Recomendado)</p>
                        </div>
                    </label>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full font-black py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs ${
                    loading ? 'bg-slate-800 text-slate-500' : 'bg-white text-black hover:bg-yellow-500 active:scale-95 shadow-xl hover:shadow-yellow-500/20'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={24}/> : <><Save size={20}/> Publicar en la Gala</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* LISTADO DE NOMINADOS */}
      <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-8 bg-black/50 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Nominados Registrados
          </h2>
          <span className="text-[10px] font-black bg-slate-800 px-4 py-1.5 rounded-full text-slate-400">Total: {nominados.length}</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-950/30">
                <th className="p-6">Categoría</th>
                <th className="p-6">Nominado</th>
                <th className="p-6">Tipo</th>
                <th className="p-6 text-right">Acción</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {nominados.map(n => (
                <tr key={n.id} className="border-t border-slate-800/50 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                        <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border border-yellow-500/20">
                            {n.categorias?.nombre}
                        </span>
                    </td>
                    <td className="p-6 font-bold uppercase italic tracking-tight text-white">{n.titulo}</td>
                    <td className="p-6">
                        <span className="text-slate-500 font-mono text-[10px] uppercase bg-black px-3 py-1 rounded-md border border-slate-800">
                            {n.tipo}
                        </span>
                    </td>
                    <td className="p-6 text-right">
                    <button 
                        onClick={() => borrarNominado(n.id)} 
                        className="text-slate-600 hover:text-red-500 p-3 hover:bg-red-500/10 rounded-2xl transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                    </td>
                </tr>
                ))}
                {nominados.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs">No hay nominados todavía</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}