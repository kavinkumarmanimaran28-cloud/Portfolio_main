/**
 * JARVIS - Just A Rather Very Intelligent System
 * AI Portfolio Assistant for Iron Man Theme
 * Powered by Google Gemini AI
 */

class JARVISAssistant {
    constructor() {
        this.geminiApiKey = null;
        this.serperApiKey = null;
        this.knowledgeBase = null;
        this.isListening = false;
        this.recognition = null;
        this.chatHistory = [];
        this.soundEnabled = true;
        this.currentTheme = null;

        // DOM Elements
        this.jarvisBtn = document.getElementById('jarvis-btn');
        this.jarvisWindow = document.getElementById('jarvis-window');
        this.chatContainer = document.getElementById('jarvis-chat');
        this.voiceBtn = document.getElementById('jarvis-voice-btn');
        this.textInput = document.getElementById('jarvis-text-input');
        this.sendBtn = document.getElementById('jarvis-send-btn');
        this.status = document.getElementById('jarvis-status');
        this.minimizeBtn = document.getElementById('jarvis-minimize');
        this.closeBtn = document.getElementById('jarvis-close');

        // Quick Actions
        this.showProjectsBtn = document.getElementById('jarvis-show-projects');
        this.contactBtn = document.getElementById('jarvis-contact');
        this.resumeBtn = document.getElementById('jarvis-resume');
        this.suggestionsContainer = document.getElementById('jarvis-suggestions');
        this.suggestionsToggle = document.getElementById('jarvis-suggestions-toggle');

        // Sound effects (using simple beep tones)
        this.sounds = {
            startup: this.createBeep(800, 0.1, 0.05),
            send: this.createBeep(600, 0.05, 0.03)
        };

        this.init();
    }

    async init() {
        // Load API Key
        await this.loadAPIKey();

        // Load Knowledge Base
        await this.loadKnowledge();

        // Initialize Speech Recognition
        this.initSpeechRecognition();

        // Setup Event Listeners
        this.setupEventListeners();

        // Monitor theme changes
        this.monitorTheme();

        // Debug: console.log('🤖 JARVIS initialized and ready');
    }

    async loadAPIKey() {
        // No longer needed - API keys are secured on Vercel backend
        console.log('🔑 API keys secured on Vercel backend');
    }

