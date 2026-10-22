/* ================================================================
   UNIBROTHERS — script.js
   Vanilla JS — no dependencies
   ================================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCookie();
  initHeader();
  initHero();
  initStats();
  initProductTabs();
  initBrands();
  initNews();
  initArticles();
  initPress();
  initContact();
  initBackToTop();
  initReveal();
  initPathwayAnimation();
  initActiveNav();
  initSmoothScroll();
});

/* ================================================================
   COOKIE BANNER
   ================================================================ */
function initCookie() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (sessionStorage.getItem('ub_cookie')) {
    banner.classList.add('hidden');
  }
}

function closeCookie() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.classList.add('hidden');
  sessionStorage.setItem('ub_cookie', '1');
}

// Expose globally for onclick attributes
window.closeCookie = closeCookie;

/* ================================================================
   HEADER — scroll effect + hamburger
   ================================================================ */
function initHeader() {
  const header    = document.getElementById('siteHeader');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  if (!header) return;

  /* ── Set --header-h CSS variable so hero padding-top is always exact ── */
  const setHeaderHeight = () => {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  // Run immediately, then again after fonts/images settle
  setHeaderHeight();
  window.addEventListener('load', setHeaderHeight);
  window.addEventListener('resize', setHeaderHeight, { passive: true });

  const applyScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    // Re-measure on scroll too — height changes when utility bar is hidden on mobile
    setHeaderHeight();
  };
  window.addEventListener('scroll', applyScroll, { passive: true });
  applyScroll();

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      navMobile.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', e => {
      if (!header.contains(e.target) && navMobile.classList.contains('open')) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ================================================================
   HERO SLIDER — auto, dots, arrows, swipe, keyboard
   ================================================================ */
function initHero() {
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  const INTERVAL = 6500;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  dots.forEach(d => {
    d.addEventListener('click', () => { goTo(Number(d.dataset.index)); startAuto(); });
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
  });

  // Touch swipe
  const hero = document.querySelector('.hero');
  if (hero) {
    let touchStartX = 0;
    hero.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
}

/* ================================================================
   STATS COUNTER — IntersectionObserver
   ================================================================ */
function initStats() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  if (!nums.length) return;

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2200;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => obs.observe(n));
}

/* ================================================================
   PRODUCT TABS
   ================================================================ */
function initProductTabs() {
  const tabs   = document.querySelectorAll('.ptab');
  const panels = document.querySelectorAll('.prod-panel');
  if (!tabs.length) return;

  function showTab(key) {
    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === key);
      t.setAttribute('aria-selected', String(t.dataset.tab === key));
    });
    panels.forEach(p => {
      const matches = (key === 'all') || (p.dataset.panel === key);
      p.classList.toggle('active', matches);
    });
  }

  // Show all panels initially
  showTab('all');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });
}

/* ================================================================
   BRANDS DATA + RENDER + FILTER
   — All images mapped to real product photos from images/products/
   ================================================================ */
