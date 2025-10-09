// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- Vul hier je Supabase gegevens in ---
const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg' // Vervang door je ANON key uit Supabase dashboard
const supabase = createClient(supabaseUrl, supabaseKey)

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
