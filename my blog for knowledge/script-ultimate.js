/**
 * GIRLY BEING - ULTIMATE JAVASCRIPT
 * Advanced search, pinkish floating elements, and world-class functionality
 */

// ===== ULTIMATE APP STATE =====
const UltimateAppState = {
    isInitialized: false,
    currentSection: 'home',
    searchResults: [],
    isSearchOpen: false,
    floatingElements: [],
    contentCache: new Map(),
    userPreferences: {
        theme: 'pink',
        animations: true,
        reducedMotion: false
    }
};

// ===== ULTIMATE SEARCH SYSTEM =====
const UltimateSearch = {
    init() {
        this.setupSearchFunctionality();
        this.setupSearchUI();
        this.setupKeyboardShortcuts();
    },

    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input-ultimate');
        const searchBtn = document.querySelector('.search-btn-ultimate');
        
        if (searchInput && searchBtn) {
            // Real-time search
            searchInput.addEventListener('input', (e) => {
                this.debounceSearch(e.target.value);
            });

            // Search button click
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });

            // Enter key search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(searchInput.value);
                }
            });
        }
    },

    setupSearchUI() {
        // Create search results dropdown
        const searchContainer = document.querySelector('.search-container-ultimate');
        if (searchContainer) {
            const resultsDropdown = document.createElement('div');
            resultsDropdown.className = 'search-results-dropdown';
            resultsDropdown.setAttribute('role', 'listbox');
            searchContainer.appendChild(resultsDropdown);
        }
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape to close search
            if (e.key === 'Escape' && UltimateAppState.isSearchOpen) {
                this.closeSearch();
            }
        });
    },

    focusSearch() {
        const searchInput = document.querySelector('.search-input-ultimate');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },

    debounceSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    },

    async performSearch(query) {
        if (!query.trim()) {
            this.closeSearch();
            return;
        }

        try {
            // Load posts if not cached
            const posts = await this.loadPosts();
            
            // Search posts
            const results = this.searchPosts(posts, query);
            UltimateAppState.searchResults = results;
            
            // Display results
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError();
        }
    },

    async loadPosts() {
        if (UltimateAppState.contentCache.has('posts')) {
            return UltimateAppState.contentCache.get('posts');
        }

        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const posts = await response.json();
            UltimateAppState.contentCache.set('posts', posts);
            return posts;
        } catch (error) {
            console.error('Error loading posts for search:', error);
            return [];
        }
    },

    searchPosts(posts, query) {
        const searchTerms = query.toLowerCase().split(' ');
        
        return posts.filter(post => {
            const searchableText = [
                post.title,
                post.excerpt,
                post.category,
                post.content || ''
            ].join(' ').toLowerCase();
            
            return searchTerms.every(term => 
                searchableText.includes(term)
            );
        }).map(post => ({
            ...post,
            relevanceScore: this.calculateRelevance(post, query)
        })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    },

    calculateRelevance(post, query) {
        const searchTerms = query.toLowerCase().split(' ');
        let score = 0;
        
        searchTerms.forEach(term => {
            // Title matches get highest score
            if (post.title.toLowerCase().includes(term)) {
                score += 10;
            }
            
            // Category matches
            if (post.category.toLowerCase().includes(term)) {
                score += 5;
            }
            
            // Excerpt matches
            if (post.excerpt.toLowerCase().includes(term)) {
                score += 3;
            }
            
            // Content matches
            if (post.content && post.content.toLowerCase().includes(term)) {
                score += 1;
            }
        });
        
        return score;
    },

    displaySearchResults(results, query) {
        const dropdown = document.querySelector('.search-results-dropdown');
        if (!dropdown) return;

        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                    <small>Try different keywords or browse our content</small>
                </div>
            `;
        } else {
            dropdown.innerHTML = `
                <div class="search-results-header">
                    <span>${results.length} results for "${query}"</span>
                </div>
                <div class="search-results-list">
                    ${results.slice(0, 5).map(post => this.createSearchResultItem(post, query)).join('')}
                </div>
                <div class="search-results-footer">
                    <a href="#search-results" class="see-all-results">
                        See all ${results.length} results
                    </a>
                </div>
            `;
        }

        dropdown.classList.add('show');
        UltimateAppState.isSearchOpen = true;
    },

    createSearchResultItem(post, query) {
        const highlightedTitle = this.highlightText(post.title, query);
        const highlightedExcerpt = this.highlightText(post.excerpt, query);
        
        return `
            <a href="${post.slug}" class="search-result-item" role="option">
                <div class="search-result-content">
                    <h4 class="search-result-title">${highlightedTitle}</h4>
                    <p class="search-result-excerpt">${highlightedExcerpt}</p>
                    <div class="search-result-meta">
                        <span class="search-result-category">${post.category}</span>
                        <span class="search-result-date">${this.formatDate(post.date)}</span>
                    </div>
                </div>
            </a>
        `;
    },

    highlightText(text, query) {
        const searchTerms = query.toLowerCase().split(' ');
        let highlightedText = text;
        
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    displaySearchError() {
        const dropdown = document.querySelector('.search-results-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Search temporarily unavailable</p>
                <small>Please try again later</small>
            </div>
        `;
        
        dropdown.classList.add('show');
    },

    closeSearch() {
        const dropdown = document.querySelector('.search-results-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            UltimateAppState.isSearchOpen = false;
        }
    }
};

