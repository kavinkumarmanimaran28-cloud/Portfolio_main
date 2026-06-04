// Mobile Share Link Copy Function
function copyShareLink() {
    const shareUrl = "https://kavinkumar2818.github.io/my-portfolio/";
    const btn = document.getElementById('share-link-btn');

    // Try using the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 2000);
        }).catch(() => {
            fallbackCopy(shareUrl, btn);
        });
    } else {
        fallbackCopy(shareUrl, btn);
    }
}

function fallbackCopy(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
    } catch (err) {
        alert('Link: ' + text);
    }
    document.body.removeChild(textArea);
}

document.addEventListener("DOMContentLoaded", () => {

    let neuralNetwork; // Define here to be accessible within the scope

    // SECRET THEMES: Track current secret theme and original theme (global scope)
    let secretThemeActive = null;
    let originalThemeBeforeSecret = null;

    // ===== THEME BACKGROUND SLIDESHOW MANAGER =====
    class ThemeBackgroundSlideshow {
        constructor() {
            this.themes = {
                'ironman-mode': [
                    'projects/images/backgrounds/ironman-1.png',
                    'projects/images/backgrounds/ironman-2.jpg',
                    'projects/images/backgrounds/ironman-3.jpg'
                ],
                'batman-mode': [
                    'projects/images/backgrounds/batman-1.jpg',
                    'projects/images/backgrounds/batman-2.jpg',
                    'projects/images/backgrounds/batman-3.jpg'
                ],
                'spiderman-mode': [
                    'projects/images/backgrounds/spiderman-1.jpg',
                    'projects/images/backgrounds/spiderman-2.jpg',
                    'projects/images/backgrounds/spiderman-3.jpg'
                ],
                'neon-mode': [
                    'projects/images/backgrounds/neon-1.jpg',
                    'projects/images/backgrounds/neon-2.jpg',
                    'projects/images/backgrounds/neon-3.jpg'
                ]
            };
            
            this.currentTheme = null;
            this.currentIndex = 0;
            this.intervalId = null;
            this.preloadedImages = {};
            
            // Monitor theme changes
            this.observeThemeChanges();
        }
        
        observeThemeChanges() {
            const observer = new MutationObserver(() => {
                this.handleThemeChange();
            });
            
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
            
            // Initial check
            this.handleThemeChange();
        }
        
        handleThemeChange() {
            const body = document.body;
            let activeTheme = null;
            
            // Check which theme is active
            for (const theme of Object.keys(this.themes)) {
                if (body.classList.contains(theme)) {
                    activeTheme = theme;
                    break;
                }
            }
            
            // If theme changed
            if (activeTheme !== this.currentTheme) {
                this.stop();
                
                if (activeTheme && this.themes[activeTheme]) {
                    this.currentTheme = activeTheme;
                    this.currentIndex = 0;
                    this.preloadImages(activeTheme);
                    this.start();
                } else {
                    this.currentTheme = null;
                    body.classList.remove('slideshow-active');
                    body.style.setProperty('--bg-image', 'none');
                }
            }
        }
        
        preloadImages(theme) {
            if (!this.preloadedImages[theme]) {
                this.preloadedImages[theme] = [];
                this.themes[theme].forEach(src => {
                    const img = new Image();
                    img.src = src;
                    this.preloadedImages[theme].push(img);
                });
            }
        }
        
        start() {
            if (!this.currentTheme) return;
            
            document.body.classList.add('slideshow-active');
            this.showImage(0);
            
            // Change image every 8 seconds
            this.intervalId = setInterval(() => {
                this.nextImage();
            }, 8000);
        }
        
        stop() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
        
        showImage(index) {
            if (!this.currentTheme || !this.themes[this.currentTheme]) return;
            
            const images = this.themes[this.currentTheme];
            const imageSrc = images[index];
            
            // Set background image
            document.body.style.setProperty('--bg-image', `url('${imageSrc}')`);
            
            // Update ::before pseudo-element
            const style = document.createElement('style');
            style.id = 'theme-bg-style';
            style.textContent = `body::before { background-image: url('${imageSrc}'); }`;
            
            // Remove old style if exists
            const oldStyle = document.getElementById('theme-bg-style');
            if (oldStyle) oldStyle.remove();
            
            document.head.appendChild(style);
        }
        
        nextImage() {
            if (!this.currentTheme) return;
            
            const images = this.themes[this.currentTheme];
            this.currentIndex = (this.currentIndex + 1) % images.length;
            this.showImage(this.currentIndex);
        }
    }
    
    // Initialize slideshow manager
    const backgroundSlideshow = new ThemeBackgroundSlideshow();

    // ===== NAVBAR AUTO-HIDE FOR HIDDEN THEMES =====
    function setupNavbarAutoHide() {
        // Create hover zone for navbar reveal
        const revealZone = document.createElement('div');
        revealZone.className = 'navbar-reveal-zone';
        document.body.appendChild(revealZone);

        const header = document.querySelector('header');
        let isNavbarVisible = false;

        // Show navbar when mouse enters top zone
        revealZone.addEventListener('mouseenter', () => {
            if (!isNavbarVisible && isHiddenThemeActive()) {
                header.style.setProperty('transform', 'translateY(0)', 'important');
                isNavbarVisible = true;
            }
        });

        // Hide navbar when mouse leaves header
        header.addEventListener('mouseleave', () => {
            if (isNavbarVisible && isHiddenThemeActive()) {
                header.style.setProperty('transform', 'translateY(-100%)', 'important');
                isNavbarVisible = false;
            }
        });

        // Check if hidden theme is active
        function isHiddenThemeActive() {
            return document.body.classList.contains('ironman-mode') ||
                   document.body.classList.contains('batman-mode') ||
                   document.body.classList.contains('spiderman-mode') ||
                   document.body.classList.contains('neon-mode') ||
                   document.body.classList.contains('barbie-mode') ||
                   document.body.classList.contains('ben10-mode');
        }

        // Reset navbar position when switching themes
        const observer = new MutationObserver(() => {
            if (!isHiddenThemeActive()) {
                header.style.transform = '';
                isNavbarVisible = false;
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Initialize navbar auto-hide
    setupNavbarAutoHide();

    // ===== INTERACTIVE PROFILE PICTURE WITH 3D CAROUSEL =====
    const profilePicture = document.getElementById('profile-picture');
    const profileZoomModal = document.getElementById('profile-zoom-modal');
    const profileZoomBackdrop = profileZoomModal?.querySelector('.profile-zoom-backdrop');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    let shapeIndex = 0; // 0: circle, 1: square, 2: rectangle
    const shapes = ['shape-circle', 'shape-square', 'shape-rectangle'];
    let clickTimer = null;
    let clickCount = 0;
    let currentSlide = 0;
    const totalSlides = carouselSlides.length;
    
    // Profile picture shape morphing and zoom
    if (profilePicture) {
        profilePicture.addEventListener('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    handleShapeChange();
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                openProfileZoom();
                clickCount = 0;
            }
        });
    }
    
    function handleShapeChange() {
        shapes.forEach(shape => profilePicture.classList.remove(shape));
        shapeIndex = (shapeIndex + 1) % shapes.length;
        if (shapeIndex > 0) {
            profilePicture.classList.add(shapes[shapeIndex]);
        }
    }
    
    function openProfileZoom() {
        if (profileZoomModal) {
            profileZoomModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateCarousel();
        }
    }
    
    function closeProfileZoom() {
        if (profileZoomModal) {
            profileZoomModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Carousel functionality
    function updateCarousel() {
        carouselSlides.forEach((slide, index) => {
            slide.classList.remove('active', 'adjacent-left', 'adjacent-right', 'far-left', 'far-right', 'hidden');
            
            const diff = index - currentSlide;
            
            if (diff === 0) {
                slide.classList.add('active');
                // Update main profile picture with current carousel image
                updateMainProfilePicture(slide);
            } else if (diff === 1 || diff === -(totalSlides - 1)) {
                slide.classList.add('adjacent-right');
            } else if (diff === -1 || diff === totalSlides - 1) {
                slide.classList.add('adjacent-left');
            } else if (diff === 2 || diff === -(totalSlides - 2)) {
                slide.classList.add('far-right');
            } else if (diff === -2 || diff === totalSlides - 2) {
                slide.classList.add('far-left');
            } else {
                slide.classList.add('hidden');
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Update main profile picture in hero section
    function updateMainProfilePicture(activeSlide) {
        const mainProfileImg = profilePicture?.querySelector('img');
        const carouselImg = activeSlide?.querySelector('img');
        
        if (mainProfileImg && carouselImg) {
            mainProfileImg.src = carouselImg.src;
            mainProfileImg.alt = carouselImg.alt;
        }
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }
    
    // Navigation button listeners
    if (carouselNext) {
        carouselNext.addEventListener('click', nextSlide);
    }
    
    if (carouselPrev) {
        carouselPrev.addEventListener('click', prevSlide);
    }
    
    // Indicator click listeners
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });
    
    // Slide click listeners (click non-active slides to navigate)
    carouselSlides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (index !== currentSlide) {
                goToSlide(index);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (profileZoomModal?.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'Escape') {
                closeProfileZoom();
            }
        }
    });
    
    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (profileZoomModal) {
        profileZoomModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        profileZoomModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left - next
            } else {
                prevSlide(); // Swipe right - prev
            }
        }
    }
    
    // Click backdrop to close
    if (profileZoomBackdrop) {
        profileZoomBackdrop.addEventListener('click', closeProfileZoom);
    }

    // --- PRELOADER LOGIC ---
    const preloader = document.getElementById("preloader");
    const welcomeTextEl = preloader.querySelector(".welcome-text");
    const welcomeText = "Welcome";
    welcomeText.split("").forEach(char => {
        const span = document.createElement("span");
        span.textContent = char;
        welcomeTextEl.appendChild(span);
    });
    const tl = gsap.timeline();
    tl.to(".welcome-text span", { y: 0, stagger: 0.1, ease: "power3.out", duration: 1 })
        .to([".unlock-prompt", "#unlock-button"], { opacity: 1, duration: 0.5, ease: "power2.inOut" });

    // Auto-unlock after 7 seconds if button not clicked
    const autoUnlockTimer = setTimeout(() => {
        preloader.classList.add("hidden");
        document.body.classList.add("unlocked");
        document.body.style.overflow = "";
    }, 7000); // 7 seconds

    document.getElementById("unlock-button").addEventListener("click", () => {
        clearTimeout(autoUnlockTimer); // Clear auto-unlock timer
        preloader.classList.add("hidden");
        document.body.classList.add("unlocked");
        document.body.style.overflow = "";
    });
    document.body.style.overflow = "hidden";

    // --- CORE CLASSES & FUNCTIONS ---
    class NeuralNetwork { constructor() { this.canvas = document.getElementById("neural-canvas"), this.ctx = this.canvas.getContext("2d"), this.nodes = [], this.connections = [], this.mouse = { x: 0, y: 0 }, this.animationId = null, this.resize(), this.createNodes(), this.createConnections(), this.animate(), window.addEventListener("resize", () => this.resize()), window.addEventListener("mousemove", e => { this.mouse.x = e.clientX, this.mouse.y = e.clientY }) } resize() { this.canvas.width = window.innerWidth, this.canvas.height = window.innerHeight } createNodes() { this.nodes = []; const e = Math.min(50, Math.floor(window.innerWidth / 30)); for (let t = 0; t < e; t++)this.nodes.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, vx: .5 * (Math.random() - .5), vy: .5 * (Math.random() - .5), radius: 3 * Math.random() + 1, pulsePhase: 2 * Math.random() * Math.PI }) } createConnections() { this.connections = []; const e = 150; for (let t = 0; t < this.nodes.length; t++)for (let s = t + 1; s < this.nodes.length; s++) { const o = this.getDistance(this.nodes[t], this.nodes[s]); o < e && this.connections.push({ nodeA: this.nodes[t], nodeB: this.nodes[s], distance: o, maxDistance: e }) } } getDistance(e, t) { return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)) } updateNodes() { this.nodes.forEach(e => { e.x += e.vx, e.y += e.vy, (e.x < 0 || e.x > this.canvas.width) && (e.vx *= -1), (e.y < 0 || e.y > this.canvas.height) && (e.vy *= -1), e.x = Math.max(0, Math.min(this.canvas.width, e.x)), e.y = Math.max(0, Math.min(this.canvas.height, e.y)); const t = this.getDistance(e, this.mouse); if (t < 100) { const s = (100 - t) / 100, o = Math.atan2(e.y - this.mouse.y, e.x - this.mouse.x); e.vx += Math.cos(o) * s * .01, e.vy += Math.sin(o) * s * .01 } e.pulsePhase += .02 }) } draw() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); const e = getComputedStyle(document.body).getPropertyValue("--accent-color").trim(); this.connections.forEach(t => { const s = 1 - t.distance / t.maxDistance; this.ctx.strokeStyle = `${e}${Math.floor(50 * s).toString(16).padStart(2, "0")}`, this.ctx.lineWidth = s, this.ctx.beginPath(), this.ctx.moveTo(t.nodeA.x, t.nodeA.y), this.ctx.lineTo(t.nodeB.x, t.nodeB.y), this.ctx.stroke() }), this.nodes.forEach(t => { this.ctx.fillStyle = e, this.ctx.beginPath(), this.ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI), this.ctx.fill() }) } animate() { this.updateNodes(), this.createConnections(), this.draw(), this.animationId = requestAnimationFrame(() => this.animate()) } }
    class Typewriter { constructor(e, t, s = 100) { this.element = e, this.texts = t, this.speed = s, this.textIndex = 0, this.charIndex = 0, this.isDeleting = !1, this.start() } start() { this.type() } type() { const e = this.texts[this.textIndex]; this.isDeleting ? (this.element.textContent = e.substring(0, this.charIndex - 1), this.charIndex--) : (this.element.textContent = e.substring(0, this.charIndex + 1), this.charIndex++); let t = this.speed; this.isDeleting && (t /= 2), !this.isDeleting && this.charIndex === e.length ? (t = 2e3, this.isDeleting = !0) : this.isDeleting && 0 === this.charIndex && (this.isDeleting = !1, this.textIndex = (this.textIndex + 1) % this.texts.length, t = 500), setTimeout(() => this.type(), t) } }
    class CodeTyper { constructor(e, t, s = 50, o = 25) { this.el = e, this.snippets = t, this.typeSpeed = s, this.deleteSpeed = o, this.snippetIndex = 0, this.charIndex = 0, this.isDeleting = !1, this.start() } start() { this.type() } type() { const e = this.snippets[this.snippetIndex]; let t; this.isDeleting ? (this.charIndex--, this.el.innerHTML = e.substring(0, this.charIndex), t = this.deleteSpeed) : (this.charIndex++, this.el.innerHTML = e.substring(0, this.charIndex), t = this.typeSpeed), !this.isDeleting && this.charIndex === e.length ? (t = 3e3, this.isDeleting = !0) : this.isDeleting && 0 === this.charIndex && (this.isDeleting = !1, this.snippetIndex = (this.snippetIndex + 1) % this.snippets.length, t = 500), setTimeout(() => this.type(), t) } }

    // FIXED: This function now uses classList to prevent removing the 'unlocked' class
    function switchTheme(themeName) {
        // Remove all theme classes including secret themes
        document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'neon-mode', 'spiderman-mode', 'batman-mode', 'ben10-mode');
        document.body.classList.add(themeName);
        localStorage.setItem("preferred-theme", themeName);

        // Reset secret theme tracking when switching to normal themes
        const secretThemes = ['ironman-mode', 'barbie-mode', 'neon-mode', 'spiderman-mode', 'batman-mode', 'ben10-mode'];
        if (!secretThemes.includes(themeName)) {
            secretThemeActive = null;
            originalThemeBeforeSecret = null;
            // Remove Spider-Man web overlay if exists
            const webOverlay = document.getElementById('spiderman-web-overlay');
            if (webOverlay) webOverlay.remove();

            // Remove Batman signal if exists
            const batSignal = document.getElementById('batman-signal');
            if (batSignal) batSignal.remove();

            // Remove Ben 10 overlay if exists
            const ben10Overlay = document.getElementById('ben10-overlay');
            if (ben10Overlay) ben10Overlay.remove();
        }

        // Update the radio button to reflect the active theme
        const themeMap = {
            'photon-mode': 'theme-photon',
            'quantum-mode': 'theme-quantum',
            'terminal-mode': 'theme-terminal'
        };
        const radioId = themeMap[themeName];
        if (radioId) {
            const radioButton = document.getElementById(radioId);
            if (radioButton) {
                radioButton.checked = true;
            }
        }

        if (neuralNetwork) {
            neuralNetwork.draw();
        }
    }

    function showTab(event, tabId) {
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        event.currentTarget.classList.add("active");
    }

    // --- INITIALIZE EVERYTHING ---
    neuralNetwork = new NeuralNetwork();
    new Typewriter(document.getElementById("typewriter"), ["Web Developer", "Network Engineer", "Prompt Engineer", "Computer Science Engineer", "Problem Solver", "AI Enthusiast"], 150);

    // FIXED: Restored the full, non-truncated code snippets array
    const codeSnippets = [`<span class="token-comment">// C++: Binary Search Algorithm</span>\n<span class="token-keyword">#include</span> <span class="token-string">&lt;iostream&gt;</span>\n<span class="token-keyword">#include</span> <span class="token-string">&lt;vector&gt;</span>\n\n<span class="token-type">int</span> <span class="token-function">binarySearch</span>(<span class="token-type">std::vector&lt;int&gt;</span>& arr, <span class="token-type">int</span> target) {\n  <span class="token-type">int</span> left = <span class="token-number">0</span>, right = arr.size() - <span class="token-number">1</span>;\n  <span class="token-keyword">while</span> (left <= right) {\n    <span class="token-type">int</span> mid = left + (right - left) / <span class="token-number">2</span>;\n    <span class="token-keyword">if</span> (arr[mid] == target) <span class="token-keyword">return</span> mid;\n    <span class="token-keyword">if</span> (arr[mid] < target) left = mid + <span class="token-number">1</span>;\n    <span class="token-keyword">else</span> right = mid - <span class="token-number">1</span>;\n  }\n  <span class="token-keyword">return</span> -<span class="token-number">1</span>;\n}`, '<span class="token-comment">// Java: Simple HashMap Usage</span>\n<span class="token-keyword">import</span> java.util.HashMap;\n<span class="token-keyword">import</span> java.util.Map;\n\n<span class="token-keyword">public class</span> <span class="token-type">FrequencyCounter</span> {\n  <span class="token-keyword">public static void</span> <span class="token-function">main</span>(String[] args) {\n    String text = <span class="token-string">"hello world"</span>;\n    Map&lt;Character, Integer&gt; freq = <span class="token-keyword">new</span> HashMap<>();\n    <span class="token-keyword">for</span> (<span class="token-type">char</span> c : text.toCharArray()) {\n      freq.put(c, freq.getOrDefault(c, <span class="token-number">0</span>) + <span class="token-number">1</span>);\n    }\n    System.out.println(freq);\n  }\n}'];
    new CodeTyper(document.getElementById("code-display"), codeSnippets);

    const preferredTheme = localStorage.getItem("preferred-theme") || "quantum-mode";
    switchTheme(preferredTheme);

    document.querySelectorAll('nav a[href^="#"]').forEach(e => { e.addEventListener("click", function (t) { t.preventDefault(), document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" }) }) });
    // REVERSIBLE: Observer adds in-view when entering, removes when leaving
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
            } else {
                entry.target.classList.remove("in-view");
            }
        });
    }, { threshold: .2 });
    document.querySelectorAll(".reveal").forEach(e => { observer.observe(e) });
    document.getElementById("copyright-year").textContent = (new Date).getFullYear();

    // PERFORMANCE: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // PERFORMANCE: Check for touch device to disable hover effects
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // PERFORMANCE: Only add card 3D hover effect on non-touch devices with motion enabled
    if (!isTouchDevice && !prefersReducedMotion) {
        document.querySelectorAll(".grid-card").forEach(card => {
            card.addEventListener("mousemove", e => {
                const t = card.getBoundingClientRect(), s = e.clientX - t.left, o = e.clientY - t.top, n = (o - t.height / 2) / 20, a = (s - t.width / 2) / -20;
                card.style.transform = `perspective(1000px) rotateX(${n}deg) rotateY(${a}deg) scale(1.05)`;
                card.style.setProperty("--mouse-x", `${s}px`);
                card.style.setProperty("--mouse-y", `${o}px`);
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
            });
        });
    }

    // PERFORMANCE: Throttled scroll parallax (runs at 60fps max)
    let scrollTicking = false;
    window.addEventListener("scroll", () => {
        if (!scrollTicking && !prefersReducedMotion) {
            requestAnimationFrame(() => {
                const e = window.pageYOffset, t = document.getElementById("neural-canvas");
                if (t) t.style.transform = `translateY(${.3 * e}px)`;
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // PERFORMANCE: Throttled particle trail (max 60fps, disabled on touch/reduced motion)
    let particleLastTime = 0;
    const particleThrottleMs = 16; // ~60fps
    if (!isTouchDevice && !prefersReducedMotion) {
        window.addEventListener("mousemove", e => {
            const now = Date.now();
            if (now - particleLastTime < particleThrottleMs) return;
            particleLastTime = now;

            let t = document.createElement("div");
            t.className = "particle";
            document.body.appendChild(t);
            let s = 2 * Math.random() + 1;
            t.style.width = `${s}px`;
            t.style.height = `${s}px`;
            t.style.left = `${e.clientX}px`;
            t.style.top = `${e.clientY}px`;
            let o = e.clientX + 50 * (Math.random() - .5), n = e.clientY + 50 * (Math.random() - .5);
            t.style.transform = `translate(${o - e.clientX}px, ${n - e.clientY}px)`;
            t.style.opacity = 0;
            setTimeout(() => { t.remove() }, 1e3);
        });
    }

    // PERFORMANCE: Magnetic effect only on non-touch devices
    if (!isTouchDevice) {
        document.querySelectorAll(".magnetic").forEach(el => {
            el.addEventListener("mousemove", e => {
                const t = el.getBoundingClientRect(), s = e.clientX - t.left - t.width / 2, o = e.clientY - t.top - t.height / 2;
                el.style.transform = `translate(${.3 * s}px, ${.3 * o}px)`;
            });
            el.addEventListener("mouseleave", () => {
                el.style.transform = "translate(0,0)";
            });
        });
    }

    // FIXED: Restored the full, non-truncated quotes array
    const quotes = [{ text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "Dr. A.P.J. Abdul Kalam" }, { text: "If you get up in the morning and think the future is going to be better, it is a bright day. Otherwise, it's not.", author: "Elon Musk" }, { text: "Wear your failure as a badge of honor.", author: "Sundar Pichai" }, { text: "To succeed in your mission, you must have single-minded devotion to your goal.", author: "Dr. A.P.J. Abdul Kalam" }, { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" }, { text: "A person who is happy is not because everything is right in his life, he is happy because his attitude towards everything in his life is right.", author: "Sundar Pichai" }];
    const quotePlaceholders = document.querySelectorAll(".quote-block");
    let shuffledQuotes = quotes.sort(() => .5 - Math.random());
    quotePlaceholders.forEach((e, t) => { const s = shuffledQuotes[t % shuffledQuotes.length]; e.querySelector(".quote-text").textContent = `“${s.text}”`, e.querySelector(".quote-author").textContent = `— ${s.author}` });
    document.querySelectorAll('.cert-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 768) return;
            const rect = card.getBoundingClientRect();
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            const translateX = viewportCenterX - cardCenterX;
            const translateY = viewportCenterY - cardCenterY;
            const scale = 1.8;
            card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease';
            card.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            card.style.zIndex = '1000';
        });
        card.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 768) return;
            card.style.transform = '';
            card.style.zIndex = '';
        });
    });

    // ===== SCROLL-BASED ANIMATIONS =====

    const header = document.querySelector('header');
    const scrollProgress = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('section[id]');
    const backToTopBtn = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    // Back to top button click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Image load detection for skeleton removal
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });

    // Scroll animation handler (throttled with requestAnimationFrame)
    let animScrollTicking = false;

    function handleScrollAnimations() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;


        // 2. Scroll progress bar
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercent + '%';
        }

        // 3. Parallax effects (if not reduced motion)
        if (!prefersReducedMotion) {
            document.querySelectorAll('.parallax-slow').forEach(el => {
                el.style.transform = `translateY(${scrollTop * 0.1}px)`;
            });
            document.querySelectorAll('.parallax-medium').forEach(el => {
                el.style.transform = `translateY(${scrollTop * 0.2}px)`;
            });
            document.querySelectorAll('.parallax-fast').forEach(el => {
                el.style.transform = `translateY(${scrollTop * 0.4}px)`;
            });
        }

        // 4. Active section highlighting + Active nav link indicator
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                section.classList.add('active-section');
                // Highlight corresponding nav link
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            } else {
                section.classList.remove('active-section');
            }
        });

        // 5. Back to top button visibility
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', () => {
        if (!animScrollTicking) {
            requestAnimationFrame(() => {
                handleScrollAnimations();
                animScrollTicking = false;
            });
            animScrollTicking = true;
        }
    });

    // 5. REVERSIBLE enhanced reveal observer with staggered animations
    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger class based on index
                const staggerIndex = Math.min(index + 1, 6);
                entry.target.style.transitionDelay = `${staggerIndex * 0.1}s`;
                entry.target.classList.add('in-view');
            } else {
                // REVERSIBLE: Remove class when leaving viewport
                entry.target.classList.remove('in-view');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe all reveal elements with enhanced observer
    document.querySelectorAll('.reveal-scale, .reveal-rotate, .reveal-blur').forEach(el => {
        enhancedObserver.observe(el);
    });

    // Add scale reveal to skill logos for dramatic effect
    document.querySelectorAll('.skill-logo-item').forEach((item, index) => {
        item.classList.add('reveal-scale');
        item.style.transitionDelay = `${(index % 10) * 0.05}s`;
        enhancedObserver.observe(item);
    });

    // Event listeners for theme toggle switch (radio inputs)
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            // Disable hacker mode when switching themes
            if (document.body.classList.contains('hacker-mode')) {
                window.isHackerMode = false; // Stop animation loop
                document.body.classList.remove('hacker-mode');
                const hackerBtn = document.getElementById('hacker-toggle');
                if (hackerBtn) hackerBtn.classList.remove('active');
                // Stop matrix animation
                const matrixCanvas = document.getElementById('matrix-canvas');
                if (matrixCanvas) {
                    const ctx = matrixCanvas.getContext('2d');
                    ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
                }
            }
            switchTheme(radio.value);
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            showTab(event, btn.dataset.tab);
        });
    });

    // ===== VIDEO GALLERY LOGIC =====
    const videoModal = document.getElementById('video-modal');
    const demoVideo = document.getElementById('demo-video');
    const videoModalClose = document.getElementById('video-modal-close');
    const galleryView = document.getElementById('video-gallery-view');
    const playerView = document.getElementById('video-player-view');
    const galleryGrid = document.getElementById('video-gallery-grid');
    const backToGalleryBtn = document.getElementById('back-to-gallery');
    const videoTitleDisplay = document.getElementById('video-title-display');

    // Video Data Structure
    // Video Data Structure
    // Using abstract tech/gradient images to prevent text cropping issues and maintain premium look
    const projectVideos = {
        "agora": [
            { title: "Agora Intro", src: "projects/videos/agora-intro.mp4", thumbnail: "projects/images/agora.png" },
            { title: "Marketplace Overview", src: "demo.mp4", thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=600&q=80" }, // Payment/Marketplace
            { title: "Vendor Dashboard", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" }, // Dashboard/Analytics
            { title: "Checkout Flow", src: "demo.mp4", thumbnail: "https://images.unsplash.com/photo-1556742102-fab9ef4ec7bb?auto=format&fit=crop&w=600&q=80" } // Checkout
        ],
        "campus-key": [
            { title: "App Navigation", src: "demo2.mp4", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80" }, // Mobile App
            { title: "Key Features", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80" } // Mobile Tech
        ],
        "hobby-connect": [
            { title: "Event Discovery", src: "demo3.mp4", thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80" }, // Event/Agenda
            { title: "User Profile", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80" } // Profile
        ],
        "quantum-os": [
            { title: "Startup Simulator AI Intro", src: "projects/videos/quantum_intro.mp4", thumbnail: "projects/images/quantum_os.png" },
            { title: "Boot Sequence", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80" }, // Matrix/Code
            { title: "Terminal Commands", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" } // Terminal
        ],
        "startup-sim": [
            { title: "Startup Simulator AI Intro", src: "projects/videos/startup_simulator_ai-intro1.mp4", thumbnail: "projects/images/startup_simulator_ai.png" },
            { title: "Startup Simulator AI Intro 2", src: "projects/videos/startup_simulator_ai-intro2.mp4", thumbnail: "projects/images/thumbnails/startup_simulator_ai_logo.png" },
            { title: "Idea Generation", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80" } // Brainstorming/Startup
        ],
        "scms": [
            { title: "Zonavi Intro", src: "projects/videos/zonavi-intro.mp4", thumbnail: "projects/images/zonavi.png" },
            { title: "Student Dashboard", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80" } // Education/School
        ],
        "kce-connect": [
            { title: "Leave Request", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80" } // Form/Request
        ],
        "circuit-vision-ai": [
            { title: "Circuit Vision AI Demo", src: "projects/videos/circuit-vision-ai-intro.mp4", thumbnail: "projects/images/circuit_vision_ai.png" },
            { title: "Circuit Detection", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" }, // AI/Tech
            { title: "Fault Analysis", src: "demo1.mp4", thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80" } // Analytics/Circuit
        ]
    };

    document.querySelectorAll('.demo-video-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.dataset.projectId;
            const videos = projectVideos[projectId] || [];

            // Populate Gallery
            galleryGrid.innerHTML = '';
            if (videos.length === 0) {
                galleryGrid.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">No videos available for this project.</p>';
            } else {
                videos.forEach((video, index) => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.style.animationDelay = `${index * 0.1}s`;
                    item.innerHTML = `
                        <div class="gallery-thumbnail">
                            <img src="${video.thumbnail}" alt="" onerror="this.style.display='none'">
                            <div class="play-icon-wrapper">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="gallery-info">
                            <h4>${video.title}</h4>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        playVideo(video);
                    });
                    galleryGrid.appendChild(item);
                });
            }

            // Show Gallery, Hide Player
            galleryView.style.display = 'block';
            playerView.style.display = 'none';
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function playVideo(video) {
        demoVideo.querySelector('source').src = video.src;
        demoVideo.load();
        videoTitleDisplay.textContent = video.title;

        galleryView.style.display = 'none';
        playerView.style.display = 'flex';

        demoVideo.play().catch(e => console.log("Auto-play prevented:", e));
    }

    backToGalleryBtn.addEventListener('click', () => {
        demoVideo.pause();
        playerView.style.display = 'none';
        galleryView.style.display = 'block';
    });

    function closeVideoModal() {
        videoModal.classList.remove('active');
        demoVideo.pause();
        document.body.style.overflow = '';
    }

    videoModalClose.addEventListener('click', closeVideoModal);

    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // ===== UI GALLERY MODAL LOGIC =====
    const uiModal = document.getElementById('ui-modal');
    const uiModalClose = document.getElementById('ui-modal-close');
    const uiGalleryView = document.getElementById('ui-gallery-view');
    const uiFullscreenView = document.getElementById('ui-fullscreen-view');
    const uiGalleryGrid = document.getElementById('ui-gallery-grid');
    const backToUIGalleryBtn = document.getElementById('back-to-ui-gallery');
    const uiFullscreenImg = document.getElementById('ui-fullscreen-img');
    const uiImageTitle = document.getElementById('ui-image-title');
    const uiPrevBtn = document.getElementById('ui-prev-btn');
    const uiNextBtn = document.getElementById('ui-next-btn');

    // Project UI Screenshots Data - Using existing project images as placeholders
    // You can add more screenshots later in a projects/ui/ folder
    const projectUIScreenshots = {
        "agora": [
            { title: "Homepage", src: "projects/images/agora.png" },
            { title: "Vendor Dashboard", src: "projects/images/agora.png" },
            { title: "Product Listing", src: "projects/images/agora.png" }
        ],
        "campus-key": [
            { title: "Login Screen", src: "projects/images/campus_key.png" },
            { title: "Main Dashboard", src: "projects/images/campus_key.png" }
        ],
        "hobby-connect": [
            { title: "Event Discovery", src: "projects/images/hobby_connect.png" },
            { title: "User Profile", src: "projects/images/hobby_connect.png" }
        ],
        "quantum-os": [
            { title: "Desktop Environment", src: "projects/images/quantum_os.png" },
            { title: "Terminal App", src: "projects/images/quantum_os.png" },
            { title: "File Manager", src: "projects/images/quantum_os.png" }
        ],
        "startup-sim": [
            { title: "Landing Page", src: "projects/images/startup_simulator_ai.png" },
            { title: "Idea Input", src: "projects/images/startup_simulator_ai.png" },
            { title: "Results Dashboard", src: "projects/images/startup_simulator_ai.png" }
        ],
        "scms": [
            { title: "Student Dashboard", src: "projects/images/zonavi.png" },
            { title: "Career Planning", src: "projects/images/zonavi.png" }
        ],
        "kce-connect": [
            { title: "Leave Request", src: "projects/images/kce_connect.png" },
            { title: "Outpass Generation", src: "projects/images/kce_connect.png" }
        ],
        "circuit-vision-ai": [
            { title: "Circuit Analysis Dashboard", src: "projects/images/circuit_vision_ai.png" },
            { title: "Component Detection", src: "projects/images/circuit_vision_ai.png" },
            { title: "Fault Detection Results", src: "projects/images/circuit_vision_ai.png" }
        ]
    };

    let currentUIImages = [];
    let currentUIIndex = 0;

    // Open UI Gallery
    document.querySelectorAll('.show-ui-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.dataset.projectId;
            currentUIImages = projectUIScreenshots[projectId] || [];

            // Populate Gallery
            uiGalleryGrid.innerHTML = '';
            if (currentUIImages.length === 0) {
                uiGalleryGrid.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">No UI screenshots available for this project yet.</p>';
            } else {
                currentUIImages.forEach((image, index) => {
                    const item = document.createElement('div');
                    item.className = 'ui-gallery-item';
                    item.style.animationDelay = `${index * 0.1}s`;
                    item.innerHTML = `
                        <div class="ui-thumbnail">
                            <img src="${image.src}" alt="${image.title}" onerror="this.style.display='none'">
                            <div class="ui-overlay">
                                <i class="fas fa-expand"></i>
                            </div>
                        </div>
                        <div class="ui-info">
                            <h4>${image.title}</h4>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        showFullscreenImage(index);
                    });
                    uiGalleryGrid.appendChild(item);
                });
            }

            // Show Gallery, Hide Fullscreen
            uiGalleryView.style.display = 'block';
            uiFullscreenView.style.display = 'none';
            uiModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function showFullscreenImage(index) {
        currentUIIndex = index;
        const image = currentUIImages[currentUIIndex];

        uiFullscreenImg.src = image.src;
        uiImageTitle.textContent = image.title;

        uiGalleryView.style.display = 'none';
        uiFullscreenView.style.display = 'flex';

        // Update navigation button states
        uiPrevBtn.style.display = currentUIImages.length > 1 ? 'flex' : 'none';
        uiNextBtn.style.display = currentUIImages.length > 1 ? 'flex' : 'none';
    }

    function navigateUIImage(direction) {
        if (direction === 'prev') {
            currentUIIndex = (currentUIIndex - 1 + currentUIImages.length) % currentUIImages.length;
        } else {
            currentUIIndex = (currentUIIndex + 1) % currentUIImages.length;
        }

        const image = currentUIImages[currentUIIndex];
        uiFullscreenImg.src = image.src;
        uiImageTitle.textContent = image.title;
    }

    // Event Listeners
    backToUIGalleryBtn.addEventListener('click', () => {
        uiFullscreenView.style.display = 'none';
        uiGalleryView.style.display = 'block';
    });

    uiPrevBtn.addEventListener('click', () => navigateUIImage('prev'));
    uiNextBtn.addEventListener('click', () => navigateUIImage('next'));

    function closeUIModal() {
        uiModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    uiModalClose.addEventListener('click', closeUIModal);

    uiModal.addEventListener('click', (e) => {
        if (e.target === uiModal) {
            closeUIModal();
        }
    });

    // Keyboard navigation for UI modal
    document.addEventListener('keydown', (e) => {
        if (uiModal.classList.contains('active') && uiFullscreenView.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                navigateUIImage('prev');
            } else if (e.key === 'ArrowRight') {
                navigateUIImage('next');
            } else if (e.key === 'Escape') {
                if (uiFullscreenView.style.display === 'flex') {
                    backToUIGalleryBtn.click();
                } else {
                    closeUIModal();
                }
            }
        }
    });

    // ===== EASTER EGG - Type "deepak" =====
    let easterEggBuffer = '';
    const easterEggCode = 'kavin';
    const easterEggOverlay = document.getElementById('easter-egg-overlay');
    const easterEggText = document.getElementById('easter-egg-text');
    const easterEggMessage = "Thanks for visiting my portfolio! 🤗";

    function typewriterEffect(element, text, callback) {
        element.textContent = '';
        element.classList.add('active');
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                if (callback) setTimeout(callback, 1500);
            }
        }, 80);
    }

    function triggerEasterEgg() {
        // Typewriter text animation
        typewriterEffect(easterEggText, easterEggMessage, () => {
            easterEggText.classList.remove('active');
            easterEggText.textContent = '';
        });

        // Create confetti
        const colors = ['#64ffda', '#ff6b6b', '#feca57', '#5f27cd', '#00d2d3', '#ff9ff3'];
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = (Math.random() * 10 + 5) + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                easterEggOverlay.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }, i * 20);
        }

        // Create fireworks
        function createFirework(x, y) {
            const fireworkColors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ffa500', '#64ffda'];
            const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

            // Create explosion particles
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.classList.add('firework');
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.backgroundColor = color;
                particle.style.boxShadow = `0 0 6px ${color}, 0 0 10px ${color}`;

                // Random direction for each particle
                const angle = (Math.PI * 2 * i) / 30;
                const velocity = 50 + Math.random() * 100;
                particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
                particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

                easterEggOverlay.appendChild(particle);
                setTimeout(() => particle.remove(), 1500);
            }
        }

        // Launch multiple fireworks at random intervals
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
                const y = Math.random() * window.innerHeight * 0.5 + 50;
                createFirework(x, y);
            }, i * 300 + Math.random() * 200);
        }
    }

    // Easter Egg Detection - Listen for key presses
    document.addEventListener('keydown', (e) => {
        // CRITICAL FIX: Ignore keypresses inside JARVIS chat input
        const isJarvisInput = e.target && (
            e.target.id === 'jarvis-text-input' ||
            e.target.closest('.jarvis-input-area') ||
            e.target.closest('#jarvis-window')
        );

        if (isJarvisInput) {
            return; // Don't trigger Easter eggs when typing in JARVIS
        }

        // Continue with normal Easter egg detection
        easterEggBuffer += e.key.toLowerCase();

        // Keep buffer reasonable length
        if (easterEggBuffer.length > 10) {
            easterEggBuffer = easterEggBuffer.slice(-10);
        }

        // Check for "kavin" Easter egg
        if (easterEggBuffer.slice(-5) === easterEggCode) {
            triggerEasterEgg();
            easterEggBuffer = '';
        }

        // 🦸‍♂️ SECRET: Check for "ironman" theme toggle
        if (easterEggBuffer.slice(-7) === 'ironman') {
            if (secretThemeActive === 'ironman-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
            } else {
                // Save current theme and switch to Iron Man
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'ironman-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'barbie-mode');
                document.body.classList.add('ironman-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Subtle fade-in transition
                document.body.style.opacity = '0.92';
                document.body.style.transition = 'opacity 0.4s ease-out';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                    setTimeout(() => {
                        document.body.style.transition = '';
                        document.body.style.opacity = '';
                    }, 400);
                }, 50);
            }
            easterEggBuffer = '';
        }

        // 💖 SECRET: Check for "barbie" theme toggle
        if (easterEggBuffer.slice(-6) === 'barbie') {
            if (secretThemeActive === 'barbie-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
            } else {
                // Save current theme and switch to Barbie
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'barbie-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode');
                document.body.classList.add('barbie-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Elegant sparkle effect
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const sparkle = document.createElement('div');
                        sparkle.style.position = 'fixed';
                        sparkle.style.left = Math.random() * window.innerWidth + 'px';
                        sparkle.style.top = Math.random() * window.innerHeight + 'px';
                        sparkle.style.width = '3px';
                        sparkle.style.height = '3px';
                        sparkle.style.background = '#ff4081';
                        sparkle.style.borderRadius = '50%';
                        sparkle.style.pointerEvents = 'none';
                        sparkle.style.zIndex = '9999';
                        sparkle.style.opacity = '0.8';
                        sparkle.style.boxShadow = '0 0 8px rgba(255, 64, 129, 0.6)';
                        sparkle.style.transition = 'all 0.8s ease-out';
                        document.body.appendChild(sparkle);
                        setTimeout(() => {
                            sparkle.style.opacity = '0';
                            sparkle.style.transform = 'translateY(-20px)';
                        }, 50);
                        setTimeout(() => sparkle.remove(), 850);
                    }, i * 50);
                }
            }
            easterEggBuffer = '';
        }

        // ⚡ SECRET: Check for "neon" theme toggle
        if (easterEggBuffer.slice(-4) === 'neon') {
            if (secretThemeActive === 'neon-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
            } else {
                // Save current theme and switch to Neon
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'neon-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'spiderman-mode');
                document.body.classList.add('neon-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Refined electric pulse effect
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        const pulse = document.createElement('div');
                        pulse.style.cssText = `
                            position: fixed;
                            left: ${Math.random() * 100}%;
                            top: ${Math.random() * 100}%;
                            width: ${Math.random() * 80 + 40}px;
                            height: 1px;
                            background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent);
                            pointer-events: none;
                            z-index: 9999;
                            transform: rotate(${Math.random() * 360}deg);
                            box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
                            opacity: 0.8;
                            transition: opacity 0.4s ease-out;
                        `;
                        document.body.appendChild(pulse);
                        setTimeout(() => { pulse.style.opacity = '0'; }, 50);
                        setTimeout(() => pulse.remove(), 450);
                    }, i * 60);
                }
            }
            easterEggBuffer = '';
        }

        // 🕷️ SECRET: Check for "spiderman" theme toggle
        if (easterEggBuffer.slice(-9) === 'spiderman') {
            if (secretThemeActive === 'spiderman-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
                // Remove web overlay if exists
                const webOverlay = document.getElementById('spiderman-web-overlay');
                if (webOverlay) webOverlay.remove();
            } else {
                // Save current theme and switch to Spider-Man
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'spiderman-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'neon-mode');
                document.body.classList.add('spiderman-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Refined web pattern overlay
                const webOverlay = document.createElement('div');
                webOverlay.id = 'spiderman-web-overlay';
                webOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                    opacity: 0.03;
                    background-image: 
                        repeating-linear-gradient(0deg, transparent, transparent 120px, rgba(229, 57, 53, 0.15) 120px, rgba(229, 57, 53, 0.15) 121px),
                        repeating-linear-gradient(90deg, transparent, transparent 120px, rgba(229, 57, 53, 0.15) 120px, rgba(229, 57, 53, 0.15) 121px);
                `;
                document.body.appendChild(webOverlay);


                // Subtle web thread animation
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        const web = document.createElement('div');
                        web.style.cssText = `
                            position: fixed;
                            left: ${Math.random() * 100}%;
                            top: -10px;
                            width: 1px;
                            height: ${Math.random() * 150 + 80}px;
                            background: linear-gradient(180deg, transparent, rgba(229, 57, 53, 0.4), transparent);
                            pointer-events: none;
                            z-index: 9999;
                            opacity: 0.7;
                            animation: webSwing 1.2s ease-out forwards;
                        `;
                        document.body.appendChild(web);
                        setTimeout(() => web.remove(), 1200);
                    }, i * 100);

                }
            }
            easterEggBuffer = '';
        }

        // 🦇 SECRET: Check for "batman" theme toggle
        if (easterEggBuffer.slice(-6) === 'batman') {
            if (secretThemeActive === 'batman-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
                const batSignal = document.getElementById('batman-signal');
                if (batSignal) batSignal.remove();
            } else {
                // Save current theme and switch to Batman
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'batman-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'neon-mode', 'spiderman-mode', 'ben10-mode');
                document.body.classList.add('batman-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Visual effects removed as per user request
            }
            easterEggBuffer = '';
        }

        // 👽 SECRET: Check for "ben10" theme toggle
        if (easterEggBuffer.slice(-5) === 'ben10') {
            if (secretThemeActive === 'ben10-mode') {
                // Revert to original theme
                switchTheme(originalThemeBeforeSecret || 'quantum-mode');
                secretThemeActive = null;
                originalThemeBeforeSecret = null;
                const ben10Overlay = document.getElementById('ben10-overlay');
                if (ben10Overlay) ben10Overlay.remove();
            } else {
                // Save current theme and switch to Ben 10
                originalThemeBeforeSecret = localStorage.getItem('preferred-theme') || 'quantum-mode';
                secretThemeActive = 'ben10-mode';
                document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'neon-mode', 'spiderman-mode', 'batman-mode');
                document.body.classList.add('ben10-mode');
                if (neuralNetwork) neuralNetwork.draw();

                // Visual effects removed as per user request
            }
            easterEggBuffer = '';
        }

    });


    // ===== MOBILE HAMBURGER MENU =====
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavLinks = mobileNav.querySelectorAll('a');

    function toggleMobileMenu() {
        hamburgerMenu.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburgerMenu.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ===== MATRIX RAIN / HACKER MODE =====
    const matrixCanvas = document.getElementById('matrix-canvas');
    const matrixCtx = matrixCanvas.getContext('2d');
    const hackerToggle = document.getElementById('hacker-toggle');
    let matrixAnimationId = null;
    window.isHackerMode = false; // Global so theme switcher can access it

    // Matrix characters (katakana + numbers + symbols)
    const matrixChars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()';

    function initMatrix() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    }

    const fontSize = 14;
    let columns = [];
    let drops = [];

    function setupMatrix() {
        initMatrix();
        columns = Math.floor(matrixCanvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }
    }

    // ===== CERTIFICATE LIGHTBOX =====
    const certLightbox = document.getElementById('cert-lightbox');
    const certLightboxImg = document.getElementById('cert-lightbox-img');
    const certLightboxTitle = document.getElementById('cert-lightbox-title');
    const certLightboxClose = document.getElementById('cert-lightbox-close');

    document.querySelectorAll('.cert-card').forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const title = card.querySelector('.cert-title').textContent;

            if (img) {
                certLightboxImg.src = img.src;
                certLightboxTitle.textContent = title;
                certLightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
    });

    function closeCertLightbox() {
        certLightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    if (certLightboxClose) {
        certLightboxClose.addEventListener('click', closeCertLightbox);
    }

    // Close on background click
    if (certLightbox) {
        certLightbox.addEventListener('click', (e) => {
            if (e.target === certLightbox) {
                closeCertLightbox();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certLightbox && certLightbox.classList.contains('active')) {
            closeCertLightbox();
        }
    });

    function drawMatrix() {
        // Semi-transparent black for trail effect
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        matrixCtx.fillStyle = '#0f0';
        matrixCtx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Brighter head of the stream
            if (Math.random() > 0.98) {
                matrixCtx.fillStyle = '#fff';
            } else {
                matrixCtx.fillStyle = `hsl(120, 100%, ${30 + Math.random() * 40}%)`;
            }

            matrixCtx.fillText(char, x, y);

            // Reset drop to top randomly
            if (y > matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        if (window.isHackerMode) {
            matrixAnimationId = requestAnimationFrame(drawMatrix);
        }
    }

    function toggleHackerMode() {
        window.isHackerMode = !window.isHackerMode;
        document.body.classList.toggle('hacker-mode');
        hackerToggle.classList.toggle('active');

        if (window.isHackerMode) {
            setupMatrix();
            drawMatrix();
        } else {
            if (matrixAnimationId) {
                cancelAnimationFrame(matrixAnimationId);
            }
            matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        }
    }


    hackerToggle.addEventListener('click', toggleHackerMode);

    // Handle window resize for matrix
    window.addEventListener('resize', () => {
        if (window.isHackerMode) {
            setupMatrix();
        }
    });

    // ===== PUZZLE EASTER EGG LOGIC =====
    const puzzleTrigger = document.getElementById('puzzle-trigger');
    const puzzleModal = document.getElementById('puzzle-modal');
    const puzzleClose = document.getElementById('puzzle-close');
    const puzzleForm = document.getElementById('puzzle-form');
    const puzzleInput = document.getElementById('puzzle-input');
    const puzzleView = document.getElementById('puzzle-view');
    const puzzleSuccess = document.getElementById('puzzle-success');
    const puzzleGotItBtn = document.getElementById('puzzle-got-it');
    const footer = document.querySelector('footer');

    let footerVisibleTimer = null;

    // Show puzzle button when footer is in view for 5 seconds
    function checkFooterVisibility() {
        if (!footer) return;

        const puzzleTriggerContainer = document.querySelector('.puzzle-trigger-container');
        if (!puzzleTriggerContainer) return;

        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Check if top of footer is visible in viewport
        // Using a slight offset (100px) so it triggers when footer is actually entering view
        const isFooterVisible = footerRect.top <= (windowHeight - 50);

        if (isFooterVisible) {
            // Footer is visible
            // If button is NOT visible and timer is NOT running, start timer
            if (!puzzleTriggerContainer.classList.contains('visible') && !footerVisibleTimer) {
                footerVisibleTimer = setTimeout(() => {
                    puzzleTriggerContainer.classList.remove('fade-out');
                    puzzleTriggerContainer.classList.add('visible');
                    footerVisibleTimer = null; // Reset timer after execution
                }, 5000);
            }
        } else {
            // Footer is NOT visible (scrolled away)

            // 1. Clear any pending timer so it doesn't show up later
            if (footerVisibleTimer) {
                clearTimeout(footerVisibleTimer);
                footerVisibleTimer = null;
            }

            // 2. If it IS currently visible, hide it immediately with fade-out
            if (puzzleTriggerContainer.classList.contains('visible')) {
                puzzleTriggerContainer.classList.remove('visible');
                puzzleTriggerContainer.classList.add('fade-out');
            }
        }
    }

    // Scroll listener for puzzle button visibility
    let puzzleScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!puzzleScrollTicking) {
            requestAnimationFrame(() => {
                checkFooterVisibility();
                puzzleScrollTicking = false;
            });
            puzzleScrollTicking = true;
        }
    });

    // Open puzzle modal
    function openPuzzleModal() {
        puzzleModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        puzzleInput.focus();
    }

    // Close puzzle modal
    function closePuzzleModal() {
        puzzleModal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset puzzle state
        puzzleInput.value = '';
        puzzleView.style.display = 'block';
        puzzleSuccess.style.display = 'none';
    }

    // Event listeners for modal
    puzzleTrigger.addEventListener('click', openPuzzleModal);
    puzzleClose.addEventListener('click', closePuzzleModal);

    // Close on overlay click
    puzzleModal.addEventListener('click', (e) => {
        if (e.target === puzzleModal) {
            closePuzzleModal();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && puzzleModal.classList.contains('active')) {
            closePuzzleModal();
        }
    });

    // Handle puzzle submission
    puzzleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const answer = puzzleInput.value.trim().toLowerCase();
        const correctAnswer = 'kavin';

        if (answer === correctAnswer) {
            // Show success view
            puzzleView.style.display = 'none';
            puzzleSuccess.style.display = 'block';
        } else {
            // Shake animation for wrong answer
            puzzleInput.style.animation = 'none';
            setTimeout(() => {
                puzzleInput.style.animation = 'shake 0.5s ease';
            }, 10);
            puzzleInput.value = '';
            puzzleInput.focus();
        }
    });

    // Add shake animation to CSS dynamically
    const shakeAnimation = document.createElement('style');
    shakeAnimation.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(shakeAnimation);

    // "Got it!" button to close success view
    puzzleGotItBtn.addEventListener('click', closePuzzleModal);

    // Initial check on page load
    setTimeout(checkFooterVisibility, 500);

});
