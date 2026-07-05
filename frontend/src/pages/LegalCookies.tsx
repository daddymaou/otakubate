import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, FileText, Lock, ScrollText, ExternalLink, 
  Shield, Cookie, AlertCircle, CheckCircle, Printer, 
  Download, Clock, Eye, Database, Users, Mail, X,
  User, MessageCircle, Image, Activity, Smartphone
} from 'lucide-react'

const legalDocs = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: <Lock size={18} />,
    description: 'How we collect, use, and protect your personal information',
    lastUpdated: 'July 1, 2026',
    color: '#3B82F6',
    sections: [
      { title: 'Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users. This may include your name, username, email address, profile information, and any content you post.' },
      { title: 'How We Use Your Information', content: 'We use your information to provide, maintain, and improve our services, to communicate with you, to protect against fraud and abuse, and to personalize your experience.' },
      { title: 'Information Sharing', content: 'We do not sell your personal information. We may share your information with your consent, to comply with legal obligations, or to protect the rights and safety of OtakuBate and its users.' },
      { title: 'Data Security', content: 'We implement industry-standard security measures to protect your information, including encryption of sensitive data and regular security audits.' },
      { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. You can manage most of your information through your account settings.' },
    ]
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: <ScrollText size={18} />,
    description: 'Rules and guidelines for using OtakuBate',
    lastUpdated: 'July 1, 2026',
    color: '#E63946',
    sections: [
      { title: 'Acceptance of Terms', content: 'By accessing or using OtakuBate, you agree to be bound by these Terms of Service and our Privacy Policy.' },
      { title: 'User Conduct', content: 'You agree not to post content that is illegal, harassing, hateful, or violates others\' rights. Respect the community and follow our content guidelines.' },
      { title: 'Intellectual Property', content: 'You retain ownership of content you post. By posting, you grant OtakuBate a license to display and distribute your content on our platform.' },
      { title: 'Account Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms or harm the community.' },
      { title: 'Limitation of Liability', content: 'OtakuBate is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.' },
    ]
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: <Cookie size={18} />,
    description: 'How we use cookies and similar technologies',
    lastUpdated: 'July 1, 2026',
    color: '#10B981',
    sections: [
      { title: 'What Are Cookies', content: 'Cookies are small text files stored on your device that help us remember your preferences and improve your experience.' },
      { title: 'How We Use Cookies', content: 'We use essential cookies for authentication and security, preference cookies to remember your settings, and analytics cookies to understand how users interact with our platform.' },
      { title: 'Managing Cookies', content: 'You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our service.' },
      { title: 'Third-Party Cookies', content: 'We may use third-party services that set their own cookies to provide analytics and improve our platform.' },
    ]
  }
]

const dataCollection = [
  { icon: <User size={12} />, label: 'Account information', color: '#10B981' },
  { icon: <Image size={12} />, label: 'Profile data (avatar, bio, etc.)', color: '#10B981' },
  { icon: <MessageCircle size={12} />, label: 'Posts and comments', color: '#10B981' },
  { icon: <Mail size={12} />, label: 'Direct messages', color: '#10B981' },
  { icon: <Activity size={12} />, label: 'Usage analytics', color: '#10B981' },
  { icon: <Smartphone size={12} />, label: 'Device and browser info', color: '#10B981' },
]

// Legal Modal Component
function LegalModal({ doc, onClose }: { doc: typeof legalDocs[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${doc.color}10`, color: doc.color }}>
              {doc.icon}
            </div>
            <h2 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>{doc.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition">
            <X size={18} style={{ color: '#999' }} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-70px)]">
          {doc.sections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="font-semibold text-sm mb-2" style={{ color: '#1a1a2e' }}>{section.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{section.content}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(230,57,70,0.1)' }}>
            <p className="text-xs" style={{ color: '#999' }}>Last updated: {doc.lastUpdated}</p>
            <button onClick={() => window.print()} className="mt-3 text-xs flex items-center justify-center gap-1 hover:underline mx-auto" style={{ color: '#E63946' }}>
              <Printer size={12} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LegalCookies() {
  const [selectedDoc, setSelectedDoc] = useState<typeof legalDocs[0] | null>(null)

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {selectedDoc && <LegalModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4" style={{ background: 'rgba(255, 248, 238, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(230,57,70,0.1)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/settings" className="p-2 rounded-xl hover:bg-black/5 transition-all">
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <FileText size={20} style={{ color: '#E63946' }} />
            Legal & Cookies
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro Hero Card */}
        <div className="mb-8 p-6 rounded-3xl bg-white shadow-sm relative overflow-hidden" style={{ border: '1px solid rgba(230,57,70,0.08)' }}>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: '#E63946' }} />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E63946, #ff6b6b)', color: '#fff' }}>
              <Shield size={22} />
            </div>
            <div>
              <p className="font-bold text-base mb-1" style={{ color: '#1a1a2e' }}>Your Privacy Matters</p>
              <p className="text-xs leading-relaxed" style={{ color: '#666' }}>We're committed to protecting your data and being transparent about our practices. Review our policies below anytime.</p>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#bbb' }}>Documents</p>

        {/* Legal Documents */}
        <div className="space-y-3 mb-8">
          {legalDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-98 text-left"
              style={{ border: '1px solid rgba(230,57,70,0.08)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${doc.color}10`, color: doc.color }}>
                  {doc.icon}
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#1a1a2e' }}>{doc.title}</h3>
                  <p className="text-xs" style={{ color: '#999' }}>{doc.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={10} style={{ color: '#bbb' }} />
                    <span className="text-[10px]" style={{ color: '#bbb' }}>Updated {doc.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <ExternalLink size={16} style={{ color: '#bbb' }} />
            </button>
          ))}
        </div>

        {/* Section Label */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#bbb' }}>Data We Collect</p>

        {/* Information We Collect */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <Database size={14} style={{ color: '#E63946' }} />
            Information We Collect
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dataCollection.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
                <CheckCircle size={12} style={{ color: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Contact for Legal */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: '#999' }}>
            Have questions about our legal policies? Contact us at{' '}
            <a href="mailto:daddymaouu@gmail.com" className="hover:underline" style={{ color: '#E63946' }}>
              daddymaouu@gmail.com
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}