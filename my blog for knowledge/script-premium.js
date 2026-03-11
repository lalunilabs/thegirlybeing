/**
 * GIRLY BEING - PREMIUM JAVASCRIPT
 * Sophisticated navigation, psychological patterns, and world-class UX
 */

// ===== PREMIUM APP STATE =====
const AppState = {
    isInitialized: false,
    currentSection: 'home',
    isMenuOpen: false,
    scrollY: 0,
    isScrolling: false,
    contentCache: new Map(),
    userPreferences: {
        theme: 'light',
        animations: true,
        reducedMotion: false
    }
};

// ===== PREMIUM NAVIGATION SYSTEM =====
const PremiumNavigation = {
    init() {
        this.setupScrollEffects();
        this.setupSmoothScrolling();
        this.setupActiveStates();
        this.setupMobileMenu();
        this.setupKeyboardNavigation();
    },

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('.nav-header');
        
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 300) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        };

        // Throttled scroll handler
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateHeader();
                    this.updateActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    },

    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                this.scrollToSection(target);
                this.updateURL(targetId);
            }
        });
    },

    scrollToSection(target) {
        const headerHeight = document.querySelector('.nav-header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    updateURL(hash) {
        if (history.pushState) {
            history.pushState(null, null, hash);
        } else {
            location.hash = hash;
        }
    },

    setupActiveStates() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const updateActiveLink = () => {
            const scrollY = window.scrollY;
            const headerHeight = document.querySelector('.nav-header').offsetHeight;
            
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSection = section.id;
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
            
            AppState.currentSection = currentSection;
        };

        // Update on scroll and load
        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink();
    },

    updateActiveSection() {
        this.setupActiveStates();
    },

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav-menu');
        
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    },

    toggleMobileMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        const nav = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (AppState.isMenuOpen) {
            nav.classList.add('open');
            toggle.classList.add('open');
            document.body.style.overflow = 'hidden';
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            this.closeMobileMenu();
        }
    },

    closeMobileMenu() {
        const nav = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        nav.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
        AppState.isMenuOpen = false;
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + H for Home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.scrollToSection(document.querySelector('#home'));
            }
            
            // Alt + C for Content
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                this.scrollToSection(document.querySelector('#content'));
            }
            
            // Alt + P for Programs
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                this.scrollToSection(document.querySelector('#programs'));
            }
        });
    }
};

