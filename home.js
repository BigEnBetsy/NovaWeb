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
    chatToggle.addEventListener('click', async () => {
      chatBox.classList.toggle('active')
      if (chatBox.classList.contains('active') && user) {
        await loadMessages()
      }
    })
    closeChat.addEventListener('click', () => {
      chatBox.classList.remove('active')
    })
    sendChat.addEventListener('click', sendMessage)
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage()
    })
  }

  // --- Functie: berichten ophalen ---
  async function loadMessages() {
    if (!user) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: true })
    if (error) {
      console.error(error)
      return
    }
    chatMessages.innerHTML = ''
    data.forEach(msg => addMessage(msg))
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  // --- Functie: bericht toevoegen aan chat ---
  function addMessage(msg) {
    const div = document.createElement('div')
    div.className = 'message ' + (msg.role === 'user' ? 'user' : 'bot')
    div.textContent = msg.message
    chatMessages.appendChild(div)
  }

  // --- Functie: bericht versturen ---
  async function sendMessage() {
    const tekst = chatInput.value.trim()
    if (!tekst || !user) {
      if (!user) alert('Je moet inloggen om te chatten!')
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

    // Automatische bot-reply én opslaan
    setTimeout(async () => {
      // const replyText = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊'
      const replyDiv = document.createElement('div')
      replyDiv.className = 'message bot'
      replyDiv.textContent = replyText
      chatMessages.appendChild(replyDiv)
      chatMessages.scrollTop = chatMessages.scrollHeight

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

  // --- Realtime listener ---
  supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new
        if (user && msg.email === user.email) {
          const div = document.createElement('div')
          div.className = 'message ' + (msg.role === 'user' ? 'user' : 'bot')
          div.textContent = msg.message
          chatMessages.appendChild(div)
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      }
    )
    .subscribe()
})



