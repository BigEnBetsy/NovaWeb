// Service selection and form handling
document.addEventListener('DOMContentLoaded', function() {
  console.log("Diensten DOM geladen");

  // HEADER HIDE-ON-SCROLL
  let lastScroll = 0;
  const header = document.querySelector("header");
  
  console.log("Header element gevonden:", header);

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    console.log("Scroll:", currentScroll);

    if (currentScroll > lastScroll && currentScroll > 100) {
      console.log("Hide header");
      header.classList.add("hide");
    } else {
      console.log("Show header");
      header.classList.remove("hide");
    }

    lastScroll = currentScroll;
  });

  // Service selection and form handling
  const serviceBtns = document.querySelectorAll('.service-btn');
  const serviceSelect = document.getElementById('serviceSelect');
  const contactForm = document.getElementById('serviceContactForm');

  // Service button clicks
  serviceBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const service = this.getAttribute('data-service');
      
      // Set the service in the form
      let serviceValue = '';
      switch(service) {
        case 'website':
          serviceValue = 'Website op maat';
          break;
        case 'onderhoud':
          serviceValue = 'Onderhoud & Support';
          break;
        case 'student':
          serviceValue = 'Studentenkorting';
          break;
      }
      
      serviceSelect.value = serviceValue;
      
      // Scroll to contact form
      document.getElementById('contact-form').scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Form submission
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const subject = `Nieuwe service aanvraag van ${data.naam} - ${data.service}`;
    const body = `
Service Aanvraag:
Naam: ${data.naam}
Email: ${data.email}
Telefoon: ${data.telefoon || 'Niet opgegeven'}
Gekozen Service: ${data.service}

Bericht:
${data.bericht}

---
Aanvraag verzonden via NovaWeb Diensten pagina
    `.trim();

    // Open email client
    window.location.href = `mailto:novaweb.devteam@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Show success message
    showNotification('Aanvraag verzonden! We nemen binnen 24 uur contact met je op.', 'success');
  });

  // Service card animations
  const serviceCards = document.querySelectorAll('.service-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
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

  // Process step animations
  const processSteps = document.querySelectorAll('.process-step');
  
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
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
});

// Notification function
function showNotification(message, type) {
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
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// --- SUPABASE LOGIN CHECK TOEVOEGEN ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co'
const supabaseKey = 'JE_ANON_PUBLIC_KEY_HIER' // vervang door jouw anon public key
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.login-btn');
  if (!loginBtn) return;

  (async () => {
    // Check huidige sessie
    const { data: { session } } = await supabase.auth.getSession();
    updateHeader(session, loginBtn);

    // Luister naar realtime auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      updateHeader(session, loginBtn);
    });
  })();
});

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
