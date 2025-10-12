import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

let user = null
const adminEmails = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com'];

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Projecten DOM geladen");

  if (typeof ShootingStars !== 'undefined') new ShootingStars()

  // --- Header hide-on-scroll ---
  const header = document.querySelector("header");
  let lastScroll = 0;
  let isHidden = false;
  const scrollThreshold = 100;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");

    if (currentScroll > lastScroll && currentScroll > scrollThreshold && !isHidden) {
      header.classList.add("hide");
      isHidden = true;
    } else if (currentScroll < lastScroll && isHidden) {
      header.classList.remove("hide");
      isHidden = false;
    }

    if (currentScroll <= scrollThreshold) {
      header.classList.remove("hide");
      isHidden = false;
    }

    lastScroll = currentScroll;
  });

  // --- Chat elementen ---
  const chatToggle = document.getElementById('chatToggle')
  const chatBox = document.getElementById('chatBox')
  const closeChat = document.getElementById('closeChat')
  const chatInput = document.getElementById('chatInput')
  const sendChat = document.getElementById('sendChat')
  const chatMessages = document.getElementById('chatMessages')
  const loginBtn = document.querySelector('.login-btn')

  // --- Supabase login check ---
  if (loginBtn) {
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user ?? null
    updateHeader(session)

    supabase.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null
      updateHeader(session)
    })
  }

  // --- Admin redirect voor chat ---
  if (chatToggle) {
    if (user && adminEmails.includes(user.email)) {
      chatToggle.addEventListener('click', () => {
        window.location.href = 'admin.html';
      })
    } else {
      // Normale chat functionaliteit
      chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'))
      closeChat.addEventListener('click', () => chatBox.classList.remove('active'))
      if (sendChat && chatInput) {
        sendChat.addEventListener('click', sendMessage)
        chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage() })
      }
    }
  }
})

function updateHeader(session) {
  const loginBtn = document.querySelector('.login-btn')
  if (!loginBtn) return
  if (session) {
    loginBtn.innerText = 'Account'
    loginBtn.href = 'account.html'
  } else {
    loginBtn.innerText = 'Login'
    loginBtn.href = 'login.html'
  }
}

async function sendMessage() {
  const chatInput = document.getElementById('chatInput')
  const chatMessages = document.getElementById('chatMessages')
  if (!chatInput || !chatMessages) return

  const tekst = chatInput.value.trim()
  if (!tekst) return

  if (!user) {
    alert('Je moet inloggen om te chatten!')
    return
  }

  const msgDiv = document.createElement('div')
  msgDiv.className = 'message user'
  msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`
  chatMessages.appendChild(msgDiv)
  chatInput.value = ''
  chatMessages.scrollTop = chatMessages.scrollHeight

  const { data: insertData, error: insertError } = await supabase
    .from('messages')
    .insert([{ user_id: user.id, email: user.email, message: tekst, role: 'user' }])
    .select()

  if (insertError) {
    console.error('Fout bij opslaan in Supabase:', insertError)
    alert('Bericht kon niet worden opgeslagen.')
    return
  }

  setTimeout(() => {
    const reply = document.createElement('div')
    reply.className = 'message bot'
    reply.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊'
    chatMessages.appendChild(reply)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }, 800)
}