const BRANDS = [
  // ── Hair, Beauty & Personal Care (HC) ──────────────────────────
  { name: 'Swisse Men\'s Hair Growth',    cat: 'personal', img: 'images/products/p03.jpeg' },
  { name: 'Hair Amla',                    cat: 'personal', img: 'images/products/p11.jpeg' },
  { name: 'Finnish Hair Butter Spa',      cat: 'personal', img: 'images/products/p01.jpeg' },
  { name: 'Black & Brown Shampoo',        cat: 'personal', img: 'images/products/p23.jpeg' },
  { name: 'Women Hair Removal Cream',     cat: 'personal', img: 'images/products/p33.jpeg' },
  { name: 'Men Hair Removal Cream',       cat: 'personal', img: 'images/products/p35.jpeg' },
  { name: 'Hair Removal Spray',           cat: 'personal', img: 'images/products/p36.jpeg' },
  { name: 'Finch Beauty Bar',             cat: 'personal', img: 'images/products/p19.jpeg' },
  { name: 'Finch Body Cream',             cat: 'personal', img: 'images/products/p22.jpeg' },
  { name: 'Finch Body Lotion',            cat: 'personal', img: 'images/products/p20.jpeg' },
  { name: 'Finch Beauty Cream',           cat: 'personal', img: 'images/products/p21.jpeg' },
  { name: 'Finch Green Beauty Bar',       cat: 'personal', img: 'images/products/p25.jpeg' },
  // ── Home, Laundry & Hygiene (HH) ───────────────────────────────
  { name: 'Surf Active Laundry',          cat: 'home',     img: 'images/products/p47.jpeg' },
  { name: 'Brite Washing Powder',         cat: 'home',     img: 'images/products/p43.jpeg' },
  { name: 'Original Antibacterial Soap',  cat: 'home',     img: 'images/products/p15.jpeg' },
  { name: 'Cool Antibacterial Soap',      cat: 'home',     img: 'images/products/p16.jpeg' },
  { name: 'Fresh Antibacterial Soap',     cat: 'home',     img: 'images/products/p17.jpeg' },
  { name: 'Antiseptic Liquid',            cat: 'home',     img: 'images/products/p18.jpeg' },
  { name: 'Hand Sanitizer Range',         cat: 'home',     img: 'images/products/p41.jpeg' },
  { name: 'Liquid Hand Wash',             cat: 'home',     img: 'images/products/p46.jpeg' },
  { name: 'Surface Cleaner',              cat: 'home',     img: 'images/products/p50.jpeg' },
  { name: 'Family Tissue Range',          cat: 'home',     img: 'images/products/p51.jpeg' },
  { name: 'Premium Box Tissues',          cat: 'home',     img: 'images/products/p52.jpeg' },
  { name: 'Maxi Roll Range',              cat: 'home',     img: 'images/products/p53.jpeg' },
  // ── Food & Natural Nutrition (FN) ──────────────────────────────
  { name: 'Blue Label Tea',               cat: 'food',     img: 'images/products/p27.jpeg' },
  { name: 'Premium Tea',                  cat: 'food',     img: 'images/products/p28.jpeg' },
  { name: 'Natural Honey (Laraib)',        cat: 'food',     img: 'images/products/p57.jpeg' },
  { name: 'Himalayan Pink Salt',          cat: 'food',     img: 'images/products/p39.jpeg' },
  { name: 'Daily Milk Range',             cat: 'food',     img: 'images/products/p56.jpeg' },
  { name: 'Nova Drinking Water',          cat: 'food',     img: 'images/products/p29.jpeg' },
  { name: 'YANG Fruit Drink',             cat: 'food',     img: 'images/products/p40.jpeg' },
  { name: 'Dairy Queen Chocolate',        cat: 'food',     img: 'images/products/p04.jpeg' },
  { name: 'Mesure Adult Nutrition',       cat: 'food',     img: 'images/products/p00.jpeg' },
  { name: 'Cooking Oil Family',           cat: 'food',     img: 'images/products/p65.jpeg' },
  { name: 'Corn Oil',                     cat: 'food',     img: 'images/products/p66.jpeg' },
  // ── Health & Nutrition for Toddlers (TN) ───────────────────────
  { name: 'Infant Stage 1 Formula',       cat: 'toddler',  img: 'images/products/p30.jpeg' },
  { name: 'Infant Stage 2 Formula',       cat: 'toddler',  img: 'images/products/p31.jpeg' },
  { name: 'Infant Stage 3 Formula',       cat: 'toddler',  img: 'images/products/p32.jpeg' },
  { name: 'Infant Stage 4 Milk',          cat: 'toddler',  img: 'images/products/p26.jpeg' },
  { name: 'Lactomax Stage 1',             cat: 'toddler',  img: 'images/products/p37.jpeg' },
  { name: 'Lactomax Stage 2',             cat: 'toddler',  img: 'images/products/p38.jpeg' },
  { name: 'Lactomax Stage 3',             cat: 'toddler',  img: 'images/products/p39.jpeg' },
  { name: 'Ultra-Thin Pads',              cat: 'toddler',  img: 'images/products/p44.jpeg' },
  { name: 'Baby Diapers',                 cat: 'toddler',  img: 'images/products/p48.jpeg' },
  { name: 'Baby Pants (Pull-Up)',         cat: 'toddler',  img: 'images/products/p55.jpeg' },
];

const CAT_LABELS = {
  personal: 'Hair & Beauty',
  home:     'Home & Hygiene',
  food:     'Food & Nutrition',
  toddler:  'Toddler & Baby',
};

/* ── How many cards to show per page ── */
const BRANDS_PER_PAGE = 12;