// ===== PINKISH FLOATING ELEMENTS =====
const FloatingElements = {
    init() {
        this.createFloatingElements();
        this.animateFloatingElements();
        this.setupInteractionEffects();
    },

    createFloatingElements() {
        const container = document.querySelector('.floating-elements-ultimate');
        if (!container) return;

        // Create additional floating elements
        for (let i = 0; i < 8; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element-ultimate';
            element.style.cssText = `
                width: ${Math.random() * 60 + 40}px;
                height: ${Math.random() * 60 + 40}px;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 3}s;
                animation-duration: ${Math.random() * 2 + 3}s;
            `;
            container.appendChild(element);
            UltimateAppState.floatingElements.push(element);
        }
    },

    animateFloatingElements() {
        // Add hover effects to floating elements
        UltimateAppState.floatingElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.2)';
                element.style.opacity = '0.3';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
                element.style.opacity = '';
            });
        });
    },

    setupInteractionEffects() {
        // Create floating particles on mouse move
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Create particle trail occasionally
            if (Math.random() > 0.98) {
                this.createParticle(mouseX, mouseY);
            }
        });
    },

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #E91E63, #FF1493);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
            animation: particle-float 2s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => particle.remove(), 2000);
    }
};

// ===== ULTIMATE NAVIGATION =====
const UltimateNavigation = {
    init() {
        this.setupScrollEffects();
        this.setupSmoothScrolling();
        this.setupActiveStates();
        this.setupMobileMenu();
    },

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('.nav-ultimate');
        
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
        const headerHeight = document.querySelector('.nav-ultimate').offsetHeight;
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
        const navLinks = document.querySelectorAll('.nav-link-ultimate');
        
        const updateActiveLink = () => {
            const scrollY = window.scrollY;
            const headerHeight = document.querySelector('.nav-ultimate').offsetHeight;
            
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
            
            UltimateAppState.currentSection = currentSection;
        };

        // Update on scroll and load
        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink();
    },

    updateActiveSection() {
        this.setupActiveStates();
    },

    setupMobileMenu() {
        // Mobile menu functionality (if needed)
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                // Toggle mobile menu
            });
        }
    }
};

