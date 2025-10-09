import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.register-form')
  const statusDiv = document.getElementById('reg-status')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('reg-email').value
    const password = document.getElementById('reg-password').value

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      statusDiv.innerText = `Registratie mislukt: ${error.message}`
    } else {
      statusDiv.style.color = 'green'
      statusDiv.innerText = 'Account aangemaakt! Check je e-mail voor verificatie.'
    }
  })
})
