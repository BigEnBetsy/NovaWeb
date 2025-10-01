// Portfolio filtering functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log("Projecten DOM geladen");

  // HEADER HIDE-ON-SCROLL - FIXED VERSION
  let lastScroll = 0;
  const header = document.querySelector("header");
  const scrollThreshold = 100;
  let isHidden = false;

  console.log("Header element gevonden:", header);

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    console.log("Scroll:", currentScroll);
    
    // Add background when scrolled
    if (currentScroll > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
    
    // Hide/show logic
    if (currentScroll > lastScroll && currentScroll > scrollThreshold && !isHidden) {
        // Scrolling down - hide header
        console.log("Hide header");
        header.classList.add("hide");
        isHidden = true;
    } else if (currentScroll < lastScroll && isHidden) {
        // Scrolling up - show header
        console.log("Show header");
        header.classList.remove("hide");
        isHidden = false;
    }
    
    // Reset if at top of page
    if (currentScroll <= scrollThreshold) {
        header.classList.remove("hide");
        isHidden = false;
    }
    
    lastScroll = currentScroll;
  });

  // Portfolio filtering functionality
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      portfolioItems.forEach(item => {
        if (filter === 'all') {
          item.classList.remove('hidden');
        } else {
          const categories = item.getAttribute('data-category').split(' ');
          if (categories.includes(filter)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        }
      });
    });
  });

  // Modal functionality
  const modal = document.getElementById('projectModal');
  const closeModal = document.querySelector('.close-modal');
  const viewProjectBtns = document.querySelectorAll('.view-project-btn');
  const modalBody = document.getElementById('modalBody');

  // Project data
  const projects = {
    koffiehoek: {
      title: "De Koffiehoek",
      description: "Een moderne website voor een lokale koffiebar met volledig responsive design, online menu en reserveringssysteem.",
      features: ["Responsive design", "Online menu", "Reserveringssysteem", "Contactformulier", "SEO geoptimaliseerd"],
      technologies: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL"],
      image: "Café Project",
      client: "Lokale Koffiebar",
      duration: "3 weken"
    },
    muziekacademie: {
      title: "MuziekAcademie",
      description: "Compleet inschrijvingssysteem voor een muziekschool met docentenprofielen, lesrooster en online betaling.",
      features: ["Inschrijvingssysteem", "Docentenprofielen", "Lesrooster", "Online betaling", "Admin dashboard"],
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      image: "Muziek School",
      client: "Muziek Academie",
      duration: "6 weken"
    },
    fotostudio: {
      title: "FotoStudio",
      description: "Elegant portfolio website voor een professionele fotograaf met geavanceerde gallery en contactmogelijkheden.",
      features: ["Portfolio gallery", "Contactformulier", "Blog sectie", "Social media integratie", "Responsive design"],
      technologies: ["HTML5", "CSS3", "JavaScript", "Lightbox"],
      image: "Fotograaf",
      client: "Professionele Fotograaf",
      duration: "4 weken"
    },
    studentenclub: {
      title: "StudentenClub",
      description: "Dynamische website voor een studentenvereniging met events, lidmaatschap en community features.",
      features: ["Events kalender", "Lidmaatschap", "Forum", "Foto gallery", "Nieuws sectie"],
      technologies: ["WordPress", "PHP", "MySQL", "JavaScript"],
      image: "Studentenvereniging",
      client: "Studentenvereniging",
      duration: "5 weken"
    },
    restaurant: {
      title: "Bistro Modern",
      description: "Restaurant website met online tafelreservering, menu en bestelsysteem.",
      features: ["Online reserveringen", "Menu", "Bestelsysteem", "Locatie", "Openingstijden"],
      technologies: ["React", "Node.js", "MongoDB", "Payment API"],
      image: "Restaurant",
      client: "Bistro Modern",
      duration: "4 weken"
    },
    portfolio: {
      title: "Student Portfolio",
      description: "Persoonlijk portfolio website voor een student met project showcase en CV.",
      features: ["Project gallery", "CV download", "Contact form", "Responsive design", "Blog"],
      technologies: ["HTML5", "CSS3", "JavaScript", "GSAP"],
      image: "Portfolio",
      client: "Student",
      duration: "2 weken"
    }
  };

  viewProjectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.getAttribute('data-project');
      const project = projects[projectId];
      
      if (project) {
        modalBody.innerHTML = `
          <h2>${project.title}</h2>
          <div class="project-details">
            <div class="project-image-large">
              ${project.image}
            </div>
            <div class="project-info">
              <p><strong>Beschrijving:</strong> ${project.description}</p>
              <p><strong>Klant:</strong> ${project.client}</p>
              <p><strong>Duur:</strong> ${project.duration}</p>
              
              <div class="project-features">
                <h4>Features:</h4>
                <ul>
                  ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
              
              <div class="project-technologies">
                <h4>Technologieën:</h4>
                <div class="tech-tags">
                  ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        modal.style.display = 'block';
      }
    });
  });

  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});


// Voeg dit toe aan je JavaScript
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});