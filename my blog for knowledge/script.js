document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.nav-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const newsletterForms = Array.from(document.querySelectorAll('.newsletter-form'));

  // Initialize email capture
  initEmailCapture();

  const MEMBERSHIP_KEY = 'girlybeing_member';
  const VOICE_KEY = 'girlybeing_voice';
  const VOICE_SWITCHER_KEY = 'girlybeing_voice_switcher_v1';
  const BOOKMARKS_KEY = 'girlybeing_bookmarks_v1';
  const LAST_READ_KEY = 'girlybeing_last_read_v1';

  // ===== EMAIL CAPTURE FUNCTIONALITY =====
  function initEmailCapture() {
    const heroForm = document.getElementById('hero-email-form');
    if (heroForm) {
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Validate email
            if (!validateEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            // Save to localStorage (in production, this would go to your email service)
            saveEmailToList(email);
            
            // Show success message
            showEmailSuccess();
            
            // Reset form
            this.reset();
        });
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function saveEmailToList(email) {
    let emailList = JSON.parse(localStorage.getItem('girlybeing_email_list') || '[]');
    if (!emailList.includes(email)) {
        emailList.push({
            email: email,
            date: new Date().toISOString(),
            source: 'hero_form',
            leadMagnet: '5_minute_mind_reset'
        });
        localStorage.setItem('girlybeing_email_list', JSON.stringify(emailList));
    }
  }

  function showEmailSuccess() {
    const emailCapture = document.querySelector('.email-capture-hero');
    if (emailCapture) {
        emailCapture.innerHTML = `
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
    }
  }

  function showError(message) {
    // Create error toast
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    errorToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
        errorToast.remove();
    }, 3000);
  }

  // ===== EMAIL CAPTURE FUNCTIONALITY =====

  // Journal Hub members-only functionality
  const journalLockOverlay = document.getElementById('journalLockOverlay');
  const journalLockOverlay2 = document.getElementById('journalLockOverlay2');
  const journalCheckinCard = document.getElementById('journalCheckinCard');
  const journalWriteCard = document.getElementById('journalWriteCard');
  const journalUnlockBtns = document.querySelectorAll('.journal-unlock-btn');

  function getIsMember() {
    return localStorage.getItem(MEMBERSHIP_KEY) === 'true';
  }
  
  function initializeJournalLock() {
    if (getIsMember()) {
      // Remove lock overlays if member
      if (journalLockOverlay) journalLockOverlay.remove();
      if (journalLockOverlay2) journalLockOverlay2.remove();
      if (journalCheckinCard) journalCheckinCard.classList.remove('locked');
      if (journalWriteCard) journalWriteCard.classList.remove('locked');

      document.querySelectorAll('#journalCheckinCard button, #journalWriteCard button').forEach((btn) => {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
      });

      document.querySelectorAll('#journalCheckinCard input, #journalWriteCard input, #journalWriteCard textarea, #journalCheckinCard textarea').forEach((el) => {
        el.disabled = false;
        el.removeAttribute('aria-disabled');
      });

      document.querySelectorAll('button.template-btn[data-template]').forEach((btn) => {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
      });
    } else {
      // Keep locks active for non-members
      if (journalCheckinCard) journalCheckinCard.classList.add('locked');
      if (journalWriteCard) journalWriteCard.classList.add('locked');

      document.querySelectorAll('#journalCheckinCard button, #journalWriteCard button').forEach((btn) => {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      });

      document.querySelectorAll('#journalCheckinCard input, #journalWriteCard input, #journalWriteCard textarea, #journalCheckinCard textarea').forEach((el) => {
        el.disabled = true;
        el.setAttribute('aria-disabled', 'true');
      });

      document.querySelectorAll('button.template-btn[data-template]').forEach((btn) => {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      });
    }
  }

  // Handle unlock button clicks
  journalUnlockBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wantsDemoUnlock = e.shiftKey;
      if (!wantsDemoUnlock) return;

      e.preventDefault();

      const confirmed = confirm('Demo unlock: click OK to unlock the Journal Hub for this session.');
      if (confirmed) {
        localStorage.setItem(MEMBERSHIP_KEY, 'true');
        initializeJournalLock();
        updateMemberPill();
        showToast('Journal Hub unlocked. Welcome in.');
        
        // Show success message
        if (journalCheckinCard) {
          const successMsg = document.createElement('div');
          successMsg.className = 'journal-status show';
          successMsg.textContent = '🎉 Journal Hub unlocked! Welcome to the Inner Circle.';
          journalCheckinCard.appendChild(successMsg);
          
          setTimeout(() => {
            successMsg.remove();
          }, 3000);
        }
      }
    });
  });

  // Initialize journal lock state
  initializeJournalLock();

  function safeParse(json) {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function getLastRead() {
    const raw = localStorage.getItem(LAST_READ_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  }

  function setLastRead(next) {
    if (!next || typeof next !== 'object') return;
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(next));
  }

  function showToast(message) {
    if (!message) return;
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function getJournalHref() {
    return document.getElementById('journal') ? '#journal' : 'index.html#journal';
  }

  function addMemberPill() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    const pill = document.createElement('a');
    pill.href = getJournalHref();
    pill.className = 'member-pill';
    pill.id = 'memberPill';
    navRight.prepend(pill);

    pill.addEventListener('click', (e) => {
      // Allow demo reset via shift-click
      if (e.shiftKey) {
        e.preventDefault();
        localStorage.removeItem(MEMBERSHIP_KEY);
        showToast('Demo reset: membership cleared.');
        window.location.reload();
      }
    });

    updateMemberPill();
  }

  function updateMemberPill() {
    const pill = document.getElementById('memberPill');
    if (!pill) return;
    pill.href = getJournalHref();
    if (getIsMember()) {
      pill.textContent = 'Inner Circle ✓';
      pill.style.opacity = '1';
    } else {
      pill.textContent = 'Members Only';
      pill.style.opacity = '0.9';
    }
  }

  addMemberPill();

  // 3-Voice Content System
  // Voice A: Psychology + Strategy (grounded/clinical but still feminine)
  // Voice B: Playful big-sis mentor (warm, hype, fun) 
  // Voice C: Soft luxury CEO (calm, elegant, confident)
  const VOICE_CLASSES = ['voice-voice-a', 'voice-voice-b', 'voice-voice-c'];
  
  function initializeVoiceSystem() {
    // Get saved voice preference or default to Voice A
    const savedVoice = localStorage.getItem(VOICE_KEY) || 'voice-voice-a';
    setActiveVoice(savedVoice);
  }
  
  function setActiveVoice(voice) {
    const nextVoice = VOICE_CLASSES.includes(voice) ? voice : 'voice-voice-a';

    // Hide all voice variants
    VOICE_CLASSES.forEach((cls) => {
      document.querySelectorAll(`.${cls}`).forEach((el) => {
        el.style.display = 'none';
      });
    });
    
    // Show selected voice
    const activeElements = document.querySelectorAll(`.${nextVoice}`);
    activeElements.forEach(el => {
      el.style.display = '';
    });
    
    // Save preference
    localStorage.setItem(VOICE_KEY, nextVoice);

    // Update switcher UI state (if present)

    document.querySelectorAll('.voice-switcher-btn[data-voice]').forEach((btn) => {
      const v = btn.getAttribute('data-voice');
      const isActive = v === nextVoice;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }
  
  // Add voice switcher to page (for demo purposes)
  function addVoiceSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'voice-switcher';
    
    switcher.innerHTML = `
      <div class="voice-switcher-title">Content Voice</div>
      <div class="voice-switcher-actions">
        <button type="button" class="voice-switcher-btn" data-voice="voice-voice-a">Strategy</button>
        <button type="button" class="voice-switcher-btn" data-voice="voice-voice-b">Playful</button>
        <button type="button" class="voice-switcher-btn" data-voice="voice-voice-c">Elegant</button>
      </div>
    `;
    
    // Handle voice switching
    switcher.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const voice = e.target.getAttribute('data-voice');
        setActiveVoice(voice);
      }
    });
    
    document.body.appendChild(switcher);

    setActiveVoice(localStorage.getItem(VOICE_KEY) || 'voice-voice-a');
  }
  
  // Initialize voice system
  initializeVoiceSystem();
  const hasAnyVoiceContent = VOICE_CLASSES.some((cls) => document.querySelector(`.${cls}`));

  function getIsVoiceSwitcherEnabled() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('voice') === '1') return true;
    return localStorage.getItem(VOICE_SWITCHER_KEY) === 'true';
  }

  function setIsVoiceSwitcherEnabled(next) {
    localStorage.setItem(VOICE_SWITCHER_KEY, next ? 'true' : 'false');
  }

  function renderVoiceSwitcher() {
    if (!hasAnyVoiceContent) return;
    const existing = document.querySelector('.voice-switcher');
    const enabled = getIsVoiceSwitcherEnabled();
    if (enabled && !existing) addVoiceSwitcher();
    if (!enabled && existing) existing.remove();
  }

  renderVoiceSwitcher();

  const logoToggle = document.querySelector('.logo-text');
  if (logoToggle) {
    logoToggle.addEventListener('click', (e) => {
      if (!(e.shiftKey && e.altKey)) return;
      e.preventDefault();
      const next = !getIsVoiceSwitcherEnabled();
      setIsVoiceSwitcherEnabled(next);
      renderVoiceSwitcher();
      showToast(next ? 'Voice settings enabled.' : 'Voice settings hidden.');
    });
  }

  const els = {
    moodPills: Array.from(document.querySelectorAll('.mood-pill')),
    promptText: document.getElementById('journalPromptText'),
    newPromptBtn: document.getElementById('newPromptBtn'),
    saveBtn: document.getElementById('saveJournalBtn'),
    clearBtn: document.getElementById('clearJournalBtn'),
    entry: document.getElementById('journalEntry'),
    focus: document.getElementById('journalFocus'),
    friction: document.getElementById('journalFriction'),
    reframe: document.getElementById('journalReframe'),
    status: document.getElementById('journalStatus'),
    savedLabel: document.getElementById('journalSavedLabel'),
    streak: document.getElementById('journalStreak'),
    templateBtns: Array.from(document.querySelectorAll('.template-btn[data-template]')),
  };

  const STORAGE_KEY = 'awb_journal_v1';

  function headerOffset() {
    if (!header) return 0;
    return header.getBoundingClientRect().height;
  }

  function scrollToWithOffset(targetEl) {
    const offset = headerOffset();
    const top = window.scrollY + targetEl.getBoundingClientRect().top - offset - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  function setActiveNavById(id) {
    if (!id) return;
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isSamePageAnchor = href.startsWith('#') && href.slice(1) === id;
      link.classList.toggle('active', isSamePageAnchor);
    });
  }

  function getSectionMap() {
    const map = [];
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#') || href === '#') return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      map.push({ id, el });
    });
    return map;
  }

  const sectionMap = getSectionMap();

  function updateActiveNav() {
    if (sectionMap.length === 0) return;
    const probeY = window.scrollY + headerOffset() + 24;

    let current = sectionMap[0].id;
    for (const { id, el } of sectionMap) {
      const top = window.scrollY + el.getBoundingClientRect().top;
      if (top <= probeY) current = id;
    }

    setActiveNavById(current);
  }

  const prompts = [
    'What "old code" did you run today — and what would the upgraded version do instead?',
    'If your life had a CEO, what decision would they make in the next 24 hours?',
    'What are you avoiding because it might change your identity?',
    'Name the belief that is costing you the most energy. What would be a truer belief?',
    'Where are you confusing intensity with progress?',
    'What would this week look like if you optimized for consistency, not motivation?',
    'What does your nervous system need so you can keep showing up?',
    'What are you manifesting accidentally through repetition and attention?',
    'What is the smallest honest action that would move you forward today?',
  ];

  const templates = {
    luxury_diary: {
      focus: 'The headline (what today was really about):',
      friction: 'The friction (what pulled me off-center):',
      reframe: 'The truth (one sentence I’m choosing to live by):',
      entry:
        'Dear diary,\n\nMoment (what happened / what I noticed):\n\nMeaning (the pattern, belief, or identity at play):\n\nThe CEO move (what I will do next — simple, specific):\n\nThe soft part (what I need from myself right now):\n\nOne promise (for the next 24 hours):\n',
    },
    ceo_notes: {
      focus: 'One idea worth keeping:',
      friction: 'One discomfort I noticed:',
      reframe: 'One experiment I will run:',
      entry:
        '1) The insight (in one sentence):\n\n2) The evidence (why it’s true / useful):\n\n3) The action (what I will do next):\n\n4) The cost (what I’m giving up):\n\n5) The metric (how I’ll know it worked):\n',
    },
    consistency: {
      focus: 'The 10-minute minimum version:',
      friction: 'The excuse that shows up:',
      reframe: 'The rule I’m committing to:',
      entry:
        'Bad day protocol:\n- Minimum version (10 min):\n- Setup (make it easy):\n- Friction removal (what I will delete):\n\nGood day protocol:\n- Upgrade version (if energy is high):\n\nTrigger → Routine → Reward:\n- Trigger:\n- Routine:\n- Reward:\n',
    },
  };

  function nowIso() {
    return new Date().toISOString();
  }

  // Dynamic Content: search + category filters + bookmarks
  const contentSearch = document.getElementById('contentSearch');
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
  let contentCards = Array.from(document.querySelectorAll('.content-card[data-category]'));
  let bookmarkBtns = Array.from(document.querySelectorAll('.bookmark-btn[data-bookmark]'));

  function refreshContentDom() {
    contentCards = Array.from(document.querySelectorAll('.content-card[data-category]'));
    bookmarkBtns = Array.from(document.querySelectorAll('.bookmark-btn[data-bookmark]'));
  }

  function getBookmarks() {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (Array.isArray(parsed)) return parsed;
    return [];
  }

  function setBookmarks(next) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  }

  function activateFilterChip(chip) {
    if (!chip) return;
    filterChips.forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
    });
  }

  function getChipByFilter(filterValue) {
    const target = normalize(filterValue);
    return filterChips.find((c) => normalize(c.getAttribute('data-filter')) === target) || null;
  }

  function updateSavedChipState() {
    const chip = getChipByFilter('saved');
    if (!chip) return;
    const count = getBookmarks().length;
    chip.textContent = count > 0 ? `Saved (${count})` : 'Saved';
    if (count === 0) {
      chip.setAttribute('aria-disabled', 'true');
    } else {
      chip.removeAttribute('aria-disabled');
    }
  }

  function normalize(str) {
    return String(str || '').trim().toLowerCase();
  }

  function getActiveFilter() {
    const active = filterChips.find((c) => c.classList.contains('active'));
    return active ? normalize(active.getAttribute('data-filter')) : 'all';
  }

  function matchesSearch(card, query) {
    if (!query) return true;
    const title = normalize(card.getAttribute('data-title'));
    const category = normalize(card.getAttribute('data-category'));
    return title.includes(query) || category.includes(query);
  }

  function matchesFilter(card, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'saved') {
      const bookmarks = new Set(getBookmarks());
      const key = card.getAttribute('data-bookmark');
      return Boolean(key && bookmarks.has(key));
    }
    return normalize(card.getAttribute('data-category')) === filter;
  }

  function applyContentFilters() {
    const rawQuery = contentSearch ? contentSearch.value.trim() : '';
    const query = normalize(rawQuery);
    const filter = getActiveFilter();
    let visibleCount = 0;
    contentCards.forEach((card) => {
      const visible = matchesSearch(card, query) && matchesFilter(card, filter);
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    const emptyState = document.getElementById('contentEmptyState');
    if (emptyState) {
      if (visibleCount === 0) {
        const savedCount = getBookmarks().length;
        if (filter === 'saved' && savedCount === 0) {
          emptyState.textContent = 'No saved posts yet. Tap 🔖 on any post, then use Saved.';
        } else if (filter === 'saved' && rawQuery) {
          emptyState.textContent = `No saved posts match “${rawQuery}”. Clear your search.`;
        } else if (rawQuery) {
          emptyState.textContent = `No matches for “${rawQuery}”. Try a different search.`;
        } else if (filter && filter !== 'all') {
          emptyState.textContent = `No posts in “${filter}” yet. Try another category.`;
        } else {
          emptyState.textContent = 'No matches yet. Try a different search, or save a post then use the Saved filter.';
        }
        emptyState.style.display = '';
      } else {
        emptyState.style.display = 'none';
      }
    }
  }

  function hydrateBookmarks() {
    const bookmarks = new Set(getBookmarks());
    bookmarkBtns.forEach((btn) => {
      const key = btn.getAttribute('data-bookmark');
      const saved = key && bookmarks.has(key);
      btn.classList.toggle('saved', Boolean(saved));
      btn.textContent = saved ? '✅' : '🔖';
    });
  }

  function bindBookmarkButtons() {
    bookmarkBtns.forEach((btn) => {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-bookmark');
        if (!key) return;
        const current = getBookmarks();
        const set = new Set(current);
        if (set.has(key)) {
          set.delete(key);
          showToast('Removed from saved.');
        } else {
          set.add(key);
          showToast('Saved.');
        }
        setBookmarks(Array.from(set));
        hydrateBookmarks();
        updateSavedChipState();
        if (getActiveFilter() === 'saved' && getBookmarks().length === 0) {
          activateFilterChip(getChipByFilter('all'));
        }
        applyContentFilters();
      });
    });
  }

  function categoryEmoji(category) {
    const key = normalize(category);
    if (key === 'mind mechanics') return '🧠';
    if (key === 'daily architecture') return '🏗️';
    if (key === 'energy shift') return '🌟';
    if (key === 'shadow & light') return '🌓';
    if (key === 'the becoming') return '🦋';
    if (key === 'grounded & present') return '🌿';
    if (key === 'the big why') return '🎯';
    return '✦';
  }

  function parseIsoDateLocal(iso) {
    const raw = String(iso || '').trim();
    const parts = raw.split('-').map((v) => Number(v));
    if (parts.length !== 3) return null;
    const [yyyy, mm, dd] = parts;
    if (!yyyy || !mm || !dd) return null;
    const dt = new Date(yyyy, mm - 1, dd);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  function isPublished(iso) {
    const dt = parseIsoDateLocal(iso);
    if (!dt) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dt.getTime() <= today.getTime();
  }

  function formatHomepageDate(iso) {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return String(iso || '');
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderHomepageFromPosts(posts) {
    const contentGrid = document.querySelector('.content-grid');
    const latestFeed = document.querySelector('.latest-posts-feed');
    if (!contentGrid && !latestFeed) return;

    const safePosts = Array.isArray(posts) ? posts.filter(Boolean) : [];
    if (safePosts.length === 0) return;

    const published = safePosts.filter((p) => isPublished(p?.date));
    if (published.length === 0) return;

    if (contentGrid) {
      const featured = published.filter((p) => p.homepageFeatured);
      const rest = published.filter((p) => !p.homepageFeatured);
      const ordered = [...featured, ...rest];

      contentGrid.innerHTML = '';

      ordered.forEach((p, idx) => {
        const card = document.createElement('article');
        card.className = idx === 0 ? 'content-card featured' : 'content-card';
        card.setAttribute('data-category', normalize(p.category));
        card.setAttribute('data-title', p.title);
        if (p.bookmark) card.setAttribute('data-bookmark', p.bookmark);

        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.type = 'button';
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.setAttribute('aria-label', 'Save this post');
        if (p.bookmark) bookmarkBtn.setAttribute('data-bookmark', p.bookmark);
        bookmarkBtn.textContent = '🔖';
        card.appendChild(bookmarkBtn);

        if (p.premium) {
          const badge = document.createElement('div');
          badge.className = 'card-badge';
          badge.textContent = 'Premium';
          card.appendChild(badge);
        }

        const cardImage = document.createElement('div');
        cardImage.className = 'card-image';
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = categoryEmoji(p.category);
        cardImage.appendChild(placeholder);
        card.appendChild(cardImage);

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = p.title;
        content.appendChild(title);

        const excerpt = document.createElement('p');
        excerpt.className = 'card-excerpt';
        excerpt.textContent = p.excerpt;
        content.appendChild(excerpt);

        const meta = document.createElement('div');
        meta.className = 'card-meta';

        const cat = document.createElement('span');
        cat.className = 'category';
        cat.textContent = p.category;

        const rt = document.createElement('span');
        rt.className = 'read-time';
        rt.textContent = p.readTime;

        meta.appendChild(cat);
        meta.appendChild(rt);
        content.appendChild(meta);

        const link = document.createElement('a');
        link.className = 'read-more';
        link.href = p.slug;
        link.textContent = 'Read More →';
        content.appendChild(link);

        card.appendChild(content);
        contentGrid.appendChild(card);
      });
    }

    if (latestFeed) {
      const latest = published
        .filter((p) => p.homepageLatest)
        .slice()
        .sort((a, b) => {
          const aDt = parseIsoDateLocal(a?.date);
          const bDt = parseIsoDateLocal(b?.date);
          const aTime = aDt ? aDt.getTime() : new Date(a?.date || 0).getTime();
          const bTime = bDt ? bDt.getTime() : new Date(b?.date || 0).getTime();
          return bTime - aTime;
        });

      if (latest.length > 0) {
        latestFeed.innerHTML = '';
        latest.forEach((p) => {
          const item = document.createElement('article');
          item.className = 'latest-post';

          const meta = document.createElement('div');
          meta.className = 'post-meta';

          const time = document.createElement('time');
          time.className = 'post-date';
          time.dateTime = p.date;
          time.textContent = formatHomepageDate(p.date);

          const cat = document.createElement('span');
          cat.className = 'post-category';
          cat.textContent = p.category;

          meta.appendChild(time);
          meta.appendChild(cat);

          const title = document.createElement('h3');
          title.className = 'post-title';
          const titleLink = document.createElement('a');
          titleLink.href = p.slug;
          titleLink.textContent = p.title;
          title.appendChild(titleLink);

          const excerpt = document.createElement('p');
          excerpt.className = 'post-excerpt';
          excerpt.textContent = p.excerpt;

          const more = document.createElement('a');
          more.href = p.slug;
          more.className = 'read-more';
          more.setAttribute('aria-label', `Read: ${p.title}`);
          more.textContent = 'Read →';

          item.appendChild(meta);
          item.appendChild(title);
          item.appendChild(excerpt);
          item.appendChild(more);

          latestFeed.appendChild(item);
        });
      }
    }

    refreshContentDom();
    bindBookmarkButtons();
    hydrateBookmarks();
    updateSavedChipState();
    applyContentFilters();
  }

  function initHomepagePosts() {
    const hasContent = Boolean(document.querySelector('.content-grid'));
    const hasLatest = Boolean(document.querySelector('.latest-posts-feed'));
    if (!hasContent && !hasLatest) return;

    fetch('posts.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load posts.json');
        return res.json();
      })
      .then((posts) => {
        renderHomepageFromPosts(posts);
        renderContinueReading(posts);
      })
      .catch(() => {
        return;
      });
  }

  function renderContinueReading(posts) {
    const latestSection = document.getElementById('latest');
    if (!latestSection) return;

    const lastRead = getLastRead();
    if (!lastRead || !lastRead.slug) return;

    const match = Array.isArray(posts) ? posts.find((p) => p && p.slug === lastRead.slug) : null;
    if (!match) return;
    if (!isPublished(match.date)) return;

    const header = latestSection.querySelector('.section-header');
    if (!header) return;
    if (latestSection.querySelector('.continue-reading')) return;

    const card = document.createElement('div');
    card.className = 'continue-reading';

    const kicker = document.createElement('p');
    kicker.className = 'continue-kicker';
    kicker.textContent = 'Continue reading';

    const title = document.createElement('h3');
    title.className = 'continue-title';
    const titleLink = document.createElement('a');
    titleLink.href = match.slug;
    titleLink.textContent = match.title;
    title.appendChild(titleLink);

    const meta = document.createElement('p');
    meta.className = 'continue-meta';
    meta.textContent = `${match.category} • ${match.readTime}`;

    const track = document.createElement('div');
    track.className = 'continue-progress';
    const fill = document.createElement('div');
    fill.className = 'continue-progress-fill';
    const pct = Math.max(0, Math.min(100, Number(lastRead.progress || 0)));
    fill.style.width = `${pct}%`;
    track.appendChild(fill);

    const cta = document.createElement('a');
    cta.className = 'continue-cta';
    cta.href = match.slug;
    cta.textContent = 'Pick up where you left off →';

    card.appendChild(kicker);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(track);
    card.appendChild(cta);

    header.insertAdjacentElement('afterend', card);
  }

  if (contentSearch) {
    contentSearch.addEventListener('input', () => {
      applyContentFilters();
    });

    contentSearch.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      contentSearch.value = '';
      applyContentFilters();
    });
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.getAttribute('aria-disabled') === 'true') {
        showToast('No saved posts yet. Save one first.');
        return;
      }
      activateFilterChip(chip);
      applyContentFilters();
    });
  });

  document.querySelectorAll('a[data-filter-target]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const filterValue = link.getAttribute('data-filter-target');
      const chip = getChipByFilter(filterValue);
      if (!chip) return;

      e.preventDefault();

      if (contentSearch) contentSearch.value = '';
      activateFilterChip(chip);
      applyContentFilters();

      const contentSection = document.getElementById('content');
      if (contentSection) {
        scrollToWithOffset(contentSection);
      } else {
        window.location.hash = 'content';
      }
    });
  });

  bindBookmarkButtons();
  initHomepagePosts();

  hydrateBookmarks();
  updateSavedChipState();
  applyContentFilters();

  function initMysteryAuthor() {
    const postMeta = document.querySelector('.post-header .post-meta');
    if (!postMeta) return;
    if (postMeta.querySelector('.post-author')) return;

    const author = document.createElement('span');
    author.className = 'post-author';
    author.textContent = 'By the Girl Behind Girly Being';
    postMeta.appendChild(author);
  }

  function formatShortDate(iso) {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return String(iso || '');
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getCurrentSlug() {
    const path = window.location.pathname || '';
    const file = path.split('/').filter(Boolean).pop() || '';
    if (!file.endsWith('.html')) return null;
    return file;
  }

  function sortPostsByDateDesc(posts) {
    return posts
      .slice()
      .sort((a, b) => {
        const aDt = parseIsoDateLocal(a?.date);
        const bDt = parseIsoDateLocal(b?.date);
        const aTime = aDt ? aDt.getTime() : new Date(a?.date || 0).getTime();
        const bTime = bDt ? bDt.getTime() : new Date(b?.date || 0).getTime();
        return bTime - aTime;
      });
  }

  function initReadNext() {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    const currentSlug = getCurrentSlug();
    if (!currentSlug) return;

    fetch('posts.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load posts.json');
        return res.json();
      })
      .then((posts) => {
        if (!Array.isArray(posts) || posts.length === 0) return;

        const published = posts.filter((p) => p && isPublished(p.date));

        const current = posts.find((p) => p && p.slug === currentSlug);
        if (!current) return;

        const currentCategory = normalize(current.category);
        let candidates = published.filter(
          (p) => p && p.slug !== currentSlug && normalize(p.category) === currentCategory
        );

        candidates = sortPostsByDateDesc(candidates);
        if (candidates.length === 0) {
          candidates = sortPostsByDateDesc(published.filter((p) => p && p.slug !== currentSlug));
        }

        const picks = candidates.slice(0, 3);
        if (picks.length === 0) return;

        const section = document.createElement('section');
        section.className = 'post-section read-next';

        const heading = document.createElement('h2');
        heading.textContent = 'Read next';
        section.appendChild(heading);

        const subtitle = document.createElement('p');
        subtitle.className = 'read-next-subtitle';
        subtitle.textContent = 'More like this — because you’re on a roll.';
        section.appendChild(subtitle);

        const feed = document.createElement('div');
        feed.className = 'latest-posts-feed';
        feed.setAttribute('aria-label', 'Read next recommendations');

        picks.forEach((p) => {
          const item = document.createElement('article');
          item.className = 'latest-post';

          const meta = document.createElement('div');
          meta.className = 'post-meta';

          const time = document.createElement('time');
          time.className = 'post-date';
          time.dateTime = p.date;
          time.textContent = formatShortDate(p.date);

          const cat = document.createElement('span');
          cat.className = 'post-category';
          cat.textContent = p.category;

          meta.appendChild(time);
          meta.appendChild(cat);

          const title = document.createElement('h3');
          title.className = 'post-title';
          const titleLink = document.createElement('a');
          titleLink.href = p.slug;
          titleLink.textContent = p.title;
          title.appendChild(titleLink);

          const excerpt = document.createElement('p');
          excerpt.className = 'post-excerpt';
          excerpt.textContent = p.excerpt;

          const more = document.createElement('a');
          more.className = 'read-more';
          more.href = p.slug;
          more.textContent = 'Read →';

          item.appendChild(meta);
          item.appendChild(title);
          item.appendChild(excerpt);
          item.appendChild(more);
          feed.appendChild(item);
        });

        section.appendChild(feed);

        const note = document.createElement('p');
        note.className = 'read-next-note';
        note.innerHTML = 'Want one calm, high-signal note a month? <a href="#newsletter">Subscribe to It’s a Girl Thing →</a>';
        section.appendChild(note);

        if (current.bookmark) {
          const saveBtn = document.createElement('button');
          saveBtn.type = 'button';
          saveBtn.className = 'save-post-btn';
          saveBtn.setAttribute('data-bookmark', current.bookmark);

          const syncSaveLabel = () => {
            const set = new Set(getBookmarks());
            const saved = set.has(current.bookmark);
            saveBtn.textContent = saved ? 'Saved ✓' : 'Save this post';
            saveBtn.classList.toggle('saved', saved);
          };

          saveBtn.addEventListener('click', () => {
            const currentSet = new Set(getBookmarks());
            if (currentSet.has(current.bookmark)) {
              currentSet.delete(current.bookmark);
              showToast('Removed from saved.');
            } else {
              currentSet.add(current.bookmark);
              showToast('Saved.');
            }
            setBookmarks(Array.from(currentSet));
            hydrateBookmarks();
            updateSavedChipState();
            syncSaveLabel();
          });

          syncSaveLabel();
          section.appendChild(saveBtn);
        }

        const back = document.createElement('a');
        back.className = 'read-more';
        back.href = 'index.html#content';
        back.textContent = 'Back to all posts →';
        section.appendChild(back);

        postContainer.appendChild(section);

        section.querySelectorAll('a[href^="#"]').forEach((a) => {
          a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            scrollToWithOffset(target);
          });
        });
      })
      .catch(() => {
        return;
      });
  }

  initReadNext();
  initMysteryAuthor();

  function initReadingProgress() {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    const slug = getCurrentSlug();
    if (!slug) return;

    if (document.querySelector('.reading-progress')) return;
    const barWrap = document.createElement('div');
    barWrap.className = 'reading-progress';
    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    barWrap.appendChild(bar);
    document.body.appendChild(barWrap);

    const getProgress = () => {
      const rect = postContainer.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const top = rect.top + scrollTop;
      const height = postContainer.offsetHeight;
      const viewport = window.innerHeight || 1;
      const max = Math.max(1, height - viewport);
      const raw = (scrollTop - top) / max;
      const pct = Math.max(0, Math.min(1, raw));
      return pct;
    };

    let ticking = false;
    let lastSavedAt = 0;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const pct = getProgress();
        bar.style.transform = `scaleX(${pct})`;

        const now = Date.now();
        if (now - lastSavedAt > 1200) {
          lastSavedAt = now;
          setLastRead({ slug, progress: Math.round(pct * 100), updatedAt: now });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  initReadingProgress();

  // Scroll reveal (world-class dynamic polish)
  function initScrollReveal() {
    const targets = Array.from(
      document.querySelectorAll(
        '.content-card, .category-card, .spotlight-card, .journal-card, .template-card, .section-header'
      )
    );

    if (targets.length === 0) return;

    targets.forEach((el) => {
      el.classList.add('reveal-on-scroll');
    });

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => obs.observe(el));
  }

  initScrollReveal();

  function dayKey(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatSavedLabel(iso) {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return 'Saved';
    const hrs = String(dt.getHours()).padStart(2, '0');
    const mins = String(dt.getMinutes()).padStart(2, '0');
    return `Saved ${hrs}:${mins}`;
  }

  function setStatus(text) {
    if (!els.status) return;
    const next = String(text || '');
    els.status.textContent = next;
    els.status.classList.toggle('show', Boolean(next));
  }

  function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    return (
      parsed ?? {
        mood: null,
        promptIndex: 0,
        focus: '',
        friction: '',
        reframe: '',
        entry: '',
        lastSavedAt: null,
        lastSavedDay: null,
        streak: 0,
      }
    );
  }

  function saveState(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function applyMood(mood) {
    els.moodPills.forEach((btn) => {
      const isActive = Number(btn.dataset.mood) === Number(mood);
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function setPrompt(index) {
    const idx = ((index % prompts.length) + prompts.length) % prompts.length;
    if (els.promptText) els.promptText.textContent = prompts[idx];
    return idx;
  }

  function computeNextStreak(prevState) {
    const today = dayKey();
    const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

    if (prevState.lastSavedDay === today) {
      return prevState.streak || 1;
    }

    if (prevState.lastSavedDay === yesterday) {
      return (prevState.streak || 0) + 1;
    }

    return 1;
  }

  function hydrate() {
    const state = getState();

    applyMood(state.mood);
    const idx = setPrompt(state.promptIndex ?? 0);

    if (els.focus) els.focus.value = state.focus ?? '';
    if (els.friction) els.friction.value = state.friction ?? '';
    if (els.reframe) els.reframe.value = state.reframe ?? '';
    if (els.entry) els.entry.value = state.entry ?? '';

    if (els.savedLabel) {
      els.savedLabel.textContent = state.lastSavedAt ? formatSavedLabel(state.lastSavedAt) : 'Not saved yet';
    }

    if (els.streak) {
      els.streak.textContent = String(state.streak ?? 0);
    }

    saveState({ ...state, promptIndex: idx });
  }

  function collectDraft() {
    const state = getState();
    return {
      ...state,
      focus: els.focus ? els.focus.value.trim() : '',
      friction: els.friction ? els.friction.value.trim() : '',
      reframe: els.reframe ? els.reframe.value.trim() : '',
      entry: els.entry ? els.entry.value : '',
    };
  }

  function persistDraftSilently() {
    const draft = collectDraft();
    saveState(draft);
  }

  const hasJournal = Boolean(els.entry && els.saveBtn && els.promptText);

  if (hasJournal) {
    // Mood selection
    els.moodPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mood = Number(btn.dataset.mood);
        const state = getState();
        const next = { ...state, mood };
        saveState(next);
        applyMood(mood);
        setStatus('Energy updated.');
        window.setTimeout(() => setStatus(''), 1200);
      });
    });

    // Prompt rotation
    if (els.newPromptBtn) {
      els.newPromptBtn.addEventListener('click', () => {
        const state = getState();
        const nextIndex = setPrompt((state.promptIndex ?? 0) + 1);
        saveState({ ...state, promptIndex: nextIndex });
        setStatus('New prompt loaded.');
        window.setTimeout(() => setStatus(''), 1200);
      });
    }

    // Templates
    els.templateBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled || !getIsMember()) {
          showToast('Unlock the Journal Hub to use templates.');
          return;
        }

        const key = btn.getAttribute('data-template');
        const tpl = key ? templates[key] : null;
        if (!tpl) {
          showToast('Template not found.');
          return;
        }

        if (els.focus) els.focus.value = tpl.focus || '';
        if (els.friction) els.friction.value = tpl.friction || '';
        if (els.reframe) els.reframe.value = tpl.reframe || '';
        if (els.entry) els.entry.value = tpl.entry || '';

        persistDraftSilently();
        setStatus('Template loaded.');
        window.setTimeout(() => setStatus(''), 1500);
      });
    });

    // Save
    if (els.saveBtn) {
      els.saveBtn.addEventListener('click', () => {
        const prev = getState();
        const now = nowIso();
        const today = dayKey();
        const streak = computeNextStreak(prev);

        const next = {
          ...collectDraft(),
          lastSavedAt: now,
          lastSavedDay: today,
          streak,
        };

        saveState(next);

        if (els.savedLabel) els.savedLabel.textContent = formatSavedLabel(now);
        if (els.streak) els.streak.textContent = String(streak);

        setStatus('Saved. You showed up. That counts.');
        window.setTimeout(() => setStatus(''), 1800);
      });
    }

    // Clear
    if (els.clearBtn) {
      els.clearBtn.addEventListener('click', () => {
        if (els.focus) els.focus.value = '';
        if (els.friction) els.friction.value = '';
        if (els.reframe) els.reframe.value = '';
        if (els.entry) els.entry.value = '';

        const state = getState();
        const next = { ...state, focus: '', friction: '', reframe: '', entry: '' };
        saveState(next);

        setStatus('Cleared. Start clean.');
        window.setTimeout(() => setStatus(''), 1200);
      });
    }

    // Autosave draft on input (no "Saved" label; just keep progress)
    const draftInputs = [els.focus, els.friction, els.reframe, els.entry].filter(Boolean);
    let autosaveTimer = null;
    draftInputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (autosaveTimer) window.clearTimeout(autosaveTimer);
        autosaveTimer = window.setTimeout(() => {
          persistDraftSilently();
        }, 300);
      });
    });

    hydrate();
  }

  // Smooth-scroll for internal anchor links (accounts for fixed header)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollToWithOffset(target);
    });
  });

  // Newsletter UX (front-end only)
  newsletterForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"]');

      let statusEl = form.querySelector('.newsletter-status');
      if (!statusEl && form.parentElement) {
        statusEl = form.parentElement.querySelector('.newsletter-status');
      }
      if (!statusEl) {
        statusEl = document.createElement('p');
        statusEl.className = 'newsletter-status';
        statusEl.setAttribute('aria-live', 'polite');
        form.insertAdjacentElement('afterend', statusEl);
      }

      const isValid = emailInput && typeof emailInput.checkValidity === 'function' ? emailInput.checkValidity() : true;
      if (emailInput && typeof emailInput.reportValidity === 'function') emailInput.reportValidity();

      if (!isValid) {
        statusEl.textContent = 'Please enter a valid email.';
        return;
      }

      statusEl.textContent = 'Thanks! It’s a Girl Thing is launching soon. For now, email hello@girlybeing.com and we’ll add you manually.';
      if (emailInput) emailInput.value = '';
    });
  });

  function onScroll() {
    updateHeaderState();
    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
