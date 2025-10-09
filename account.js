// ===============================
// ✅ Supabase Configuratie
// ===============================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===============================
// DOM ELEMENTEN
// ===============================
const deleteAccountBtn = document.getElementById('delete-account');
const deleteModal = document.getElementById('delete-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');
const changeEmailBtn = document.getElementById('change-email');
const studentDiscountBtn = document.getElementById('student-discount');
const saveSettingsBtn = document.getElementById('save-settings');
const logoutBtn = document.getElementById('logout');
const fileUpload = document.querySelector('.file-upload');
const fileInput = document.getElementById('file-input');
const emailField = document.getElementById('email');
const userTypeSelect = document.getElementById('user-type');

// ===============================
// ✅ Accountdata laden
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    alert('Je bent niet ingelogd. Je wordt doorgestuurd naar de loginpagina.');
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;
  console.log('Ingelogde gebruiker:', user);

  // E-mailadres tonen
  emailField.value = user.email;

  // Optioneel: user metadata laden (uit "profiles" tabel bijvoorbeeld)
  // Hier kun je later Supabase-rowdata ophalen met:
  // const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
});

// ===============================
// 📁 Bestand uploaden (client-side voorbeeld)
// ===============================
fileUpload.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    alert(`Bestand "${file.name}" wordt geüpload...`);

    const { data, error } = await supabase.storage
      .from('uploads') // Maak bucket 'uploads' aan in Supabase
      .upload(`user-files/${Date.now()}-${file.name}`, file);

    if (error) {
      alert(`Upload mislukt: ${error.message}`);
    } else {
      alert(`Bestand succesvol geüpload: ${file.name}`);
      console.log('Upload info:', data);
    }
  }
});

// ===============================
// 🗑️ Account verwijderen
// ===============================
deleteAccountBtn.addEventListener('click', () => {
  deleteModal.style.display = 'flex';
});

confirmDelete.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  deleteModal.style.display = 'none';
  if (!error) {
    alert('Je account is verwijderd (of afgemeld).');
    window.location.href = 'login.html';
  }
});

cancelDelete.addEventListener('click', () => {
  deleteModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === deleteModal) deleteModal.style.display = 'none';
});

// ===============================
// ✉️ E-mail wijzigen
// ===============================
changeEmailBtn.addEventListener('click', async () => {
  const newEmail = prompt('Voer je nieuwe e-mailadres in:');
  if (!newEmail) return;

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    alert('Fout bij e-mail wijzigen: ' + error.message);
  } else {
    emailField.value = newEmail;
    alert('E-mailadres bijgewerkt! Controleer je inbox voor verificatie.');
  }
});

// ===============================
// 🎓 Studentenkorting
// ===============================
studentDiscountBtn.addEventListener('click', async () => {
  alert('Studentenkorting aangevraagd! We nemen contact met je op.');

  // Optioneel: sla aanvraag op in Supabase
  // await supabase.from('student_requests').insert([{ user_id: user.id, requested_at: new Date() }]);
});

// ===============================
// 💾 Instellingen opslaan
// ===============================
saveSettingsBtn.addEventListener('click', async () => {
  const userType = userTypeSelect.value;
  alert(`Instellingen opgeslagen (${userType}).`);

  // Voorbeeld: opslaan in "profiles" tabel
  // await supabase.from('profiles').upsert({ id: user.id, user_type: userType });
});

// ===============================
// 🚪 Uitloggen
// ===============================
logoutBtn.addEventListener('click', async () => {
  if (confirm('Weet je zeker dat je wilt uitloggen?')) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Uitloggen mislukt: ' + error.message);
    } else {
      alert('Je bent uitgelogd.');
      window.location.href = 'login.html';
    }
  }
});
