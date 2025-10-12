import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

let user = null // globale user variabele

window.addEventListener('DOMContentLoaded', async () => {
  // --- Shooting stars ---
  if (typeof ShootingStars !== 'undefined') new ShootingStars()

  // --- DOM elementen ---
  const chatToggle = document.getElementById('chatToggle')
  const chatBox = document.getElementById('chatBox')
  const closeChat = document.getElementById('closeChat')
  const chatInput = document.getElementById('chatInput')
  const sendChat = document.getElementById('sendChat')
  const chatMessages = document.getElementById('chatMessages')
  const loginBtn = document.querySelector('.login-btn')

  // --- Check login status ---
  const { data: { session } } = await supabase.auth.getSession()
  user = session?.user ?? null

  if (user && loginBtn) {
    loginBtn.innerText = 'Account'
    loginBtn.href = 'account.html'
  }

  // --- Realtime login/logout ---
  supabase.auth.onAuthStateChange((event, session) => {
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
  const adminEmails = ['gallerstef@gmail.com', 'robinb@gmail.com']
  if (user && adminEmails.includes(user.email)) {
      chatToggle.addEventListener('click', () => {
          window.location.href = 'admin.html'
      })
  } else {
      // --- Normale chat functionaliteit ---
      chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'))
      closeChat.addEventListener('click', () => chatBox.classList.remove('active'))

      // --- Verstuur bericht ---
      sendChat.addEventListener('click', sendMessage)
      chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage() })
  }

  // --- Functie om berichten te versturen ---
  async function sendMessage() {
    const tekst = chatInput.value.trim()
    if (!tekst) return

    if (!user) {
      alert('Je moet inloggen om te chatten!')
      return
    }

    // DOM update (toon bericht direct)
    const msgDiv = document.createElement('div')
    msgDiv.className = 'message user'
    msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`
    chatMessages.appendChild(msgDiv)
    chatInput.value = ''
    chatMessages.scrollTop = chatMessages.scrollHeight

    // --- Verstuur bericht naar Supabase ---
    const { data: insertData, error: insertError } = await supabase
      .from('messages')
      .insert([{ user_id: user.id, email: user.email, message: tekst, role: 'user' }])
      .select()

    if (insertError) {
      console.error('❌ Fout bij opslaan in Supabase:', insertError)
      alert('Bericht kon niet worden opgeslagen. Zie console voor details.')
      return
    }

    // Automatische bot reply
    setTimeout(() => {
      const reply = document.createElement('div')
      reply.className = 'message bot'
      reply.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊'
      chatMessages.appendChild(reply)
      chatMessages.scrollTop = chatMessages.scrollHeight
    }, 800)
  }

  // --- Realtime berichten (optioneel) ---
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      console.log('Nieuw bericht:', payload.new)
      // hier kan je DOM bijwerken als je realtime wil tonen
    })
    .subscribe()
})

// --- Header hide-on-scroll ---
let lastScroll = 0
const header = document.querySelector('header')
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset
  if (currentScroll > lastScroll && currentScroll > 50) header.classList.add('hide')
  else header.classList.remove('hide')
  lastScroll = currentScroll
})

// --- ShootingStars class (houd je bestaande code) ---
class ShootingStars { /* ... kopieer je bestaande class ... */ }
