import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

const userList = document.getElementById('userList')
const chatHeader = document.getElementById('chatHeader')
const chatMessages = document.getElementById('chatMessages')
const chatInput = document.getElementById('chatInput')
const sendBtn = document.getElementById('sendBtn')

let currentEmail = null
let unreadCounts = {} // Houdt aantal ongelezen per email bij

// 🔹 Laad unieke gebruikers
async function loadUsers() {
  const { data, error } = await supabase
    .from('messages')
    .select('email')
    .not('email', 'is', null)

  if (error) return console.error(error)

  const uniqueEmails = [...new Set(data.map(m => m.email))]
  renderUserList(uniqueEmails)
}

// 🔹 Render gebruikerslijst
function renderUserList(emails) {
  userList.innerHTML = ''
  emails.forEach(email => {
    const div = document.createElement('div')
    div.className = 'user-item'
    div.dataset.email = email
    div.textContent = email

    // Badge voor ongelezen berichten
    if (unreadCounts[email] && unreadCounts[email] > 0) {
      const badge = document.createElement('span')
      badge.className = 'user-notification'
      badge.textContent = unreadCounts[email]
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
  unreadCounts[email] = 0 // Reset ongelezen berichten
  renderUserList([...document.querySelectorAll('.user-item')].map(d => d.dataset.email))

  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.toggle('active', item.dataset.email === email)
  })

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
  const tekst = chatInput.value.trim()
  if (!tekst || !currentEmail) return

  chatInput.value = ''
  const msg = { email: currentEmail, message: tekst, role: 'admin' }
  addMessage(msg)

  const { error } = await supabase.from('messages').insert([msg])
  if (error) console.error(error)
})

// 🔹 Realtime updates
supabase
  .channel('realtime-messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    const msg = payload.new
    const email = msg.email

    // Indien open chat, toon direct
    if (currentEmail === email) {
      addMessage(msg)
    } else {
      // Ongelezen verhogen
      unreadCounts[email] = (unreadCounts[email] || 0) + 1
      // Verplaats gebruiker bovenaan en update badge
      const items = [...document.querySelectorAll('.user-item')]
      const emails = items.map(i => i.dataset.email)
      // Plaats nieuw email bovenaan
      if (!emails.includes(email)) emails.unshift(email)
      else {
        const index = emails.indexOf(email)
        emails.splice(index, 1)
        emails.unshift(email)
      }
      renderUserList(emails)
    }
  })
  .subscribe()

loadUsers()
