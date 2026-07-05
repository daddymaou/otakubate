import dotenv from 'dotenv'
dotenv.config()

const LOGO_URL = 'https://files.catbox.moe/8anicu.png'

// ---------- UNIQUE ANIME-THEMED SVG ICONS ----------
const icons = {
  verify: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#E63946" stroke-width="2" fill="none"/><path d="M8 12L11 15L16 9" stroke="#E63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="11" rx="2" stroke="#E63946" stroke-width="2" fill="none"/><path d="M8 11V8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V11" stroke="#E63946" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  key: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 2L15 8M17 5L19 7" stroke="#E63946" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="10" cy="14" r="6" stroke="#E63946" stroke-width="2" fill="none"/><path d="M14 10L10 14" stroke="#E63946" stroke-width="2" stroke-linecap="round"/></svg>`,
  sparkle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" fill="#E63946" opacity="0.8"/></svg>`,
  shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#E63946" stroke-width="2" fill="none"/><path d="M9 12L11 14L15 10" stroke="#E63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  anime: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#E63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 17L12 22L22 17" stroke="#E63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 12L12 17L22 12" stroke="#E63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
}

// ---------- UNIQUE ANIME-THEMED EMAIL TEMPLATE ----------
const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
  <title>OtakuBate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0 !important; background: #0f0f1a; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 580px; margin: 0 auto; padding: 12px; }
    .email-container { background: linear-gradient(160deg, #14142a 0%, #1a1a35 50%, #0f0f1a 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.03); border: 1px solid rgba(230, 57, 70, 0.08); }
    
    .email-header { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%); 
      padding: 30px 24px 22px; 
      text-align: center; 
      border-bottom: 2px solid rgba(230, 57, 70, 0.15);
      position: relative;
      overflow: hidden;
    }
    .email-header::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #E63946, #FF6B7A, #E63946, transparent);
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { background-position: -200% 0; }
      50% { background-position: 200% 0; }
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%);
      border-radius: 50%;
    }
    .logo-wrapper { display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; z-index: 1; }
    .logo-img { width: 38px; height: 38px; object-fit: contain; border-radius: 8px; }
    .logo-text { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #ffffff 0%, #E63946 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .logo-badge { font-size: 8px; background: rgba(230,57,70,0.2); color: #E63946; padding: 2px 8px; border-radius: 20px; letter-spacing: 1px; font-weight: 700; text-transform: uppercase; -webkit-text-fill-color: #E63946; }
    .tagline { font-size: 10px; letter-spacing: 4px; color: rgba(230,57,70,0.5); text-transform: uppercase; font-weight: 600; position: relative; z-index: 1; margin-top: 8px; }

    .email-content { padding: 28px 24px 24px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); }
    @media (prefers-color-scheme: dark) { .email-content { background: rgba(255, 255, 255, 0.02); } }

    h2 { font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #f0e6d2; letter-spacing: -0.5px; line-height: 1.2; }
    .greeting { font-size: 14px; color: #a8a8c8; line-height: 1.6; margin-bottom: 20px; }
    .highlight { color: #E63946; font-weight: 700; }

    .otp-card { 
      background: linear-gradient(135deg, rgba(230,57,70,0.06) 0%, rgba(230,57,70,0.02) 100%); 
      border: 1px solid rgba(230,57,70,0.12); 
      border-radius: 20px; 
      padding: 28px 20px; 
      text-align: center; 
      margin: 24px 0; 
      position: relative;
      box-shadow: 0 0 40px rgba(230,57,70,0.03);
    }
    .otp-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(230,57,70,0.1), transparent, rgba(230,57,70,0.05));
      z-index: -1;
    }
    .otp-label { font-size: 9px; text-transform: uppercase; letter-spacing: 4px; font-weight: 700; color: #E63946; margin-bottom: 14px; display: block; }
    .otp-code { 
      font-size: 42px; 
      font-weight: 800; 
      letter-spacing: 12px; 
      color: #E63946; 
      font-family: 'SF Mono', 'Courier New', monospace; 
      background: rgba(230,57,70,0.06); 
      padding: 14px 20px; 
      border-radius: 14px; 
      display: inline-block; 
      text-shadow: 0 0 40px rgba(230,57,70,0.15);
      border: 1px solid rgba(230,57,70,0.06);
    }
    @media (max-width: 480px) { .otp-code { font-size: 30px; letter-spacing: 8px; padding: 12px 16px; } }
    .expiry { font-size: 11px; color: #6a6a8a; margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; }

    .action-btn { 
      display: inline-block; 
      background: linear-gradient(135deg, #E63946 0%, #ff5a67 100%); 
      color: white; 
      font-weight: 700; 
      font-size: 14px; 
      padding: 14px 34px; 
      border-radius: 50px; 
      text-decoration: none; 
      box-shadow: 0 8px 24px rgba(230,57,70,0.25); 
      transition: all 0.3s ease; 
      margin: 12px 0 4px; 
      text-align: center;
      letter-spacing: 0.5px;
    }

    .feature-grid { 
      background: rgba(230,57,70,0.03); 
      border-radius: 16px; 
      padding: 16px 18px; 
      margin: 20px 0; 
      border: 1px solid rgba(230,57,70,0.06); 
    }
    .feature-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
    .feature-item:last-child { border-bottom: none; }
    .feature-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(230,57,70,0.08); border-radius: 8px; font-size: 14px; }
    .feature-text { flex: 1; font-size: 12px; color: #a8a8c8; }

    .warning-box { 
      background: rgba(230,57,70,0.04); 
      border-left: 3px solid #E63946; 
      border-radius: 10px; 
      padding: 12px 16px; 
      margin: 16px 0; 
      font-size: 11px; 
      color: #8a8aaa; 
      line-height: 1.5; 
    }

    .email-footer { background: #0a0a14; padding: 24px 20px; text-align: center; border-top: 1px solid rgba(230,57,70,0.06); }
    .footer-links { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 12px; }
    .footer-links a { color: #555577; text-decoration: none; font-size: 10px; transition: color 0.2s; letter-spacing: 0.5px; }
    .footer-links a:hover { color: #E63946; }
    .copyright { font-size: 9px; color: #3a3a55; line-height: 1.5; letter-spacing: 0.5px; }
    
    @media (max-width: 520px) { .email-content { padding: 20px 16px; } h2 { font-size: 22px; } .otp-card { padding: 20px 14px; } .action-btn { padding: 12px 24px; font-size: 13px; } }
  </style>
</head>
<body style="margin: 0; padding: 12px; background: #0f0f1a;">
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo-wrapper">
          <img src="${LOGO_URL}" alt="OtakuBate" class="logo-img" />
          <span class="logo-text">OtakuBate</span>
          <span class="logo-badge">✦ ANIME</span>
        </div>
        <div class="tagline">Connect • Share • Explore</div>
      </div>
      <div class="email-content">${content}</div>
      <div class="email-footer">
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>
        <div class="copyright">
          © ${new Date().getFullYear()} OtakuBate — Anime Community
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

// ---------- BREVO FETCH HELPER ----------
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const API_KEY = process.env.BREVO_API_KEY
  
  console.log('📧 ===== EMAIL DEBUG =====')
  console.log('📧 To:', to)
  console.log('📧 Subject:', subject)
  console.log('📧 API Key exists:', !!API_KEY)
  console.log('📧 Sender Email:', process.env.BREVO_SENDER_EMAIL || 'otakubate.e@gmail.com')
  console.log('📧 =========================')
  
  if (!API_KEY) {
    throw new Error('BREVO_API_KEY is not set in .env')
  }

  const emailData = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'otakubate.e@gmail.com',
      name: process.env.BREVO_SENDER_NAME || 'OtakuBate'
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent
  }

  console.log('📧 Sending to Brevo...')

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify(emailData)
    })

    console.log('📧 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Brevo error:', errorText)
      
      let errorMessage = 'Brevo email failed'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
      } catch {
        errorMessage = errorText
      }
      
      throw new Error(`Brevo email failed: ${errorMessage}`)
    }

    const result = await response.json()
    console.log('✅ Email sent successfully')
    return result
  } catch (error: any) {
    console.error('❌ Email error:', error.message)
    throw error
  }
}

// ============================================
// EMAIL TEMPLATES WITH ANIME SLANGS
// ============================================

export const sendVerificationEmail = async (to: string, username: string, otp: string) => {
  await sendEmail(
    to,
    '🎌 Oi! Verify Your Email, Otaku!',
    base(`
      <div style="text-align: center;">
        <div style="margin-bottom: 6px;">${icons.verify}</div>
        <h2>Konnichiwa, <span class="highlight">${username}</span>! 👋</h2>
        <p class="greeting">
          Oi oi! Welcome to OtakuBate! 🎌<br>
          Your anime journey begins here!<br>
          <span style="color: #E63946;">Arigatou</span> for joining our community!
        </p>
      </div>
      <div class="otp-card">
        <span class="otp-label">✦ VERIFICATION CODE ✦</span>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱️ Expires in 10 minutes — <span style="color: #E63946;">Hurry!</span></div>
      </div>
      <div class="feature-grid">
        <div class="feature-item"><div class="feature-icon">🎌</div><div class="feature-text">Join anime discussions with fellow otakus</div></div>
        <div class="feature-item"><div class="feature-icon">📺</div><div class="feature-text">Discover and track trending anime</div></div>
        <div class="feature-item"><div class="feature-icon">💬</div><div class="feature-text">Chat in real-time with the community</div></div>
        <div class="feature-item"><div class="feature-icon">🏆</div><div class="feature-text">Earn badges and rank up</div></div>
      </div>
      <div class="warning-box">
        ⚠️ If you didn't create this account, please ignore this email.<br>
        <span style="color: #E63946;">Gomen nasai</span> for the inconvenience.
      </div>
    `)
  )
}

export const sendOTPEmail = async (to: string, username: string, otp: string) => {
  await sendEmail(
    to,
    '🔐 Oi! Your Login Code, Otaku!',
    base(`
      <div style="text-align: center;">
        <div style="margin-bottom: 6px;">${icons.lock}</div>
        <h2>Ohayo, <span class="highlight">${username}</span>! 🌅</h2>
        <p class="greeting">
          Okaeri! Welcome back to OtakuBate! 🎌<br>
          Use this code to securely log in to your account.
        </p>
      </div>
      <div class="otp-card">
        <span class="otp-label">✦ LOGIN CODE ✦</span>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱️ Valid for 10 minutes — <span style="color: #E63946;">Hayaku!</span></div>
      </div>
      <div class="warning-box">
        ⚠️ Never share this code with anyone.<br>
        OtakuBate staff will <span style="color: #E63946; font-weight: 700;">never</span> ask for it.<br>
        <span style="color: #E63946;">Yoroshiku!</span>
      </div>
    `)
  )
}

export const sendPasswordResetEmail = async (to: string, otp: string, username: string) => {
  await sendEmail(
    to,
    '🔄 Reset Your Password, Otaku!',
    base(`
      <div style="text-align: center;">
        <div style="margin-bottom: 6px;">${icons.key}</div>
        <h2>Oi! <span class="highlight">${username}</span>! 👊</h2>
        <p class="greeting">
          We received a request to reset your password.<br>
          Don't worry — we got your back! 💪<br>
          <span style="color: #E63946;">Shinpai shinai!</span>
        </p>
      </div>
      <div class="otp-card">
        <span class="otp-label">✦ RESET CODE ✦</span>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱️ Valid for 10 minutes — <span style="color: #E63946;">Gambatte!</span></div>
      </div>
      <div class="warning-box">
        ⚠️ If you didn't request this, you can safely ignore this email.<br>
        Your password won't change. <span style="color: #E63946;">Daijoubu!</span>
      </div>
    `)
  )
}

export const sendWelcomeEmail = async (to: string, username: string) => {
  await sendEmail(
    to,
    '🎉 Welcome to OtakuBate, Otaku!',
    base(`
      <div style="text-align: center;">
        <div style="margin-bottom: 6px;">${icons.sparkle}</div>
        <h2>Yokoso, <span class="highlight">${username}</span>! 🎌</h2>
        <p class="greeting">
          Oi oi! Your account is ready! 🎉<br>
          Let's start your anime adventure together!<br>
          <span style="color: #E63946;">Iku yo!</span>
        </p>
      </div>
      <div class="feature-grid">
        <div class="feature-item"><div class="feature-icon">🎯</div><div class="feature-text">Personalized anime recommendations</div></div>
        <div class="feature-item"><div class="feature-icon">💬</div><div class="feature-text">Real-time chat with otaku friends</div></div>
        <div class="feature-item"><div class="feature-icon">🏆</div><div class="feature-text">Earn badges and climb the ranks</div></div>
        <div class="feature-item"><div class="feature-icon">📺</div><div class="feature-text">Track your favorite anime</div></div>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/feed" class="action-btn">🚀 Start Exploring →</a>
      </div>
      <div style="text-align: center; margin-top: 12px;">
        <span style="font-size: 11px; color: #6a6a8a;">
          <span style="color: #E63946;">Arigatou</span> for joining!<br>
          <span style="color: #E63946;">Tanoshimu!</span> (Enjoy!)
        </span>
      </div>
    `)
  )
}

export const sendActionOTPEmail = async (to: string, otp: string, username: string, purpose: string) => {
  let actionText = ''
  let actionEmoji = ''
  let animePhrase = ''
  
  switch (purpose) {
    case 'NAME_CHANGE': 
      actionText = 'change your display name'; 
      actionEmoji = '✏️'; 
      animePhrase = 'What\'s in a name? ' + '❤️';
      break
    case 'USERNAME_CHANGE': 
      actionText = 'change your username'; 
      actionEmoji = '@'; 
      animePhrase = 'A new identity awaits! ' + '🌟';
      break
    case 'PRIVACY_UPDATE': 
      actionText = 'update your privacy settings'; 
      actionEmoji = '🔒'; 
      animePhrase = 'Your secret is safe! ' + '🤫';
      break
    case 'EMAIL_CHANGE': 
      actionText = 'change your email address'; 
      actionEmoji = '📧'; 
      animePhrase = 'New address, who dis? ' + '📬';
      break
    case 'PASSWORD_CHANGE': 
      actionText = 'change your password'; 
      actionEmoji = '🔐'; 
      animePhrase = 'Stronger security, stronger you! ' + '💪';
      break
    case 'DELETE_ACCOUNT': 
      actionText = 'delete your account'; 
      actionEmoji = '⚠️'; 
      animePhrase = 'Sayonara? Are you sure? ' + '😢';
      break
    default: 
      actionText = 'perform this action'; 
      actionEmoji = '⚡'; 
      animePhrase = 'Let\'s do this! ' + '🔥'
  }
  
  await sendEmail(
    to,
    `🛡️ Oi! Verify to ${actionText}`,
    base(`
      <div style="text-align: center;">
        <div style="margin-bottom: 6px;">${icons.shield}</div>
        <h2>Oi! <span class="highlight">${username}</span>! 👀</h2>
        <p class="greeting">
          You requested to ${actionText} ${actionEmoji}<br>
          ${animePhrase}<br>
          <span style="color: #E63946;">Let's verify you!</span>
        </p>
      </div>
      <div class="otp-card">
        <span class="otp-label">✦ VERIFICATION CODE ✦</span>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱️ Valid for 10 minutes — <span style="color: #E63946;">Hurry up!</span></div>
      </div>
      <div class="warning-box">
        ⚠️ This code is for ${actionText}.<br>
        Never share it with anyone — <span style="color: #E63946;">yakusoku!</span> (promise!)<br>
        <span style="color: #E63946;">Ganbare!</span> (Do your best!)
      </div>
    `)
  )
}