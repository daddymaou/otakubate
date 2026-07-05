require('dotenv').config()

async function testBrevo() {
  const API_KEY = process.env.BREVO_API_KEY
  
  const emailData = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    },
    to: [{
      email: 'otakubate.e@gmail.com'
    }],
    subject: 'Test from OtakuBate',
    htmlContent: '<h1>✅ Success!</h1><p>Your email system is working.</p>'
  }

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
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Email sent! Message ID:', data.messageId)
    } else {
      console.error('❌ Failed:', data.message)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testBrevo()