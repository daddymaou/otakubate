import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { 
  Settings, Users, FileText, MessageCircle, Camera, Sparkles, Calendar, 
  Heart, MessageSquare, Share2, Grid, Info, Palette, Check, X,
  Copy, CheckCircle, ChevronDown, ChevronUp, Bookmark, MapPin, Globe, 
  Link as LinkIcon, User as UserIcon, AtSign, Clock, Award, ArrowLeft,
  Loader2
} from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import PostCard from '../components/feed/PostCard'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

type ProfileTab = 'posts' | 'saved' | 'about'

// Social Media Icons (unchanged)
const FacebookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z" fill="#1877F2"/></svg>)
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M25.873,6.069c-2.619-2.623-6.103-4.067-9.814-4.069C8.411,2,2.186,8.224,2.184,15.874c-.001,2.446,.638,4.833,1.852,6.936l-1.969,7.19,7.355-1.929c2.026,1.106,4.308,1.688,6.63,1.689h.006c7.647,0,13.872-6.224,13.874-13.874,.001-3.708-1.44-7.193-4.06-9.815h0Zm-9.814,21.347h-.005c-2.069,0-4.099-.557-5.87-1.607l-.421-.25-4.365,1.145,1.165-4.256-.274-.436c-1.154-1.836-1.764-3.958-1.763-6.137,.003-6.358,5.176-11.531,11.537-11.531,3.08,.001,5.975,1.202,8.153,3.382,2.177,2.179,3.376,5.077,3.374,8.158-.003,6.359-5.176,11.532-11.532,11.532h0Zm6.325-8.636c-.347-.174-2.051-1.012-2.369-1.128-.318-.116-.549-.174-.78,.174-.231,.347-.895,1.128-1.098,1.359-.202,.232-.405,.26-.751,.086-.347-.174-1.464-.54-2.788-1.72-1.03-.919-1.726-2.054-1.929-2.402-.202-.347-.021-.535,.152-.707,.156-.156,.347-.405,.52-.607,.174-.202,.231-.347,.347-.578,.116-.232,.058-.434-.029-.607-.087-.174-.78-1.88-1.069-2.574-.281-.676-.567-.584-.78-.595-.202-.01-.433-.012-.665-.012s-.607,.086-.925,.434c-.318,.347-1.213,1.186-1.213,2.892s1.242,3.355,1.416,3.587c.174,.232,2.445,3.733,5.922,5.235,.827,.357,1.473,.571,1.977,.73,.83,.264,1.586,.227,2.183,.138,.666-.1,2.051-.839,2.34-1.649,.289-.81,.289-1.504,.202-1.649s-.318-.232-.665-.405h0Z" fill="#25D366"/></svg>)
const TelegramIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z" fill="#0088cc"/></svg>)

const SnapchatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
    <path d="M30.893,22.837c-.208-.567-.606-.871-1.058-1.122-.085-.05-.163-.09-.23-.12-.135-.07-.273-.137-.41-.208-1.41-.747-2.51-1.69-3.274-2.808-.217-.315-.405-.648-.562-.996-.065-.186-.062-.292-.015-.389,.046-.074,.108-.138,.18-.188,.242-.16,.492-.323,.661-.432,.302-.195,.541-.35,.695-.46,.579-.405,.983-.835,1.236-1.315,.357-.672,.404-1.466,.13-2.175-.383-1.009-1.336-1.635-2.49-1.635-.243,0-.486,.025-.724,.077-.064,.014-.127,.028-.189,.044,.011-.69-.005-1.418-.066-2.135-.218-2.519-1.1-3.84-2.02-4.893-.589-.66-1.283-1.218-2.053-1.653-1.396-.797-2.979-1.202-4.704-1.202s-3.301,.405-4.698,1.202c-.773,.434-1.468,.994-2.057,1.656-.92,1.053-1.802,2.376-2.02,4.893-.061,.717-.077,1.449-.067,2.135-.062-.016-.125-.031-.189-.044-.238-.051-.481-.077-.724-.077-1.155,0-2.109,.626-2.491,1.635-.276,.71-.23,1.505,.126,2.178,.254,.481,.658,.911,1.237,1.315,.153,.107,.393,.262,.695,.46,.163,.106,.402,.261,.635,.415,.082,.053,.151,.123,.204,.205,.049,.1,.051,.208-.022,.408-.155,.341-.34,.668-.553,.976-.747,1.092-1.815,2.018-3.179,2.759-.723,.383-1.474,.639-1.791,1.502-.239,.651-.083,1.391,.525,2.015h0c.223,.233,.482,.429,.766,.58,.592,.326,1.222,.578,1.876,.75,.135,.035,.263,.092,.379,.169,.222,.194,.19,.486,.485,.914,.148,.221,.336,.412,.555,.564,.619,.428,1.315,.455,2.053,.483,.666,.025,1.421,.054,2.283,.339,.357,.118,.728,.346,1.158,.613,1.032,.635,2.446,1.503,4.811,1.503s3.789-.873,4.829-1.51c.427-.262,.796-.488,1.143-.603,.862-.285,1.617-.313,2.283-.339,.737-.028,1.433-.055,2.053-.483,.259-.181,.475-.416,.632-.69,.212-.361,.207-.613,.406-.789,.109-.074,.229-.129,.356-.162,.662-.173,1.301-.428,1.901-.757,.302-.162,.575-.375,.805-.63l.008-.009c.57-.61,.714-1.329,.48-1.964Zm-2.102,1.13c-1.282,.708-2.135,.632-2.798,1.059-.563,.363-.23,1.144-.639,1.426-.503,.347-1.989-.025-3.909,.609-1.584,.524-2.594,2.029-5.442,2.029s-3.835-1.502-5.444-2.033c-1.916-.634-3.406-.262-3.909-.609-.409-.282-.077-1.064-.639-1.426-.664-.427-1.516-.351-2.798-1.055-.816-.451-.353-.73-.081-.862,4.645-2.249,5.386-5.721,5.419-5.979,.04-.312,.084-.557-.259-.875-.332-.307-1.804-1.218-2.213-1.503-.676-.472-.973-.944-.754-1.523,.153-.401,.527-.552,.92-.552,.124,0,.248,.014,.369,.041,.742,.161,1.462,.533,1.879,.633,.05,.013,.102,.02,.153,.021,.222,0,.3-.112,.285-.366-.048-.812-.162-2.394-.034-3.872,.176-2.034,.831-3.042,1.61-3.934,.374-.428,2.132-2.286,5.493-2.286s5.123,1.85,5.497,2.276c.78,.891,1.436,1.899,1.61,3.934,.128,1.479,.018,3.061-.034,3.872-.018,.268,.063,.366,.285,.366,.052,0,.103-.008,.153-.021,.417-.1,1.137-.472,1.879-.633,.121-.027,.245-.041,.369-.041,.395,0,.766,.153,.92,.552,.219,.579-.077,1.051-.753,1.523-.409,.285-1.881,1.196-2.213,1.503-.344,.317-.299,.563-.259,.875,.033,.261,.773,3.734,5.419,5.979,.274,.137,.737,.416-.079,.871Z" fill="#FFFC00"/>
  </svg>
)

