import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { X, Mail, Send, MessageCircle } from 'lucide-react'

// ============================================
// SVG ICONS
// ============================================
const CommunityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
)

const DiscoverIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
    <path d="M8 12h.01M16 12h.01" />
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" opacity="0.2" />
  </svg>
)

const PostsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    <path d="M15 5l3 3" />
  </svg>
)

const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const OnlineIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#10B981">
    <circle cx="12" cy="12" r="12" />
  </svg>
)

const MenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" 
      style={{ 
        transform: isOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
        transformOrigin: 'center',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
      }} 
    />
    <line x1="3" y1="12" x2="21" y2="12" 
      style={{ 
        opacity: isOpen ? 0 : 1,
        transform: isOpen ? 'translateX(20px)' : 'none',
        transition: 'all 0.3s ease' 
      }} 
    />
    <line x1="3" y1="18" x2="21" y2="18" 
      style={{ 
        transform: isOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
        transformOrigin: 'center',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
      }} 
    />
  </svg>
)

const SparkleIcon = ({ size = 16, delay = 0 }: { size?: number, delay?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#E63946" opacity="0.6" style={{ animation: `sparkleFloat 3s ease-in-out ${delay}s infinite` }}>
    <path d="M12 0L14.5 8.5L23 11L14.5 13.5L12 22L9.5 13.5L1 11L9.5 8.5L12 0Z" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const StarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// ============================================
// TELEGRAM SVG
// ============================================
const TelegramSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.9,8.1l-1.7,8.2c-0.1,0.6-0.5,0.7-0.9,0.4l-2.6-2
      c-0.6,0.6-1.2,1.1-1.3,1.3c-0.2,0.1-0.3,0.3-0.5,0.3c-0.3,0-0.3-0.2-0.4-0.4l-0.9-3L5.9,12c-0.6-0.2-0.6-0.6,0.1-0.9l10.2-3.9
      C16.6,7.1,17.1,7.3,16.9,8.1z M14.5,9l-5.7,3.6l0.9,3l0.2-2l4.9-4.4C15.1,8.9,14.9,8.9,14.5,9z"/>
  </svg>
)

// ============================================
// WHATSAPP SVG
// ============================================
const WhatsAppSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6,14c-0.2-0.1-1.5-0.7-1.7-0.8c-0.2-0.1-0.4-0.1-0.6,0.1c-0.2,0.2-0.6,0.8-0.8,1c-0.1,0.2-0.3,0.2-0.5,0.1c-0.7-0.3-1.4-0.7-2-1.2c-0.5-0.5-1-1.1-1.4-1.7c-0.1-0.2,0-0.4,0.1-0.5c0.1-0.1,0.2-0.3,0.4-0.4c0.1-0.1,0.2-0.3,0.2-0.4c0.1-0.1,0.1-0.3,0-0.4c-0.1-0.1-0.6-1.3-0.8-1.8C9.4,7.3,9.2,7.3,9,7.3c-0.1,0-0.3,0-0.5,0C8.3,7.3,8,7.5,7.9,7.6C7.3,8.2,7,8.9,7,9.7c0.1,0.9,0.4,1.8,1,2.6c1.1,1.6,2.5,2.9,4.2,3.7c0.5,0.2,0.9,0.4,1.4,0.5c0.5,0.2,1,0.2,1.6,0.1c0.7-0.1,1.3-0.6,1.7-1.2c0.2-0.4,0.2-0.8,0.1-1.2C17,14.2,16.8,14.1,16.6,14 M19.1,4.9C15.2,1,8.9,1,5,4.9c-3.2,3.2-3.8,8.1-1.6,12L2,22l5.3-1.4c1.5,0.8,3.1,1.2,4.7,1.2h0c5.5,0,9.9-4.4,9.9-9.9C22,9.3,20.9,6.8,19.1,4.9 M16.4,18.9c-1.3,0.8-2.8,1.3-4.4,1.3h0c-1.5,0-2.9-0.4-4.2-1.1l-0.3-0.2l-3.1,0.8l0.8-3l-0.2-0.3C2.6,12.4,3.8,7.4,7.7,4.9S16.6,3.7,19,7.5C21.4,11.4,20.3,16.5,16.4,18.9"/>
  </svg>
)

interface AnimeData {
  mal_id: number
  title: string
  title_japanese?: string
  images: { jpg: { image_url: string } }
  score?: number
}

