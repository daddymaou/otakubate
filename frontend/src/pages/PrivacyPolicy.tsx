import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Sparkles, FileText, Mail, Lock, User, Database, Cookie, AlertTriangle } from 'lucide-react'

const Section = ({ id, title, icon, children }: { id?: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div id={id} className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="flex-shrink-0" style={{ color: '#E63946' }}>{icon}</span>}
      <h2 className="text-base font-bold" style={{ color: '#1a1a2e' }}>{title}</h2>
    </div>
    <div className="text-sm leading-relaxed space-y-2.5 pl-1" style={{ color: '#555' }}>{children}</div>
  </div>
)

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pb-16" style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FFE8E8 100%)' }}>
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: 'rgba(230,57,70,0.05)', top: '-150px', right: '-100px', animation: 'blobFloat1 12s ease-in-out infinite' }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(26,26,46,0.04)', bottom: '-100px', left: '-80px', animation: 'blobFloat2 15s ease-in-out infinite' }}
        />
      </div>

      {/* Navbar - Matches Help/Support */}
      <nav 
        className="relative z-10 sticky top-0"
        style={{
          background: 'rgba(255, 248, 238, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(230, 57, 70, 0.08)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link 
            to="/settings" 
            className="p-2 rounded-xl hover:bg-black/5 transition-all duration-200"
          >
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </Link>
          <div className="flex items-center gap-2">
            <Shield size={20} style={{ color: '#E63946' }} />
            <span className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Privacy Policy</span>
          </div>
          <span className="text-xs ml-auto px-2 py-1 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            Updated: 2025
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header Card - Matches Help/Support */}
        <div 
          className="p-6 rounded-2xl mb-8 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}
            >
              <FileText size={24} />
            </div>
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>Privacy Policy</h1>
          <p style={{ color: '#999' }}>Effective: June 10, 2025 · Last Updated: June 10, 2025</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(230,57,70,0.06)', color: '#E63946' }}>
              <Sparkles size={12} className="inline mr-1" /> OtakuBate
            </span>
            <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(26,26,46,0.04)', color: '#666' }}>
              <Shield size={12} className="inline mr-1" /> Protected
            </span>
          </div>
        </div>

        {/* Intro Card */}
        <div 
          className="p-6 rounded-2xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
            Welcome to OtakuBate. We respect your privacy and are committed to protecting your personal data. This Privacy Policy describes how OtakuBate collects, uses, stores, and protects your information when you use our platform. By using OtakuBate, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Policy Sections */}
        <div 
          className="p-6 rounded-2xl space-y-0"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <Section id="collect" title="1. Information We Collect" icon={<Database size={18} />}>
            <p><strong style={{ color: '#E63946' }}>Account Information:</strong> When you create an account, we collect your username, email address, password (hashed), and optional display name. Google OAuth users provide their Google profile and email.</p>
            <p><strong style={{ color: '#E63946' }}>Profile Data:</strong> Bio, avatar image, banner image, favorite genres, favorite anime titles, and other profile information you choose to provide.</p>
            <p><strong style={{ color: '#E63946' }}>Content:</strong> Posts, comments, messages, and other content you create or share on OtakuBate.</p>
            <p><strong style={{ color: '#E63946' }}>Usage Data:</strong> Device information, IP addresses, browser type, pages visited, interactions with the platform, and session timestamps.</p>
            <p><strong style={{ color: '#E63946' }}>Communications:</strong> Email addresses used to send verification, security alerts, and OTP codes.</p>
          </Section>

          <Section id="use" title="2. How We Use Your Information" icon={<User size={18} />}>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Provide, maintain, and improve the OtakuBate platform</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Send transactional emails (verification, password reset, security alerts)</li>
              <li>Enable social features (following, posting, messaging, communities)</li>
              <li>Personalize your feed and content recommendations</li>
              <li>Detect and prevent fraud, abuse, and security violations</li>
            </ul>
          </Section>

          <Section id="sharing" title="3. Data Sharing" icon={<AlertTriangle size={18} />}>
            <p>We do <strong style={{ color: '#E63946' }}>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>
            <p>We may share data with:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong style={{ color: '#E63946' }}>Service providers:</strong> Cloudinary (image hosting), Brevo (email delivery), MongoDB Atlas (database), Google OAuth (authentication)</li>
              <li><strong style={{ color: '#E63946' }}>Law enforcement:</strong> When required by law or to protect rights and safety</li>
              <li><strong style={{ color: '#E63946' }}>Business transfers:</strong> In the event of a merger or acquisition</li>
            </ul>
          </Section>

          <Section id="security" title="4. Data Security" icon={<Lock size={18} />}>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Passwords hashed with bcrypt (cost factor 12)</li>
              <li>JWT-based authentication with short-lived access tokens</li>
              <li>Email verification for new accounts</li>
              <li>OTP codes for new device logins and sensitive actions</li>
              <li>HTTPS encryption for all data in transit</li>
              <li>Rate limiting on authentication endpoints</li>
            </ul>
          </Section>

          <Section id="rights" title="5. Your Rights" icon={<Shield size={18} />}>
            <p>Depending on your jurisdiction, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong style={{ color: '#E63946' }}>Access:</strong> Request a copy of your personal data</li>
              <li><strong style={{ color: '#E63946' }}>Correction:</strong> Update inaccurate information from your Settings</li>
              <li><strong style={{ color: '#E63946' }}>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong style={{ color: '#E63946' }}>Portability:</strong> Request your data in a portable format</li>
              <li><strong style={{ color: '#E63946' }}>Objection:</strong> Object to certain types of data processing</li>
            </ul>
            <p>To exercise these rights, message our support bot <strong style={{ color: '#E63946' }}>@OtakuBateBot</strong> on Telegram.</p>
          </Section>

          <Section id="cookies" title="6. Cookies & Tracking" icon={<Cookie size={18} />}>
            <p>OtakuBate uses the following types of storage:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong style={{ color: '#E63946' }}>localStorage:</strong> Authentication tokens (JWT) for session management</li>
              <li><strong style={{ color: '#E63946' }}>Cookies:</strong> Session identifiers for server-side authentication</li>
              <li><strong style={{ color: '#E63946' }}>Analytics:</strong> Privacy-friendly analytics to understand usage patterns</li>
            </ul>
          </Section>

          <Section id="retention" title="7. Data Retention" icon={<Database size={18} />}>
            <p>We retain your data as long as your account is active. When you delete your account:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Your profile, posts, and personal data are permanently deleted within 30 days</li>
              <li>Anonymized aggregate data may be retained for analytics</li>
              <li>Backup copies may persist for up to 90 days before deletion</li>
            </ul>
          </Section>

          <Section id="children" title="8. Children's Privacy" icon={<User size={18} />}>
            <p>OtakuBate is not directed to children under 13. We do not knowingly collect information from children under 13. If we become aware that we have collected such data, we will delete it promptly. Contact our support bot <strong style={{ color: '#E63946' }}>@OtakuBateBot</strong> on Telegram if you believe a child has provided us with personal information.</p>
          </Section>

          <Section id="changes" title="9. Changes to This Policy" icon={<FileText size={18} />}>
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a prominent notice on the platform. Your continued use of OtakuBate after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section id="contact" title="10. Contact Us" icon={<Mail size={18} />}>
            <p>For privacy-related questions, data requests, or concerns:</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.04)', border: '1px solid rgba(230,57,70,0.08)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946' }}>
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#1a1a2e' }}>Support Bot</p>
                  <p className="text-xs" style={{ color: '#E63946' }}>@OtakuBateBot on Telegram</p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            to="/settings" 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(26,26,46,0.05)',
              color: '#1a1a2e'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(230,57,70,0.1)'
              e.currentTarget.style.color = '#E63946'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(26,26,46,0.05)'
              e.currentTarget.style.color = '#1a1a2e'
            }}
          >
            ← Back to Settings
          </Link>
          <a 
            href="https://t.me/OtakuBateBot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(34,158,217,0.08)',
              color: '#229ED9',
              border: '1px solid rgba(34,158,217,0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(34,158,217,0.15)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(34,158,217,0.08)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            💬 Contact Support
          </a>
        </div>
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
      `}</style>
    </div>
  )
}