// ===== PREMIUM CONTENT LOADER =====
const PremiumContent = {
    async loadPosts() {
        try {
            if (AppState.contentCache.has('posts')) {
                return AppState.contentCache.get('posts');
            }

            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const posts = await response.json();
            AppState.contentCache.set('posts', posts);
            
            return posts;
        } catch (error) {
            console.error('Error loading posts:', error);
            return [];
        }
    },

    async renderPremiumContent() {
        const container = document.getElementById('premium-content-grid');
        if (!container) return;

        // Show loading state
        this.showLoadingState(container);

        const posts = await this.loadPosts();
        const featuredPosts = posts
            .filter(post => post.homepageFeatured)
            .filter(post => this.isPublished(post))
            .slice(0, 6);

        if (featuredPosts.length === 0) {
            container.innerHTML = '<p class="no-content">Premium content coming soon...</p>';
            return;
        }

        container.innerHTML = featuredPosts.map(post => this.createPremiumCard(post)).join('');
        
        // Animate cards in
        this.animateContentCards(container);
    },

    createPremiumCard(post) {
        const categoryEmoji = this.getCategoryEmoji(post.category);
        const isPremium = post.premium ? '<div class="premium-indicator">👑 Premium</div>' : '';
        const bookmarkState = this.getBookmarkState(post.bookmark);
        
        return `
            <article class="content-card-premium" data-post-id="${post.slug}">
                <div class="content-card-image-premium">
                    <div class="content-emoji">${categoryEmoji}</div>
                    ${isPremium}
                </div>
                <div class="content-card-body-premium">
                    <div class="content-category-premium">${post.category}</div>
                    <h3 class="content-title-premium">
                        <a href="${post.slug}">${post.title}</a>
                    </h3>
                    <p class="content-excerpt-premium">${post.excerpt}</p>
                    <div class="content-meta-premium">
                        <span class="content-date">${this.formatDate(post.date)}</span>
                        <span class="read-time">${post.readTime}</span>
                    </div>
                    <div class="content-actions-premium">
                        <a href="${post.slug}" class="btn btn-outline btn-sm" aria-label="Read ${post.title}">
                            Read More
                        </a>
                        <button 
                            class="bookmark-btn ${bookmarkState}" 
                            data-bookmark="${post.bookmark}"
                            aria-label="Save ${post.title}"
                        >
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-grid">
                ${Array(6).fill('').map(() => `
                    <div class="loading-skeleton" style="height: 400px; border-radius: 24px;"></div>
                `).join('')}
            </div>
        `;
    },

    animateContentCards(container) {
        const cards = container.querySelectorAll('.content-card-premium');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },

    getCategoryEmoji(category) {
        const emojis = {
            'Mind Mechanics': '🧠',
            'Daily Architecture': '🏗️',
            'Energy Shift': '✨',
            'Shadow & Light': '🌗',
            'The Becoming': '🌱',
            'The Big Why': '🎯',
            'Grounded & Present': '🌿'
        };
        return emojis[category] || '📝';
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    isPublished(post) {
        const publishDate = new Date(post.date);
        const now = new Date();
        return publishDate <= now;
    },

    getBookmarkState(bookmarkKey) {
        const bookmarks = JSON.parse(localStorage.getItem('girlybeing_bookmarks_v1') || '[]');
        return bookmarks.includes(bookmarkKey) ? 'bookmarked' : '';
    }
};

// ===== PREMIUM EMAIL SYSTEM =====
const PremiumEmail = {
    init() {
        this.setupForms();
        this.setupValidation();
    },

    setupForms() {
        const emailForm = document.getElementById('premium-email-form');
        const newsletterForm = document.getElementById('premium-newsletter-form');

        if (emailForm) {
            emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e, 'hero'));
        }

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleEmailSubmit(e, 'newsletter'));
        }
    },

    setupValidation() {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    },

    validateEmail(input) {
        const email = input.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValid && email) {
            this.showError(input, 'Please enter a valid email address');
            return false;
        }

        this.clearError(input);
        return true;
    },

    async handleEmailSubmit(e, source) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!this.validateEmail(emailInput)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        try {
            // Save email
            const success = await this.saveEmail(email, source);
            
            if (success) {
                this.showSuccess(form, source);
                form.reset();
                this.trackConversion(source);
            } else {
                throw new Error('Failed to save email');
            }
        } catch (error) {
            this.showError(emailInput, 'Something went wrong. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    async saveEmail(email, source) {
        try {
            const emailList = JSON.parse(localStorage.getItem('girlybeing_email_list') || '[]');
            
            // Check if email already exists
            const exists = emailList.some(entry => entry.email === email);
            
            if (!exists) {
                emailList.push({
                    email,
                    source,
                    timestamp: new Date().toISOString(),
                    leadMagnet: source === 'hero' ? 'transformation_starter_kit' : 'newsletter'
                });
                
                localStorage.setItem('girlybeing_email_list', JSON.stringify(emailList));
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return true;
        } catch (error) {
            console.error('Error saving email:', error);
            return false;
        }
    },

    showSuccess(form, source) {
        const successHTML = source === 'hero' 
            ? this.getHeroSuccessHTML()
            : this.getNewsletterSuccessHTML();

        form.parentElement.innerHTML = successHTML;
        
        // Announce to screen readers
        this.announceToScreenReader('Thank you for subscribing! Check your email for your free gift.');
    },

    getHeroSuccessHTML() {
        return `
            <div class="success-message-premium">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>🎉 Check Your Email!</h3>
                <p>Your free Transformation Starter Kit is on its way. Check your spam folder if you don't see it within 5 minutes.</p>
                <div class="success-next-steps">
                    <h4>While you wait:</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Add us to your contacts</li>
                        <li><i class="fas fa-check"></i> Explore our <a href="#content">free content</a></li>
                        <li><i class="fas fa-check"></i> Join the <a href="#programs">Inner Circle</a></li>
                    </ul>
                </div>
            </div>
        `;
    },

    getNewsletterSuccessHTML() {
        return `
            <div class="success-message-premium">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>🎉 Welcome to It's a Girl Thing!</h3>
                <p>You're all set! Look for your first letter in your inbox soon.</p>
            </div>
        `;
    },

    showError(input, message) {
        this.clearError(input);
        
        const error = document.createElement('div');
        error.className = 'error-message-premium';
        error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        error.setAttribute('role', 'alert');
        
        input.parentNode.appendChild(error);
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('error');
    },

    clearError(input) {
        const existingError = input.parentNode.querySelector('.error-message-premium');
        if (existingError) {
            existingError.remove();
        }
        input.removeAttribute('aria-invalid');
        input.classList.remove('error');
    },

    trackConversion(source) {
        // Track conversion event
        console.log(`Conversion tracked: ${source} email signup`);
        
        // Google Analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
                'source': source,
                'value': 1
            });
        }
        
        // Facebook Pixel event
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: source
            });
        }
    },

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
};

