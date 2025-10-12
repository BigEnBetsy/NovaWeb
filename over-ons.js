// --- IMPORT SUPABASE ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

// --- GLOBALE VARIABELEN ---
let user = null
const adminEmails = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com'];

// --- DOM CONTENT LOADED ---
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM geladen - script werkt");

  // --- Shooting Stars ---
  if (typeof ShootingStars !== 'undefined') new ShootingStars()

  // --- Team member hover ---
  const teamMembers = document.querySelectorAll('.team-member');
  teamMembers.forEach(member => {
    member.addEventListener('mouseenter', () => member.style.transform = 'translateY(-10px)');
    member.addEventListener('mouseleave', () => member.style.transform = 'translateY(0)');
  });

  // --- Stats animatie ---
  const stats = document.querySelectorAll('.stat-number');
  const animateStats = () => {
    stats.forEach(stat => {
      const rect = stat.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        stat.style.animation = 'countUp 2s ease-out forwards';
      }
    });
  };
  window.addEventListener('scroll', animateStats);
  animateStats();

  // --- HEADER HIDE-ON-SCROLL ---
  let lastScroll = 0;
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) header.classList.add("hide");
    else header.classList.remove("hide");
    lastScroll = currentScroll;
  });

  // --- LOGIN CHECK ---
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
    updateHeader(session, loginBtn);

    supabase.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null;
      updateHeader(session, loginBtn);
    });
  }

  // --- CHAT ELEMENTEN ---
  const chatToggle = document.getElementById('chatToggle')
  const chatBox = document.getElementById('chatBox')
  const closeChat = document.getElementById('closeChat')
  const chatInput = document.getElementById('chatInput')
  const sendChat = document.getElementById('sendChat')
  const chatMessages = document.getElementById('chatMessages')

  // Admin redirect check
  if (user && adminEmails.includes(user.email)) {
    chatToggle.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  } else {
    // Normale chat functionaliteit
    chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'))
    closeChat.addEventListener('click', () => chatBox.classList.remove('active'))
    sendChat.addEventListener('click', sendMessage)
    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage() })
  }

  // --- Realtime berichten ---
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const msg = payload.new;
      appendMessage(msg);
    })
    .subscribe()
})

// --- FUNCTIES ---
function updateHeader(session, loginBtn) {
  if (!loginBtn) return;
  if (session) {
    loginBtn.innerText = 'Account';
    loginBtn.href = 'account.html';
  } else {
    loginBtn.innerText = 'Login';
    loginBtn.href = 'login.html';
  }
}

async function sendMessage() {
  const chatInput = document.getElementById('chatInput')
  const chatMessages = document.getElementById('chatMessages')
  const tekst = chatInput.value.trim();
  if (!tekst) return;

  if (!user) {
    alert('Je moet inloggen om te chatten!');
    return;
  }

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`;
  chatMessages.appendChild(msgDiv);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const { data: insertData, error: insertError } = await supabase
    .from('messages')
    .insert([{ user_id: user.id, email: user.email, message: tekst, role: 'user' }])
    .select();

  if (insertError) {
    console.error('Fout bij opslaan in Supabase:', insertError);
    alert('Bericht kon niet worden opgeslagen. Zie console voor details.');
    return;
  }

  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'message bot';
    reply.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊';
    chatMessages.appendChild(reply);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
}

function appendMessage(msg) {
  const chatMessages = document.getElementById('chatMessages')
  const div = document.createElement('div');
  div.className = msg.role === 'user' ? 'message user' : 'message bot';
  div.innerHTML = `<strong>${msg.email || 'Onbekend'}:</strong> ${msg.message}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
