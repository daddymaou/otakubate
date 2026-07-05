import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import CreatePost from '../components/feed/CreatePost'
import PostCard from '../components/feed/PostCard'
import Spinner from '../components/ui/Spinner'

export default function Feed() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/posts?limit=30')
        return data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached posts')
          return { posts: [] }
        }
        throw error
      }
    },
    staleTime: 60000, // Data stays fresh for 60s
    gcTime: 120000, // Cache persists for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchInterval: 120000, // Refetch every 2 minutes instead of every time
    retry: 1,
    retryDelay: 5000,
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF8EE',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Logo - Very Low Opacity */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(80vw, 600px)',
        height: 'auto',
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <img 
          src="https://files.catbox.moe/8anicu.png" 
          alt="OtakuBate Logo"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Background Blob Decorations */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'rgba(230,57,70,0.05)',
          top: '-150px', right: '-100px',
          animation: 'blobFloat1 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px', height: '400px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'rgba(26,26,46,0.04)',
          bottom: '-100px', left: '-80px',
          animation: 'blobFloat2 15s ease-in-out infinite'
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '680px',
        margin: '0 auto',
        padding: '24px 16px'
      }}
      className="feed-container">
        {/* Create Post Component */}
        <CreatePost />

        {/* Posts Feed */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px 0',
            minHeight: '300px'
          }}>
            <Spinner size={40} />
          </div>
        ) : data?.posts?.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(26,26,46,0.08)',
            marginTop: '20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              🎌
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              No posts yet
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#999'
            }}>
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '20px'
          }}>
            {data?.posts?.map((post: any) => (
              <PostCard key={post._id} post={post} queryKey={['posts']} />
            ))}
          </div>
        )}
      </div>

      {/* Animations */}
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
        
        .feed-container {
          padding: 24px 16px;
        }
        
        @media (min-width: 768px) {
          .feed-container {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  )
}