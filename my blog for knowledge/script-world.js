/**
 * GIRLY BEING - WORLD-CLASS JAVASCRIPT
 * Smooth interactions, search, and magazine-quality UX
 */

// ===== APP STATE =====
const AppState = {
    isInitialized: false,
    searchResults: [],
    isMenuOpen: false
};

// ===== NAVIGATION =====
const Navigation = {
    init() {
        this.setupScrollEffects();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    },

    setupScrollEffects() {
        const nav = document.querySelector('.nav-world');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class
            if (currentScrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Hide/show nav on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navHeight = document.querySelector('.nav-world').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    setupMobileMenu() {
        // Mobile menu toggle (if needed in future)
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                AppState.isMenuOpen = !AppState.isMenuOpen;
                document.querySelector('.nav-links-world').classList.toggle('open');
            });
        }
    }
};

// ===== SEARCH FUNCTIONALITY =====
const Search = {
    init() {
        this.setupSearchInput();
        this.setupKeyboardShortcuts();
    },

    setupSearchInput() {
        const searchInput = document.querySelector('.search-input-world');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.debounceSearch(e.target.value);
        });

        // Search on enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(searchInput.value);
            }
        });
    },

    setupKeyboardShortcuts() {
        // Cmd/Ctrl + K to focus search
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input-world');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    },

    debounceSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.performSearch(query);
            }
        }, 300);
    },

    async performSearch(query) {
        try {
            // For now, search through visible articles
            const articles = document.querySelectorAll('.article-card-world');
            const searchTerm = query.toLowerCase();

            articles.forEach(article => {
                const title = article.querySelector('.article-title-world').textContent.toLowerCase();
                const excerpt = article.querySelector('.article-excerpt-world').textContent.toLowerCase();
                const category = article.querySelector('.article-category-world').textContent.toLowerCase();

                if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                    article.style.display = 'block';
                    article.style.opacity = '1';
                } else {
                    article.style.opacity = '0.3';
                }
            });

            // Reset if search is cleared
            if (!query) {
                articles.forEach(article => {
                    article.style.opacity = '1';
                });
            }

        } catch (error) {
            console.error('Search error:', error);
        }
    }
};

// ===== ANIMATIONS =====
const Animations = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    },

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe cards and sections
        document.querySelectorAll('.article-card-world, .program-card-world, .pillar-card-world').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    },

    setupHoverEffects() {
        // Add smooth hover transitions to cards
        document.querySelectorAll('.article-card-world, .program-card-world').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
};

// ===== NEWSLETTER =====
const Newsletter = {
    init() {
        this.setupForm();
    },

    setupForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!this.validateEmail(email)) {
                this.showError(emailInput, 'Please enter a valid email');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success
            this.showSuccess(form);
            
            // Track conversion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_signup', {
                    'event_category': 'engagement',
                    'event_label': 'footer_newsletter'
                });
            }
        });
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showError(input, message) {
        input.style.borderColor = '#FF6B6B';
        input.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        }, 3000);
    },

    showSuccess(form) {
        const successHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #D4A5A5; margin-bottom: 1rem;"></i>
                <h3 style="font-family: 'Playfair Display', serif; color: #2D2D2D; margin-bottom: 0.5rem;">Welcome to It's a Girl Thing!</h3>
                <p style="color: rgba(45, 45, 45, 0.7);">Check your inbox for your first letter.</p>
            </div>
        `;
        
        form.parentElement.innerHTML = successHTML;
    }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    init() {
        this.setupFocusStates();
        this.setupExternalLinks();
    },

    setupFocusStates() {
        // Add visible focus styles for keyboard navigation
        document.querySelectorAll('a, button, input').forEach(el => {
            el.addEventListener('focus', () => {
                el.style.outline = '2px solid #D4A5A5';
                el.style.outlineOffset = '2px';
            });
            
            el.addEventListener('blur', () => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
        });
    },

    setupExternalLinks() {
        // Open external links in new tab
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
};

// ===== APP INITIALIZATION =====
const App = {
    async init() {
        if (AppState.isInitialized) return;

        console.log('🌸 Initializing Girly Being World-Class...');

        await Promise.all([
            Navigation.init(),
            Search.init(),
            Animations.init(),
            Newsletter.init(),
            Utils.init()
        ]);

        AppState.isInitialized = true;
        console.log('✨ World-class app initialized');
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// Expose for debugging
window.GirlyBeingApp = App;