// Share Modal (unchanged)
function ShareModal({ isOpen, onClose, username, displayName, avatarUrl }: { 
  isOpen: boolean; 
  onClose: () => void; 
  username: string; 
  displayName: string; 
  avatarUrl: string;
}) {
  const [copied, setCopied] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const profileUrl = `${window.location.origin}/profile/${username}`
  const shareText = `Check out ${displayName || username} on OtakuBate!`
  const encodedUrl = encodeURIComponent(profileUrl)
  const encodedText = encodeURIComponent(shareText)

  const topShares = [
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088cc', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'Snapchat', icon: <SnapchatIcon />, color: '#FFFC00', url: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}` },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Share Profile</h3>
                <p className="text-xs" style={{ color: '#999' }}>@{username}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
              <X size={18} style={{ color: '#999' }} />
            </button>
          </div>

          <div className="mb-5 p-3 rounded-2xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.1)' }}>
            <div className="flex items-center gap-3">
              <img src={avatarUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{displayName || username}</p>
                <p className="text-xs" style={{ color: '#999' }}>@{username}</p>
              </div>
            </div>
            <div className="mt-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <p className="text-xs" style={{ color: '#666' }}>{profileUrl}</p>
            </div>
          </div>

          <p className="text-xs font-medium mb-3" style={{ color: '#666' }}>Share via</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {topShares.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105" style={{ background: `${link.color}10`, border: `1px solid ${link.color}30`, color: link.color }}>
                {link.icon}
                <span className="text-[10px]">{link.name}</span>
              </a>
            ))}
          </div>

          <button onClick={handleCopyLink} className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105" style={{ background: '#1a1a2e', color: '#fff' }}>
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: me } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<ProfileTab>('posts')
  const [showShareModal, setShowShareModal] = useState(false)

  // User profile query
  const { data: ud, isLoading: userLoading, error } = useQuery({ 
    queryKey: ['user', username], 
    queryFn: async () => {
      try {
        const response = await api.get(`/users/${username}`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached user data')
          return null
        }
        throw error
      }
    },
    retry: 1,
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 120000,
    retryDelay: 5000,
  })
  
  // User posts query
  const { data: pd, isLoading: postsLoading } = useQuery({ 
    queryKey: ['user-posts', ud?.user?._id || ud?._id], 
    queryFn: async () => {
      try {
        const response = await api.get(`/users/${(ud?.user?._id || ud?._id)}/posts`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached posts')
          return { posts: [] }
        }
        throw error
      }
    },
    enabled: !!(ud?.user?._id || ud?._id) && tab === 'posts',
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 5000,
  })

  // Saved posts query
  const { data: savedData, isLoading: savedLoading } = useQuery({ 
    queryKey: ['user-saved', ud?.user?._id || ud?._id], 
    queryFn: async () => {
      try {
        const response = await api.get(`/posts/bookmarks/me`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Rate limited, using cached saved posts')
          return { posts: [] }
        }
        throw error
      }
    },
    enabled: !!me && tab === 'saved',
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 5000,
  })

  // ✅ Follow mutation with loading state
  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${(ud?.user?._id || ud?._id)}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', username] })
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(u.isFollowing ? 'Unfollowed' : 'Followed')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update follow status')
    }
  })

  const u = ud?.user
  const isMe = me?._id === u?._id
  const isFollowing = u?.isFollowing || false
  const isFollowingLoading = followMutation.isPending

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={48} />
      </div>
    )
  }

  if (error || !ud?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(230, 57, 70, 0.1)' }}>
            <Users size={48} style={{ color: '#E63946' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>User Not Found</h2>
          <p className="text-sm mb-6" style={{ color: '#999' }}>The user you're looking for doesn't exist.</p>
          <Link to="/" className="px-6 py-2 rounded-full text-sm font-medium" style={{ background: '#1a1a2e', color: '#fff' }}>
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const defaultBanners = [
    '/defaults/banners/banner1.jpg',
    '/defaults/banners/banner2.jpg',
    '/defaults/banners/banner3.jpg',
    '/defaults/banners/banner4.jpg',
    '/defaults/banners/banner5.jpg',
    '/defaults/banners/banner6.jpg'
  ]
  const defaultAvatars = Array.from({ length: 12 }, (_, i) => `/defaults/avatars/avatar${i + 1}.png`)
  
  const bannerIndex = (u._id?.charCodeAt?.(0) || 0) % defaultBanners.length
  const avatarIndex = (u._id?.charCodeAt?.(0) || 0) % defaultAvatars.length

  const bannerUrl = u.banner || defaultBanners[bannerIndex]
  const avatarUrl = u.avatar || defaultAvatars[avatarIndex]
  const joinDate = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const shareTitle = `${u.displayName || u.username} (@${u.username}) on OtakuBate`
  const shareDescription = u.bio || `${u.displayName || u.username} is on OtakuBate - the ultimate anime social network.`
  const shareImage = avatarUrl
  const shareUrl = `${window.location.origin}/profile/${u.username}`

  const genderLabels: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    'non-binary': 'Non-binary',
    other: 'Other',
    'prefer-not-to-say': 'Prefer not to say'
  }

  // ✅ Handle follow/unfollow with loading state
  const handleFollow = () => {
    if (isFollowingLoading) return
    followMutation.mutate()
  }

  return (
    <>
      <Helmet>
        <title>{shareTitle}</title>
        <meta name="description" content={shareDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="OtakuBate" />
        <meta property="profile:username" content={u.username} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImage} />
      </Helmet>

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={u.username}
        displayName={u.displayName || u.username}
        avatarUrl={avatarUrl}
      />

      <div className="min-h-screen pb-16">
        {/* Banner */}
        <div className="relative h-44 md:h-52 w-full overflow-hidden">
          <img src={bannerUrl} className="w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFF8EE]" />
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 rounded-xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 z-20 group"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <ArrowLeft size={20} style={{ color: '#1a1a2e' }} />
          </button>

          {isMe && (
            <Link to="/profile/customize" className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md bg-black/50 text-white hover:bg-black/70 transition">
              <Camera size={12} className="inline mr-1" /> Change Banner
            </Link>
          )}
        </div>

        {/* Profile Info */}
        <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative -mt-6">
              <img 
                src={avatarUrl} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg" 
                alt={u.username} 
                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatars[0] }} 
              />
              {isMe && (
                <Link to="/profile/customize" className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#E63946] text-white shadow-md hover:scale-110 transition">
                  <Camera size={12} />
                </Link>
              )}
            </div>
            
            <div className="text-center mt-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1a1a2e' }}>{u.displayName || u.username}</h1>
                {/* ✅ REMOVED: Verified badge */}
                {u.isPremium && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#E63946] to-[#FF6B7A] text-white font-bold">PRO</span>}
              </div>
              <p className="text-sm" style={{ color: '#999' }}>@{u.username}</p>
            </div>
          </div>

          {/* Bio */}
          {u.bio && (
            <div className="text-center mb-4 px-4">
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{u.bio}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex justify-center gap-6 py-3 border-y" style={{ borderColor: 'rgba(230,57,70,0.08)' }}>
            <div className="text-center">
              <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>{u.postsCount || 0}</div>
              <div className="text-xs" style={{ color: '#999' }}>Posts</div>
            </div>
            <button 
              onClick={() => navigate(`/profile/${u.username}/followers`)}
              className="text-center hover:scale-105 transition-all duration-200 group"
            >
              <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>{u.followersCount || 0}</div>
              <div className="text-xs group-hover:text-[#E63946] transition-colors" style={{ color: '#999' }}>Followers</div>
            </button>
            <button 
              onClick={() => navigate(`/profile/${u.username}/following`)}
              className="text-center hover:scale-105 transition-all duration-200 group"
            >
              <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>{u.followingCount || 0}</div>
              <div className="text-xs group-hover:text-[#E63946] transition-colors" style={{ color: '#999' }}>Following</div>
            </button>
          </div>

          {/* ✅ Action Buttons - With Spinners */}
          <div className="flex gap-3 mt-4">
            {isMe ? (
              <>
                <Link to="/settings" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition border hover:scale-105" style={{ background: 'transparent', color: '#1a1a2e', borderColor: 'rgba(230, 57, 70, 0.2)' }}>
                  <Settings size={16} /> Edit Profile
                </Link>
                <button 
                  onClick={() => setShowShareModal(true)} 
                  className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition border hover:scale-105" 
                  style={{ background: 'transparent', color: '#999', borderColor: 'rgba(230, 57, 70, 0.2)' }}
                >
                  <Share2 size={16} />
                </button>
              </>
            ) : (
              <>
                {/* ✅ Follow/Unfollow Button with Spinner */}
                <button 
                  onClick={handleFollow} 
                  disabled={isFollowingLoading}
                  className="flex-1 py-2.5 rounded-full text-sm font-medium transition hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ 
                    background: isFollowing ? 'transparent' : '#1a1a2e', 
                    color: isFollowing ? '#1a1a2e' : '#fff', 
                    border: isFollowing ? '1px solid rgba(230, 57, 70, 0.3)' : 'none' 
                  }}
                >
                  {isFollowingLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isFollowingLoading ? (isFollowing ? 'Unfollowing...' : 'Following...') : (isFollowing ? 'Unfollow' : 'Follow')}
                </button>
                
                {/* ✅ Message Button */}
                <Link 
                  to={`/messages/${u._id}`} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition border hover:scale-105"
                  style={{ background: 'transparent', color: '#E63946', borderColor: 'rgba(230, 57, 70, 0.3)' }}
                >
                  <MessageCircle size={16} /> Message
                </Link>
                
                <button 
                  onClick={() => setShowShareModal(true)} 
                  className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition border hover:scale-105" 
                  style={{ background: 'transparent', color: '#999', borderColor: 'rgba(230, 57, 70, 0.2)' }}
                >
                  <Share2 size={16} />
                </button>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b mt-6" style={{ borderBottomColor: 'rgba(230, 57, 70, 0.1)' }}>
            <button onClick={() => setTab('posts')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${tab === 'posts' ? 'text-[#E63946]' : 'text-[#999] hover:text-[#1a1a2e]'}`}>
              <Grid size={16} /> Posts {tab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63946] rounded-full" />}
            </button>
            {isMe && (
              <button onClick={() => setTab('saved')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${tab === 'saved' ? 'text-[#E63946]' : 'text-[#999] hover:text-[#1a1a2e]'}`}>
                <Bookmark size={16} /> Saved {tab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63946] rounded-full" />}
              </button>
            )}
            <button onClick={() => setTab('about')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${tab === 'about' ? 'text-[#E63946]' : 'text-[#999] hover:text-[#1a1a2e]'}`}>
              <Info size={16} /> About {tab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63946] rounded-full" />}
            </button>
          </div>

          {/* Tab Content */}
          {tab === 'posts' && (
            postsLoading ? (
              <div className="flex justify-center py-12"><Spinner size={32} /></div>
            ) : pd?.posts?.length === 0 ? (
              <div className="text-center py-12 rounded-2xl mt-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                <FileText size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
                <p className="text-sm" style={{ color: '#999' }}>No posts yet</p>
                {isMe && <Link to="/create-post" className="inline-block mt-3 text-sm font-medium hover:underline" style={{ color: '#E63946' }}>Create your first post →</Link>}
              </div>
            ) : (
              <div className="space-y-4 mt-4">{pd?.posts?.map((p: any) => (<PostCard key={p._id} post={p} queryKey={['user-posts', u._id]} />))}</div>
            )
          )}

          {tab === 'saved' && isMe && (
            savedLoading ? (
              <div className="flex justify-center py-12"><Spinner size={32} /></div>
            ) : savedData?.posts?.length === 0 ? (
              <div className="text-center py-12 rounded-2xl mt-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                <Bookmark size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
                <p className="text-sm" style={{ color: '#999' }}>No saved posts yet</p>
                <p className="text-xs mt-1" style={{ color: '#bbb' }}>Posts you bookmark will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">{savedData?.posts?.map((p: any) => (<PostCard key={p._id} post={p} queryKey={['user-saved', u._id]} />))}</div>
            )
          )}

          {tab === 'about' && (
            <div className="mt-4 space-y-4">
              {/* Personal Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {u.gender && u.gender !== 'prefer-not-to-say' && (
                  <div className="p-4 rounded-xl text-center sm:text-left" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                    <p className="text-xs" style={{ color: '#999' }}>Gender</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1a1a2e' }}>{genderLabels[u.gender]}</p>
                  </div>
                )}
                {u.pronouns && (
                  <div className="p-4 rounded-xl text-center sm:text-left" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                    <p className="text-xs" style={{ color: '#999' }}>Pronouns</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1a1a2e' }}>{u.pronouns}</p>
                  </div>
                )}
                {u.location && (
                  <div className="p-4 rounded-xl text-center sm:text-left" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                    <p className="text-xs" style={{ color: '#999' }}>Location</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                      <MapPin size={14} style={{ color: '#E63946' }} />
                      <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{u.location}</p>
                    </div>
                  </div>
                )}
                {u.website && (
                  <div className="p-4 rounded-xl text-center sm:text-left" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                    <p className="text-xs" style={{ color: '#999' }}>Website</p>
                    <a href={u.website.startsWith('http') ? u.website : `https://${u.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-sm font-medium hover:underline" style={{ color: '#E63946' }}>
                      <LinkIcon size={14} /> {u.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Join Date */}
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                <p className="text-xs" style={{ color: '#999' }}>Joined</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Calendar size={14} style={{ color: '#E63946' }} />
                  <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{joinDate}</p>
                </div>
              </div>

              {/* Favorite Genres */}
              {u.favoriteGenres?.length > 0 && (
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                  <p className="text-xs mb-3" style={{ color: '#999' }}>Favorite Genres</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {u.favoriteGenres.map((g: string) => (
                      <span key={g} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(230, 57, 70, 0.1)', color: '#E63946' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Anime */}
              {u.favoriteAnime?.length > 0 && (
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                  <p className="text-xs mb-3" style={{ color: '#999' }}>Favorite Anime</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {u.favoriteAnime.map((a: string) => (
                      <span key={a} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(26, 26, 46, 0.05)', color: '#1a1a2e' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!u.bio && !u.gender && !u.pronouns && !u.location && !u.website && (!u.favoriteGenres || u.favoriteGenres.length === 0) && (!u.favoriteAnime || u.favoriteAnime.length === 0) && (
                <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(230, 57, 70, 0.08)' }}>
                  <Info size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#999' }}>No about information yet</p>
                  {isMe && <Link to="/profile/customize" className="inline-block mt-3 text-sm font-medium hover:underline" style={{ color: '#E63946' }}>Complete your profile →</Link>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </>
  )
}