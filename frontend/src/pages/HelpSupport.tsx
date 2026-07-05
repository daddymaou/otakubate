import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, HelpCircle, MessageCircle, Mail, FileText, 
  ChevronDown, ChevronUp, Search, Sparkles, Shield, 
  User, Lock, Bell, AtSign, Heart, Users, CreditCard,
  AlertCircle, CheckCircle, ExternalLink, Send, Phone,
  Clock, BookOpen, Video, Download, Award, Globe,
  MessagesSquare, Flag, UsersRound, X, Rocket, Code2,
  Bot, Loader2, Menu, Home, Zap, Star, Crown
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// CONFIG
// ============================================
const AIKO_API_ENDPOINT = '/api/ai/chat'
const TELEGRAM_BOT = 'https://t.me/OtakuBateBot'
const TELEGRAM_CHANNEL = 'https://t.me/otakubate'
const DISCORD_INVITE = 'https://discord.gg/GASuyBbtV'
const AIKO_AVATAR_URL = 'https://files.catbox.moe/8anicu.png'

// ============================================
// FALLBACK RESPONSES
// ============================================
const AIKO_FALLBACK_RESPONSES: Record<string, string> = {
  'club': "To create a club, go to OtakuHub and click the 'Create Club' button. You'll need to add a name and avatar — it's super easy! 🌸",
  'create club': "To create a club, go to OtakuHub and click the 'Create Club' button. You'll need to add a name and avatar — it's super easy! 🌸",
  'join club': "To join a club, browse clubs in OtakuHub and tap on any club you like. You'll see a 'Join Club' button — just tap it! ✨",
  'report': "Please send your report to our Telegram bot @OtakuBateBot — we'll handle it ASAP! 🤖",
  'report a problem': "Please send your report to our Telegram bot @OtakuBateBot — we'll handle it ASAP! 🤖",
  'human': "For human support, message our Telegram bot @OtakuBateBot and an admin will get back to you! 💬",
  'talk to a human': "For human support, message our Telegram bot @OtakuBateBot and an admin will get back to you! 💬",
  'password': "To change your password, go to Privacy & Security → Security section. Click 'Change Password' and follow the verification process. 🔒",
  'change password': "To change your password, go to Privacy & Security → Security section. Click 'Change Password' and follow the verification process. 🔒",
  'email': "To change your email, go to Privacy & Security → Security section. Click 'Change Email' — you'll verify your current email first. 📧",
  'change email': "To change your email, go to Privacy & Security → Security section. Click 'Change Email' — you'll verify your current email first. 📧",
  'delete account': "Account deletion requires verification via OTP first. Go to Privacy & Security → Danger Zone → Delete Account. Please be careful — this can't be undone! 😢",
  'profile': "To customize your profile, go to Settings → Profile Customization. You can change your avatar, banner, display name, and bio there! ✨",
  'avatar': "You can upload a custom avatar in Profile Customization → Avatar tab. Supported formats: PNG, JPG, GIF (max 5MB). 📸",
  'banner': "The recommended banner size is 1500x500 pixels for the best display across all devices. 📐",
  'username': "You can change your username in Profile Customization. Click the edit icon next to your username — you can change it every 3 days. 📝",
  'notification': "To manage notifications, go to Notification Settings. You can toggle what notifications you receive — email, push, likes, comments, and more! 🔔",
  'notifications': "To manage notifications, go to Notification Settings. You can toggle what notifications you receive — email, push, likes, comments, and more! 🔔",
  'followers': "When someone follows you, you'll see a notification. You can view all your followers on your profile page. 👥",
  'following': "You can see who you're following on your profile page under the 'Following' tab. 👥",
  'like': "Click the heart icon under any post to like it. Click again to unlike! 💖",
  'comment': "Click the comment icon or 'Reply' button under a post to add your comment. 💬",
  'mention': "Type @ followed by a username (e.g., @john) to mention them in a post or comment. They'll receive a notification! 📣",
  'edit post': "Click the three dots menu (⋮) on your post to edit or delete it. ✏️",
  'delete post': "Click the three dots menu (⋮) on your post — you'll see the delete option there. This action can't be undone. 🗑️",
  'otakuhub': "OtakuHub is where you discover and join anime clubs built around shows, genres, and shared interests. It's the heart of the community! 🎌",
  'club settings': "Club settings are available to admins and owners. You can edit the club name, description, avatar, and banner. ⚙️",
  'block': "You can block users from their profile or from your messages. Go to Privacy & Security → Blocked Users to manage them. 🚫",
  'unblock': "Go to Privacy & Security → Blocked Users and tap 'Unblock' next to the user you want to unblock. ✅",
  'verification': "After registration, we send a 6-digit code to your email. Enter it in the verification screen to activate your account. ✅",
  'google sign in': "Yes! Click 'Continue with Google' on the login page to sign in using your Google account. 🅶",
  'discord': "Join our Discord server at discord.gg/GASuyBbtV and connect with the community! 🎌",
  'telegram': "Our Telegram bot is at t.me/OtakuBateBot — it's the best way to get support! 🤖",
  'support': "For any support, just message @OtakuBateBot on Telegram and we'll help you out! 🤖",
  'channel': "Follow our Telegram channel at t.me/otakubate for updates and announcements! 📢",
  'telegram channel': "Follow our Telegram channel at t.me/otakubate for updates and announcements! 📢",
}

