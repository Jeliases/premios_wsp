import Navbar from '@/components/Navbar'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white selection:bg-yellow-500 selection:text-black">
        {/* Fondo con efecto de luces (Glow) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-900/20 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-slate-800/30 blur-[120px] rounded-full" />
        </div>

        <Navbar />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
        
        <footer className="py-10 text-center text-slate-600 text-sm border-t border-slate-900">
          <p>© 2026 PREMIOS WSP - Creado para la comunidad</p>
        </footer>
      </body>
    </html>
  )
}