'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  PlusCircle, 
  Trash2, 
  LayoutDashboard, 
  Save, 
  FolderPlus, 
  Loader2, 
  Upload, 
  Eye, 
  EyeOff,
  Plus,
  Users, // Icono para los votantes
  X, // Icono para cerrar
  Filter // NUEVO: Icono para el filtro
} from 'lucide-react'

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
  
  // NUEVOS ESTADOS PARA VOTANTES
  const [votantes, setVotantes] = useState<any[]>([])
  const [mostrarVotantes, setMostrarVotantes] = useState(false)
  const [loadingVotantes, setLoadingVotantes] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('') // NUEVO: Estado para filtrar

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
    const { data: catData } = await supabase.from('categorias').select('*').order('nombre')
    const { data: nomData } = await supabase.from('clips').select('*, categorias(nombre)')
    if (catData) setCategorias(catData)
    if (nomData) setNominados(nomData)
  }

  // FUNCIÓN PARA VER QUIÉN VOTÓ - ACTUALIZADA PARA TRAER CATEGORÍA
  const verVotantes = async () => {
    setLoadingVotantes(true)
    const { data, error } = await supabase
      .from('votos')
      .select(`
        nombre_votante,
        email_votante,
        created_at,
        clips ( 
          titulo,
          categorias ( nombre ) 
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVotantes(data)
      setMostrarVotantes(true)
    } else {
      alert("Error al cargar votantes: " + error?.message)
    }
    setLoadingVotantes(false)
  }

  // Lógica de filtrado en tiempo real
  const votantesFiltrados = filtroCategoria 
    ? votantes.filter(v => v.clips?.categorias?.nombre === filtroCategoria)
    : votantes;

  const crearCategoria = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nuevaCat.trim()) return;
    
    const { error } = await supabase.from('categorias').insert([{ nombre: nuevaCat.trim() }])
    if (!error) {
      setNuevaCat('')
      await loadData()
    } else {
      alert("Error: " + error.message)
    }
  }

  const toggleResultados = async () => {
    const nuevoEstado = !resultadosPublicos;
    const { error } = await supabase
      .from('config_gala')
      .update({ resultados_publicos: nuevoEstado })
      .eq('id', 'main_config');

    if (!error) setResultadosPublicos(nuevoEstado);
    else alert("Error: " + error.message);
  };

  const guardarNominado = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoria_id) return alert("Selecciona una categoría")
    setLoading(true)

    let finalUrl = form.url_media

    if (form.tipo !== 'texto' && file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file)

      if (uploadError) {
        alert("Error al subir: " + uploadError.message)
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

    if (error) alert("Error: " + error.message)
    else {
      setForm({ ...form, titulo: '', url_media: '' })
      setFile(null)
      loadData()
    }
    setLoading(false)
  }

  const borrarNominado = async (id: string) => {
    if (confirm("¿Eliminar este nominado?")) {
      await supabase.from('clips').delete().eq('id', id)
      loadData()
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white font-black uppercase tracking-[0.3em] animate-pulse">Cifrando Acceso...</div>

  if (!user || !ADMIN_WHITELIST.includes(user.email)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 md:p-10 text-center">
        <div className="bg-slate-900/50 p-8 md:p-12 rounded-[2.5rem] border border-red-500/30 w-full max-w-lg">
          <h1 className="text-4xl md:text-5xl font-black mb-4 italic uppercase text-red-500">Acceso Denegado</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Zona exclusiva para Staff WSP.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-10 pb-20 px-4 md:px-0">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER DE PANEL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 md:p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
              <div className="bg-yellow-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <LayoutDashboard className="text-black" size={28} />
              </div>
              <div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">Gala Control</h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Panel de Organización</p>
              </div>
          </div>

          <div className="flex flex-wrap gap-3">
              {/* BOTÓN NUEVO: VER VOTANTES */}
              <button 
                onClick={verVotantes}
                disabled={loadingVotantes}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-white text-black hover:bg-yellow-500 shadow-lg"
              >
                {loadingVotantes ? <Loader2 className="animate-spin" size={16}/> : <><Users size={16}/> Ver Votantes</>}
              </button>

              <button 
                  onClick={toggleResultados}
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${
                      resultadosPublicos ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                  }`}
              >
                  {resultadosPublicos ? <><EyeOff size={16}/> Ocultar Resultados</> : <><Eye size={16}/> Revelar Resultados</>}
              </button>
          </div>
        </div>

        {/* MODAL / SECCIÓN DE VOTANTES - ACTUALIZADA CON FILTRO */}
        {mostrarVotantes && (
          <div className="bg-slate-900/90 border border-yellow-500/50 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-yellow-500 font-black uppercase italic tracking-widest flex items-center gap-2">
                <Users size={20} /> Historial de Inteligencia (Votos Realizados)
              </h2>

              {/* SELECT DE FILTRADO */}
              <div className="flex items-center gap-3 bg-black/50 p-3 rounded-2xl border border-white/10 w-full md:w-auto">
                <Filter size={16} className="text-yellow-500" />
                <select 
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-transparent text-white text-[10px] font-black uppercase outline-none cursor-pointer pr-4"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre} className="bg-slate-900">{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <button onClick={() => setMostrarVotantes(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase text-slate-500 border-b border-white/10 font-black tracking-widest">
                    <th className="p-4">Categoría</th> {/* NUEVA COLUMNA */}
                    <th className="p-4">Votante</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Candidato Elegido</th>
                    <th className="p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] text-white font-bold">
                  {votantesFiltrados.map((v, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="text-yellow-500/50 text-[8px] uppercase font-black">
                          {v.clips?.categorias?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="p-4 uppercase italic text-yellow-500">{v.nombre_votante || 'Usuario Anónimo'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[9px]">{v.email_votante}</td>
                      <td className="p-4 uppercase">{v.clips?.titulo || 'Desconocido'}</td>
                      <td className="p-4 text-slate-500 text-[9px]">{new Date(v.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {votantesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-500 uppercase italic">No se encontraron votos con este filtro.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* COLUMNA CATEGORÍAS */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border border-white/5">
              <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase italic text-yellow-500">
                <FolderPlus size={18} /> Categorías
              </h2>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={nuevaCat}
                  onChange={(e) => setNuevaCat(e.target.value)}
                  placeholder="Nombre..."
                  className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-yellow-500 transition-all font-bold text-white min-w-0"
                />
                <button 
                  type="button"
                  onClick={crearCategoria} 
                  className="bg-yellow-500 text-black w-12 h-12 flex items-center justify-center rounded-xl font-black hover:bg-yellow-400 active:scale-90 transition-transform flex-shrink-0"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categorias.map(c => (
                  <div key={c.id} className="text-[9px] bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center uppercase font-black text-slate-400">
                    {c.nombre}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORMULARIO NOMINADOS */}
          <div className="lg:col-span-2">
            <form onSubmit={guardarNominado} className="bg-slate-900/80 p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
              <h2 className="text-sm font-black flex items-center gap-2 uppercase italic text-yellow-500">
                <PlusCircle size={18} /> Añadir Nominado
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Categoría Destino</label>
                  <select 
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl focus:border-yellow-500 outline-none text-xs font-bold text-white appearance-none cursor-pointer"
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

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Nombre del Nominado</label>
                  <input 
                    type="text"
                    placeholder="Ej: Clip histórico"
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl focus:border-yellow-500 outline-none text-xs font-bold text-white"
                    value={form.titulo}
                    onChange={(e) => setForm({...form, titulo: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-slate-500 text-center block">Tipo de Medio</label>
                <div className="grid grid-cols-3 gap-2">
                  {['video', 'foto', 'texto'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setForm({...form, tipo: t as any, url_media: ''}); setFile(null); }}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${
                        form.tipo === t ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {form.tipo === 'texto' ? (
                  <textarea 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl focus:border-yellow-500 outline-none text-xs text-white min-h-[120px]"
                    placeholder="Escribe el texto aquí..."
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
                      <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-2xl p-8 bg-black/40 hover:border-yellow-500/40 transition-all">
                          <Upload size={20} className="text-slate-500" />
                          <span className="text-[10px] font-black uppercase text-slate-400 text-center">
                              {file ? file.name : `Subir ${form.tipo}`}
                          </span>
                      </label>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest ${
                    loading ? 'bg-slate-800 text-slate-500' : 'bg-white text-black hover:bg-yellow-500 active:scale-95 shadow-xl'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Publicar en la Gala</>}
              </button>
            </form>
          </div>
        </div>

        {/* TABLA DE NOMINADOS */}
        <div className="bg-slate-900/80 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 bg-black/50 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Nominados Activos</h2>
            <span className="text-[10px] font-black text-slate-500">Registrados: {nominados.length}</span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                    <tr className="text-slate-500 text-[9px] uppercase tracking-widest border-b border-white/5">
                      <th className="p-6">Categoría</th>
                      <th className="p-6">Nominado</th>
                      <th className="p-6">Tipo</th>
                      <th className="p-6 text-right">Borrar</th>
                    </tr>
                </thead>
                <tbody className="text-xs">
                    {nominados.map(n => (
                    <tr key={n.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                            <span className="text-yellow-500 text-[9px] font-black uppercase tracking-tighter">
                                {n.categorias?.nombre}
                            </span>
                        </td>
                        <td className="p-6 font-bold uppercase italic text-white">{n.titulo}</td>
                        <td className="p-6">
                            <span className="text-slate-500 text-[9px] uppercase font-mono">{n.tipo}</span>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => borrarNominado(n.id)} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                              <Trash2 size={18} />
                          </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  )
}