const AIKO_DEFAULT_FALLBACK = "I'm not totally sure about that one 🌸 Please message our support bot @OtakuBateBot on Telegram — they'll get you sorted! 🤖"

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  
  for (const [key, response] of Object.entries(AIKO_FALLBACK_RESPONSES)) {
    if (lower.includes(key)) {
      return response
    }
  }
  
  if (lower.includes('help') || lower.includes('?')) {
    return "I'm here to help! 🌸 Try asking me about clubs, profiles, notifications, or account settings. For direct support, message @OtakuBateBot on Telegram! 🤖"
  }
  
  return AIKO_DEFAULT_FALLBACK
}

// ============================================
// FAQ DATA - CLEAN & ORGANIZED
// ============================================
const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <Rocket size={18} />,
    color: '#E63946',
    items: [
      { q: 'How do I create an account?', a: 'Click "Register" on the login page, fill in your details, and verify your email address. You\'ll receive a 6-digit code to confirm your email.' },
      { q: 'How do I verify my email?', a: 'After registration, we send a 6-digit code to your email. Enter it in the verification screen to activate your account.' },
      { q: 'What are the benefits of verification?', a: 'Verified accounts get a checkmark badge, higher posting limits, and access to exclusive features.' },
      { q: 'Can I use Google to sign in?', a: 'Yes! Click "Continue with Google" on the login page to sign in using your Google account.' },
    ]
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: <User size={18} />,
    color: '#8B5CF6',
    items: [
      { q: 'How do I change my username?', a: 'Go to Profile Customization page. Click the edit icon next to your username. You can change it every 3 days.' },
      { q: 'How do I upload a custom avatar?', a: 'Go to Profile Customization → Avatar tab. Click "Upload Custom Avatar" and select an image (max 5MB).' },
      { q: 'What are the recommended banner dimensions?', a: 'The recommended banner size is 1500x500 pixels for the best display across all devices.' },
      { q: 'How do I add my favorite anime/genres?', a: 'Go to Profile Customization → Profile Info tab. Enter comma-separated values in the favorite fields.' },
      { q: 'Can I change my display name?', a: 'Yes! Go to Profile Customization → Profile Info tab and edit your display name anytime.' },
    ]
  },
  {
    id: 'security',
    name: 'Privacy & Security',
    icon: <Shield size={18} />,
    color: '#059669',
    items: [
      { q: 'How do I change my password?', a: 'Go to Privacy & Security → Security section. Click "Change Password" and follow the verification process.' },
      { q: 'How do I change my email?', a: 'Go to Privacy & Security → Security section. Click "Change Email" - you\'ll verify your current email first.' },
      { q: 'What happens when I delete my account?', a: 'All your data including posts, comments, and messages are permanently deleted. This action cannot be undone.' },
      { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption and never share your personal information with third parties.' },
    ]
  },
  {
    id: 'posts',
    name: 'Posts & Reactions',
    icon: <Heart size={18} />,
    color: '#DC2626',
    items: [
      { q: 'How do I like a post?', a: 'Click the heart icon under any post. You can unlike it by clicking again.' },
      { q: 'How do I comment on a post?', a: 'Click the comment icon or "Reply" button under a post to add your comment.' },
      { q: 'What are mentions?', a: 'Type @ followed by a username (e.g., @john) to mention them in a post or comment. They\'ll receive a notification.' },
      { q: 'Can I edit or delete my posts?', a: 'Yes, click the three dots menu (⋮) on your post to edit or delete it.' },
    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: <Bell size={18} />,
    color: '#F59E0B',
    items: [
      { q: 'What types of notifications do I get?', a: 'You\'ll get notifications for likes, comments, replies, follows, and mentions.' },
      { q: 'Can I turn off notifications?', a: 'Yes, go to Notification Settings to customize which notifications you receive.' },
      { q: 'How do I mark notifications as read?', a: 'Click on a notification to mark it as read, or use "Mark all as read" button.' },
    ]
  },
  {
    id: 'clubs',
    name: 'Clubs & Community',
    icon: <UsersRound size={18} />,
    color: '#8B5CF6',
    items: [
      { q: 'What is OtakuHub?', a: 'OtakuHub is where you discover and join anime clubs built around shows, genres, and shared interests.' },
      { q: 'How do I create a club?', a: 'Go to OtakuHub and click "Create Club". Add a name, avatar, and optional banner and description.' },
      { q: 'How do I join a club?', a: 'Browse clubs in OtakuHub and tap on any club to view and join it.' },
      { q: 'How do I report a user, post, or club?', a: 'Message our support bot @OtakuBateBot on Telegram with the details and we\'ll handle it ASAP! 🤖' },
    ]
  }
]

// ============================================
// QUICK LINKS DATA
// ============================================
const quickLinks = [
  { icon: <Bot size={16} />, label: 'Telegram Bot', description: '@OtakuBateBot', link: TELEGRAM_BOT, color: '#229ED9' },
  { icon: <MessageCircle size={16} />, label: 'Discord', description: 'Join our server', link: DISCORD_INVITE, color: '#5865F2' },
  { icon: <Send size={16} />, label: 'Telegram Channel', description: '@otakubate', link: TELEGRAM_CHANNEL, color: '#1B8FC4' },
  { icon: <Globe size={16} />, label: 'Website', description: 'otakubate.com', link: 'https://otakubate.com', color: '#E63946' },
]

const communityLinks = [
  { icon: <UsersRound size={14} />, title: 'Browse Clubs', desc: 'Discover anime clubs', link: '/clubs' },
  { icon: <Award size={14} />, title: 'Guidelines', desc: 'Community rules', link: '/terms' },
  { icon: <Bot size={14} />, title: 'Report Issue', desc: 'Message @OtakuBateBot', link: TELEGRAM_BOT },
]

const quickGuides = [
  { icon: <Video size={14} />, title: 'Video Tutorials', desc: 'Watch guides', link: '#' },
  { icon: <Download size={14} />, title: 'Mobile App', desc: 'Coming soon', link: '#', soon: true },
  { icon: <Star size={14} />, title: 'Feature Requests', desc: 'Suggest features', link: TELEGRAM_BOT },
]

// ============================================
// COMPONENTS
// ============================================
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div 
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ 
        border: '1px solid rgba(230,57,70,0.08)',
        background: open ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
      }}
    >
      <button 
        onClick={() => setOpen(o => !o)} 
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/30 transition-all"
      >
        <span className="text-sm font-medium pr-3" style={{ color: '#1a1a2e' }}>{q}</span>
        {open ? 
          <ChevronUp size={16} className="flex-shrink-0" style={{ color: '#E63946' }} /> : 
          <ChevronDown size={16} className="flex-shrink-0" style={{ color: '#bbb' }} />
        }
      </button>
      {open && (
        <div className="px-4 pb-3">
          <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// DOCUMENTATION MODAL
// ============================================
function DocsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
              <BookOpen size={18} />
            </div>
            <h2 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>Documentation</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
            <X size={18} style={{ color: '#999' }} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-70px)] space-y-2">
          <p className="text-xs mb-3" style={{ color: '#999' }}>Browse topics — a full docs site is on the way.</p>
          {[
            { icon: <Rocket size={14} />, title: 'Getting Started', desc: 'Account setup and verification' },
            { icon: <User size={14} />, title: 'Profile & Customization', desc: 'Avatars, banners, and bios' },
            { icon: <UsersRound size={14} />, title: 'Clubs & OtakuHub', desc: 'Creating and joining clubs' },
            { icon: <Shield size={14} />, title: 'Privacy & Security', desc: 'Account safety' },
          ].map((topic, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                {topic.icon}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{topic.title}</p>
                <p className="text-xs" style={{ color: '#999' }}>{topic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// AIKO CHAT WIDGET - REDESIGNED
// ============================================
type ChatMessage = { id: string; from: 'user' | 'aiko'; text: string }

const AIKO_QUICK_REPLIES = [
  'How do I create a club?',
  'How do I report a problem?',
  'How do I contact support?',
]

function AikoChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', from: 'aiko', text: "Hiya! I'm Aiko 🌸 Ask me anything about OtakuBate — or message @OtakuBateBot on Telegram for direct support!" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping, isOpen])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMsg: ChatMessage = { id: Date.now().toString(), from: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setShowQuickReplies(false)

    try {
      const response = await fetch(AIKO_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      })

      const data = await response.json()

      if (response.ok && data.success && data.response) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-aiko',
          from: 'aiko',
          text: data.response
        }])
      } else {
        const fallback = getFallbackResponse(trimmed)
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-aiko-fallback',
          from: 'aiko',
          text: fallback
        }])
      }
    } catch (error) {
      const fallback = getFallbackResponse(trimmed)
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-aiko-fallback',
        from: 'aiko',
        text: fallback
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Button - Modern & Sleek */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-3 py-1.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, #E63946, #FF6B7A)',
          boxShadow: '0 8px 32px rgba(230,57,70,0.4)'
        }}
      >
        <img 
          src={AIKO_AVATAR_URL} 
          alt="Aiko" 
          className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
        />
        <span className="text-sm font-bold text-white">Ask Aiko</span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </button>

      {/* Chat Modal - Improved Design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(12px)' }} onClick={() => setIsOpen(false)}>
          <div
            className="relative w-full sm:max-w-sm h-[90vh] sm:h-[580px] max-h-[700px] overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-slide-up"
            style={{ background: 'linear-gradient(180deg, #FFF8EE 0%, #FFF0F0 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header - Clean */}
            <div className="relative px-4 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #E63946, #FF6B7A)' }}>
              <div className="relative">
                <img 
                  src={AIKO_AVATAR_URL} 
                  alt="Aiko" 
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Aiko 🌸</p>
                <p className="text-[10px] text-white/80">Online • Here to help</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Messages - Improved */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'aiko' && (
                    <img 
                      src={AIKO_AVATAR_URL} 
                      alt="Aiko" 
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-auto border border-[rgba(230,57,70,0.1)]"
                    />
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm ${
                      m.from === 'user' ? 'rounded-br-sm text-white' : 'rounded-bl-sm bg-white'
                    }`}
                    style={
                      m.from === 'user' 
                        ? { background: 'linear-gradient(135deg, #E63946, #FF6B7A)' } 
                        : { color: '#1a1a2e', border: '1px solid rgba(230,57,70,0.08)' }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <img 
                    src={AIKO_AVATAR_URL} 
                    alt="Aiko" 
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 border border-[rgba(230,57,70,0.1)]"
                  />
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white flex items-center gap-1 shadow-sm" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
                    <span className="typing-dot" style={{ background: '#E63946' }} />
                    <span className="typing-dot" style={{ background: '#E63946', animationDelay: '0.15s' }} />
                    <span className="typing-dot" style={{ background: '#E63946', animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}

              {/* Quick Replies - Styled */}
              {messages.length === 1 && !isTyping && showQuickReplies && (
                <div className="flex flex-col gap-2 pt-2">
                  {AIKO_QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-xs px-4 py-2.5 rounded-xl bg-white hover:shadow-md transition-all active:scale-98"
                      style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#E63946' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input - Clean */}
            <div className="px-3 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(230,57,70,0.08)', background: 'rgba(255,255,255,0.8)' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input) }}
                placeholder="Message Aiko..."
                className="flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none bg-white/80 backdrop-blur"
                style={{ border: '1px solid rgba(230,57,70,0.15)', color: '#1a1a2e' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF6B7A)' }}
              >
                {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// MAIN HELP SUPPORT PAGE
// ============================================
export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDocs, setShowDocs] = useState(false)

  const allFaqs = faqCategories.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.name, categoryId: cat.id }))
  )

  const filteredFaqs = searchQuery 
    ? allFaqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory 
      ? allFaqs.filter(faq => faq.categoryId === selectedCategory)
      : null

  const selectedCategoryData = faqCategories.find(c => c.id === selectedCategory)

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
      <AikoChatWidget />

      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 px-4 py-3" style={{ background: 'rgba(255, 248, 238, 0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.08)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/settings" className="p-2 rounded-xl hover:bg-black/5 transition-all">
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
              <HelpCircle size={20} style={{ color: '#E63946' }} />
              Help & Support
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Search Bar - Enhanced */}
        <div className="mb-5">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur"
              style={{ border: '1px solid rgba(230,57,70,0.1)', color: '#1a1a2e' }}
            />
          </div>
        </div>

        {/* Quick Links - 4 Column Grid */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {quickLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/80 backdrop-blur transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 text-center"
                  style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}15`, color: link.color }}>
                    {link.icon}
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{link.label}</span>
                  <span className="text-[10px]" style={{ color: '#999' }}>{link.description}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Categories - Clean Grid */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
              <Zap size={14} style={{ color: '#E63946' }} />
              Browse Topics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 backdrop-blur transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 text-left"
                  style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${category.color}15`, color: category.color }}>
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium leading-tight" style={{ color: '#1a1a2e' }}>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category View */}
        {selectedCategory && selectedCategoryData && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 transition"
                >
                  <ArrowLeft size={16} style={{ color: '#E63946' }} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${selectedCategoryData.color}15`, color: selectedCategoryData.color }}>
                    {selectedCategoryData.icon}
                  </div>
                  <h2 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>{selectedCategoryData.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs px-3 py-1 rounded-full hover:bg-black/5 transition"
                style={{ color: '#E63946' }}
              >
                All Topics
              </button>
            </div>
            <div className="space-y-2">
              {selectedCategoryData.items.map((item, idx) => (
                <FAQItem key={idx} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        )}

        {/* Search/Filter Results */}
        {(searchQuery || (selectedCategory && !selectedCategoryData)) && (
          <div className="space-y-3 mb-6">
            <p className="text-xs" style={{ color: '#999' }}>
              {filteredFaqs?.length || 0} {filteredFaqs?.length === 1 ? 'result' : 'results'} found
            </p>
            {filteredFaqs && filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FAQItem key={index} q={faq.q} a={faq.a} />
              ))
            ) : (
              <div className="text-center py-10">
                <HelpCircle size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#999' }} />
                <p className="text-sm" style={{ color: '#666' }}>No results found</p>
                <p className="text-xs mt-1" style={{ color: '#999' }}>Try different keywords</p>
              </div>
            )}
          </div>
        )}

        {/* All FAQs - Only when not searching/filtering */}
        {!searchQuery && !selectedCategory && (
          <div className="space-y-6 mb-6">
            {faqCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${category.color}15`, color: category.color }}>
                    {category.icon}
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{category.name}</h3>
                </div>
                <div className="space-y-2">
                  {category.items.slice(0, 3).map((item, idx) => (
                    <FAQItem key={idx} q={item.q} a={item.a} />
                  ))}
                </div>
                {category.items.length > 3 && (
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs mt-2 hover:underline flex items-center gap-1"
                    style={{ color: '#E63946' }}
                  >
                    View all {category.items.length} questions →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Support Banner - Prominent */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, #229ED9, #1B8FC4)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Bot size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white">Need Help?</h3>
              <p className="text-sm text-white/80 mb-3">Message our support bot for quick assistance from our team.</p>
              <a
                href={TELEGRAM_BOT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>@OtakuBateBot</span>
                <Send size={14} style={{ color: '#229ED9' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Community & Guides */}
        {!searchQuery && !selectedCategory && (
          <>
            {/* Community Links */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <UsersRound size={14} style={{ color: '#E63946' }} />
                Community
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {communityLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                    style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{item.title}</p>
                      <p className="text-xs truncate" style={{ color: '#999' }}>{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Guides */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                <BookOpen size={14} style={{ color: '#E63946' }} />
                Quick Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {quickGuides.map((guide, idx) => (
                  <a
                    key={idx}
                    href={guide.link}
                    target={guide.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${guide.soon ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{ border: '1px solid rgba(230,57,70,0.06)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
                      {guide.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{guide.title}</p>
                      <p className="text-xs truncate" style={{ color: '#999' }}>{guide.desc}</p>
                    </div>
                    {guide.soon && <span className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">Soon</span>}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Response Time */}
        <div className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs" style={{ color: '#999' }}>
            <span className="flex items-center gap-1.5"><Clock size={12} /> Response: <strong className="text-[#1a1a2e]">2-4 hours</strong></span>
            <span className="flex items-center gap-1.5"><Bot size={12} /> Support via <strong className="text-[#1a1a2e]">Telegram Bot</strong></span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          animation: typing-bounce 1s infinite ease-in-out;
        }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}