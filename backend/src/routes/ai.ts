import { Router, Request, Response } from 'express'

const router = Router()

// ============================================
// HEAVSTAL AI API CONFIG
// ============================================
const HEAVSTAL_API_KEY = 'ht_live_kvye3R1NrHrpJ1u5vY4WjQ9s0kxGxAgS3jRMXwukJVMxdEa3'
const HEAVSTAL_API_URL = 'https://heavstal.com.ng/api/v1/ai'

// ============================================
// SUPPORT CHANNELS
// ============================================
const TELEGRAM_BOT = 'https://t.me/OtakuBateBot'
const TELEGRAM_CHANNEL = 'https://t.me/otakubate'
const DISCORD_INVITE = 'https://discord.gg/GASuyBbtV'
const WEBSITE_URL = 'https://otakubate.name.ng'

// ============================================
// FALLBACK RESPONSES - ALL SUPPORT TO TG/DISCORD
// ============================================

const FALLBACK_RESPONSES: Record<string, string> = {
  // Support & Contact
  'support': "For any support, just message @OtakuBateBot on Telegram and we'll help you out! 🤖",
  'help': "I'm here to help! 🌸 For direct support, message @OtakuBateBot on Telegram or join our Discord at discord.gg/GASuyBbtV 💌",
  'contact': "You can reach us through:\n• Telegram Bot: @OtakuBateBot\n• Discord: discord.gg/GASuyBbtV\n• Website: otakubate.name.ng 🌸",
  'report': "Please send your report to our Telegram bot @OtakuBateBot — we'll handle it ASAP! 🤖",
  'report a problem': "Please send your report to our Telegram bot @OtakuBateBot — we'll handle it ASAP! 🤖",
  'bug': "Oh no, a bug! 🐛 Please report it to @OtakuBateBot on Telegram and our dev team will fix it pronto! 🔧",
  'telegram': "We have a Telegram bot at t.me/OtakuBateBot and a channel at t.me/otakubate! Join us! 💌",
  'telegram channel': "Our Telegram channel is t.me/otakubate — follow for updates and announcements! 📢",
  'telegram bot': "Our support bot is @OtakuBateBot — message it for any help! 🤖",
  'discord': "Join our Discord community at discord.gg/GASuyBbtV and connect with other fans! 🎮",
  
  // Human Support
  'human': "For human support, message our Telegram bot @OtakuBateBot and an admin will get back to you! 💬",
  'talk to a human': "For human support, message our Telegram bot @OtakuBateBot and an admin will get back to you! 💬",
  'admin': "Admins are available through our Telegram bot @OtakuBateBot — just send a message! 👑",
  'real person': "Our support team is available via @OtakuBateBot on Telegram! 💬",
  
  // Clubs
  'club': "To create a club, go to OtakuHub and click the 'Create Club' button. You'll need to add a name and avatar — it's super easy! 🌸",
  'create club': "To create a club, go to OtakuHub and click the 'Create Club' button. You'll need to add a name and avatar — it's super easy! 🌸",
  'join club': "To join a club, browse clubs in OtakuHub and tap on any club you like. You'll see a 'Join Club' button — just tap it! ✨",
  
  // Account & Security
  'password': "To change your password, go to Privacy & Security → Security section. Click 'Change Password' and follow the verification process. 🔒",
  'change password': "To change your password, go to Privacy & Security → Security section. Click 'Change Password' and follow the verification process. 🔒",
  'email': "To change your email, go to Privacy & Security → Security section. Click 'Change Email' — you'll verify your current email first. 📧",
  'change email': "To change your email, go to Privacy & Security → Security section. Click 'Change Email' — you'll verify your current email first. 📧",
  'delete account': "Account deletion requires verification via OTP first. Go to Privacy & Security → Danger Zone → Delete Account. Please be careful — this can't be undone! 😢",
  
  // Profile
  'profile': "To customize your profile, go to Settings → Profile Customization. You can change your avatar, banner, display name, and bio there! ✨",
  'avatar': "You can upload a custom avatar in Profile Customization → Avatar tab. Supported formats: PNG, JPG, GIF (max 5MB). 📸",
  'banner': "The recommended banner size is 1500x500 pixels for the best display across all devices. 📐",
  'username': "You can change your username in Profile Customization. Click the edit icon next to your username — you can change it every 3 days. 📝",
  
  // Notifications
  'notification': "To manage notifications, go to Notification Settings. You can toggle what notifications you receive — email, push, likes, comments, and more! 🔔",
  'notifications': "To manage notifications, go to Notification Settings. You can toggle what notifications you receive — email, push, likes, comments, and more! 🔔",
  
  // Interactions
  'followers': "When someone follows you, you'll see a notification. You can view all your followers on your profile page. 👥",
  'following': "You can see who you're following on your profile page under the 'Following' tab. 👥",
  'like': "Click the heart icon under any post to like it. Click again to unlike! 💖",
  'comment': "Click the comment icon or 'Reply' button under a post to add your comment. 💬",
  'mention': "Type @ followed by a username (e.g., @john) to mention them in a post or comment. They'll receive a notification! 📣",
  'edit post': "Click the three dots menu (⋮) on your post to edit or delete it. ✏️",
  'delete post': "Click the three dots menu (⋮) on your post — you'll see the delete option there. This action can't be undone. 🗑️",
  
  // OtakuHub
  'otakuhub': "OtakuHub is where you discover and join anime clubs built around shows, genres, and shared interests. It's the heart of the community! 🎌",
  'club settings': "Club settings are available to admins and owners. You can edit the club name, description, avatar, and banner. ⚙️",
  
  // Moderation
  'block': "You can block users from their profile or from your messages. Go to Privacy & Security → Blocked Users to manage them. 🚫",
  'unblock': "Go to Privacy & Security → Blocked Users and tap 'Unblock' next to the user you want to unblock. ✅",
  
  // Verification
  'verification': "After registration, we send a 6-digit code to your email. Enter it in the verification screen to activate your account. ✅",
  'google sign in': "Yes! Click 'Continue with Google' on the login page to sign in using your Google account. 🅶",
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) {
      return response
    }
  }
  
  if (lower.includes('help') || lower.includes('?') || lower.includes('support')) {
    return "I'm here to help! 🌸 Try asking me about clubs, profiles, notifications, or account settings. For direct support, message @OtakuBateBot on Telegram or join our Discord at discord.gg/GASuyBbtV! 💌"
  }
  
  return "I'm not totally sure about that one 🌸 For any support, please message @OtakuBateBot on Telegram or join our Discord at discord.gg/GASuyBbtV — we'll get you sorted! 🤖"
}

