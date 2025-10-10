import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.register-form')
  const popup = document.getElementById('reg-popup')
  const closeBtn = document.getElementById('popup-close')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('reg-email').value
    const password = document.getElementById('reg-password').value

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(`Registratie mislukt: ${error.message}`)
    } else {
      popup.style.display = 'flex'
    }
  })

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none'
  })

  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.style.display = 'none'
  })
})
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('reg-email').value
  const password = document.getElementById('reg-password').value

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    // Check of de fout komt door een al bestaand account
    if (error.message.includes('already registered')) {
      alert('❌ Deze e-mail is al in gebruik.')
    } else {
      alert(`Registratie mislukt: ${error.message}`)
    }
  } else {
    popup.style.display = 'flex'
  }
})
