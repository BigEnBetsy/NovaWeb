// import ShootingStars from './shootingStars.js';

// // Initialize shooting stars
// let shootingStars;
// window.addEventListener('load', () => {
//   shootingStars = new ShootingStars();
// });

// document.addEventListener('DOMContentLoaded', () => {
//   // team member hover
//   const teamMembers = document.querySelectorAll('.team-member');
  
//   teamMembers.forEach(member => {
//     member.addEventListener('mouseenter', () => {
//       member.style.transform = 'translateY(-10px)';
//     });
    
//     member.addEventListener('mouseleave', () => {
//       member.style.transform = 'translateY(0)';
//     });
//   });

//   // stats animatie
//   const stats = document.querySelectorAll('.stat-number');
//   const animateStats = () => {
//     stats.forEach(stat => {
//       const rect = stat.getBoundingClientRect();
//       if (rect.top < window.innerHeight - 100) {
//         stat.style.animation = 'countUp 2s ease-out forwards';
//       }
//     });
//   };

//   window.addEventListener('scroll', animateStats);
//   animateStats();

//   // HEADER HIDE-ON-SCROLL - IMPROVED VERSION
//   let lastScroll = 0;
//   const header = document.querySelector("header");
//   const headerHeight = header.offsetHeight;

//   window.addEventListener("scroll", () => {
//     const currentScroll = window.pageYOffset;

//     if (currentScroll > lastScroll && currentScroll > headerHeight) {
//       // Naar beneden scrollen (en voorbij header hoogte)
//       header.classList.add("hide");
//     } else {
//       // Naar boven scrollen
//       header.classList.remove("hide");
//     }

//     lastScroll = currentScroll;
//   });
// });




// shootingStars.js moet in de HTML worden geladen of hier als gewone script
// team member hover
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM geladen - script werkt");
  
  // team member hover
  const teamMembers = document.querySelectorAll('.team-member');
  
  teamMembers.forEach(member => {
    member.addEventListener('mouseenter', () => {
      member.style.transform = 'translateY(-10px)';
    });
    
    member.addEventListener('mouseleave', () => {
      member.style.transform = 'translateY(0)';
    });
  });

  // stats animatie
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

  // HEADER HIDE-ON-SCROLL - WERKENDE VERSIE
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

  
});