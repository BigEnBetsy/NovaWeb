// Voeg dit bovenaan login.js of bovenaan admin.html script toe

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

// --- Lijst met toegestane admin emails ---
const allowedAdmins = ['admin1@example.com', 'admin2@example.com']

// --- Check toegang tot admin pagina ---
async function checkAdminAccess() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user || !allowedAdmins.includes(user.email)) {
    alert('Je hebt geen toegang tot deze pagina!')
    window.location.href = 'login.html' // terug naar login
  }
}

// Alleen uitvoeren als we op admin.html zijn
if (window.location.pathname.endsWith('admin.html')) {
  checkAdminAccess()
}


document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('.login-form')
  const loginBtn = document.querySelector('.login-submit-btn')
  const btnText = loginBtn.querySelector('.btn-text')
  const btnLoader = loginBtn.querySelector('.btn-loader')
  const statusDiv = document.getElementById('status')

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault()

      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      // Toon loader
      btnText.style.opacity = '0'
      btnLoader.style.display = 'block'
      loginBtn.disabled = true
      statusDiv.innerText = ''

      // Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      // Stop loader
      btnText.style.opacity = '1'
      btnLoader.style.display = 'none'
      loginBtn.disabled = false

      if (error) {
        statusDiv.style.color = 'red'
        statusDiv.innerText = `Login mislukt: ${error.message}`
      } else {
        statusDiv.style.color = 'green'
        statusDiv.innerText = `Ingelogd! Welkom ${data.user.email}`
       
         window.location.href = 'klantenProject.html'
      }
    })
  }

  // Input animaties (blijft zoals jij had)
  const inputs = document.querySelectorAll('.input-container input')
  inputs.forEach(input => {
    input.addEventListener('focus', function() { this.parentElement.classList.add('focused') })
    input.addEventListener('blur', function() { if (!this.value) this.parentElement.classList.remove('focused') })
  })
})

const forgotPasswordLink = document.querySelector('.forgot-password');

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    if (!email) {
      statusDiv.style.color = 'red';
      statusDiv.innerText = 'Vul eerst je e-mailadres in.';
      return;
    }

    // Stuur reset email via Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://bigenbetsy.github.io/NovaWeb/resetww.html' // Pas aan naar je eigen reset-pagina
    });

    if (error) {
      statusDiv.style.color = 'red';
      statusDiv.innerText = `Fout: ${error.message}`;
    } else {
      statusDiv.style.color = 'green';
      statusDiv.innerText = 'Check je e-mail om je wachtwoord te resetten.';
    }
  });
}


  const chatToggle = document.getElementById('chatToggle');
  const chatBox = document.getElementById('chatBox');
  const closeChat = document.getElementById('closeChat');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');
  const chatMessages = document.getElementById('chatMessages');

  // Open/sluit chat
  chatToggle.addEventListener('click', () => {
    chatBox.classList.toggle('active');
  });

  closeChat.addEventListener('click', () => {
    chatBox.classList.remove('active');
  });

  // Verstuur bericht
  sendChat.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });

  function sendMessage() {
    const tekst = chatInput.value.trim();
    if (!tekst) return;
    const msg = document.createElement('div');
    msg.className = 'message user';
    msg.textContent = tekst;
    chatMessages.appendChild(msg);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simpele automatische reactie
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'message bot';
      // reply.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊';
      chatMessages.appendChild(reply);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);
  }

window.addEventListener('DOMContentLoaded', async () => {
  // --- Shooting stars ---
  const shootingStars = new ShootingStars()

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

  // --- Chat open/sluit ---
  chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'))
  closeChat.addEventListener('click', () => chatBox.classList.remove('active'))

  // --- Verstuur bericht ---
  sendChat.addEventListener('click', sendMessage)
  chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage() })

async function sendMessage() {
  const tekst = chatInput.value.trim();
  if (!tekst) return;

  // Haal ingelogde gebruiker op
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Fout bij ophalen gebruiker:', userError);
    alert('Er ging iets mis bij het ophalen van je account.');
    return;
  }

  const user = userData?.user;
  if (!user) {
    alert('Je moet inloggen om te chatten!');
    return;
  }

  // DOM update (toon bericht direct)
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`;
  chatMessages.appendChild(msgDiv);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // --- Verstuur bericht naar Supabase ---
  const { data: insertData, error: insertError } = await supabase
    .from('messages')
    .insert([
      {
        user_id: user.id,
        email: user.email,
        message: tekst,
        role: 'user'
      }
    ])
    .select(); // -> handig om terug te krijgen wat is opgeslagen

  // Log result voor debugging
  console.log('Supabase insert result:', { insertData, insertError });

  if (insertError) {
    console.error('❌ Fout bij opslaan in Supabase:', insertError);
    alert('Bericht kon niet worden opgeslagen. Zie console voor details.');
    return;
  }

  // Automatische bot reply
  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'message bot';
    // reply.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊';
    chatMessages.appendChild(reply);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
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


  const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');

hamburger.addEventListener('click', () => {
  nav.classList.toggle('active');
});