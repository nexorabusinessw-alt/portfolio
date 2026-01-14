const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section");
const revealElements = document.querySelectorAll(".reveal");
const projectsGrid = document.getElementById("projects-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalHighlights = document.getElementById("modal-highlights");
const modalTags = document.getElementById("modal-tags");
const contactForm = document.getElementById("contact-form");

if (prefersReducedMotion) {
  document.documentElement.style.scrollBehavior = "auto";
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((el) => observer.observe(el));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { threshold: 0.55 }
);

sections.forEach((section) => sectionObserver.observe(section));

const renderProjects = (filter) => {
  projectsGrid.innerHTML = "";
  const filtered = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  filtered.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card reveal";
    card.dataset.id = projects.indexOf(project);
    card.innerHTML = `
      ${project.featured ? '<span class="badge-featured">Featured</span>' : ""}
      <p class="category">${project.category}</p>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="tag-list">
        ${project.technologies.map((tech) => `<span class="tag">${tech}</span>`).join("")}
      </div>
    `;
    projectsGrid.appendChild(card);
    observer.observe(card);
  });
};

renderProjects("all");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderProjects(button.dataset.filter);
  });
});

const openModal = (project) => {
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalHighlights.innerHTML = project.highlights.map((item) => `<li>${item}</li>`).join("");
  modalTags.innerHTML = project.technologies.map((tech) => `<span class="tag">${tech}</span>`).join("");
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
};

projectsGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".project-card");
  if (!card) return;
  const project = projects[Number(card.dataset.id)];
  if (project) openModal(project);
});

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true" || event.target.classList.contains("modal-close")) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

const validateField = (input) => {
  const error = document.querySelector(`[data-error-for="${input.id}"]`);
  if (!error) return true;

  if (!input.value.trim()) {
    error.textContent = "This field is required.";
    return false;
  }

  if (input.type === "email") {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(input.value)) {
      error.textContent = "Please enter a valid email.";
      return false;
    }
  }

  error.textContent = "";
  return true;
};

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const inputs = contactForm.querySelectorAll("input, textarea");
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    const submitBtn = contactForm.querySelector("button[type='submit']");
    const successMessage = contactForm.querySelector(".form-success");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      successMessage.textContent = "Message ready to send (demo)";
      contactForm.reset();
      setTimeout(() => {
        successMessage.textContent = "";
      }, 3000);
    }, 1200);
  });
}

const typingElement = document.getElementById("typing-text");
const typingPhrases = ["Data Science", "Developer", "Software Engineer", "Data Analysis"];

if (typingElement) {
  if (prefersReducedMotion) {
    typingElement.textContent = typingPhrases[0];
  } else {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeLoop = () => {
      const currentPhrase = typingPhrases[phraseIndex];
      const updatedText = isDeleting
        ? currentPhrase.substring(0, charIndex - 1)
        : currentPhrase.substring(0, charIndex + 1);

      typingElement.textContent = updatedText;
      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

      let delay = isDeleting ? 70 : 120;

      if (!isDeleting && updatedText === currentPhrase) {
        delay = 1200;
        isDeleting = true;
      } else if (isDeleting && updatedText === "") {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        delay = 400;
      }

      setTimeout(typeLoop, delay);
    };

    typeLoop();
  }
}

if (!prefersReducedMotion) {
  projectsGrid.addEventListener("mousemove", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 4;
    const rotateY = (x / rect.width) * 4;
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  projectsGrid.addEventListener("mouseleave", (event) => {
    const card = event.target.closest(".project-card");
    if (card) {
      card.style.transform = "";
    }
  });
}
