import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- Supabase setup ---
const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

let user = null

window.addEventListener('DOMContentLoaded', async () => {
  // --- DOM elementen ---
  const chatToggle = document.getElementById('chatToggle')
  const chatBox = document.getElementById('chatBox')
  const closeChat = document.getElementById('closeChat')
  const chatInput = document.getElementById('chatInput')
  const sendChat = document.getElementById('sendChat')
  const chatMessages = document.getElementById('chatMessages')
  const loginBtn = document.querySelector('.login-btn')

  // --- Check login status ---
  const {
    data: { session },
  } = await supabase.auth.getSession()
  user = session?.user ?? null

  if (user && loginBtn) {
    loginBtn.innerText = 'Account'
    loginBtn.href = 'account.html'
  }

  // --- Realtime login/logout ---
  supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null
    if (!loginBtn) return
    if (user) {
      loginBtn.innerText = 'Account'
      loginBtn.href = 'account.html'
    } else {
      loginBtn.innerText = 'Login'
      loginBtn.href = 'login.html'
    }
  })

  // --- Admin check ---
  const adminEmails = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com']
  if (user && adminEmails.includes(user.email)) {
    // admin -> open adminpagina
    chatToggle.addEventListener('click', () => {
      window.location.href = 'admin.html'
    })
  } else {
    // --- Normale chat functionaliteit ---
    chatToggle.addEventListener('click', () => {
      chatBox.classList.toggle('active')
    })
    closeChat.addEventListener('click', () => {
      chatBox.classList.remove('active')
    })

    sendChat.addEventListener('click', sendMessage)
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage()
    })
  }

  // --- Functie: bericht versturen ---
  async function sendMessage() {
    const tekst = chatInput.value.trim()
    if (!tekst) return

    if (!user) {
      alert('Je moet inloggen om te chatten!')
      return
    }

    // Toon bericht direct
    const msgDiv = document.createElement('div')
    msgDiv.className = 'message user'
    msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`
    chatMessages.appendChild(msgDiv)
    chatInput.value = ''
    chatMessages.scrollTop = chatMessages.scrollHeight

    // Opslaan in Supabase
    const { error } = await supabase.from('messages').insert([
      {
        user_id: user.id,
        email: user.email,
        message: tekst,
        role: 'user',
      },
    ])

    if (error) {
      console.error('❌ Fout bij opslaan in Supabase:', error)
      alert('Bericht kon niet worden opgeslagen.')
      return
    }

    // Automatische bot-reply én opslaan in database
    setTimeout(async () => {
      const replyText =
        'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊'
      const replyDiv = document.createElement('div')
      replyDiv.className = 'message bot'
      replyDiv.textContent = replyText
      chatMessages.appendChild(replyDiv)
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Sla ook botbericht op
      await supabase.from('messages').insert([
        {
          user_id: user.id,
          email: user.email,
          message: replyText,
          role: 'bot',
        },
      ])
    }, 800)
  }

  // --- Realtime berichten ---
  supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new
        if (user && msg.email === user.email && msg.role === 'admin') {
          // Admin heeft gereageerd → toon in chat
          const adminMsg = document.createElement('div')
          adminMsg.className = 'message bot'
          adminMsg.textContent = msg.message
          chatMessages.appendChild(adminMsg)
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      }
    )
    .subscribe()
})

// --- Header hide-on-scroll ---
let lastScroll = 0
const header = document.querySelector('header')
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset
  if (currentScroll > lastScroll && currentScroll > 50)
    header.classList.add('hide')
  else header.classList.remove('hide')
  lastScroll = currentScroll
})

// --- ShootingStars class (houd bestaande code) ---
class ShootingStars {
  // je bestaande class-code hier
}
