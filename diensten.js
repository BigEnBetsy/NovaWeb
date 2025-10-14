import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg'
const supabase = createClient(supabaseUrl, supabaseKey)

let user = null;
const adminEmails = ['gallerstef@gmail.com', 'robin.baeyens27@gmail.com'];

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Diensten DOM geladen");

  // --- Header hide-on-scroll ---
  const header = document.querySelector("header");
  let lastScroll = 0;
  let isHidden = false;
  const scrollThreshold = 100;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
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

  // --- Service knoppen naar formulier ---
  const serviceBtns = document.querySelectorAll('.service-btn');
  const serviceSelect = document.getElementById('serviceSelect');
  const contactForm = document.getElementById('serviceContactForm');
  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.getAttribute('data-service');
      let serviceValue = '';
      switch(service) {
        case 'website': serviceValue = 'Premium Website Package'; break;
        case 'ecommerce': serviceValue = 'Webshop Solution'; break;
        case 'onderhoud': serviceValue = 'Onderhoud & Support'; break;
        case 'student': serviceValue = 'Studentenkorting'; break;
        case 'onepage': serviceValue = 'One-Page Website'; break;
      }
      if(serviceSelect) serviceSelect.value = serviceValue;
      const formEl = document.getElementById('contact-form');
      if(formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Contactformulier submit ---
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      const subject = `Nieuwe service aanvraag van ${data.naam} - ${data.service}`;
      const body = `Naam: ${data.naam}\nEmail: ${data.email}\nTelefoon: ${data.telefoon || 'Niet opgegeven'}\nGekozen Service: ${data.service}\n\nBericht:\n${data.bericht}`;
      window.location.href = `mailto:novaweb.devteam@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showNotification('Aanvraag verzonden! We nemen binnen 24 uur contact met je op.', 'success');
    });
  }

  // --- Supabase login check ---
  const loginBtn = document.querySelector('.login-btn');
  const { data: { session } } = await supabase.auth.getSession();
  user = session?.user ?? null;
  updateHeader(session);
  supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null;
    updateHeader(session);
    if(user) loadMessages();
  });

  function updateHeader(session) {
    if(!loginBtn) return;
    if(session){
      loginBtn.innerText = 'Account';
      loginBtn.href = 'account.html';
    } else {
      loginBtn.innerText = 'Login';
      loginBtn.href = 'login.html';
    }
  }

  // --- Chat functionaliteit ---
  const chatToggle = document.getElementById('chatToggle');
  const chatBox = document.getElementById('chatBox');
  const closeChat = document.getElementById('closeChat');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');
  const chatMessages = document.getElementById('chatMessages');

  if(user && adminEmails.includes(user.email)){
    chatToggle?.addEventListener('click', () => window.location.href = 'admin.html');
  } else {
    chatToggle?.addEventListener('click', () => chatBox.classList.toggle('active'));
    closeChat?.addEventListener('click', () => chatBox.classList.remove('active'));
    sendChat?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
    if(user) loadMessages();
  }

  // --- Animaties service cards ---
  const serviceCards = document.querySelectorAll('.service-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });

  // --- Animaties process steps ---
  const processSteps = document.querySelectorAll('.process-step');
  const processObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if(entry.isIntersecting){
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  }, { threshold: 0.2 });
  processSteps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = 'all 0.6s ease';
    processObserver.observe(step);
  });

  // --- Hamburger ---
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  hamburger.addEventListener('click', () => nav.classList.toggle('active'));
});

// --- Notificaties ---
function showNotification(message, type){
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(()=>{ notification.style.transform = 'translateX(0)'; },100);
  setTimeout(()=>{ notification.style.transform = 'translateX(100%)'; setTimeout(()=>document.body.removeChild(notification),300); },4000);
}

// --- Chat functies ---
async function sendMessage(){
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const tekst = chatInput.value.trim();
  if(!tekst) return;

  if(!user){
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    msgDiv.textContent = 'Je moet inloggen om te kunnen chatten! 😊';
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }

  // Voeg user bericht toe
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.innerHTML = `<strong>${user.email}</strong>: ${tekst}`;
  chatMessages.appendChild(msgDiv);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Opslaan in Supabase
  const { error } = await supabase.from('messages').insert([{
    user_id: user.id,
    email: user.email,
    message: tekst,
    role: 'user',
    created_at: new Date().toISOString()
  }]);
  if(error){ console.error(error); return; }

  // Bot reply
  const replyText = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact op. 😊';
  setTimeout(async ()=>{
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot';
    botDiv.textContent = replyText;
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    await supabase.from('messages').insert([{
      user_id: user.id,
      email: user.email,
      message: replyText,
      role: 'bot',
      created_at: new Date().toISOString()
    }]);
  }, 800);
}

function addMessage(msg){
  const chatMessages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message ' + (msg.role==='user'?'user':'bot');

  const messageText = document.createElement('div');
  messageText.textContent = msg.message;

  const messageTime = document.createElement('div');
  messageTime.className = 'message-time';
  messageTime.textContent = new Date(msg.created_at).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});

  div.appendChild(messageText);
  div.appendChild(messageTime);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function loadMessages(){
  if(!user) return;
  const chatMessages = document.getElementById('chatMessages');
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending:true });
  if(error){ console.error(error); return; }

  chatMessages.innerHTML = '';
  if(data.length===0){
    const emptyDiv = document.createElement('div');
    emptyDiv.className='message bot';
    emptyDiv.textContent='Nog geen berichten. Stuur een bericht om te starten!';
    chatMessages.appendChild(emptyDiv);
  } else {
    data.forEach(addMessage);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Realtime updates
  supabase
    .from(`messages:email=eq.${user.email}`)
    .on('INSERT', payload => {
      addMessage(payload.new);
    })
    .subscribe();
}
