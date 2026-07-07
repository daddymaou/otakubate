import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, AlertTriangle, User, Lock, BookOpen, Scale, MessageCircle, Mail } from 'lucide-react'

const Section = ({ id, title, icon, children }: { id?: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div id={id} className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="flex-shrink-0" style={{ color: '#E63946' }}>{icon}</span>}
      <h2 className="text-base font-bold" style={{ color: '#1a1a2e' }}>{title}</h2>
    </div>
    <div className="text-sm leading-relaxed space-y-2.5 pl-1" style={{ color: '#555' }}>{children}</div>
  </div>
)

export default function TermsConditions() {
  const navigate = useNavigate()

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

      {/* Navbar */}
      <nav 
        className="relative z-10 sticky top-0"
        style={{
          background: 'rgba(255, 248, 238, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(230, 57, 70, 0.08)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl hover:bg-black/5 transition-all duration-200"
          >
            <ArrowLeft size={20} style={{ color: '#666' }} />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} style={{ color: '#E63946' }} />
            <span className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Terms of Service</span>
          </div>
          <span className="text-xs ml-auto px-2 py-1 rounded-full" style={{ background: 'rgba(230,57,70,0.08)', color: '#E63946' }}>
            Updated: July 1, 2026
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header Card */}
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
              <Scale size={24} />
            </div>
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>Terms of Service</h1>
          <p style={{ color: '#999' }}>Effective: July 1, 2026 · Last Updated: July 1, 2026</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(230,57,70,0.06)', color: '#E63946' }}>
              <Shield size={12} className="inline mr-1" /> OtakuBate
            </span>
            <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(26,26,46,0.04)', color: '#666' }}>
              <FileText size={12} className="inline mr-1" /> Legal
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
            These Terms of Service ("Terms") constitute a legally binding agreement between you and OtakuBate governing your access to and use of the OtakuBate platform. By creating an account or using OtakuBate, you confirm that you are at least 13 years of age and agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </div>

        {/* Terms Sections */}
        <div 
          className="p-6 rounded-2xl space-y-0"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(230, 57, 70, 0.08)'
          }}
        >
          <Section id="account" title="1. Account Registration" icon={<User size={18} />}>
            <p>You must provide accurate, complete, and current information when creating your account. You are responsible for maintaining the security of your credentials and for all activity under your account. Notify us immediately if you suspect unauthorized access.</p>
            <p>Each person may only maintain one account. Creating multiple accounts to circumvent bans or restrictions is prohibited.</p>
          </Section>

          <Section id="use" title="2. Acceptable Use" icon={<AlertTriangle size={18} />}>
            <p>You agree to use OtakuBate only for lawful purposes. The following are strictly prohibited:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Harassment, bullying, threatening, or intimidating other users</li>
              <li>Posting hate speech, discriminatory content, or incitement to violence</li>
              <li>Sharing sexually explicit content involving minors (CSAM) — immediate legal reporting</li>
              <li>Impersonating real persons, organizations, or OtakuBate staff</li>
              <li>Spamming, phishing, or distributing malware</li>
              <li>Using automated bots to scrape, post, or interact without permission</li>
              <li>Circumventing security, rate limiting, or access controls</li>
              <li>Unauthorized commercial advertising without prior written consent</li>
            </ul>
          </Section>

          <Section id="content" title="3. Content & Intellectual Property" icon={<BookOpen size={18} />}>
            <p>You retain ownership of content you post on OtakuBate. By posting, you grant OtakuBate a non-exclusive, worldwide, royalty-free license to display, reproduce, and distribute your content on the platform.</p>
            <p>Anime, manga, and related media referenced on OtakuBate are the intellectual property of their respective rights holders. OtakuBate is a fan community platform and does not host copyrighted media without authorization.</p>
            <p>If you believe your copyright is being infringed, contact our support bot <strong style={{ color: '#E63946' }}>@OtakuBateBot</strong> on Telegram.</p>
          </Section>

          <Section id="dmca" title="4. DMCA & Copyright" icon={<Shield size={18} />}>
            <p>OtakuBate respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). To submit a takedown notice:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Identify the copyrighted work you claim is infringed</li>
              <li>Provide the URL(s) of the allegedly infringing content</li>
              <li>Include your contact information and a statement of good faith</li>
              <li>Sign the notice (electronic signature acceptable)</li>
            </ul>
            <p>Submit DMCA notices via <strong style={{ color: '#E63946' }}>@OtakuBateBot</strong> on Telegram.</p>
          </Section>

          <Section id="privacy" title="5. Privacy" icon={<Lock size={18} />}>
            <p>Your use of OtakuBate is also governed by our <Link to="/privacy" className="font-medium transition-colors hover:underline" style={{ color: '#E63946' }}>Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
          </Section>

          <Section id="moderation" title="6. Moderation & Enforcement" icon={<AlertTriangle size={18} />}>
            <p>OtakuBate reserves the right to remove content, suspend accounts, or ban users who violate these Terms at our sole discretion. Actions we may take include:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Warning or temporary suspension for minor violations</li>
              <li>Permanent account termination for severe or repeated violations</li>
              <li>Reporting illegal content to appropriate authorities</li>
            </ul>
            <p>You may appeal enforcement actions by contacting <strong style={{ color: '#E63946' }}>@OtakuBateBot</strong> on Telegram.</p>
          </Section>

          <Section id="disclaimer" title="7. Disclaimer of Warranties" icon={<AlertTriangle size={18} />}>
            <p>OtakuBate is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free from viruses or other harmful components.</p>
          </Section>

          <Section id="liability" title="8. Limitation of Liability" icon={<AlertTriangle size={18} />}>
            <p>To the maximum extent permitted by law, OtakuBate shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if we have been advised of such damages. Our total liability to you for any claims arising from these Terms shall not exceed $100 USD.</p>
          </Section>

          <Section id="termination" title="9. Termination" icon={<AlertTriangle size={18} />}>
            <p>You may delete your account at any time from the Settings page. We may terminate or suspend your access immediately if you breach these Terms. Upon termination, your right to use the Service ceases immediately, and we may delete your account data in accordance with our Privacy Policy.</p>
          </Section>

          <Section id="governing" title="10. Governing Law" icon={<Scale size={18} />}>
            <p>These Terms are governed by the laws of the United States, without regard to conflict of law provisions. Any disputes shall be resolved in courts of competent jurisdiction in the United States.</p>
          </Section>

          <Section id="changes" title="11. Changes to Terms" icon={<FileText size={18} />}>
            <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or a prominent in-app notice at least 14 days before they take effect. Continued use after the effective date constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section id="contact" title="12. Contact" icon={<MessageCircle size={18} />}>
            <p>Questions about these Terms? Contact us:</p>
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

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
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
              ← Back
            </button>
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
          
          {/* Maou Credit - Fixed closing tag */}
          <p className="text-xs" style={{ color: '#999' }}>
            Developed By{' '}
            <a 
              href="https://maou.name.ng/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#000000', 
                fontWeight: 700, 
                textDecoration: 'none',
                fontFamily: "'Arial', sans-serif",
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E63946')}
              onMouseLeave={e => (e.currentTarget.style.color = '#000000')}
            >
              ᗰᗩOᑌ
            </a>
          </p>
        </div>
      </div>

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