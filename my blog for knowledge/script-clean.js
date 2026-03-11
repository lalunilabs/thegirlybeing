/**
 * GIRLY BEING - CLEAN & OPTIMIZED JAVASCRIPT
 * Performance-focused, accessible, and maintainable
 */

// ===== PERFORMANCE MONITORING =====
const performanceMonitor = {
    startTime: performance.now(),
    
    init() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            console.log(`Page load time: ${Math.round(loadTime)}ms`);
            
            // Monitor Core Web Vitals
            if ('PerformanceObserver' in window) {
                this.observeWebVitals();
            }
        });
    },
    
    observeWebVitals() {
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
    }
};

// ===== STORAGE MANAGER =====
const storage = {
    keys: {
        EMAIL_LIST: 'girlybeing_email_list',
        BOOKMARKS: 'girlybeing_bookmarks_v1',
        LAST_READ: 'girlybeing_last_read_v1',
        MEMBER: 'girlybeing_member'
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    }
};

// ===== EMAIL CAPTURE =====
const emailCapture = {
    forms: [],
    
    init() {
        // Find all email forms
        const heroForm = document.getElementById('hero-email-form');
        const newsletterForm = document.getElementById('newsletter-form');
        
        if (heroForm) this.setupForm(heroForm, 'hero');
        if (newsletterForm) this.setupForm(newsletterForm, 'newsletter');
    },
    
    setupForm(form, type) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(form, type);
        });
        
        // Add input validation
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }
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
    
    async handleSubmit(form, type) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!this.validateEmail(emailInput)) {
            return;
        }
        
        // Save email
        const success = this.saveEmail(email, type);
        
        if (success) {
            this.showSuccess(form, type);
            form.reset();
            
            // Track conversion
            this.trackConversion(type);
        } else {
            this.showError(emailInput, 'Something went wrong. Please try again.');
        }
    },
    
    saveEmail(email, source) {
        const emailList = storage.get(storage.keys.EMAIL_LIST, []);
        
        // Check if email already exists
        const exists = emailList.some(entry => entry.email === email);
        
        if (!exists) {
            emailList.push({
                email,
                source,
                timestamp: new Date().toISOString(),
                leadMagnet: source === 'hero' ? '5_minute_mind_reset' : 'newsletter'
            });
            
            return storage.set(storage.keys.EMAIL_LIST, emailList);
        }
        
        return true; // Already exists, but that's fine
    },
    
    showSuccess(form, type) {
        const successHTML = type === 'hero' 
            ? this.getHeroSuccessHTML()
            : this.getNewsletterSuccessHTML();
            
        form.parentElement.innerHTML = successHTML;
        
        // Announce to screen readers
        this.announce('Thank you for subscribing! Check your email for your free gift.');
    },
    
    getHeroSuccessHTML() {
        return `
            <div class="success-message">
                <h3>🎉 Check Your Email!</h3>
                <p>Your free 5-Minute Mind Reset guide is on its way. Check your spam folder if you don't see it within 5 minutes.</p>
                <div class="next-steps">
                    <h4>While you wait:</h4>
                    <ul>
                        <li>✨ Add us to your contacts so you don't miss future emails</li>
                        <li>📚 Explore our <a href="#content">free content</a> below</li>
                        <li>👑 Ready to go deeper? <a href="premium.html#pricing">Join Inner Circle</a></li>
                    </ul>
                </div>
            </div>
        `;
    },
    
    getNewsletterSuccessHTML() {
        return `
            <div class="success-message">
                <h3>🎉 Welcome to It's a Girl Thing!</h3>
                <p>You're all set! Look for your first letter in your inbox soon.</p>
            </div>
        `;
    },
    
    showError(input, message) {
        this.clearError(input);
        
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        error.setAttribute('role', 'alert');
        
        input.parentNode.appendChild(error);
        input.setAttribute('aria-invalid', 'true');
    },
    
    clearError(input) {
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.removeAttribute('aria-invalid');
    },
    
    trackConversion(type) {
        // In production, send to analytics
        console.log(`Conversion tracked: ${type} email signup`);
        
        // Could integrate with Google Analytics, Facebook Pixel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
                'source': type
            });
        }
    },
    
    announce(message) {
        // Create live region for screen readers
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.className = 'sr-only';
        liveRegion.textContent = message;
        
        document.body.appendChild(liveRegion);
        
        setTimeout(() => liveRegion.remove(), 1000);
    }
};