// ===== PREMIUM BOOKMARK SYSTEM =====
const PremiumBookmarks = {
    init() {
        document.addEventListener('click', (e) => {
            const bookmarkBtn = e.target.closest('.bookmark-btn');
            if (bookmarkBtn) {
                e.preventDefault();
                this.toggleBookmark(bookmarkBtn);
            }
        });
    },

    toggleBookmark(button) {
        const bookmarkKey = button.dataset.bookmark;
        const isBookmarked = button.classList.contains('bookmarked');
        
        if (isBookmarked) {
            this.removeBookmark(bookmarkKey);
            button.classList.remove('bookmarked');
            this.showToast('Bookmark removed');
        } else {
            this.addBookmark(bookmarkKey);
            button.classList.add('bookmarked');
            this.showToast('Post saved to bookmarks!');
        }
    },

    addBookmark(bookmarkKey) {
        const bookmarks = JSON.parse(localStorage.getItem('girlybeing_bookmarks_v1') || '[]');
        
        if (!bookmarks.includes(bookmarkKey)) {
            bookmarks.push(bookmarkKey);
            localStorage.setItem('girlybeing_bookmarks_v1', JSON.stringify(bookmarks));
        }
    },

    removeBookmark(bookmarkKey) {
        const bookmarks = JSON.parse(localStorage.getItem('girlybeing_bookmarks_v1') || '[]');
        const index = bookmarks.indexOf(bookmarkKey);
        
        if (index > -1) {
            bookmarks.splice(index, 1);
            localStorage.setItem('girlybeing_bookmarks_v1', JSON.stringify(bookmarks));
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-premium';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ===== PREMIUM ANIMATIONS =====
const PremiumAnimations = {
    init() {
        this.setupIntersectionObserver();
        this.setupFloatingElements();
        this.setupParallaxEffects();
    },

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.pillar-card-premium, .program-card, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    },

    animateElement(element) {
        element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    },

    setupFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            const delay = index * 0.5;
            const duration = 3 + index;
            
            element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        });
    },

    setupParallaxEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-graphic');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }
};

// ===== PREMIUM PERFORMANCE MONITOR =====
const PremiumPerformance = {
    init() {
        this.monitorPageLoad();
        this.monitorUserInteractions();
    },

    monitorPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Premium page load time: ${Math.round(loadTime)}ms`);
            
            // Monitor Core Web Vitals
            this.observeWebVitals();
        });
    },

    observeWebVitals() {
        if (!('PerformanceObserver' in window)) return;

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`LCP: ${Math.round(lastEntry.startTime)}ms`);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log(`FID: ${Math.round(entry.processingStart - entry.startTime)}ms`);
            });
        }).observe({ entryTypes: ['first-input'] });
    },

    monitorUserInteractions() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn')) {
                const buttonText = e.target.textContent.trim();
                console.log(`Button clicked: ${buttonText}`);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const formId = e.target.id || 'unknown';
            console.log(`Form submitted: ${formId}`);
        });
    }
};

// ===== PREMIUM APP INITIALIZATION =====
const PremiumApp = {
    async init() {
        if (AppState.isInitialized) return;

        console.log('🌟 Initializing Girly Being Premium...');
        
        // Initialize all systems
        await Promise.all([
            PremiumNavigation.init(),
            PremiumContent.renderPremiumContent(),
            PremiumEmail.init(),
            PremiumBookmarks.init(),
            PremiumAnimations.init(),
            PremiumPerformance.init()
        ]);

        AppState.isInitialized = true;
        console.log('✨ Premium app initialized successfully');
    }
};

// ===== START PREMIUM APP =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PremiumApp.init());
} else {
    PremiumApp.init();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Premium JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Premium promise rejection:', e.reason);
});

// ===== EXPORTS =====
window.GirlyBeingPremium = {
    navigation: PremiumNavigation,
    content: PremiumContent,
    email: PremiumEmail,
    bookmarks: PremiumBookmarks,
    animations: PremiumAnimations,
    performance: PremiumPerformance
};
