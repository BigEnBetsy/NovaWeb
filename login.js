// === SUPABASE CLIENT ===
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

// === ADMIN TOEGANG ===
const allowedAdmins = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com'] // CORRIGEER: robin.com → robin.baeyens27@gmail.com

async function checkAdminAccess() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user || !allowedAdmins.includes(user.email)) {
    alert('Toegang geweigerd. Alleen admins mogen hier.')
    window.location.href = 'login.html'
  }
}

// Controleer alleen op admin.html
if (window.location.pathname.endsWith('admin.html')) {
  checkAdminAccess()
}

// === GLOBALE VARIABELEN ===
let user = null

// === DOM GELADEN ===
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.querySelector('.login-form')
  const loginBtn = document.querySelector('.login-submit-btn')
  const btnText = loginBtn?.querySelector('.btn-text')
  const btnLoader = loginBtn?.querySelector('.btn-loader')
  const statusDiv = document.getElementById('status')
  const headerLoginBtn = document.querySelector('.login-btn')

  // --- UPDATE HEADER LOGIN KNOP ---
  const updateLoginButton = () => {
    if (!headerLoginBtn) return
    if (user) {
      headerLoginBtn.innerText = 'Account'
      headerLoginBtn.href = 'account.html'
    } else {
      headerLoginBtn.innerText = 'Login'
      headerLoginBtn.href = 'login.html'
    }
  }

  // --- CHECK HUIDIGE SESSIE ---
  const { data: { session } } = await supabase.auth.getSession()
  user = session?.user ?? null
  updateLoginButton()

  // --- REALTIME AUTH UPDATE ---
  supabase.auth.onAuthStateChange((_, sess) => {
    user = sess?.user ?? null
    updateLoginButton()
  })

  // === INLOGGEN MET FORMULIER ===
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault()

      const email = document.getElementById('email').value.trim()
      const password = document.getElementById('password').value

      if (!email || !password) {
        statusDiv.style.color = 'red'
        statusDiv.innerText = 'Vul alle velden in.'
        return
      }

      // Loader
      btnText.style.opacity = '0'
      btnLoader.style.display = 'block'
      loginBtn.disabled = true
      statusDiv.innerText = ''

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        statusDiv.style.color = 'green'
        statusDiv.innerText = `Welkom ${data.user.email}!`
        setTimeout(() => {
          window.location.href = 'klantenProject.html'
        }, 800)
      } catch (error) {
        statusDiv.style.color = 'red'
        statusDiv.innerText = error.message || 'Inloggen mislukt.'
      } finally {
        btnText.style.opacity = '1'
        btnLoader.style.display = 'none'
        loginBtn.disabled = false
      }
    })
  }

  // === INPUT FOCUS ANIMATIE ===
  document.querySelectorAll('.input-container input').forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'))
    input.addEventListener('blur', () => {
      if (!input.value) input.parentElement.classList.remove('focused')
    })
  })

  // === WACHTWOORD VERGETEN ===
  const forgotLink = document.querySelector('.forgot-password')
  if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
      e.preventDefault()
      const email = document.getElementById('email').value.trim()
      if (!email) {
        statusDiv.style.color = 'red'
        statusDiv.innerText = 'Voer je e-mail in.'
        return
      }

      statusDiv.innerText = 'Bezig met versturen...'
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://bigenbetsy.github.io/NovaWeb/resetww.html'
      })

      if (error) {
        statusDiv.style.color = 'red'
        statusDiv.innerText = error.message
      } else {
        statusDiv.style.color = 'green'
        statusDiv.innerText = 'Check je inbox voor de resetlink!'
      }
    })
  }

  // === CHAT FUNCTIE ===
  const chatToggle = document.getElementById('chatToggle')
  const chatBox = document.getBot('chatBox')
  const closeChat = document.getElementById('closeChat')
  const chatInput = document.getElementById('chatInput')
  const sendChat = document.getElementById('sendChat')
  const chatMessages = document.getElementById('chatMessages')

  if (chatToggle && chatBox) {
    chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'))
    closeChat?.addEventListener('click', () => chatBox.classList.remove('active'))

    const sendMessage = async () => {
      const text = chatInput.value.trim()
      if (!text) return

      // Gebruiker ophalen
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        alert('Log in om te chatten!')
        return
      }

      // Toon eigen bericht
      const msg = document.createElement('div')
      msg.className = 'message user'
      msg.innerHTML = `<strong>${currentUser.email}</strong>: ${text}`
      chatMessages.appendChild(msg)
      chatInput.value = ''
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Verstuur naar Supabase
      const { error } = await supabase.from('messages').insert({
        user_id: currentUser.id,
        email: currentUser.email,
        message: text,
        role: 'user'
      })

      if (error) {
        console.error('Chat error:', error)
        alert('Bericht niet verzonden.')
      } else {
        // Bot reply
        setTimeout(() => {
          const botMsg = document.createElement('div')
          botMsg.className = 'message bot'
          botMsg.textContent = 'Bedankt! We antwoorden zo snel mogelijk.'
          chatMessages.appendChild(botMsg)
          chatMessages.scrollTop = chatMessages.scrollHeight
        }, 1000)
      }
    }

    sendChat?.addEventListener('click', sendMessage)
    chatInput?.addEventListener('keypress', e => e.key === 'Enter' && sendMessage())
  }

  // === HAMBURGER MENU (mobiel) ===
  const hamburger = document.querySelector('.hamburger')
  const nav = document.querySelector('nav')
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active')
      hamburger.classList.toggle('active')
    })

    // Sluit menu bij klik op link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active')
        hamburger.classList.remove('active')
      })
    })
  }

  // === MOBIELE HEADER KNOPPEN KLOON ===
  function cloneHeaderButtons() {
    const old = document.querySelector('.nav-header-buttons')
    if (old) old.remove()
    if (window.innerWidth > 768) return

    const headerButtons = document.querySelector('.header-buttons')
    const clone = headerButtons.cloneNode(true)
    clone.classList.add('nav-header-buttons')
    clone.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:25px;width:100%;align-items:center;'
    clone.querySelectorAll('a').forEach(a => {
      a.style.cssText = 'width:80%;text-align:center;padding:12px;border-radius:50px;'
    })
    nav.appendChild(clone)

    // Herstel login knop link
    const mobileLogin = clone.querySelector('.login-btn')
    if (mobileLogin) {
      mobileLogin.addEventListener('click', (e) => {
        e.preventDefault()
        window.location.href = user ? 'account.html' : 'login.html'
      })
    }
  }

  cloneHeaderButtons()
  window.addEventListener('resize', cloneHeaderButtons)
})