// ============================================
// AIKO'S PERSONALITY - Clean & Brand Aware
// ============================================
const AIKO_SYSTEM_PROMPT = `You are Aiko, the friendly AI assistant for OtakuBate — the ultimate anime social platform.

ABOUT OTAKUBATE:
- Anime communities where fans connect
- Real-time chat with other fans
- Discover anime and share reviews
- Post fan art, reactions, and hot takes
- Join clubs and discuss your favorite series

SUPPORT CHANNELS:
- Telegram Support Bot: @OtakuBateBot (t.me/OtakuBateBot)
- Telegram Channel: t.me/otakubate
- Discord Community: discord.gg/GASuyBbtV
- Website: otakubate.name.ng

IMPORTANT RULES:
- NEVER mention daddymaouu@gmail.com or any email
- ALWAYS direct users to Telegram bot (@OtakuBateBot) for support
- For community, direct to Discord (discord.gg/GASuyBbtV)
- Keep responses short (2-4 sentences)
- Use occasional emojis (🌸, ✨, 🎌, 💌, 🤖)
- Be warm, friendly, and passionate about anime
- Answer questions about OtakuBate features confidently
- For account issues, guide to Privacy & Security settings
- Never break character or mention you're an AI

EXAMPLES:
User: "How do I get support?"
Aiko: "For any support, just message @OtakuBateBot on Telegram and we'll help you out! 🤖"

User: "I found a bug"
Aiko: "Oh no, a bug! 🐛 Please report it to @OtakuBateBot on Telegram and our dev team will fix it pronto! 🔧"

User: "What is OtakuBate?"
Aiko: "OtakuBate is the ultimate anime social network where fans connect, share, and discover! 🌸 Join communities, chat with fans, and explore your favorite series. 🎌"

User: "Where can I chat with other fans?"
Aiko: "You can chat with fans right here on OtakuBate, or join our Discord community at discord.gg/GASuyBbtV! 🎮"

User: "Who do I contact for help?"
Aiko: "Message our Telegram bot @OtakuBateBot — our support team is ready to help! 💬"

User: "What's the website?"
Aiko: "Check us out at otakubate.com — your anime community awaits! 🌐"

NEVER use email addresses. ALWAYS use Telegram bot and Discord for support.`

// ============================================
// AI CHAT ENDPOINT
// ============================================

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    // Try Heavstal AI API
    try {
      console.log('📡 Trying Heavstal AI...')
      
      const response = await fetch(HEAVSTAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': HEAVSTAL_API_KEY
        },
        body: JSON.stringify({
          prompt: message.trim(),
          persona: AIKO_SYSTEM_PROMPT
        })
      })

      const data = await response.json()
      console.log('📦 Heavstal AI response:', data)

      if (data.status === 'success' && data.data && data.data.response) {
        return res.json({
          success: true,
          response: data.data.response,
          source: 'heavstal'
        })
      } else {
        console.log('❌ Heavstal AI error:', data)
      }
    } catch (apiError: any) {
      console.log('❌ Heavstal AI error:', apiError.message)
    }

    // Use fallback if AI fails
    const fallback = getFallbackResponse(message)
    return res.json({
      success: true,
      response: fallback,
      source: 'fallback'
    })
  } catch (error: any) {
    console.error('AI chat error:', error.message)
    return res.json({
      success: true,
      response: "I'm having trouble right now 🌸 Please message @OtakuBateBot on Telegram for help! 🤖"
    })
  }
})

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    ai_available: true,
    fallback_available: true,
    support: {
      telegram_bot: TELEGRAM_BOT,
      telegram_channel: TELEGRAM_CHANNEL,
      discord: DISCORD_INVITE,
      website: WEBSITE_URL
    }
  })
})

export default router