// ===== CONTENT LOADER =====
const contentLoader = {
    cache: new Map(),
    
    async loadPosts() {
        try {
            // Check cache first
            if (this.cache.has('posts')) {
                return this.cache.get('posts');
            }
            
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const posts = await response.json();
            
            // Cache the result
            this.cache.set('posts', posts);
            
            return posts;
        } catch (error) {
            console.error('Error loading posts:', error);
            return [];
        }
    },
    
    async renderLatestPosts() {
        const container = document.getElementById('latest-posts-container');
        if (!container) return;
        
        const posts = await this.loadPosts();
        const latestPosts = posts
            .filter(post => post.homepageLatest)
            .filter(post => this.isPublished(post))
            .slice(0, 3);
            
        if (latestPosts.length === 0) {
            container.innerHTML = '<p>No posts available yet.</p>';
            return;
        }
        
        container.innerHTML = latestPosts.map(post => this.createPostCard(post)).join('');
    },
    
    async renderContentGrid() {
        const container = document.getElementById('content-grid');
        if (!container) return;
        
        const posts = await this.loadPosts();
        const featuredPosts = posts
            .filter(post => post.homepageFeatured)
            .filter(post => this.isPublished(post))
            .slice(0, 6);
            
        if (featuredPosts.length === 0) {
            container.innerHTML = '<p>No featured content available yet.</p>';
            return;
        }
        
        container.innerHTML = featuredPosts.map(post => this.createContentCard(post)).join('');
    },
    
    isPublished(post) {
        const publishDate = new Date(post.date);
        const now = new Date();
        return publishDate <= now;
    },
    
    createPostCard(post) {
        const categoryEmoji = this.getCategoryEmoji(post.category);
        const isPremium = post.premium ? '<span class="premium-badge">👑 Premium</span>' : '';
        
        return `
            <article class="post-card">
                <div class="post-card-image">
                    <span class="post-emoji">${categoryEmoji}</span>
                    ${isPremium}
                </div>
                <div class="post-card-content">
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">${this.formatDate(post.date)}</span>
                        <span class="read-time">${post.readTime}</span>
                    </div>
                    <h3 class="post-title">
                        <a href="${post.slug}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="${post.slug}" class="read-more" aria-label="Read ${post.title}">Read More →</a>
                </div>
            </article>
        `;
    },
    
    createContentCard(post) {
        const categoryEmoji = this.getCategoryEmoji(post.category);
        
        return `
            <article class="content-card">
                <div class="content-card-image">
                    <span class="content-emoji">${categoryEmoji}</span>
                </div>
                <div class="content-card-body">
                    <div class="content-meta">
                        <span class="content-category">${post.category}</span>
                        <span class="content-date">${this.formatDate(post.date)}</span>
                    </div>
                    <h3 class="content-title">
                        <a href="${post.slug}">${post.title}</a>
                    </h3>
                    <p class="content-excerpt">${post.excerpt}</p>
                    <div class="content-actions">
                        <a href="${post.slug}" class="btn btn-outline btn-sm">Read More</a>
                        <button class="btn btn-ghost btn-sm" onclick="bookmark.save('${post.bookmark}')" aria-label="Save ${post.title}">
                            🔖
                        </button>
                    </div>
                </div>
            </article>
        `;
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
    }
};

// ===== BOOKMARK SYSTEM =====
const bookmark = {
    init() {
        // Add bookmark buttons to content cards
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-bookmark-action]')) {
                e.preventDefault();
                const bookmarkKey = e.target.dataset.bookmarkAction;
                this.save(bookmarkKey);
            }
        });
    },
    
    save(bookmarkKey) {
        const bookmarks = storage.get(storage.keys.BOOKMARKS, []);
        
        if (!bookmarks.includes(bookmarkKey)) {
            bookmarks.push(bookmarkKey);
            storage.set(storage.keys.BOOKMARKS, bookmarks);
            this.showToast('Post saved to bookmarks!');
        } else {
            this.showToast('Post already bookmarked');
        }
    },
    
    remove(bookmarkKey) {
        const bookmarks = storage.get(storage.keys.BOOKMARKS, []);
        const index = bookmarks.indexOf(bookmarkKey);
        
        if (index > -1) {
            bookmarks.splice(index, 1);
            storage.set(storage.keys.BOOKMARKS, bookmarks);
            this.showToast('Bookmark removed');
        }
    },
    
    getAll() {
        return storage.get(storage.keys.BOOKMARKS, []);
    },
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ===== NAVIGATION =====
const navigation = {
    init() {
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    this.smoothScroll(target);
                }
            }
        });
        
        // Active state management
        this.updateActiveLink();
        window.addEventListener('scroll', () => this.updateActiveLink());
    },
    
    smoothScroll(target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },
    
    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                current = section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
};

// ===== INITIALIZATION =====
const app = {
    async init() {
        // Start performance monitoring
        performanceMonitor.init();
        
        // Initialize components
        emailCapture.init();
        navigation.init();
        bookmark.init();
        
        // Load content
        await Promise.all([
            contentLoader.renderLatestPosts(),
            contentLoader.renderContentGrid()
        ]);
        
        console.log('Girly Being app initialized');
    }
};

// ===== START APP =====
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ===== EXPORTS =====
window.girlyBeing = {
    storage,
    bookmark,
    contentLoader
};