// ============================================
// CONTACT MODAL
// ============================================
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const contactLinks = [
    { 
      icon: <TelegramSVG />, 
      label: 'Telegram', 
      url: 'https://t.me/fwmaou',
      color: '#0088cc'
    },
    { 
      icon: <WhatsAppSVG />, 
      label: 'WhatsApp', 
      url: 'https://wa.me/2348154899093',
      color: '#25D366'
    },
    { 
      icon: <Mail size={20} />, 
      label: 'Email', 
      url: 'mailto:daddymaouu@gmail.com',
      color: '#E63946'
    },
  ]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E63946] via-[#FF6B7A] to-[#E63946] opacity-20 blur-xl" />
        <div className="relative bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFF0F0] p-6" style={{ borderRadius: '20px 4px 20px 4px' }}>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
                <MessageCircle size={18} />
              </div>
              <h3 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Contact Developer</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 transition">
              <X size={18} style={{ color: '#999' }} />
            </button>
          </div>

          <p className="text-sm mb-6" style={{ color: '#666' }}>
            Reach out to the developer through any of these channels:
          </p>

          <div className="space-y-3">
            {contactLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                style={{ 
                  border: '1px solid rgba(230,57,70,0.08)',
                  background: 'rgba(255,255,255,0.5)'
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}15`, color: link.color }}>
                  {link.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{link.label}</p>
                </div>
                <span style={{ color: '#ccc' }}>→</span>
              </a>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(230,57,70,0.08)' }}>
            <p className="text-xs text-center" style={{ color: '#999' }}>
              I'll get back to you as soon as possible
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ANIME IMAGE PLACEHOLDER CONFIG
// ============================================
const ANIME_IMAGES = {
  heroBg: 'https://files.catbox.moe/8anicu.png',
  float1: 'https://files.catbox.moe/se9lvb.png',
  float2: 'https://files.catbox.moe/x84ce7.png',
  float3: 'https://files.catbox.moe/cwdv8u.png',
  featureDeco: 'https://files.catbox.moe/kajwd2.png',
  ctaDeco: 'https://files.catbox.moe/qfb6wm.png',
}

const content = {
  en: {
    nav: ['Home', 'Communities', 'Features'],
    signIn: 'Sign In',
    joinFree: 'Join Free',
    badge: '✦ Premium Anime Community',
    heroTitle: 'Welcome to',
    heroTitleAccent: 'Otaku',
    heroTitleEnd: 'Bate',
    heroSub: 'Your Anime Community',
    heroDesc: 'The ultimate social network for anime fans. Discover series, join communities, share reactions, and connect with fans worldwide.',
    heroDescJP: '世界中のファンと繋がろう',
    getStarted: 'Get Started',
    login: 'Sign In',
    stats: [
      ['120K+', 'Members'],
      ['2.4K+', 'Communities'],
      ['850K+', 'Posts']
    ],
    trendingLabel: 'Popular Communities',
    trendingSub: 'Click to join',
    featuresTitle: 'Everything for the',
    featuresTitleAccent: 'Otaku',
    featuresTitleEnd: '',
    featuresSub: 'Built for anime, manga and light novel fans.',
    featuresLabel: 'Features',
    ctaTitle: 'Ready to Join the',
    ctaTitleAccent: 'Fandom',
    ctaTitleEnd: '?',
    ctaSub: 'Thousands of fans are already here. Your community is waiting.',
    ctaButton: 'Join OtakuBate — Free Forever',
    footerText: '| Developed By MaouKnowsJava ',
    footerLinks: ['Privacy', 'Terms', 'Contact'],
    loading: 'Loading trending anime...',
    trending: 'Trending',
    online: 'online'
  },
  jp: {
    nav: ['ホーム', 'コミュニティ', '機能'],
    signIn: 'ログイン',
    joinFree: '無料登録',
    badge: '✦ プレミアムアニメコミュニティ',
    heroTitle: 'あなたの',
    heroTitleAccent: 'アニメ',
    heroTitleEnd: 'コミュニティ',
    heroSub: 'Your Anime Community',
    heroDesc: 'アニメファンのための究極のソーシャルネットワーク。シリーズを見つけ、コミュニティに参加し、反応を共有し、世界中のファンとつながりましょう。',
    heroDescJP: 'Connect with fans worldwide',
    getStarted: '始めよう',
    login: 'ログイン',
    stats: [
      ['120K+', 'メンバー'],
      ['2.4K+', 'コミュニティ'],
      ['850K+', '投稿']
    ],
    trendingLabel: '人気のコミュニティ',
    trendingSub: 'クリックして参加',
    featuresTitle: 'オタクの',
    featuresTitleAccent: 'すべて',
    featuresTitleEnd: 'がここに',
    featuresSub: 'アニメ、マンガ、ライトノベルファンのために作られました。',
    featuresLabel: '特徴',
    ctaTitle: '準備はいい？',
    ctaTitleAccent: '参加しよう',
    ctaTitleEnd: '',
    ctaSub: 'すでに何千人ものファンがここにいます。あなたのコミュニティが待っています。',
    ctaButton: '無料で始める · Join Free Forever',
    footerText: 'アニメファンのために作られた · || Developed By MaouKnowsJava ',
    footerLinks: ['プライバシー', '利用規約', 'お問い合わせ'],
    loading: 'アニメを読み込み中...',
    trending: '急上昇',
    online: 'オンライン'
  }
}

const features = [
  { 
    icon: <CommunityIcon />, 
    en: { title: 'Anime Communities', desc: 'Discover and join thousands of communities for your favorite series — from classic hits to seasonal sensations' },
    jp: { title: 'アニメコミュニティ', desc: 'お気に入りのシリーズのコミュニティを発見して参加しよう — クラシックから最新作まで' }
  },
  { 
    icon: <ChatIcon />, 
    en: { title: 'Real-time Chat', desc: 'Connect with fans instantly through direct messaging and group conversations. Share your thoughts live.' },
    jp: { title: 'リアルタイムチャット', desc: 'ダイレクトメッセージとグループ会話でファンと即座に繋がろう。リアルタイムで思いを共有。' }
  },
  { 
    icon: <DiscoverIcon />, 
    en: { title: 'Anime Discovery', desc: 'Explore trending shows, seasonal picks, and hidden gems. Find your next favorite series today.' },
    jp: { title: 'アニメ発見', desc: '話題の作品、季節のおすすめ、隠れた名作を探索。今日あなたの次のお気に入りを見つけよう。' }
  },
  { 
    icon: <PostsIcon />, 
    en: { title: 'Community Posts', desc: 'Share reviews, fan art, hot takes, and reactions. Your voice matters in the fandom.' },
    jp: { title: 'コミュニティ投稿', desc: 'レビュー、ファンアート、感想、反応を共有。あなたの声がファンダムに響く。' }
  },
  { 
    icon: <ShieldIcon />, 
    en: { title: 'Safe & Modded', desc: 'Active moderation keeps our community safe and welcoming. Report, block, and enjoy peace of mind.' },
    jp: { title: '安全で健全な', desc: '活発なモデレーションでコミュニティを安全に保ちます。報告、ブロック、安心して楽しめます。' }
  },
  { 
    icon: <StarIcon />, 
    en: { title: 'Premium Experience', desc: 'Unlock exclusive content, badges, and features. Support the community and stand out.' },
    jp: { title: 'プレミアム体験', desc: '限定コンテンツ、バッジ、機能をアンロック。コミュニティをサポートして目立とう。' }
  },
]

const trendingAnime = [
  { name: 'One Piece', members: '46.3K', color: '#F4C430', jp: 'ワンピース' },
  { name: 'Jujutsu Kaisen', members: '34.7K', color: '#8B5CF6', jp: '呪術廻戦' },
  { name: 'Attack on Titan', members: '29.1K', color: '#E63946', jp: '進撃の巨人' },
  { name: 'Solo Leveling', members: '22.4K', color: '#3B82F6', jp: '俺だけレベルアップな件' },
  { name: 'Demon Slayer', members: '18.9K', color: '#EC4899', jp: '鬼滅の刃' },
  { name: 'Manga Readers', members: '15.2K', color: '#10B981', jp: '漫画読者' },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [trendingAnimes, setTrendingAnimes] = useState<AnimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'en' | 'jp'>('en')
  const [showContactModal, setShowContactModal] = useState(false)
  const t = content[lang]

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=6')
        const data = await response.json()
        setTrendingAnimes(data.data || [])
      } catch (error) {
        console.error('Failed to fetch trending anime:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  // Handle nav clicks - all go to login or register except Contact
  const handleNavClick = (link: string) => {
    if (link === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setMobileMenuOpen(false)
      return
    }
    setMobileMenuOpen(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFF8EE', 
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", 
      overflowX: 'hidden' 
    }}>
      
      {/* ===== CONTACT MODAL ===== */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />

      {/* ===== SPARKLES - BACKGROUND DECORATION ===== */}
      <div style={{ position: 'fixed', top: '8%', left: '5%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={18} delay={0} />
      </div>
      <div style={{ position: 'fixed', top: '15%', right: '8%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={14} delay={0.7} />
      </div>
      <div style={{ position: 'fixed', bottom: '20%', left: '3%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={22} delay={1.2} />
      </div>
      <div style={{ position: 'fixed', bottom: '30%', right: '5%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={16} delay={0.4} />
      </div>
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={30} delay={0.9} />
      </div>
      <div style={{ position: 'fixed', top: '25%', left: '20%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={12} delay={1.5} />
      </div>
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', zIndex: 0, pointerEvents: 'none' }}>
        <SparkleIcon size={20} delay={0.2} />
      </div>

      {/* Navbar */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
        background: scrolled ? 'rgba(255,248,238,0.95)' : 'rgba(255,248,238,0.85)', 
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(26,26,46,0.12)' : '1px solid rgba(26,26,46,0.06)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08)' : 'none'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img 
                src={ANIME_IMAGES.heroBg}
                alt="OtakuBate" 
                style={{ 
                  height: '52px', 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
              <div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px', display: 'block', lineHeight: 1.2 }}>
                  {lang === 'jp' ? 'オタクBate' : 'OtakuBate'}
                </span>
                <span style={{ fontSize: '10px', color: '#E63946', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', display: 'block' }}>
                  {lang === 'jp' ? 'OtakuBate' : 'オタクベート'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav - ALL LEAD TO LOGIN/REGISTER */}
            <div style={{ display: 'none', gap: '40px', alignItems: 'center' }} className="desktop-nav">
              {t.nav.map(link => {
                if (link === 'Home') {
                  return (
                    <a 
                      key={link}
                      href="#"
                      onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ 
                        color: '#555', fontSize: '13px', fontWeight: 600,
                        textDecoration: 'none', letterSpacing: '1px',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                    >
                      {link}
                    </a>
                  )
                }
                return (
                  <Link 
                    key={link}
                    to={link === 'Features' ? '/register' : '/register'}
                    style={{ 
                      color: '#555', fontSize: '13px', fontWeight: 600,
                      textDecoration: 'none', letterSpacing: '1px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                  >
                    {link}
                  </Link>
                )
              })}
              {/* Contact button in nav */}
              <button
                onClick={() => setShowContactModal(true)}
                style={{ 
                  color: '#555', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', letterSpacing: '1px',
                  transition: 'color 0.3s ease',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              >
                About
              </button>
            </div>

            {/* Desktop CTA + Language Toggle */}
            <div style={{ display: 'none', gap: '12px', alignItems: 'center' }} className="desktop-nav">
              <button
                onClick={() => setLang(lang === 'en' ? 'jp' : 'en')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '25px',
                  border: '1.5px solid rgba(26,26,46,0.15)',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700,
                  color: '#1a1a2e',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(26,26,46,0.05)'
                  e.currentTarget.style.borderColor = '#E63946'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'
                }}
              >
                <GlobeIcon />
                <span>{lang === 'en' ? '日本語' : 'English'}</span>
              </button>

              <Link to="/login" style={{ 
                color: '#1a1a2e', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', padding: '9px 22px',
                border: '1.5px solid #1a1a2e', borderRadius: '25px',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.transform = 'none' }}
              >
                {t.signIn}
              </Link>
              <Link to="/register" style={{ 
                color: '#fff', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', padding: '9px 22px',
                background: '#E63946', borderRadius: '25px',
                border: '1.5px solid #E63946',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(230,57,70,0.3)'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c1121f'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(230,57,70,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E63946'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(230,57,70,0.3)' }}
              >
                {t.joinFree}
              </Link>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a2e', padding: '8px', zIndex: 200 }}
            >
              <MenuIcon isOpen={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== SLIDE-IN DRAWER ===== */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '400px',
        zIndex: 999,
        background: '#FFF8EE',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.08)',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 32px 40px',
        overflowY: 'auto'
      }}>
        <div style={{ position: 'absolute', top: '15%', right: '10%' }}>
          <SparkleIcon size={14} delay={0.3} />
        </div>
        <div style={{ position: 'absolute', bottom: '30%', left: '8%' }}>
          <SparkleIcon size={18} delay={1.1} />
        </div>

        <button 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1a1a2e',
            padding: '8px'
          }}
        >
          <X size={28} />
        </button>

        <div style={{ marginBottom: '40px' }}>
          <img 
            src={ANIME_IMAGES.heroBg}
            alt="OtakuBate" 
            style={{ 
              height: '48px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Drawer Nav Links - ALL TO LOGIN/REGISTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {t.nav.map((link) => (
            link === 'Home' ? (
              <a 
                key={link} 
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false) }}
                style={{ 
                  color: '#1a1a2e', 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  textDecoration: 'none', 
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(26,26,46,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E63946'; e.currentTarget.style.paddingLeft = '8px' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.paddingLeft = '0' }}
              >
                {link}
                <span style={{ fontSize: '14px', color: '#ccc' }}>→</span>
              </a>
            ) : (
              <Link 
                key={link} 
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  color: '#1a1a2e', 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  textDecoration: 'none', 
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(26,26,46,0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E63946'; e.currentTarget.style.paddingLeft = '8px' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.paddingLeft = '0' }}
              >
                {link}
                <span style={{ fontSize: '14px', color: '#ccc' }}>→</span>
              </Link>
            )
          ))}
          {/* Contact/About button in drawer */}
          <button
            onClick={() => { setShowContactModal(true); setMobileMenuOpen(false) }}
            style={{ 
              color: '#1a1a2e', 
              fontSize: '24px', 
              fontWeight: 700, 
              textDecoration: 'none', 
              padding: '12px 0',
              borderBottom: '1px solid rgba(26,26,46,0.06)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E63946'; e.currentTarget.style.paddingLeft = '8px' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.paddingLeft = '0' }}
          >
            About
            <span style={{ fontSize: '14px', color: '#ccc' }}>→</span>
          </button>
        </div>

        <button 
          onClick={() => setLang(lang === 'en' ? 'jp' : 'en')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '14px 20px', 
            marginTop: '32px',
            borderRadius: '30px',
            border: '1.5px solid rgba(26,26,46,0.1)',
            background: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#1a1a2e',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <GlobeIcon />
          <span>{lang === 'en' ? 'Switch to 日本語' : 'Switch to English'}</span>
        </button>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(26,26,46,0.08)'
        }}>
          <Link 
            to="/login" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ 
              color: '#1a1a2e', 
              fontSize: '16px', 
              fontWeight: 600, 
              textDecoration: 'none',
              padding: '14px', 
              textAlign: 'center', 
              border: '1.5px solid rgba(26,26,46,0.15)',
              borderRadius: '30px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,26,46,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {t.signIn}
          </Link>
          <Link 
            to="/register" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: 700, 
              textDecoration: 'none',
              padding: '14px', 
              textAlign: 'center', 
              background: '#E63946',
              borderRadius: '30px',
              boxShadow: '0 8px 30px rgba(230,57,70,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#c1121f'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E63946'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            {t.joinFree}
          </Link>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#ccc' }}>
            {lang === 'jp' ? 'オタクベート' : 'MaouKnowsJava'} 
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========== HERO SECTION ========== */}
      <section style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '120px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
        position: 'relative'
      }}>
        
        {/* Hero Sparkles */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', zIndex: 1, pointerEvents: 'none' }}>
          <SparkleIcon size={22} delay={0} />
        </div>
        <div style={{ position: 'absolute', top: '20%', right: '8%', zIndex: 1, pointerEvents: 'none' }}>
          <SparkleIcon size={16} delay={0.8} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', zIndex: 1, pointerEvents: 'none' }}>
          <SparkleIcon size={20} delay={1.5} />
        </div>
        <div style={{ position: 'absolute', bottom: '25%', right: '5%', zIndex: 1, pointerEvents: 'none' }}>
          <SparkleIcon size={14} delay={0.3} />
        </div>

        {/* Blurred background anime image */}
        <div style={{
          position: 'absolute', 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', 
          height: '100%',
          maxWidth: '500px', 
          maxHeight: '500px',
          zIndex: 0, 
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          <img 
            src={ANIME_IMAGES.heroBg}
            alt=""
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              filter: 'blur(70px)' 
            }} 
          />
        </div>

        {/* Floating anime images */}
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '2%',
          zIndex: 1,
          opacity: 0.15,
          pointerEvents: 'none',
          animation: 'floatCard 6s ease-in-out infinite'
        }}>
          <img 
            src={ANIME_IMAGES.float1}
            alt=""
            style={{
              width: '140px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '18%',
          left: '2%',
          zIndex: 1,
          opacity: 0.12,
          pointerEvents: 'none',
          animation: 'floatCard 7s ease-in-out infinite reverse'
        }}>
          <img 
            src={ANIME_IMAGES.float2}
            alt=""
            style={{
              width: '120px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Hero Content */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          position: 'relative', 
          zIndex: 1,
          width: '100%'
        }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 20px', 
            borderRadius: '30px', 
            marginBottom: '8px', 
            background: 'rgba(230,57,70,0.06)', 
            border: '1px solid rgba(230,57,70,0.15)' 
          }}>
            <SparkleIcon size={12} delay={0} />
            <span style={{ color: '#E63946', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {t.badge}
            </span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(36px, 8vw, 72px)', 
            fontWeight: 900, 
            color: '#1a1a2e', 
            lineHeight: 1.1, 
            textAlign: 'center',
            letterSpacing: '-2px',
            marginBottom: '8px',
            width: '100%'
          }}>
            {t.heroTitle}<br />
            <span style={{ color: '#E63946' }}>{t.heroTitleAccent}</span>{t.heroTitleEnd}
          </h1>

          <p style={{ 
            fontSize: '14px', 
            color: '#E63946', 
            fontWeight: 600, 
            letterSpacing: '3px', 
            marginBottom: '8px', 
            opacity: 0.7,
            textAlign: 'center'
          }}>
            {t.heroSub}
          </p>

          <p style={{ 
            fontSize: 'clamp(16px, 2vw, 20px)', 
            color: '#666', 
            lineHeight: 1.8, 
            maxWidth: '580px', 
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            {t.heroDesc}
            <br />
            <span style={{ fontSize: '14px', opacity: 0.6 }}>{t.heroDescJP}</span>
          </p>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '14px', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '440px',
            marginBottom: '16px'
          }} className="cta-buttons">
            <Link to="/register" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px', 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: 700, 
              textDecoration: 'none', 
              padding: '18px 40px', 
              background: '#1a1a2e', 
              borderRadius: '14px', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              width: '100%'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(26,26,46,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              {t.getStarted} <span style={{ fontSize: '22px' }}>→</span>
            </Link>
            <Link to="/login" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px', 
              color: '#E63946', 
              fontSize: '16px', 
              fontWeight: 700, 
              textDecoration: 'none', 
              padding: '18px 40px', 
              border: '2px solid #E63946', 
              borderRadius: '14px', 
              transition: 'all 0.3s ease', 
              width: '100%'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E63946'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E63946'; e.currentTarget.style.transform = 'none' }}>
              {t.login}
            </Link>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '36px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginTop: '8px'
          }}>
            {t.stats.map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#1a1a2e' }}>{num}</div>
                <div style={{ fontSize: '12px', color: '#999', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visuals */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          minHeight: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%' 
        }} className="hero-visual">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px', 
            position: 'relative', 
            zIndex: 10,
            width: '100%',
            maxWidth: '500px'
          }}>
            {loading ? (
              <div style={{ color: '#999', textAlign: 'center', gridColumn: 'span 2', padding: '40px' }}>{t.loading}</div>
            ) : (
              trendingAnimes.slice(0, 4).map((anime, i) => (
                <div key={anime.mal_id} style={{ 
                  background: '#fff', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(26,26,46,0.08)', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
                  transition: 'all 0.3s ease', 
                  cursor: 'pointer', 
                  animation: `floatCard ${3 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(230,57,70,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)' }}>
                  <img src={anime.images.jpg.image_url} alt={anime.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {lang === 'jp' && anime.title_japanese ? anime.title_japanese : anime.title}
                    </div>
                    {anime.score && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#F4C430', fontSize: '16px' }}>★</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e' }}>{anime.score}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trending Badge */}
          <div style={{ 
            position: 'absolute', 
            top: '-10px', 
            right: '-5px', 
            zIndex: 20, 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '12px 16px', 
            boxShadow: '0 8px 35px rgba(0,0,0,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            animation: 'floatCard 3s ease-in-out infinite', 
            animationDelay: '1.2s' 
          }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #E63946, #c1121f)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontSize: '16px' 
            }}>
              <TrendingIcon />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e' }}>{t.trending}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>
                {trendingAnimes[0] ? (lang === 'jp' && trendingAnimes[0].title_japanese ? trendingAnimes[0].title_japanese : trendingAnimes[0].title) : t.loading}
              </div>
            </div>
          </div>

          {/* Online Badge */}
          <div style={{ 
            position: 'absolute', 
            bottom: '-10px', 
            left: '-5px', 
            zIndex: 20, 
            background: '#fff', 
            borderRadius: '30px', 
            padding: '8px 14px', 
            boxShadow: '0 8px 35px rgba(0,0,0,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            animation: 'floatCard 3s ease-in-out infinite', 
            animationDelay: '0.4s' 
          }}>
            <OnlineIcon />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e' }}>12.4K </span>
              <span style={{ fontSize: '10px', color: '#999' }}>{t.online}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Communities */}
      <section style={{ 
        borderTop: '1px solid rgba(26,26,46,0.06)', 
        borderBottom: '1px solid rgba(26,26,46,0.06)', 
        padding: '36px 24px', 
        background: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', pointerEvents: 'none' }}>
          <SparkleIcon size={14} delay={0.5} />
        </div>
        <div style={{ position: 'absolute', bottom: '20%', left: '8%', pointerEvents: 'none' }}>
          <SparkleIcon size={18} delay={1.3} />
        </div>
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          <img 
            src={ANIME_IMAGES.float3}
            alt=""
            style={{
              width: '180px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <SparkleIcon size={12} delay={0} />
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#E63946', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.trendingLabel}
              </p>
            </div>
            <p style={{ fontSize: '13px', color: '#999', letterSpacing: '1px' }}>{t.trendingSub}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {trendingAnime.map(c => (
              <Link key={c.name} to="/register"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 20px', 
                  borderRadius: '30px', 
                  border: '1.5px solid', 
                  borderColor: `${c.color}40`, 
                  background: `${c.color}08`, 
                  textDecoration: 'none', 
                  transition: 'all 0.3s ease' 
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = c.color; e.currentTarget.style.background = `${c.color}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = `${c.color}40`; e.currentTarget.style.background = `${c.color}08` }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{c.name}</span>
                {lang === 'jp' && <span style={{ fontSize: '10px', color: '#999', fontWeight: 500 }}>{c.jp}</span>}
                <span style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>{c.members}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', pointerEvents: 'none' }}>
          <SparkleIcon size={20} delay={0.2} />
        </div>
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', pointerEvents: 'none' }}>
          <SparkleIcon size={16} delay={0.9} />
        </div>
        <div style={{ position: 'absolute', top: '40%', right: '15%', pointerEvents: 'none' }}>
          <SparkleIcon size={12} delay={1.6} />
        </div>

        <div style={{
          position: 'absolute',
          left: '-30px',
          bottom: '10%',
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          <img 
            src={ANIME_IMAGES.featureDeco}
            alt=""
            style={{
              width: '200px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '56px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#E63946', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t.featuresLabel}
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#1a1a2e', marginBottom: '16px', letterSpacing: '-1.5px' }}>
            {t.featuresTitle} <span style={{ color: '#E63946' }}>{t.featuresTitleAccent}</span>{t.featuresTitleEnd}
          </h2>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: '#666', maxWidth: '500px', margin: '0 auto' }}>
            {t.featuresSub}
          </p>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}>
          {features.map((f, idx) => (
            <div key={f.en.title} style={{ 
              padding: '32px 24px', 
              borderRadius: '20px', 
              border: '1px solid rgba(26,26,46,0.06)', 
              background: '#fff', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
              cursor: 'default', 
              position: 'relative', 
              overflow: 'hidden' 
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#E63946' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
                <SparkleIcon size={20} delay={idx * 0.3} />
              </div>
              <div style={{ color: '#E63946', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px' }}>
                {lang === 'jp' ? f.jp.title : f.en.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>
                {lang === 'jp' ? f.jp.desc : f.en.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '8%', pointerEvents: 'none' }}>
          <SparkleIcon size={18} delay={0.4} />
        </div>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', pointerEvents: 'none' }}>
          <SparkleIcon size={22} delay={1.1} />
        </div>

        <div style={{
          position: 'absolute',
          right: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.08,
          pointerEvents: 'none'
        }}>
          <img 
            src={ANIME_IMAGES.ctaDeco}
            alt=""
            style={{
              width: '180px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{ 
          padding: '48px 24px', 
          borderRadius: '28px', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, rgba(230,57,70,0.04) 0%, rgba(26,26,46,0.02) 100%)', 
          border: '1px solid rgba(230,57,70,0.12)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '10%', animation: 'sparkleFloat 2s ease-in-out infinite' }}>
            <SparkleIcon size={24} delay={0} />
          </div>
          <div style={{ position: 'absolute', bottom: '20px', left: '10%', animation: 'sparkleFloat 2s ease-in-out 0.5s infinite' }}>
            <SparkleIcon size={20} delay={0.5} />
          </div>
          <div style={{ position: 'absolute', top: '40%', left: '5%', animation: 'sparkleFloat 2.5s ease-in-out 0.8s infinite' }}>
            <SparkleIcon size={14} delay={0.8} />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: '#1a1a2e', marginBottom: '16px', letterSpacing: '-1px' }}>
            {t.ctaTitle} <span style={{ color: '#E63946' }}>{t.ctaTitleAccent}</span>{t.ctaTitleEnd}
          </h2>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: '#666', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            {t.ctaSub}
          </p>
          <Link to="/register" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '10px', 
            color: '#fff', 
            fontSize: '16px', 
            fontWeight: 700, 
            textDecoration: 'none', 
            padding: '18px 44px', 
            background: '#E63946', 
            borderRadius: '14px', 
            transition: 'all 0.3s ease', 
            boxShadow: '0 8px 30px rgba(230,57,70,0.3)' 
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(230,57,70,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,57,70,0.3)' }}>
            {t.ctaButton}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(26,26,46,0.06)', background: '#fff', padding: '32px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', right: '15%', pointerEvents: 'none' }}>
          <SparkleIcon size={12} delay={0.7} />
        </div>
        <div style={{ position: 'absolute', bottom: '30%', left: '10%', pointerEvents: 'none' }}>
          <SparkleIcon size={16} delay={1.4} />
        </div>

        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '16px' 
        }} className="footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={ANIME_IMAGES.heroBg} alt="OtakuBate" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>
              {lang === 'jp' ? 'オタクBate' : 'OtakuBate'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>
            © {new Date().getFullYear()} OtakuBate · {t.footerText}
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {t.footerLinks.map(link => {
              if (link === 'Contact') {
                return (
                  <button
                    key={link}
                    onClick={() => setShowContactModal(true)}
                    style={{ 
                      fontSize: '12px', 
                      color: '#999', 
                      textDecoration: 'none', 
                      letterSpacing: '1px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#999')}
                  >
                    {link}
                  </button>
                )
              }
              return (
                <Link 
                  key={link} 
                  to={link === 'Privacy' ? '/privacy' : link === 'Terms' ? '/terms' : '/contact'}
                  style={{ fontSize: '12px', color: '#999', textDecoration: 'none', letterSpacing: '1px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#999')}
                >
                  {link}
                </Link>
              )
            })}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes sparkleFloat {
          0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.3) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        
        /* Desktop Styles */
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .cta-buttons { 
            flex-direction: row !important; 
            max-width: 100% !important;
          }
          .cta-buttons a { 
            width: auto !important; 
            min-width: 180px;
          }
          .hero-visual { 
            min-height: 400px !important; 
          }
        }
        
        @media (min-width: 1024px) {
          .hero-content { 
            flex-direction: row !important; 
            gap: 64px !important; 
          }
          .hero-text { 
            text-align: left !important; 
            flex: 0 0 50% !important; 
            align-items: flex-start !important;
          }
          .hero-visual { 
            flex: 0 0 50% !important; 
            min-height: 450px !important;
          }
          .footer-content { 
            flex-direction: row !important; 
            justify-content: space-between !important; 
          }
        }
      `}</style>
    </div>
  )
}