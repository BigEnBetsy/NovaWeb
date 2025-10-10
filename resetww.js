const forgotPasswordLink = document.querySelector('.forgot-password');

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    if (!email) {
      statusDiv.style.color = 'red';
      statusDiv.innerText = 'Vul eerst je e-mailadres in.';
      return;
    }

    // Stuur reset email via Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://bigenbetsy.github.io/NovaWeb/resetww.html' // Pas aan naar je eigen reset-pagina
    });

    if (error) {
      statusDiv.style.color = 'red';
      statusDiv.innerText = `Fout: ${error.message}`;
    } else {
      statusDiv.style.color = 'green';
      statusDiv.innerText = 'Check je e-mail om je wachtwoord te resetten.';
    }
  });
}
