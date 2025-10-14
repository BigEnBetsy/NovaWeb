import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

let user = null
const adminEmails = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com']

document.addEventListener('DOMContentLoaded', async () => {
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
  updateHeader(session)

  supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null
    updateHeader(session)
  })

  function updateHeader(session) {
    if (!loginBtn) return
    if (session) {
      loginBtn.innerText = 'Account'
      loginBtn.href = 'account.html'
    } else {
      loginBtn.innerText = 'Login'
      loginBtn.href = 'login.html'
    }
  }

  // --- Admin redirect ---
  if (user && adminEmails.includes(user.email)) {
    chatToggle?.addEventListener('click', () => {
      window.location.href = 'admin.html'
    })
  } else {
    chatToggle?.addEventListener('click', () => {
      chatBox?.classList.toggle('active')
      if (chatBox?.classList.contains('active') && user) {
        loadMessages()
      }
    })
    closeChat?.addEventListener('click', () => chatBox?.classList.remove('active'))
    sendChat?.addEventListener('click', sendMessage)
    chatInput?.addEventListener('keypress', e => { 
      if (e.key === 'Enter') sendMessage() 
    })
  }

  // --- Realtime berichten ---
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const msg = payload.new
      if (user && msg.email === user.email) {
        addMessage(msg)
      }
    })
    .subscribe()
})

// --- Functie: berichten ophalen ---
async function loadMessages() {
  if (!user) return
  const chatMessages = document.getElementById('chatMessages')

  // Haal alle berichten op van deze gebruiker
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

  if (data.length === 0) {
    const emptyDiv = document.createElement('div')
    emptyDiv.className = 'message bot'
    emptyDiv.textContent = 'Nog geen berichten. Stuur een bericht om te starten!'
    chatMessages.appendChild(emptyDiv)
  } else {
    data.forEach(addMessage)
  }

  chatMessages.scrollTop = chatMessages.scrollHeight
}

// --- Functie: bericht toevoegen aan chat ---
function addMessage(msg) {
  const chatMessages = document.getElementById('chatMessages')
  const div = document.createElement('div')
  div.className = 'message ' + (msg.role === 'user' ? 'user' : 'bot')

  const messageText = document.createElement('div')
  messageText.textContent = msg.message

  const messageTime = document.createElement('div')
  messageTime.className = 'message-time'
  messageTime.textContent = new Date(msg.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

  div.appendChild(messageText)
  div.appendChild(messageTime)
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// --- Functie: bericht versturen ---
async function sendMessage() {
  const chatInput = document.getElementById('chatInput')
  const chatMessages = document.getElementById('chatMessages')
  const tekst = chatInput.value.trim()

  if (!tekst) return

  if (!user) {
    const msgDiv = document.createElement('div')
    msgDiv.className = 'message bot'
    msgDiv.textContent = 'Je moet inloggen om te kunnen chatten! 😊'
    chatMessages.appendChild(msgDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
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
      created_at: new Date().toISOString()
    },
  ])
  if (error) {
    console.error('❌ Fout bij opslaan in Supabase:', error)
    alert('Bericht kon niet worden opgeslagen.')
    return
  }

  // Bot reply
  // const replyText = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊'
  setTimeout(async () => {
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
        created_at: new Date().toISOString()
      },
    ])
  }, 800)
}