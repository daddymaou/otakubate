import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF8EE',
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    }}>
      {/* Background Logo */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(80vw, 600px)',
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <img
          src="https://files.catbox.moe/8anicu.png"
          alt="OtakuBate Logo"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Background Blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          filter: 'blur(100px)', background: 'rgba(230,57,70,0.05)',
          top: '-150px', right: '-100px', animation: 'blobFloat1 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          filter: 'blur(100px)', background: 'rgba(26,26,46,0.04)',
          bottom: '-100px', left: '-80px', animation: 'blobFloat2 15s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
          filter: 'blur(100px)', background: 'rgba(230,57,70,0.03)',
          top: '50%', right: '20%', transform: 'translateY(-50%)',
          animation: 'blobFloat3 18s ease-in-out infinite'
        }} />
      </div>

      {/* Sidebar — fixed, w-64 = 256px on md+ */}
      <Sidebar />

      {/* Main Content — use Tailwind to apply margin only on md+ */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10 md:ml-64">
        <TopBar />
        <main className="flex-1 relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.05); }
          66% { transform: translate(30px, -40px) scale(0.95); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  )
}