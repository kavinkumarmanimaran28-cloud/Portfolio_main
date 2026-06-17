/* ============================================
   KAVIN KUMAR M — Portfolio JavaScript
   Dark Futuristic · Fire Theme
   ============================================ */

/* ---- TYPEWRITER ---- */
const roles = [
  "Web Developer",
  "Network Engineer",
  "Prompt Engineer",
  "Flutter Developer",
  "Problem Solver",
  "AI Enthusiast"
];
let rIndex = 0, cIndex = 0, isDeleting = false;
const twEl = document.getElementById("typewriter-text");

function typewrite() {
  const current = roles[rIndex];
  if (isDeleting) {
    twEl.textContent = current.substring(0, cIndex--);
  } else {
    twEl.textContent = current.substring(0, cIndex++);
  }
  let speed = isDeleting ? 60 : 100;
  if (!isDeleting && cIndex === current.length + 1) {
    speed = 1800; isDeleting = true;
  } else if (isDeleting && cIndex < 0) {
    isDeleting = false;
    rIndex = (rIndex + 1) % roles.length;
    speed = 400;
  }
  setTimeout(typewrite, speed);
}
typewrite();

/* ---- SCROLL PROGRESS ---- */
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  document.getElementById("scroll-bar").style.width = (scrolled / total * 100) + "%";

  // Back to top
  const btn = document.getElementById("back-top");
  btn.classList.toggle("show", scrolled > 400);

  // Navbar shadow
  const nav = document.getElementById("navbar");
  nav.style.boxShadow = scrolled > 50 ? "0 4px 32px rgba(0,0,0,0.5)" : "none";
});