    async loadKnowledge() {
        try {
            const response = await fetch('jarvis-knowledge.json');
            this.knowledgeBase = await response.json();
        } catch (error) {
            // Fallback with empty knowledge base
            this.knowledgeBase = { owner: { name: 'Deepak' } }; // Fallback
        }
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceBtn.classList.add('listening');
                this.updateStatus('Listening...');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.textInput.value = transcript;
                this.handleUserMessage(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateStatus('Error: ' + event.error);
                this.isListening = false;
                this.voiceBtn.classList.remove('listening');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceBtn.classList.remove('listening');
                this.updateStatus('Ready');
            };
        } else {
            // Speech recognition not available
        }
    }

    setupEventListeners() {
        // Button to open JARVIS
        this.jarvisBtn.addEventListener('click', () => this.openJARVIS());

        // Voice button
        this.voiceBtn.addEventListener('click', () => this.startVoiceInput());

        // Send button
        this.sendBtn.addEventListener('click', () => {
            const message = this.textInput.value.trim();
            if (message) {
                this.playSound('send');
                this.handleUserMessage(message);
                this.textInput.value = '';
            }
        });

        // Enter key to send
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendBtn.click();
            }
        });

        // Window controls
        this.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
        this.closeBtn.addEventListener('click', () => this.closeWindow());

        // Quick Action Buttons
        this.showProjectsBtn.addEventListener('click', () => this.quickShowProjects());
        this.contactBtn.addEventListener('click', () => this.quickContact());
        this.resumeBtn.addEventListener('click', () => this.quickDownloadResume());

        // Suggestions Toggle
        this.suggestionsToggle.addEventListener('click', () => this.toggleSuggestions());
    }

    monitorTheme() {
        // Show JARVIS button only in Iron Man theme
        const checkTheme = () => {
            const isIronMan = document.body.classList.contains('ironman-mode');
            this.jarvisBtn.style.display = isIronMan ? 'block' : 'none';

            // Close window if theme changes away from Iron Man
            if (!isIronMan && this.jarvisWindow.classList.contains('active')) {
                this.closeWindow();
            }
        };

        // Initial check
        checkTheme();

        // Watch for class changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    openJARVIS() {
        this.jarvisWindow.classList.add('active');
        this.jarvisBtn.style.display = 'none';

        // Play startup sound
        this.playSound('startup');

        // Show greeting if first time (without long message)
        if (this.chatHistory.length === 0) {
            const greeting = this.knowledgeBase?.jarvisPersonality?.greeting || "Good day! I am JARVIS, Deepak's portfolio assistant. May I have the pleasure of knowing your name?";
            this.addMessage(greeting, 'jarvis');
            this.speak(greeting);

            // Show initial suggestions
            const initialSuggestions = ["Show me his projects", "What are his skills?", "Tell me about Deepak"];
            this.showSuggestions(initialSuggestions);
        }
    }

    closeWindow() {
        this.jarvisWindow.classList.remove('active');
        this.jarvisBtn.style.display = 'block';
    }

    minimizeWindow() {
        this.jarvisWindow.classList.toggle('minimized');
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.updateStatus('Voice not supported');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async handleUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        // Process message
        const response = await this.processMessage(message);

        // Remove typing indicator
        this.removeTyping();

        // Add JARVIS response
        this.addMessage(response, 'jarvis');

        // Show suggested follow-up questions
        const suggestions = this.getSuggestedQuestions(response);
        this.showSuggestions(suggestions);

        // Speak response if it's short enough
        if (response.length < 200) {
            this.speak(response);
        }
    }

    async processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Check for navigation commands
        const navResponse = this.handleNavigation(lowerMessage);
        if (navResponse) return navResponse;

        // Check for theme commands
        const themeResponse = this.handleThemeChange(lowerMessage);
        if (themeResponse) return themeResponse;

        // Use Gemini AI for intelligent responses
        return await this.getGeminiResponse(message);
    }

    handleNavigation(message) {
        // Only navigate with explicit commands like "go to", "show", "navigate to"
        // Don't trigger on questions like "tell about X" or "what about X"
        const isExplicitNavCommand =
            message.includes('go to') ||
            message.includes('show me') ||
            message.includes('navigate to') ||
            message.includes('take me to') ||
            message.startsWith('show '); // "show projects", "show about", etc.

        if (!isExplicitNavCommand) {
            return null; // Not a navigation command
        }

        const sections = {
            'about': '#about',
            'home': '#hero',
            'projects': '#projects',
            'skills': '#skills',
            'experience': '#experience',
            'education': '#education',
            'certifications': '#certifications',
            'certificates': '#certifications',
            'contact': '#contact',
            'resume': '#'
        };

        for (const [key, selector] of Object.entries(sections)) {
            if (message.includes(key)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return `Navigating to ${key} section.`;
                }
            }
        }
        return null;
    }

    handleThemeChange(message) {
        // ONLY respond to explicit "change theme" or "switch theme" commands
        // This prevents accidental theme changes when user types theme names
        if (message.includes('change theme') || message.includes('switch theme') || message.includes('activate')) {
            if (message.includes('quantum')) {
                this.switchTheme('quantum-mode');
                return 'Switching to Quantum theme.';
            } else if (message.includes('photon')) {
                this.switchTheme('photon-mode');
                return 'Switching to Photon theme.';
            } else if (message.includes('terminal')) {
                this.switchTheme('terminal-mode');
                return 'Switching to Terminal theme.';
            } else if (message.includes('iron man') || message.includes('ironman')) {
                this.switchTheme('ironman-mode');
                return 'Switching to Iron Man theme.';
            } else if (message.includes('batman') || message.includes('dark knight')) {
                this.switchTheme('batman-mode');
                return 'Switching to Batman theme.';
            } else if (message.includes('ben 10') || message.includes('ben ten') || message.includes('omnitrix')) {
                this.switchTheme('ben10-mode');
                return 'Switching to Ben 10 theme.';
            }
        }
        return null;
    }

    switchTheme(themeName) {
        document.body.classList.remove('quantum-mode', 'terminal-mode', 'photon-mode', 'ironman-mode', 'barbie-mode', 'neon-mode', 'spiderman-mode', 'batman-mode', 'ben10-mode');
        document.body.classList.add(themeName);
        localStorage.setItem("preferred-theme", themeName);

        // Update radio button if exists
        const themeMap = {
            'photon-mode': 'theme-photon',
            'quantum-mode': 'theme-quantum',
            'terminal-mode': 'theme-terminal'
        };
        const radioId = themeMap[themeName];
        if (radioId) {
            const radio = document.getElementById(radioId);
            if (radio) radio.checked = true;
        }
    }

    async getGeminiResponse(userMessage) {
        try {
            // Check if web search is needed
            let searchResults = null;
            if (this.needsWebSearch(userMessage)) {
                console.log('🔍 Web search detected, performing search...');
                searchResults = await this.performWebSearch(userMessage);
            }

            // Build conversation context
            const conversationHistory = this.chatHistory
                .filter(msg => msg.sender !== 'jarvis' || !msg.text.includes('Here are some things'))
                .slice(-6)
                .map(msg => `${msg.sender === 'user' ? 'User' : 'JARVIS'}: ${msg.text}`)
                .join('\n');

            const systemPrompt = this.buildSystemPrompt();
            let contextualPrompt = conversationHistory
                ? `${systemPrompt}\n\nPrevious conversation:\n${conversationHistory}\n\nUser: ${userMessage}\n\nJARVIS:`
                : `${systemPrompt}\n\nUser: ${userMessage}\n\nJARVIS:`;

            // Add search results to prompt if available
            if (searchResults && searchResults.results && searchResults.results.length > 0) {
                const searchContext = this.formatSearchResults(searchResults);
                contextualPrompt = `${systemPrompt}\n\n${searchContext}\n\nPrevious conversation:\n${conversationHistory}\n\nUser: ${userMessage}\n\nJARVIS: Based on the search results above, `;
            }

            // Call Vercel serverless function
            console.log('🚀 Calling Vercel Gemini API...');

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: contextualPrompt })
            });

            if (!response.ok) {
                console.error('❌ Vercel function error:', response.status);
                return "I'm having trouble connecting to my AI systems. Please try again in a moment.";
            }

            const data = await response.json();
            const aiResponse = data.response;

            if (aiResponse) {
                console.log('✅ AI response received', data.modelUsed ? `(using ${data.modelUsed})` : '');
                return aiResponse;
            }

            return "I'm having trouble connecting to my AI systems. Please try again in a moment.";

        } catch (error) {
            console.error('❌ API Error:', error);
            return "I apologize, but I'm experiencing technical difficulties. Please try again.";
        }
    }

    needsWebSearch(message) {
        const lowerMessage = message.toLowerCase();

        // Keywords that indicate need for real-time search
        const searchKeywords = [
            'news', 'latest', 'current', 'recent', 'today',
            'yesterday', 'this week', 'this month', 'this year',
            'what happened', 'who won', 'weather',
            'stock price', 'score', 'result',
            'trending', 'breaking', 'update'
        ];

        // Check if message contains any search keywords
        return searchKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    async performWebSearch(query) {
        try {
            console.log('🔍 Performing web search for:', query);

            // Call Vercel serverless function
            const response = await fetch('/api/serper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                console.error('❌ Web search error:', response.status);
                return null;
            }

            const data = await response.json();
            console.log('✅ Web search completed:', data.results?.length, 'results');
            return data;

        } catch (error) {
            console.error('❌ Web search failed:', error);
            return null;
        }
    }

    formatSearchResults(searchData) {
        let formatted = "WEB SEARCH RESULTS:\n\n";

        // Add knowledge graph if available
        if (searchData.knowledgeGraph) {
            formatted += `Knowledge Graph:\n`;
            formatted += `Title: ${searchData.knowledgeGraph.title}\n`;
            formatted += `Description: ${searchData.knowledgeGraph.description}\n\n`;
        }

        // Add top search results
        if (searchData.results && searchData.results.length > 0) {
            formatted += `Top Search Results:\n`;
            searchData.results.slice(0, 3).forEach((result, index) => {
                formatted += `${index + 1}. ${result.title}\n`;
                formatted += `   ${result.snippet}\n`;
                formatted += `   Source: ${result.link}\n\n`;
            });
        }

        formatted += "Use the above info to answer concisely (under 150 words). Mention sources if relevant.";

        return formatted;
    }

    buildSystemPrompt() {
        const kb = this.knowledgeBase;

        // Get current date and time
        const now = new Date();
        const currentDateTime = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        return `You are JARVIS, an AI assistant inspired by Tony Stark's JARVIS from Iron Man. 
        
CONTEXT:
- You are living in Deepak Saravanakumar's portfolio website.
- The user you are talking to is a VISITOR (a recruiter, developer, or guest).
- The user is NOT Deepak. Deepak is your creator/owner.

CURRENT DATE & TIME: ${currentDateTime}

PERSONALITY:
- Charismatic, witty, and professional (Tony Stark style).
- Address the user by their name if they have provided it.
- If the name is unknown, be polite (use "Sir", "Ma'am", or just be friendly).
- NEVER address the user as "Deepak".

BEHAVIOR:
- Your core purpose is to showcase Deepak's skills, projects, and experience.
- If the user just introduced themselves, greet them strictly by their name and welcome them.
- If the user asks about Deepak, provide info from the knowledge base below.
- Keep responses concise (under 150 words).

KNOWLEDGE ABOUT DEEPAK (Your Creator):
Name: ${kb.owner.name}
Title: ${kb.owner.title}
Education: ${kb.owner.education} (CGPA: ${kb.owner.cgpa})
Location: ${kb.owner.location}
Email: ${kb.owner.email}

Bio: ${kb.bio}

Skills:
- Languages: ${kb.skills.languages.join(', ')}
- Frontend: ${kb.skills.frontend.join(', ')}
- Backend: ${kb.skills.backend.join(', ')}
- Databases: ${kb.skills.databases.join(', ')}

Projects: ${kb.projects.map(p => `${p.name} (${p.tech.join(', ')}) - ${p.description}`).join('; ')}

Remember: The user is a GUEST. Make them feel welcome.`;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `jarvis-message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);
        this.chatContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        // Store in history
        this.chatHistory.push({ sender, text, time: new Date() });
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'jarvis-message jarvis typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.chatContainer.appendChild(typingDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    removeTyping() {
        const typing = this.chatContainer.querySelector('.typing-message');
        if (typing) typing.remove();
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95; // Slightly slower for clarity
            utterance.pitch = 0.85; // Lower pitch for male voice
            utterance.volume = 1.0;

            // ALWAYS use consistent male voice (British English preferred, like JARVIS)
            const voices = window.speechSynthesis.getVoices();

            // Priority: male British > male US > any male > first available
            let selectedVoice = voices.find(voice =>
                voice.lang === 'en-GB' && voice.name.toLowerCase().includes('male')
            ) || voices.find(voice =>
                voice.lang.includes('en-GB')
            ) || voices.find(voice =>
                voice.lang === 'en-US' && voice.name.toLowerCase().includes('male')
            ) || voices.find(voice =>
                voice.lang.includes('en') && (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david'))
            ) || voices[0];

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    }

    updateStatus(text) {
        this.status.querySelector('.jarvis-status-text').textContent = text;
    }

    // ===== QUICK ACTION METHODS =====
    quickShowProjects() {
        this.playSound('send');
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.addMessage("Navigating to projects section.", 'jarvis');
            setTimeout(() => this.closeWindow(), 1000);
        }
    }

    quickContact() {
        this.playSound('send');
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.addMessage("Opening contact section for you.", 'jarvis');
            setTimeout(() => this.closeWindow(), 1000);
        }
    }

    quickDownloadResume() {
        this.playSound('send');
        this.addMessage("Preparing resume download... Please check your downloads folder!", 'jarvis');
        // Update this path to your actual resume file
        const resumeUrl = 'DeepakResume.pdf';
        const a = document.createElement('a');
        a.href = resumeUrl;
        a.download = 'Deepak_Resume.pdf';
        a.click();
    }

    // ===== SUGGESTIONS & QUICK ACTIONS TOGGLE =====
    toggleSuggestions() {
        const suggestionsVisible = this.suggestionsContainer.classList.toggle('show');
        const quickActionsContainer = document.querySelector('.jarvis-quick-actions');

        // Toggle both quick actions and suggestions together
        quickActionsContainer.classList.toggle('show', suggestionsVisible);
        this.suggestionsToggle.classList.toggle('active', suggestionsVisible);
    }

    // ===== SUGGESTION CHIPS =====
    showSuggestions(questions) {
        this.suggestionsContainer.innerHTML = '';

        questions.forEach(question => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = question;
            chip.addEventListener('click', () => {
                this.textInput.value = question;
                this.sendBtn.click();
                this.suggestionsContainer.innerHTML = '';
            });
            this.suggestionsContainer.appendChild(chip);
        });
    }

    getSuggestedQuestions(lastResponse) {
        const lowerResponse = lastResponse.toLowerCase();
        const suggestions = [];

        if (lowerResponse.includes('project')) {
            suggestions.push("Tell me about Quantum OS", "What technologies were used?", "Show more projects");
        } else if (lowerResponse.includes('skill')) {
            suggestions.push("What's his strongest skill?", "Does he know AI?", "Show projects");
        } else if (lowerResponse.includes('education')) {
            suggestions.push("What is his CGPA?", "Tell me about projects", "What skills?");
        } else if (lowerResponse.includes('hello') || lowerResponse.includes('hi')) {
            suggestions.push("Show me his projects", "What are his skills?", "Tell me about Deepak");
        } else {
            suggestions.push("Show projects", "Contact Deepak", "What skills?");
        }

        return suggestions.slice(0, 3);
    }

    // ===== SOUND EFFECTS =====
    createBeep(frequency, duration, volume) {
        return () => {
            if (!this.soundEnabled) return;

            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                gainNode.gain.value = volume;

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (e) {
                // Sound not supported
            }
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // ===== ENHANCED THEME MONITORING =====
    monitorTheme() {
        const checkTheme = () => {
            // JARVIS is ONLY visible in Iron Man theme (exclusive Easter egg)
            const isIronMan = document.body.classList.contains('ironman-mode');
            this.jarvisBtn.style.display = isIronMan ? 'block' : 'none';

            // Close window if theme changes away from Iron Man
            if (!isIronMan && this.jarvisWindow.classList.contains('active')) {
                this.closeWindow();
            }

            // Store current theme
            if (isIronMan) {
                this.currentTheme = 'ironman';
            }
        };

        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
}

// Initialize JARVIS when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        window.jarvis = new JARVISAssistant();
    }, 100);
});