// ===== ULTIMATE CONTENT LOADER =====
const UltimateContent = {
    async loadContent() {
        try {
            const posts = await this.loadPosts();
            this.renderUltimateContent(posts);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    },

    async loadPosts() {
        if (UltimateAppState.contentCache.has('posts')) {
            return UltimateAppState.contentCache.get('posts');
        }

        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const posts = await response.json();
        UltimateAppState.contentCache.set('posts', posts);
        return posts;
    },

    renderUltimateContent(posts) {
        const container = document.getElementById('ultimate-content-grid');
        if (!container) return;

        const featuredPosts = posts
            .filter(post => post.homepageFeatured)
            .filter(post => this.isPublished(post))
            .slice(0, 6);

        if (featuredPosts.length === 0) {
            container.innerHTML = '<p class="no-content">Premium content coming soon...</p>';
            return;
        }

        container.innerHTML = featuredPosts.map(post => this.createUltimateCard(post)).join('');
        
        // Animate cards in
        this.animateContentCards(container);
    },

    createUltimateCard(post) {
        const categoryEmoji = this.getCategoryEmoji(post.category);
        const isPremium = post.premium ? '<div class="premium-indicator-ultimate">👑 Premium</div>' : '';
        
        return `
            <article class="content-card-ultimate" data-post-id="${post.slug}">
                <div class="content-card-image-ultimate">
                    <div class="content-emoji-ultimate">${categoryEmoji}</div>
                    ${isPremium}
                </div>
                <div class="content-card-body-ultimate">
                    <div class="content-category-ultimate">${post.category}</div>
                    <h3 class="content-title-ultimate">
                        <a href="${post.slug}">${post.title}</a>
                    </h3>
                    <p class="content-excerpt-ultimate">${post.excerpt}</p>
                    <div class="content-meta-ultimate">
                        <span class="content-date-ultimate">${this.formatDate(post.date)}</span>
                        <span class="read-time-ultimate">${post.readTime}</span>
                    </div>
                    <div class="content-actions-ultimate">
                        <a href="${post.slug}" class="btn-ultimate btn-secondary-ultimate" aria-label="Read ${post.title}">
                            Read More
                        </a>
                        <button class="bookmark-btn-ultimate" data-bookmark="${post.bookmark}" aria-label="Save ${post.title}">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    animateContentCards(container) {
        const cards = container.querySelectorAll('.content-card-ultimate');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
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
    }
};

// ===== ULTIMATE EMAIL SYSTEM =====
const UltimateEmail = {
    init() {
        this.setupForms();
        this.setupValidation();
    },

    setupForms() {
        const newsletterForm = document.getElementById('ultimate-newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
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

    async handleEmailSubmit(e) {
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showSuccess(form);
            form.reset();
            this.trackConversion('newsletter');
        } catch (error) {
            this.showError(emailInput, 'Something went wrong. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    showSuccess(form) {
        const successHTML = `
            <div class="success-message-ultimate">
                <div class="success-icon-ultimate">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>🎉 Welcome to It's a Girl Thing!</h3>
                <p>You're all set! Look for your first letter in your inbox soon.</p>
            </div>
        `;

        form.parentElement.innerHTML = successHTML;
    },

    showError(input, message) {
        this.clearError(input);
        
        const error = document.createElement('div');
        error.className = 'error-message-ultimate';
        error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        error.setAttribute('role', 'alert');
        
        input.parentNode.appendChild(error);
        input.setAttribute('aria-invalid', 'true');
    },

    clearError(input) {
        const existingError = input.parentNode.querySelector('.error-message-ultimate');
        if (existingError) {
            existingError.remove();
        }
        input.removeAttribute('aria-invalid');
    },

    trackConversion(source) {
        console.log(`Conversion tracked: ${source} email signup`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
                'source': source,
                'value': 1
            });
        }
    }
};

// ===== ULTIMATE PERFORMANCE MONITOR =====
const UltimatePerformance = {
    init() {
        this.monitorPageLoad();
        this.monitorUserInteractions();
    },

    monitorPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Ultimate page load time: ${Math.round(loadTime)}ms`);
            
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
        // Track search usage
        document.addEventListener('input', (e) => {
            if (e.target.matches('.search-input-ultimate')) {
                console.log('Search interaction detected');
            }
        });

        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-ultimate')) {
                const buttonText = e.target.textContent.trim();
                console.log(`Button clicked: ${buttonText}`);
            }
        });
    }
};