function initBrands() {
  const grid       = document.getElementById('brandsGrid');
  const loadMoreBtn = document.getElementById('brandsLoadMore');
  const showingEl  = document.getElementById('brandsShowing');
  if (!grid) return;

  /* ── 1. Render ALL cards into the DOM once ── */
  BRANDS.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.dataset.category = b.cat;
    card.dataset.index = String(i);
    card.innerHTML =
      '<div class="brand-img">' +
        '<img src="' + b.img + '" alt="' + b.name + '" loading="lazy"/>' +
      '</div>' +
      '<div class="brand-info">' +
        '<span class="brand-name">' + b.name + '</span>' +
        '<span class="brand-tag">' + CAT_LABELS[b.cat] + '</span>' +
      '</div>';
    grid.appendChild(card);
  });

  /* ── 2. Populate filter counts ── */
  const cats = ['all', 'personal', 'home', 'food', 'toddler'];
  cats.forEach(cat => {
    const el = document.getElementById('fc-' + cat);
    if (!el) return;
    const count = cat === 'all'
      ? BRANDS.length
      : BRANDS.filter(b => b.cat === cat).length;
    el.textContent = count;
  });

  /* ── 3. State ── */
  let activeFilter = 'all';
  let visibleCount = BRANDS_PER_PAGE;   // how many of the filtered set to show

  /* ── 4. Core render function ──
     Walks every card and decides:
       hidden    = filtered out (wrong category)
       lm-hidden = right category but beyond visibleCount
       (neither) = shown
  ── */
  function render() {
    const allCards = Array.from(grid.querySelectorAll('.brand-card'));

    /* Split into filtered-in vs filtered-out */
    const matchCards = allCards.filter(c =>
      activeFilter === 'all' || c.dataset.category === activeFilter
    );
    const noMatchCards = allCards.filter(c =>
      activeFilter !== 'all' && c.dataset.category !== activeFilter
    );

    /* Hide filtered-out cards immediately */
    noMatchCards.forEach(c => {
      c.classList.add('hidden');
      c.classList.remove('lm-hidden');
    });

    /* Show / page matched cards */
    matchCards.forEach((c, i) => {
      c.classList.remove('hidden');
      if (i < visibleCount) {
        c.classList.remove('lm-hidden');
      } else {
        c.classList.add('lm-hidden');
      }
    });

    /* Update meta label */
    const showing = Math.min(visibleCount, matchCards.length);
    const total   = matchCards.length;
    if (showingEl) {
      showingEl.textContent =
        'Showing ' + showing + ' of ' + total + ' products';
    }

    /* Update load-more button */
    if (loadMoreBtn) {
      if (showing >= total) {
        loadMoreBtn.classList.add('all-loaded');
      } else {
        loadMoreBtn.classList.remove('all-loaded');
        const remaining = total - showing;
        const nextBatch = Math.min(remaining, BRANDS_PER_PAGE);
        loadMoreBtn.querySelector('.lm-text').textContent =
          'Show ' + nextBatch + ' More Products';
      }
    }
  }

  /* ── 5. Filter buttons ── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.filter === activeFilter) return; // no-op if already active

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeFilter = btn.dataset.filter;
      visibleCount = BRANDS_PER_PAGE;  // reset pagination on filter change
      render();

      /* Smooth scroll back to filter bar so user sees results from top */
      const filtersEl = document.querySelector('.brand-filters');
      if (filtersEl) {
        const headerH = document.getElementById('siteHeader')?.offsetHeight || 68;
        const top = filtersEl.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 6. Load-more button ── */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += BRANDS_PER_PAGE;
      render();
    });
  }

  /* ── 7. Initial render ── */
  render();
}

/* ================================================================
   NEWS DATA + RENDER
   ================================================================ */
const NEWS = [
  {
    title:   'Unibrothers Expands Product Portfolio to 300+ FMCG Lines',
    date:    'October 15, 2025',
    excerpt: 'Unibrothers Pakistan announces the expansion of its consumer goods portfolio, now spanning 300+ products across four core categories managed through World Trade Solutions.',
    img:     'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=70',
  },
  {
    title:   'Lactomax Toddler Nutrition Range Receives Quality Certification',
    date:    'September 18, 2025',
    excerpt: 'The Lactomax infant and toddler nutrition range (Stages 1–3) has completed full quality and safety review, reinforcing Unibrothers\' commitment to responsible product stewardship.',
    img:     'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=70',
  },
  {
    title:   'World Trade Solutions Strengthens Distribution Across Pakistan',
    date:    'August 10, 2025',
    excerpt: 'Unibrothers\' trade partner World Trade Solutions expands its distribution capability, ensuring faster reach for all four product categories nationwide.',
    img:     'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=70',
  },
  {
    title:   'Finch Personal Care Brand Launches Green Beauty Bar Range',
    date:    'July 28, 2025',
    excerpt: 'Finch, Unibrothers\' personal care brand, introduces its Green Beauty Bar — a natural-formula cleansing bar designed for sensitive skin.',
    img:     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=70',
  },
  {
    title:   'Nova Drinking Water and YANG Fruit Drink Added to FN Category',
    date:    'June 14, 2025',
    excerpt: 'Two new additions to the Food & Natural Nutrition category — Nova packaged drinking water and YANG Fruit Drink — complete the beverages sub-portfolio.',
    img:     'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=70',
  },
  {
    title:   'Unibrothers Launches Responsible Product Communication Policy',
    date:    'May 3, 2025',
    excerpt: 'A new stewardship policy ensures all product claims, labels and consumer communications meet the highest standards of accuracy and transparency.',
    img:     'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=70',
  },
];

