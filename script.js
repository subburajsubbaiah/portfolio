/* ==========================================================================
   FIREBASE FIRESTORE CONNECTION
   ========================================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyD4M9u6EE3OvLqiR1VxBWatqVM9N1zPvHc",
  authDomain: "subburaj-in.firebaseapp.com",
  projectId: "subburaj-in",
  storageBucket: "subburaj-in.firebasestorage.app",
  messagingSenderId: "899070920676",
  appId: "1:899070920676:web:e0a851b4604cd1296669f1",
  measurementId: "G-QCKV91YB1C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ==========================================================================
   PORTFOLIO INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initMobileMenu();
  initScrollEffects();
  initSkillsDashboard();
  initScrollReveal();
  initCardEffects();
});

/* ==========================================================================
   TYPEWRITER EFFECT (HERO SECTION)
   ========================================================================== */
function initTypewriter() {
  const target = document.getElementById('typing-text');
  if (!target) return;

  const words = [
    'Software Developer',
    'UI/UX Designer',
    'AI-Assisted Engineer'
  ];
  
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Faster deleting
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 1500; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  // Start typewriter loop
  setTimeout(type, 800);
}

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('navbar-menu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !navMenu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
}

/* ==========================================================================
   SCROLL EFFECTS & NAVIGATION HIGHLIGHTS
   ========================================================================== */
function initScrollEffects() {
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header background change on scroll
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Highlight active section link
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120; // Offset for sticky navbar
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   SKILLS DASHBOARD PANEL SWITCHER
   ========================================================================== */
function initSkillsDashboard() {
  const cards = document.querySelectorAll('.skill-card');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateProgressBars(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => observer.observe(card));
}

function animateProgressBars(card) {
  const bars = card.querySelectorAll('.progress-bar-fill');
  bars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width');
    bar.style.width = '0';
    bar.offsetHeight; // force reflow
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 50);
  });
}


/* ==========================================================================
   CONTACT FORM SUBMISSION SIMULATION
   ========================================================================== */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('form-submit-btn');
  const feedback = document.getElementById('form-feedback');
  const form = document.getElementById('portfolio-contact-form');

  if (!submitBtn || !feedback || !form) return;

  // Set loading state
  submitBtn.disabled = true;
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Sending Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

  feedback.className = 'form-feedback';
  feedback.textContent = '';

  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const message = document.getElementById('form-message').value.trim();

  // Write to Firestore contacts collection as background backup (safely wrapped)
  try {
    if (typeof db !== 'undefined' && db && typeof db.collection === 'function') {
      db.collection("contacts").add({
        name: name,
        email: email,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .catch((error) => {
        console.error("Firestore backup error: ", error);
      });
    }
  } catch (firestoreError) {
    console.error("Firestore backup failed to initialize: ", firestoreError);
  }

  // Send email to Gmail using FormSubmit AJAX service
  fetch("https://formsubmit.co/ajax/5293c4cccea3b2c6e08cbf4e56dc6405", {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      message: message,
      _subject: `New Portfolio Message from ${name}`
    })
  })
  .then(response => {
    if (response.ok) {
      feedback.className = 'form-feedback success';
      feedback.textContent = `Thank you, ${name}! Your message has been sent successfully. I will get back to you shortly.`;
      form.reset();
    } else {
      return response.json().then(data => {
        throw new Error(data.message || "Failed to submit form");
      }).catch(() => {
        throw new Error("FormSubmit response was not OK");
      });
    }
  })
  .catch((error) => {
    console.error("Email send error: ", error);
    feedback.className = 'form-feedback error';
    
    // Check if tested locally from file:// URL
    if (window.location.protocol === 'file:') {
      feedback.innerHTML = 'Oops! FormSubmit does not support direct local files (<code>file://</code> URLs). Please test this on your live site (e.g. GitHub Pages) or run a local web server.';
    } else {
      feedback.textContent = `Oops! Something went wrong: ${error.message || error}. Please try again or email me directly at subburajsubbaiah@gmail.com.`;
    }
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  });
}

/* ==========================================================================
   SCROLL REVEAL TRIGGERS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('section, .project-alt-card, .timeline-item, .achievement-card, .skill-card');
  
  revealElements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   3D TILT & SPOTLIGHT HOVER EFFECTS (PREMIUM EXPERIENCE)
   ========================================================================== */
function initCardEffects() {
  const cards = document.querySelectorAll('.glass-card, .project-alt-desc-glass');
  
  // Only apply tilt on devices with mouse/pointer support for optimal UX
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  
  cards.forEach(card => {
    // Check if this card should receive the 3D tilt effect
    const shouldTilt = card.classList.contains('skill-card') || card.classList.contains('achievement-card');

    // 1. Mouse movement tracking for 3D tilt & spotlight position
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update custom properties for spotlight positioning (applies to all cards)
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      if (hasFinePointer && shouldTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt angles based on cursor offset from card center (max 6deg)
        const rotateX = -(y - centerY) / (rect.height / 12);
        const rotateY = (x - centerX) / (rect.width / 12);
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    });
    
    // 2. Mouse leave handling to smoothly reset card state
    card.addEventListener('mouseleave', () => {
      if (hasFinePointer && shouldTilt) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }
    });
  });
}