// ===== ULTIMATE APP INITIALIZATION =====
const UltimateApp = {
    async init() {
        if (UltimateAppState.isInitialized) return;

        console.log('🌟 Initializing Girly Being Ultimate...');
        
        // Initialize all systems
        await Promise.all([
            UltimateSearch.init(),
            FloatingElements.init(),
            UltimateNavigation.init(),
            UltimateContent.loadContent(),
            UltimateEmail.init(),
            UltimatePerformance.init()
        ]);

        UltimateAppState.isInitialized = true;
        console.log('✨ Ultimate app initialized successfully');
    }
};

// ===== START ULTIMATE APP =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UltimateApp.init());
} else {
    UltimateApp.init();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Ultimate JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Ultimate promise rejection:', e.reason);
});

// ===== EXPORTS =====
window.GirlyBeingUltimate = {
    search: UltimateSearch,
    floating: FloatingElements,
    navigation: UltimateNavigation,
    content: UltimateContent,
    email: UltimateEmail,
    performance: UltimatePerformance
};

// ===== ADDITIONAL CSS FOR DYNAMIC ELEMENTS =====
const additionalCSS = `
    /* Search Results Dropdown */
    .search-results-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid rgba(233, 30, 99, 0.1);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(233, 30, 99, 0.1);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: none;
    }
    
    .search-results-dropdown.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
    }
    
    .search-results-header {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(233, 30, 99, 0.1);
        font-size: 0.8rem;
        color: rgba(26, 26, 26, 0.7);
    }
    
    .search-result-item {
        display: block;
        padding: 16px;
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid rgba(233, 30, 99, 0.05);
        transition: background-color 0.2s ease;
    }
    
    .search-result-item:hover {
        background: rgba(233, 30, 99, 0.05);
    }
    
    .search-result-title {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .search-result-excerpt {
        font-size: 0.9rem;
        color: rgba(26, 26, 26, 0.7);
        margin-bottom: 8px;
        line-height: 1.4;
    }
    
    .search-result-meta {
        display: flex;
        gap: 12px;
        font-size: 0.8rem;
        color: rgba(26, 26, 26, 0.5);
    }
    
    mark {
        background: rgba(233, 30, 99, 0.2);
        color: var(--primary-rose);
        padding: 1px 2px;
        border-radius: 2px;
    }
    
    /* Floating Particles */
    @keyframes particle-float {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
        }
    }
    
    .floating-particle {
        pointer-events: none;
    }
    
    /* Success Messages */
    .success-message-ultimate {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(255, 20, 147, 0.1));
        border-radius: 16px;
        border: 1px solid rgba(233, 30, 99, 0.2);
    }
    
    .success-icon-ultimate {
        font-size: 3rem;
        color: var(--primary-rose);
        margin-bottom: 1rem;
    }
    
    .success-message-ultimate h3 {
        font-family: var(--font-display);
        font-size: 1.5rem;
        color: var(--accent-charcoal);
        margin-bottom: 0.5rem;
    }
    
    .success-message-ultimate p {
        color: rgba(26, 26, 26, 0.8);
    }
    
    /* Error Messages */
    .error-message-ultimate {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding: 8px 12px;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.2);
        border-radius: 8px;
        color: var(--error-coral);
        font-size: 0.9rem;
    }
    
    /* Container Ultimate */
    .container-ultimate {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 var(--space-lg);
    }
    
    /* Section Headers Ultimate */
    .section-header-ultimate {
        text-align: center;
        margin-bottom: var(--space-2xl);
    }
    
    .section-title-ultimate {
        font-family: var(--font-display);
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--accent-charcoal);
        margin-bottom: var(--space-sm);
    }
    
    .section-subtitle-ultimate {
        font-size: 1.2rem;
        color: rgba(26, 26, 26, 0.7);
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
