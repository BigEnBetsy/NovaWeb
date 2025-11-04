import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fmrvruyofieuhxmmrbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZydXlvZmlldWh4bW1yYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0NTIsImV4cCI6MjA3NTQ3NjQ1Mn0.KooHvMATpbJqXmIkquvJcHVIqDo1G5ALWTiYVI7rlvg';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let sessionToken = null;

// DOM
const emailField = document.getElementById('email');
const activeDaysEl = document.getElementById('active-days');
const uploadsCountEl = document.getElementById('uploads-count');
const projectsCountEl = document.getElementById('projects-count');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const filesCardBody = document.querySelector('#files .card-body');
const deleteModal = document.getElementById('delete-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');

// Profiel velden
const accountIdField = document.getElementById('account-id');
const createdAtField = document.getElementById('created-at');
const lastSignInField = document.getElementById('last-sign-in');
const emailStatus = document.getElementById('email-status');

// Nav dots
const dots = document.querySelectorAll('.dot');

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = session.user;
  sessionToken = session.access_token;

  console.log('Ingelogde gebruiker:', currentUser.id);

  // Laad alles direct
  await loadProfileInfo();
  await loadStats();
  await loadUserFiles(); // BESTANDEN WORDEN NU DIRECT GETOOND

  // Scroll navigation
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 200;
    document.querySelectorAll('section').forEach(sec => {
      if (sec.offsetTop <= scrollPosition && (sec.offsetTop + sec.offsetHeight) > scrollPosition) {
        dots.forEach(d => d.classList.remove('active'));
        document.querySelector(`[data-section="${sec.id}"]`).classList.add('active');
      }
    });
  });
});

// === PROFIEL INFORMATIE LADEN ===
async function loadProfileInfo() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  emailField.value = user.email || 'Onbekend';
  emailStatus.textContent = user.email_confirmed_at ? 'Bevestigd' : 'Niet bevestigd';
  emailStatus.style.color = user.email_confirmed_at ? '#4ade80' : '#ff6b6b';

  accountIdField.value = user.id;

  const created = user.created_at ? new Date(user.created_at) : null;
  createdAtField.value = created
    ? `${created.toLocaleDateString('nl-NL')} om ${created.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
    : 'Onbekend';

  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
  lastSignInField.value = lastSignIn
    ? `${lastSignIn.toLocaleDateString('nl-NL')} om ${lastSignIn.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
    : 'Onbekend';

  document.getElementById('copy-id').onclick = () => {
    navigator.clipboard.writeText(user.id);
    const btn = document.getElementById('copy-id');
    const oldHTML = btn.innerHTML;
    btn.innerHTML = 'Gekopieerd!';
    btn.style.background = '#4ade80';
    setTimeout(() => {
      btn.innerHTML = oldHTML;
      btn.style.background = '';
    }, 2000);
  };
}

// === BESTANDEN LADEN (DIRECT BIJ OPENEN) ===
async function loadUserFiles() {
  const { data: files, error } = await supabase
    .from('files')
    .select('id, file_name, file_path, file_size, created_at')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fout bij ophalen bestanden:', error);
    return;
  }

  let mediaGrid = document.querySelector('.media-grid');
  if (!mediaGrid) {
    mediaGrid = document.createElement('div');
    mediaGrid.className = 'media-grid';
    filesCardBody.appendChild(mediaGrid);
  } else {
    mediaGrid.innerHTML = '';
  }

  if (files.length === 0) {
    mediaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ccc; margin-top: 20px;">Geen bestanden geüpload.</p>';
    return;
  }

  for (const file of files) {
    await appendFileToGrid(file, mediaGrid); // Voeg één voor één toe
  }
}