function renderNewsCards(data, containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card reveal-up';
    card.innerHTML = `
      <div class="nc-img">
        <img src="${item.img}" alt="${item.title}" loading="lazy"/>
      </div>
      <div class="nc-body">
        <span class="nc-date">${item.date}</span>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
        <a href="#" class="nc-read">Read more →</a>
      </div>`;
    grid.appendChild(card);
  });
}

function initNews() {
  renderNewsCards(NEWS, 'newsGrid');
}

/* ================================================================
   ARTICLES DATA + RENDER
   ================================================================ */
const ARTICLES = [
  {
    featured: true,
    eyebrow:  'Product Development',
    title:    'From Consumer Need to Market: Inside the Unibrothers Product Pathway',
    excerpt:  'An in-depth look at how Unibrothers moves a product from the initial Consumer Need (CN) definition through Product Development (PD), Quality &amp; Compliance (QC) and ultimately to Launch &amp; Monitoring (LM) — and why this disciplined process matters.',
    date:     '14 October 2025',
    readTime: '8 min read',
    img:      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=75',
  },
  {
    eyebrow:  'Trade',
    title:    'How World Trade Solutions Is Reshaping FMCG Distribution in Pakistan',
    excerpt:  'An inside look at how Unibrothers\' commercial partner, World Trade Solutions, is building a more resilient, efficient distribution network across Pakistan\'s growing FMCG market.',
    date:     '11 September 2025',
    readTime: '5 min read',
    img:      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=75',
  },
  {
    eyebrow:  'Stewardship',
    title:    'Claims Governance: Why Every Unibrothers Product Claim is Evidence-Based',
    excerpt:  'Our claims governance process ensures no product reaches market with unsubstantiated benefits. Here\'s how our quality governance team reviews and approves every statement before consumer use.',
    date:     '7 September 2025',
    readTime: '6 min read',
    img:      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75',
  },
  {
    eyebrow:  'Nutrition',
    title:    'Lactomax: Building a Complete Infant Nutrition Range for Pakistani Families',
    excerpt:  'How Unibrothers developed the Lactomax toddler nutrition range — covering Stages 1, 2 and 3 — to meet the specific nutritional needs of infants and growing-up children across Pakistan.',
    date:     '26 August 2025',
    readTime: '7 min read',
    img:      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=75',
  },
  {
    eyebrow:  'Global Reach',
    title:    'UK Head Office to Pakistan Operations: Unibrothers\' Cross-Border Capability',
    excerpt:  'How a London-based global head office connects international product development capability to the Rawalpindi operations team — and why this bridge creates a stronger offer for Pakistani consumers.',
    date:     '22 July 2025',
    readTime: '4 min read',
    img:      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=75',
  },
];

function initArticles() {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  ARTICLES.forEach(a => {
    const card = document.createElement('div');
    card.className = a.featured ? 'article-card featured reveal-up' : 'article-card reveal-up';
    card.innerHTML = `
      <div class="ac-img">
        <img src="${a.img}" alt="${a.title}" loading="lazy"/>
      </div>
      <div class="ac-body">
        <span class="ac-eyebrow">${a.eyebrow}</span>
        <h3>${a.title}</h3>
        <p>${a.excerpt}</p>
        <div class="ac-meta"><span>📅 ${a.date}</span><span>⏱ ${a.readTime}</span></div>
        <a href="#" class="ac-read">Read article →</a>
      </div>`;
    grid.appendChild(card);
  });
}

/* ================================================================
   PRESS RELEASES DATA + RENDER
   ================================================================ */
