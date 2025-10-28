import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM ELEMENTEN
const emailField = document.getElementById('email');
const userTypeSelect = document.getElementById('user-type');
const activeDaysEl = document.getElementById('active-days');
const uploadsCountEl = document.getElementById('uploads-count');
const projectsCountEl = document.getElementById('projects-count');
const fileUpload = document.querySelector('.file-upload');
const fileInput = document.getElementById('file-input');
const deleteAccountBtn = document.getElementById('delete-account');
const deleteModal = document.getElementById('delete-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');
const changeEmailBtn = document.getElementById('change-email');
const studentDiscountBtn = document.getElementById('student-discount');
const saveSettingsBtn = document.getElementById('save-settings');
const logoutBtn = document.getElementById('logout');

// ===============================
// Accountdata laden
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        alert('Je bent niet ingelogd.');
        window.location.href = 'login.html';
        return;
    }

    const user = session.user;
    emailField.value = user.email;

    // Actieve dagen berekenen
    const { data, error } = await supabase.from('users').select('created_at').eq('email', user.email).single();
    if (!error && data) {
        const createdAt = new Date(data.created_at);
        const today = new Date();
        const diffDays = Math.floor((today - createdAt)/(1000*60*60*24)) + 1;
        activeDaysEl.textContent = diffDays;
    }

    // Uploads tellen
    const { data: uploads } = await supabase.storage.from('uploads').list('user-files/');
    uploadsCountEl.textContent = uploads ? uploads.length : 0;

    // Projecten tellen (voorbeeld tabel 'projects')
    const { data: projects } = await supabase.from('projects').select('*').eq('user_email', user.email);
    projectsCountEl.textContent = projects ? projects.length : 0;
});

// ===============================
// Bestand uploaden
// ===============================
fileUpload.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const { data, error } = await supabase.storage.from('uploads').upload(`user-files/${Date.now()}-${file.name}`, file);
        if (error) alert('Upload mislukt: ' + error.message);
        else {
            alert(`Bestand "${file.name}" succesvol geüpload`);
            uploadsCountEl.textContent = parseInt(uploadsCountEl.textContent)+1;
        }
    }
});

// ===============================
// Account verwijderen
// ===============================
deleteAccountBtn.addEventListener('click', () => deleteModal.style.display = 'flex');
cancelDelete.addEventListener('click', () => deleteModal.style.display = 'none');
confirmDelete.addEventListener('click', async () => {
    await supabase.auth.signOut();
    alert('Account verwijderd / uitgelogd');
    window.location.href = 'login.html';
});

// ===============================
// E-mail wijzigen
// ===============================
changeEmailBtn.addEventListener('click', async () => {
    const newEmail = prompt('Voer je nieuwe e-mailadres in:');
    if (!newEmail) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) alert('Fout: ' + error.message);
    else emailField.value = newEmail;
});

// ===============================
// Studentenkorting aanvragen
// ===============================
studentDiscountBtn.addEventListener('click', () => alert('Studentenkorting aangevraagd!'));

// ===============================
// Instellingen opslaan
// ===============================
saveSettingsBtn.addEventListener('click', () => alert(`Instellingen opgeslagen: ${userTypeSelect.value}`));

// ===============================
// Uitloggen
// ===============================
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});
