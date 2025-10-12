import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

const chatContainer = document.getElementById('chatContainer')
const userList = document.getElementById('userListItems')

let selectedEmail = null

// ------------------------------------------------------------
// 1️⃣ Laad unieke gebruikers (emails) uit messages-tabel
// ------------------------------------------------------------
async function loadUserList() {
  const { data, error } = await supabase
    .from('messages')
    .select('email')
    .not('email', 'is', null)

  if (error) {
    console.error('Fout bij ophalen gebruikers:', error)
    return
  }

  // Unieke e-mails filteren
  const uniqueEmails = [...new Set(data.map(item => item.email))].sort()

  userList.innerHTML = ''
  uniqueEmails.forEach(email => {
    const li = document.createElement('li')
    li.textContent = email
    li.addEventListener('click', () => selectUser(email))
    userList.appendChild(li)
  })
}

// ------------------------------------------------------------
// 2️⃣ Gebruiker selecteren en berichten tonen
// ------------------------------------------------------------
async function selectUser(email) {
  selectedEmail = email

  // Active class bijwerken
  document.querySelectorAll('#userList li').forEach(li => {
    li.classList.toggle('active', li.textContent === email)
  })

  chatContainer.innerHTML = '<p style="opacity:0.6;">Berichten laden...</p>'
  await loadMessages(email)
}

// ------------------------------------------------------------
// 3️⃣ Bestaande showMessage-functie (niet wijzigen)
// ------------------------------------------------------------
function showMessage(message) {
  const div = document.createElement('div')
  div.className = message.role === 'user' ? 'message user' : 'message bot'
  div.innerHTML = `<strong>${message.email || 'Onbekend'}:</strong> ${message.message}`
  chatContainer.appendChild(div)
  chatContainer.scrollTop = chatContainer.scrollHeight
}

// ------------------------------------------------------------
// 4️⃣ Berichten laden voor een specifieke gebruiker
// ------------------------------------------------------------
async function loadMessages(emailFilter = null) {
  let query = supabase.from('messages').select('*').order('created_at', { ascending: true })
  if (emailFilter) query = query.eq('email', emailFilter)

  const { data: messages, error } = await query
  if (error) return console.error('Fout bij laden berichten:', error)

  chatContainer.innerHTML = ''
  messages.forEach(msg => showMessage(msg))
}

// ------------------------------------------------------------
// 5️⃣ Realtime updates (ongewijzigd)
// ------------------------------------------------------------
supabase
  .channel('public:messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    const msg = payload.new
    if (!selectedEmail || msg.email === selectedEmail) {
      showMessage(msg)
    }
  })
  .subscribe()

// ------------------------------------------------------------
// 6️⃣ Initieel laden
// ------------------------------------------------------------
loadUserList()