// === BESTAND TOEVOEGEN AAN GRID (voor upload) ===
async function appendFileToGrid(file, grid) {
  const item = document.createElement('div');
  item.className = 'media-item';

  const isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(file.file_name);

  if (isImage) {
    const img = document.createElement('img');
    img.alt = file.file_name;
    img.loading = 'lazy';
    img.style.opacity = '0.5';
    img.style.transition = 'opacity 0.3s';

    const { data, error: signedError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(file.file_path, 3600);

    if (signedError || !data?.signedUrl) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+';
    } else {
      img.src = data.signedUrl;
      img.onload = () => img.style.opacity = '1';
    }
    item.appendChild(img);
  } else {
    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.innerHTML = '<i class="fas fa-file"></i>';
    item.appendChild(icon);

    const name = document.createElement('p');
    name.textContent = file.file_name;
    name.style.fontSize = '0.8rem';
    name.style.marginTop = '5px';
    name.style.textAlign = 'center';
    name.style.padding = '0 4px';
    item.appendChild(name);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = '×';
  delBtn.title = 'Verwijderen';
  delBtn.onclick = () => deleteFile(file.id, file.file_path, item);
  item.appendChild(delBtn);

  grid.appendChild(item);
}

// === BESTAND VERWIJDEREN ===
async function deleteFile(fileId, filePath, domItem) {
  if (!confirm(`Weet je zeker dat je dit bestand wilt verwijderen?`)) return;

  const { error: storageError } = await supabase.storage.from('uploads').remove([filePath]);
  if (storageError) {
    alert('Fout bij verwijderen uit opslag: ' + storageError.message);
    return;
  }

  const { error: dbError } = await supabase.from('files').delete().eq('id', fileId);
  if (dbError) {
    alert('Fout bij verwijderen uit database: ' + dbError.message);
    return;
  }

  domItem.remove();
  uploadsCountEl.textContent = parseInt(uploadsCountEl.textContent) - 1;

  if (document.querySelectorAll('.media-item').length === 0) {
    document.querySelector('.media-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ccc; margin-top: 20px;">Geen bestanden geüpload.</p>';
  }
}

// === UPLOAD (voegt nieuw bestand toe zonder refresh) ===
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = '#FFD60A'; });
uploadArea.addEventListener('dragleave', () => uploadArea.style.borderColor = 'rgba(255,255,255,0.3)');
uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.style.borderColor = 'rgba(255,255,255,0.3)'; fileInput.files = e.dataTransfer.files; handleFile(); });
fileInput.addEventListener('change', handleFile);

async function handleFile() {
  const file = fileInput.files[0];
  if (!file) return alert('Geen bestand geselecteerd');

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return alert('Je bent niet ingelogd.');

    const user = session.user;
    const filePath = `user-files/${user.id}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (storageError) throw storageError;

    const { data: dbData, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) throw dbError;

    alert('Bestand geüpload!');
    uploadsCountEl.textContent = parseInt(uploadsCountEl.textContent || '0') + 1;
    fileInput.value = '';

    // VOEG HET NIEUWE BESTAND DIRECT TOE
    const mediaGrid = document.querySelector('.media-grid');
    if (mediaGrid) {
      await appendFileToGrid(dbData, mediaGrid);
    }

  } catch (err) {
    console.error('Upload fout:', err);
    alert('Upload mislukt: ' + err.message);
  }
}

// === STATISTIEKEN ===
async function loadStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.created_at) {
    const days = Math.floor((new Date() - new Date(user.created_at)) / 86400000) + 1;
    activeDaysEl.textContent = days;
  } else {
    activeDaysEl.textContent = 'Onbekend';
  }

  const { count: uploads } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
  uploadsCountEl.textContent = uploads || 0;

  const { count: projects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
  projectsCountEl.textContent = projects || 0;
}

// === ACTIES ===
document.getElementById('change-email').addEventListener('click', async () => {
  const newEmail = prompt('Nieuw e-mailadres:');
  if (!newEmail || !newEmail.includes('@')) return;

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    alert('Fout bij wijzigen: ' + error.message);
  } else {
    alert('E-mail bijgewerkt! Check je inbox om te bevestigen.');
    emailField.value = newEmail;
  }
});

document.getElementById('student-discount').addEventListener('click', () => alert('Studentenkorting aangevraagd!'));
document.getElementById('save-settings').addEventListener('click', () => alert('Instellingen opgeslagen!'));
document.getElementById('logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

document.getElementById('delete-account').addEventListener('click', () => deleteModal.style.display = 'flex');
cancelDelete.addEventListener('click', () => deleteModal.style.display = 'none');

confirmDelete.addEventListener('click', async () => {
  if (!confirm('Weet je het 100% zeker?')) return;

  const res = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }
  });

  if (res.ok) {
    await supabase.auth.signOut();
    alert('Account verwijderd.');
    window.location.href = 'login.html';
  } else {
    alert('Fout bij verwijderen.');
  }
});