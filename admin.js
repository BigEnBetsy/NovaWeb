import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

const userList = document.getElementById('userList')
const chatHeader = document.getElementById('chatHeader')
const chatMessages = document.getElementById('chatMessages')
const chatInput = document.getElementById('chatInput')
const sendBtn = document.getElementById('sendBtn')

let currentEmail = null
let usersState = {} // { email: { unread: 0 } }

// Controleer of ingelogd + admin
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Niet ingelogd → terug naar login
  window.location.href = 'login.html';
} else {
  // Check of email in admins tabel staat
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!admin) {
    alert('Je hebt geen toegang tot deze pagina!');
    window.location.href = 'login.html';
  }
}


// 🔹 Laad alle unieke gebruikers
async function loadUsers() {
  const { data, error } = await supabase
    .from('messages')
    .select('email')
    .not('email', 'is', null)
  
  if (error) return console.error(error)

  const uniqueEmails = [...new Set(data.map(m => m.email))]
  uniqueEmails.forEach(email => {
    if (!usersState[email]) usersState[email] = { unread: 0 }
  })

  renderUserList()
}

// 🔹 Render gebruikerslijst met sortering op ongelezen
function renderUserList() {
  userList.innerHTML = ''
  
  const sortedEmails = Object.keys(usersState)
    .sort((a, b) => {
      // Eerst gebruiker met ongelezen bovenaan
      if (usersState[b].unread !== usersState[a].unread) {
        return usersState[b].unread - usersState[a].unread
      }
      // Daarna alfabetisch
      return a.localeCompare(b)
    })

  sortedEmails.forEach(email => {
    const div = document.createElement('div')
    div.className = 'user-item'
    div.dataset.email = email
    div.textContent = email

    if (email === currentEmail) div.classList.add('active')
    if (usersState[email].unread > 0) div.classList.add('new-message')

    // Badge
    if (usersState[email].unread > 0) {
      const badge = document.createElement('span')
      badge.className = 'user-notification'
      badge.textContent = usersState[email].unread
      div.appendChild(badge)
      div.style.border = '2px solid red'
    }

    div.addEventListener('click', () => selectUser(email))
    userList.appendChild(div)
  })
}

// 🔹 Selecteer gebruiker
async function selectUser(email) {
  currentEmail = email
  // Reset ongelezen
  if (usersState[email]) usersState[email].unread = 0
  renderUserList()

  chatHeader.textContent = 'Chat met: ' + email
  await loadMessages(email)
}

// 🔹 Berichten laden
async function loadMessages(email) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: true })

  if (error) return console.error(error)

  chatMessages.innerHTML = ''
  data.forEach(msg => addMessage(msg))
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// 🔹 Berichten tonen
function addMessage(msg) {
  const div = document.createElement('div')
  div.className = 'message ' + (msg.role === 'user' ? 'user' : 'admin')
  div.textContent = msg.message
  chatMessages.appendChild(div)
}

// 🔹 Admin bericht verzenden
sendBtn.addEventListener('click', async () => {
  if (!currentEmail) return
  const tekst = chatInput.value.trim()
  if (!tekst) return

  chatInput.value = ''
  const msg = { email: currentEmail, message: tekst, role: 'admin' }
  addMessage(msg)
  await supabase.from('messages').insert([msg])
})

// 🔹 Realtime updates
supabase
  .channel('realtime-messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    const msg = payload.new
    const email = msg.email

    // Voeg nieuwe email toe aan state
    if (!usersState[email]) usersState[email] = { unread: 0 }

    if (currentEmail === email) {
      // Chat open → direct tonen
      addMessage(msg)
    } else {
      // Ongelezen verhogen
      usersState[email].unread += 1
    }

    renderUserList()
  })
  .subscribe()

loadUsers()