/* ---- BACK TO TOP ---- */
document.getElementById("back-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---- HAMBURGER MENU ---- */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

mobileMenu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

/* ---- FIRE CANVAS ---- */
const canvas = document.getElementById("fire-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = [];
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -(Math.random() * 2 + 1);
    this.alpha = Math.random() * 0.5 + 0.1;
    this.size = Math.random() * 3 + 1;
    this.life = 0;
    this.maxLife = Math.random() * 120 + 80;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    this.alpha = (1 - this.life / this.maxLife) * 0.4;
    if (this.life >= this.maxLife) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    const hue = 15 + (this.life / this.maxLife) * 30;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) {
  const p = new Particle();
  p.life = Math.random() * p.maxLife;
  particles.push(p);
}

function animateFire() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateFire);
}
animateFire();

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll(
  "section, .about-card, .skill-tag, .project-card, .timeline-item, .cert-card, .contact-card, .section-heading"
);
revealEls.forEach(el => el.classList.add("reveal"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("visible"), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

/* ---- 3D TILT EFFECT ---- */
function initTilt() {
  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -10;
      const rotY = ((x - cx) / cx) * 10;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      card.querySelector(".tilt-card-inner").style.transform = `translateZ(20px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(600px) rotateX(0) rotateY(0) translateZ(0)";
      card.querySelector(".tilt-card-inner").style.transform = "translateZ(0)";
    });
  });
}
initTilt();

/* ---- ACTIVE NAV LINK ---- */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(a => a.style.color = "");
      const active = document.querySelector(`.nav-links a[href="#${section.id}"]`);
      if (active) active.style.color = "var(--fire-2)";
    }
  });
});

/* ---- FOOTER YEAR ---- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---- CERT LIGHTBOX ---- */
const certLightbox = document.getElementById("cert-lightbox");
const certLightboxImg = document.getElementById("cert-lightbox-img");
const certLightboxTitle = document.getElementById("cert-lightbox-title");
const certLightboxClose = document.getElementById("cert-lightbox-close");

document.querySelectorAll(".cert-card").forEach(card => {
  card.addEventListener("click", () => {
    const img = card.getAttribute("data-cert-img");
    const title = card.getAttribute("data-cert-title");
    certLightboxImg.src = img;
    certLightboxImg.alt = title;
    certLightboxTitle.textContent = title;
    certLightbox.classList.add("open");
  });
});

certLightboxClose.addEventListener("click", () => certLightbox.classList.remove("open"));
certLightbox.addEventListener("click", e => {
  if (e.target === certLightbox) certLightbox.classList.remove("open");
});

/* ---- AI CHATBOT ---- */
const aiToggle = document.getElementById("ai-toggle");
const aiWindow = document.getElementById("ai-window");
const aiClose = document.getElementById("ai-close");
const aiInput = document.getElementById("ai-input");
const aiSend = document.getElementById("ai-send");
const aiMessages = document.getElementById("ai-messages");

aiToggle.addEventListener("click", () => {
  aiWindow.classList.toggle("open");
  if (aiWindow.classList.contains("open") && aiMessages.children.length === 0) {
    addBotMsg("👋 Hi! I'm Kavin's AI assistant. Ask me anything about Kavin's skills, projects, or experience!");
  }
});
aiClose.addEventListener("click", () => aiWindow.classList.remove("open"));

function addBotMsg(text) {
  const div = document.createElement("div");
  div.className = "ai-msg bot";
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function addUserMsg(text) {
  const div = document.createElement("div");
  div.className = "ai-msg user";
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function addTyping() {
  const div = document.createElement("div");
  div.className = "ai-msg bot";
  div.id = "typing-indicator";
  div.textContent = "Thinking...";
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

async function sendMessage() {
  const msg = aiInput.value.trim();
  if (!msg) return;
  aiInput.value = "";
  addUserMsg(msg);
  const typing = addTyping();

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: buildPrompt(msg)
      })
    });

    typing.remove();

    if (!response.ok) {
      addBotMsg("Sorry, I'm having trouble connecting right now. Please try again!");
      return;
    }

    const data = await response.json();
    addBotMsg(data.response || "Sorry, I couldn't get a response.");
  } catch (err) {
    typing.remove();
    addBotMsg("Connection error. Please try again in a moment.");
  }
}

function buildPrompt(userMsg) {
  return `You are KK Assistant, an AI chatbot on Kavin Kumar M's portfolio website.

ABOUT KAVIN:
- Full Name: Kavin Kumar M
- Role: Web Developer, Network Engineer, Prompt Engineer
- Education: B.E. CSE at Karpagam College of Engineering (2023–Present)
- Location: Coimbatore, Tamil Nadu (Native: Palani)
- Email: kavinkumarkumar258@gmail.com
- Phone: +91 6374-280-855
- GitHub: github.com/KAVINKUMAR2818
- LinkedIn: linkedin.com/in/kavin-kumar-m-475614299
- LeetCode: leetcode.com/u/KAVIN_KUMAR_2818

SKILLS:
- Languages: Python, Java, JavaScript, Dart
- Frontend: HTML5, CSS3, React, Flutter, Tailwind CSS
- Database: SQL, MySQL, DBMS
- Tools: VS Code, Figma, AWS, Power BI, Cisco Packet Tracer

PROJECTS:
1. Quiz Website — HTML, CSS, JavaScript
   Responsive quiz app with timer and auto score calculation
2. Business Website — React, Tailwind CSS
   Modern responsive business site with routing and form validation
3. Karpagam Foodcourt — Flutter
   Mobile app with screen navigation and dynamic list rendering

CERTIFICATIONS:
- Cisco Networking Essentials
- Cisco Networking Basics
- Introduction to Cybersecurity (Cisco)
- AWS Cloud Practitioner
- Python Programming
- CCNA (In Progress)

RULES:
- Only answer questions about Kavin or general tech topics
- Be helpful, friendly, and concise (max 3-4 sentences)
- If asked off-topic questions, politely redirect to Kavin's portfolio info

User question: ${userMsg}`;
}

aiSend.addEventListener("click", sendMessage);
aiInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