const PRESS = [
  {
    date:    '15 Oct 2025',
    title:   'Unibrothers Pakistan Announces 300+ Product Portfolio Milestone',
    excerpt: 'Unibrothers Pakistan confirms its consumer goods portfolio has reached 300+ products organised across four core categories: HC, HH, FN and TN.',
  },
  {
    date:    '18 Sep 2025',
    title:   'Lactomax Infant Nutrition Range Achieves Full Quality Certification',
    excerpt: 'Lactomax Stages 1, 2 and 3 complete the Quality & Compliance (QC) pathway, meeting all safety and nutritional standards for infant and toddler nutrition.',
  },
  {
    date:    '28 Jul 2025',
    title:   'Finch Brand Launches Green Beauty Bar — Unibrothers\' Newest Personal Care Product',
    excerpt: 'Finch, the personal care brand under Unibrothers, officially introduces its Green Beauty Bar variant designed for sensitive-skin consumers across Pakistan.',
  },
  {
    date:    '14 Jun 2025',
    title:   'Nova Drinking Water and YANG Fruit Drink Join Unibrothers FN Portfolio',
    excerpt: 'Two beverages products — Nova packaged drinking water and YANG Fruit Drink — are added to the Food & Natural Nutrition (FN) category, completing the beverages range.',
  },
  {
    date:    '3 May 2025',
    title:   'Unibrothers Publishes Responsible Product Communication Policy',
    excerpt: 'As part of its Product Stewardship commitment, Unibrothers publishes a formal Responsible Product Communication policy covering all consumer-facing claims.',
  },
  {
    date:    '19 Mar 2025',
    title:   'World Trade Solutions Appointed as Official Distribution Partner for Unibrothers',
    excerpt: 'Unibrothers Pakistan confirms World Trade Solutions as its official commercial partner for all trade, wholesale and distribution activity across Pakistan.',
  },
  {
    date:    '7 Jan 2025',
    title:   'Unibrothers Opens Pakistan Operations at Rawat Industrial Estate, Rawalpindi',
    excerpt: 'Unibrothers Pakistan officially establishes its Pakistan operations at Plot No. 104, S Block, Rawat Industrial Estate, Rawalpindi, marking a significant milestone in the company\'s local expansion.',
  },
];

function initPress() {
  const list = document.getElementById('pressList');
  if (!list) return;
  PRESS.forEach(p => {
    const item = document.createElement('div');
    item.className = 'press-item reveal-up';
    item.innerHTML = `
      <span class="press-date">${p.date}</span>
      <div class="press-body">
        <h4>${p.title}</h4>
        <p>${p.excerpt}</p>
      </div>`;
    list.appendChild(item);
  });
}

/* ================================================================
   CONTACT FORM — fake submit with success message
   ================================================================ */
function initContact() {
  const form   = document.getElementById('contactForm');
  const formOk = document.getElementById('formOk');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e53e3e';
        valid = false;
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      form.reset();
      if (formOk) {
        formOk.style.display = 'flex';
        setTimeout(() => { formOk.style.display = 'none'; }, 6000);
      }
    }, 1600);
  });
}

/* ================================================================
   BACK TO TOP
   ================================================================ */
function initBackToTop() {
  const btn = document.getElementById('btt');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================================
   SCROLL REVEAL — IntersectionObserver
   ================================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay, 10) : 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ================================================================
   ACTIVE NAV — highlight current section
   ================================================================ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const links    = document.querySelectorAll('.nl');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        links.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === id) l.classList.add('active');
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
}

/* ================================================================
   SMOOTH SCROLL — offset for fixed header
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const header = document.getElementById('siteHeader');
      const headerH = header ? header.offsetHeight : 68;
      const offset = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}


/* ================================================================
   PATHWAY ANIMATION — sequential step reveal on scroll
   ================================================================ */
function initPathwayAnimation() {
  const stepsContainer = document.querySelector('.pathway-steps');
  const steps = document.querySelectorAll('.pw-step');
  if (!steps.length) return;

  let triggered = false;

  function runAnimation() {
    if (triggered) return;
    triggered = true;

    stepsContainer.classList.add('pw-animated');

    steps.forEach((step, i) => {
      setTimeout(() => {
        step.classList.add('pw-active');

        // Update the connector line progress
        const progress = Math.round(((i + 1) / steps.length) * 100);
        stepsContainer.style.setProperty('--pw-progress', progress + '%');
      }, i * 280); // stagger each step by 280ms
    });
  }

  // Trigger when the section scrolls into view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runAnimation();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  obs.observe(stepsContainer);
}
