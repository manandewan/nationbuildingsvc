/**
 * BUILDINGINDIA IMPACT CHAPTER • SRI VENKATESWARA COLLEGE (SVC)
 * Interactive Scripting: Navigation, Tabs, Modals & Data Bindings
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Toggle & Backdrop Handling
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  const navBackdrop = document.getElementById('navBackdrop');

  function setMobileNavState(open) {
    if (!mainNav || !mobileToggle) return;
    if (open) {
      mainNav.classList.add('open');
      mobileToggle.textContent = '✕';
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
      if (navBackdrop) navBackdrop.classList.add('active');
    } else {
      mainNav.classList.remove('open');
      mobileToggle.textContent = '☰';
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      if (navBackdrop) navBackdrop.classList.remove('active');
    }
  }

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('open');
      setMobileNavState(!isOpen);
    });

    // Close when clicking nav backdrop
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        setMobileNavState(false);
      });
    }

    // Close when nav links or drawer CTA are tapped
    mainNav.querySelectorAll('.nav-link, .nav-link-cta').forEach(link => {
      link.addEventListener('click', () => {
        setMobileNavState(false);
      });
    });
  }

  // 3. Multi-Tab Navigation Architecture & Deep Linking
  const validTabs = ['home', 'initiatives', 'canteen', 'structure', 'team', 'join'];
  const tabAliases = {
    'about': 'home',
    'pillars': 'home',
    'charter': 'initiatives',
    'pulses': 'initiatives',
    'menu': 'canteen',
    'canteen-guide': 'canteen',
    'governance': 'structure',
    'ecosystem': 'structure',
    'apply': 'join',
    'recruitment': 'join'
  };

  function switchTab(tabKey, updateHash = true) {
    if (!tabKey) return;
    const cleanKey = tabKey.replace(/^#/, '').toLowerCase();
    const resolvedTab = tabAliases[cleanKey] || cleanKey;
    const targetTab = validTabs.includes(resolvedTab) ? resolvedTab : 'home';

    // Toggle active view container
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(`view-${targetTab}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update navigation links active & aria state
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
      const linkTab = link.getAttribute('data-tab');
      if (linkTab === targetTab) {
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
      } else {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
      }
    });

    // Update URL hash without breaking history
    if (updateHash) {
      if (window.location.hash !== `#${targetTab}`) {
        window.history.pushState(null, '', `#${targetTab}`);
      }
    }

    // Smooth scroll to top of document
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if open
    setMobileNavState(false);
  }
  window.switchTab = switchTab;

  // Bind click handlers to all [data-tab] triggers (nav links, hero buttons, footer links, etc.)
  document.querySelectorAll('[data-tab]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = trigger.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Browser back/forward navigation support
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      switchTab(hash, false);
    } else {
      switchTab('home', false);
    }
  });

  // Initial tab resolution on direct load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    switchTab(initialHash, false);
  }

  // 4. Modal Architecture
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  const briefs = {
    talentUnbound: {
      title: "Project Talent Unbound",
      subtitle: "A BuildingIndia Impact Chapters Initiative • Sri Venkateswara College",
      content: `
        <h4>Executive Summary</h4>
        <p>Project Talent Unbound is designed to bridge systemic employment disparities faced by college students and alumni with physical, sensory, and neurocognitive disabilities (Persons with Benchmark Disabilities - PwBD).</p>
        <p>Piloted within the Sri Venkateswara College ecosystem over an 8-month timeframe, the project institutionalizes campus-based placement readiness, accessible recruitment channels, and sensitized employer partnerships aligned with India's <strong>Rights of Persons with Disabilities (RPwD) Act, 2016</strong>.</p>

        <h4>Guiding Challenge Question</h4>
        <blockquote style="border-left: 3px solid var(--c-flame); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #FFFFFF;">
          "How can we design and implement effective pathways within Sri Venkateswara College over the next eight months to create meaningful skilled work opportunities for students and alumni with varied physical, sensory, and neurocognitive disabilities?"
        </blockquote>

        <h4>Core Strategic Objectives</h4>
        <table class="modal-table">
          <thead>
            <tr><th>Strategic Pillar</th><th>Key Action</th><th>Expected Outcome</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>1. Enable Access</strong></td><td>Audit recruitment portals & drives</td><td>Inclusive, adaptive recruitment pipelines</td></tr>
            <tr><td><strong>2. Build Capability</strong></td><td>Curriculum & mentorship pairings</td><td>High-readiness candidate cohorts</td></tr>
            <tr><td><strong>3. Drive Sensitization</strong></td><td>Recruiter & faculty workshops</td><td>De-stigmatized, bias-free hiring</td></tr>
            <tr><td><strong>4. Facilitate Linkages</strong></td><td>Direct corporate connections</td><td>Placements with vetted inclusive firms</td></tr>
            <tr><td><strong>5. Institutionalize</strong></td><td>Placement cell policy integration</td><td>Sustainable annual placement system</td></tr>
          </tbody>
        </table>

        <h4>4-Phase Implementation Framework</h4>
        <ul>
          <li><strong>Phase 1: Discovery & Baseline (Months 1–2):</strong> Qualitative interviews with 30–50 PwBD students, placement ecosystem mapping, and metrics baseline dashboard.</li>
          <li><strong>Phase 2: Strategy Design (Months 3–5):</strong> Employability curriculum, recruiter segmentation (Champions, Willing, Skeptics), and the Inclusive Recruitment Toolkit.</li>
          <li><strong>Phase 3: Pilot & Validate (Months 6–7):</strong> Pilot cohort of 5–6 students with 5–8 inclusion-ready recruiters, mock drives, and proof of concept report.</li>
          <li><strong>Phase 4: Scale & Institutionalize (Month 8+):</strong> Expansion across the entire PwBD student body and integration into the annual SVC placement calendar.</li>
        </ul>

        <h4>Stakeholder & Institutional Linkages</h4>
        <p>Collaborative partnership integrating the <strong>SVC Placement Cell</strong>, <strong>Equal Opportunity Cell (EOC)</strong>, college administration, faculty mentors, and native programs like <strong>SRIVIPRA</strong> (faculty-led research internships).</p>
      `
    },
    vitality: {
      title: "Project Vitality",
      subtitle: "SVC Student Health Blueprint • A Delhi University Chapters Initiative",
      content: `
        <h4>Executive Summary</h4>
        <p>Project Vitality is a student-led, zero-budget health blueprint at Sri Venkateswara College addressing the neglect of physical and metabolic wellness caused by erratic college routines, poor food availability, and absence of biomarker tracking.</p>
        <p>The mission focuses on improving <strong>actual physiological biomarkers</strong> (cortisol, glucose, lipid profiles, and cardiovascular metrics) rather than superficial, "gym-bro" aesthetic culture.</p>

        <h4>The Three Realities & Feasibility Filters</h4>
        <ul>
          <li><strong>1. Zero Budget:</strong> 100% cashless operations; rewards and challenge incentives are sourced as coupons/promotions from local cafes and printing services.</li>
          <li><strong>2. Limited Volunteer Hours:</strong> Student volunteers balance full-time academic courses; all interventions are modular and low-maintenance.</li>
          <li><strong>3. Cultural Resistance:</strong> Traditional health advice is seen as preachy; initiatives employ humor, gamification, and digital-first delivery.</li>
        </ul>

        <h4>The Three Pillars of Action</h4>
        <table class="modal-table">
          <thead>
            <tr><th>Vertical</th><th>Core Focus</th><th>Selected Interventions</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Awareness</strong></td>
              <td>Low-barrier cognitive framing ("biohacking")</td>
              <td>Digital Canteen Guide, Mythbusters Series, Dorm Room Hacks Reels, Nutrition Decoders</td>
            </tr>
            <tr>
              <td><strong>Impact</strong></td>
              <td>Active behavioral conversion & bodily updates</td>
              <td>Canteen Condition Analysis, On-Campus Biomarker Health Camp, VenkyWalks Step Challenge, Impromptu Pop-up Challenges</td>
            </tr>
            <tr>
              <td><strong>Research</strong></td>
              <td>Empirical data & policy leverage</td>
              <td>Annual Health Census (sleep, diet, fatigue), PG Housing Diet Audits, Reference-based Food Estimates</td>
            </tr>
          </tbody>
        </table>

        <h4>Target Biomarkers</h4>
        <p>Cortisol (stress/recovery), Fasting Blood Glucose & HbA1c, Heart Rate Variability (HRV), Resting Blood Pressure, Lipid Profiles, and Micronutrients (Vitamin D3, B12, Iron/Hemoglobin).</p>

        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.12);">
          <a href="#canteen" class="btn btn-flame" onclick="window.closeModal(); window.switchTab('canteen'); return false;">Open Digital Canteen Guide →</a>
        </div>
      `
    },
    apply: {
      title: "Join BuildingIndia Impact Chapter SVC",
      subtitle: "Academic Year 2026–2027 Recruitment Cycle",
      content: `
        <h4>Who We Are Looking For</h4>
        <ul>
          <li><strong>Curious & Growth-Minded:</strong> Passionate about solving complex campus and societal problems, eager to learn, and ready to bring bold ideas.</li>
          <li><strong>Reliable & Committed:</strong> Dedicated team players who take complete ownership of deliverables and sustain active involvement throughout the tenure.</li>
        </ul>

        <h4>Available Positions</h4>
        <table class="modal-table">
          <thead>
            <tr><th>Tier</th><th>Target Cohort</th><th>Key Responsibilities</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Management Body</strong></td><td>Pre-Final Year Students</td><td>Initiative Coordinators (Standard, College, Marketing) leading execution teams.</td></tr>
            <tr><td><strong>General Body</strong></td><td>First & Pre-Final Year Students</td><td>Associates driving ground-level research, logistics, design, and outreach.</td></tr>
          </tbody>
        </table>

        <h4>3-Stage Selection Process</h4>
        <ol style="padding-left: 1.25rem; margin-bottom: 1.25rem;">
          <li><strong>Stage 01: Application Form:</strong> Submit your background, motivation statement, and project preferences.</li>
          <li><strong>Stage 02: Group Discussion:</strong> Collaborative problem-solving exercise evaluated by the Management Body.</li>
          <li><strong>Stage 03: Personal Interview:</strong> In-depth discussion on leadership, commitment, and role alignment.</li>
        </ol>

        <h4>Key Benefits for Members</h4>
        <ul>
          <li>Pre-Placement Interview (PPI) Opportunities with Nation with NaMo for standout performers.</li>
          <li>Official Letters of Recommendation (LORs) and national portfolio credentials.</li>
          <li>Direct mentorship from central Foundation leads and industry experts.</li>
          <li>Cross-chapter collaborations with chapters at IITs, BITS, and Delhi University colleges.</li>
        </ul>

        <div style="background: rgba(255, 255, 255, 0.05); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.10); border-left: 3px solid rgba(255, 255, 255, 0.4); margin-top: 1.5rem;">
          <strong style="color: #FFFFFF;">Application Status:</strong> <span style="color: var(--c-topaz);">Closed</span> (Cutoff was 11:59 PM, Sunday, 27th September, 2026).<br>
          <span style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.65);">Applications for this recruitment cycle are now complete. For future announcements or inquiries, connect with the chapter via our <a href="https://chat.whatsapp.com/CmIf9XDIyCs6wS53r1vhWp" target="_blank" rel="noopener noreferrer" style="color: var(--c-topaz); text-decoration: underline;">WhatsApp Community</a> or <a href="https://www.instagram.com/nbimpactchapter_svc/" target="_blank" rel="noopener noreferrer" style="color: var(--c-topaz); text-decoration: underline;">Instagram</a>.</span>
        </div>
      `
    }
  };

  function openModal(key) {
    const data = briefs[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalBody.innerHTML = data.content;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  // Trigger buttons
  document.querySelectorAll('[data-modal-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-modal-trigger');
      openModal(key);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // 5. SVC Digital Canteen Guide (Project Vitality • Initiative 1.1)
  const CANTEEN_RAW_ITEMS = [
    {
      id: 'plain-omelette',
      name: 'Egg Omelette (2 Pc, Plain)',
      priceDisplay: '₹40',
      priceSort: 40,
      category: 'Snacks & Quick Bites',
      diet: 'egg',
      prepTag: 'Tawa Cooked',
      image: 'canteen_images/plain-omelette.jpg',
      metrics: { protein: 28, glycemic: 29, prep: 20, nutrients: 13 },
      macros: { kcal: '190 kcal', proteinG: 12, carbsG: 2, fatG: 15 },
      summary: 'Two whole eggs whisked with chopped onions, green chillies, and spices on the tawa (no bread).',
      analysis: 'Highest protein-to-calorie efficiency on the menu with virtually zero refined carbohydrates, keeping blood glucose steady across back-to-back lectures.',
      tip: 'Ask for light oil on the tawa or pair with Idli Sambar for a balanced high-protein meal.'
    },
    {
      id: 'idli-sambar',
      name: 'Idli Sambar',
      priceDisplay: '₹35',
      priceSort: 35,
      category: 'South Indian',
      diet: 'veg',
      prepTag: 'Steamed & Fermented',
      image: 'canteen_images/idli-sambar.jpg',
      metrics: { protein: 21, glycemic: 24, prep: 25, nutrients: 14 },
      macros: { kcal: '260 kcal', proteinG: 9, carbsG: 46, fatG: 4 },
      summary: 'Two steamed fermented rice-lentil idlis served with hot vegetable lentil sambar and chutney.',
      analysis: 'Zero deep-frying and naturally fermented batter provide complete rice-plus-dal amino acids, gut-friendly probiotics, and gentle digestion.',
      tip: 'Ask for an extra ladle of sambar over coconut chutney to boost lentil fiber and protein.'
    },
    {
      id: 'rice-bowl',
      name: 'Rice Bowl (Rajma / Chole / Dal)',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'Meals & Bowls',
      diet: 'veg',
      prepTag: 'Steamed & Simmered',
      image: 'canteen_images/rice-bowl.jpg',
      metrics: { protein: 23, glycemic: 22, prep: 20, nutrients: 13 },
      macros: { kcal: '460 kcal', proteinG: 13, carbsG: 76, fatG: 11 },
      summary: 'Steamed rice topped with your choice of simmered canteen rajma, chole, or yellow dal gravy.',
      analysis: 'Combining legumes with rice forms a complete plant protein profile while soluble bean fiber slows down glucose absorption compared to plain rice or maida.',
      tip: 'Ask for a higher gravy-to-rice ratio for extra protein, iron, and sustained afternoon fullness.'
    },
    {
      id: 'uttapam',
      name: 'Uttapam',
      priceDisplay: '₹45',
      priceSort: 45,
      category: 'South Indian',
      diet: 'veg',
      prepTag: 'Griddle & Fermented',
      image: 'canteen_images/uttapam.jpg',
      metrics: { protein: 19, glycemic: 22, prep: 21, nutrients: 13 },
      macros: { kcal: '340 kcal', proteinG: 9, carbsG: 54, fatG: 9 },
      summary: 'Thick fermented rice-urad pancake topped with chopped onions, tomatoes, and coriander, served with sambar.',
      analysis: 'Retains the probiotic and amino-acid benefits of fermented South Indian batter with added vegetable toppings and moderate griddle oil.',
      tip: 'A strong midday lunch option when you want something warm and filling without heavy frying oil.'
    },
    {
      id: 'bread-omelette',
      name: 'Bread Omelette (2 Eggs)',
      priceDisplay: '₹40',
      priceSort: 40,
      category: 'Snacks & Quick Bites',
      diet: 'egg',
      prepTag: 'Tawa Toasted',
      image: 'canteen_images/bread-omelette.jpg',
      metrics: { protein: 25, glycemic: 19, prep: 18, nutrients: 11 },
      macros: { kcal: '340 kcal', proteinG: 15, carbsG: 28, fatG: 18 },
      summary: 'Two-egg masala omelette folded onto two tawa-toasted slices of white bread.',
      analysis: 'Delivers 15g of protein for ₹40; the two refined white bread slices lower glycemic stability slightly compared to a plain omelette, though egg protein buffers the spike.',
      tip: 'Order with a single bread slice or plain when you don’t need the extra quick carbs.'
    },
    {
      id: 'onion-dosa',
      name: 'Onion Dosa',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'South Indian',
      diet: 'veg',
      prepTag: 'Crisp Griddle',
      image: 'canteen_images/onion-dosa.jpg',
      metrics: { protein: 17, glycemic: 20, prep: 19, nutrients: 12 },
      macros: { kcal: '360 kcal', proteinG: 8, carbsG: 55, fatG: 12 },
      summary: 'Crisp fermented rice-lentil crepe roasted with chopped onions, served with lentil sambar and chutney.',
      analysis: 'Uses fermented batter roasted with sautéed onions rather than heavy mashed potato filling, keeping the glycemic load slightly lighter than masala dosa.',
      tip: 'Dip primarily in sambar for extra lentil protein and vegetable micronutrients.'
    },
    {
      id: 'dosa',
      name: 'Dosa',
      priceDisplay: '₹40',
      priceSort: 40,
      category: 'South Indian',
      diet: 'veg',
      prepTag: 'Crisp Griddle',
      image: 'canteen_images/dosa.jpg',
      metrics: { protein: 16, glycemic: 19, prep: 19, nutrients: 12 },
      macros: { kcal: '380 kcal', proteinG: 8, carbsG: 58, fatG: 13 },
      summary: 'Classic crisp fermented crepe with spiced potato filling, served alongside hot sambar and chutney.',
      analysis: 'Clean tawa preparation and fermented batter make it far easier on digestion and lipid markers than deep-fried maida snacks at a similar ₹40 price point.',
      tip: 'Request light oil on the tawa if ordering daily.'
    },
    {
      id: 'paneer-roll',
      name: 'Paneer Roll',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Tawa Wrap',
      image: 'canteen_images/paneer-roll.jpg',
      metrics: { protein: 22, glycemic: 16, prep: 14, nutrients: 10 },
      macros: { kcal: '450 kcal', proteinG: 14, carbsG: 46, fatG: 23 },
      summary: 'Spiced paneer cubes and sliced onions wrapped in a tawa-cooked roll with tangy sauces.',
      analysis: 'Provides one of the better vegetarian protein counts (~14g) among grab-and-go snacks, tempered by a refined maida wrap and calorie-dense sauces.',
      tip: 'Ask for light mayonnaise/sauces so the paneer and onions do the heavy lifting.'
    },
    {
      id: 'thali',
      name: 'Canteen Thali',
      priceDisplay: '₹70',
      priceSort: 70,
      category: 'Meals & Bowls',
      diet: 'veg',
      prepTag: 'Full Platter',
      image: 'canteen_images/thali.jpg',
      metrics: { protein: 23, glycemic: 13, prep: 12, nutrients: 12 },
      macros: { kcal: '820 kcal', proteinG: 18, carbsG: 118, fatG: 30 },
      summary: 'Full meal platter with naan, steamed rice, dal, rajma, and kofta curry (daily sabzis vary).',
      analysis: 'High total protein (~18g) and variety from dal and rajma, but pairing refined maida naan + white rice + fried kofta creates a heavy ~820 kcal carb-and-oil load that can trigger afternoon drowsiness.',
      tip: 'Prioritize finishing the dal and rajma bowls first, and split or go easy on the maida naan before afternoon classes.'
    },
    {
      id: 'lassi',
      name: 'Lassi',
      priceDisplay: '₹40',
      priceSort: 40,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Churned Dairy',
      image: 'canteen_images/lassi.jpg',
      metrics: { protein: 14, glycemic: 12, prep: 20, nutrients: 11 },
      macros: { kcal: '250 kcal', proteinG: 7, carbsG: 36, fatG: 8 },
      summary: 'Chilled churned yogurt lassi sweetened with sugar.',
      analysis: 'Far more nutritious than carbonated sodas thanks to dairy protein, calcium, and live gut probiotics, though added sugar keeps it in the moderate band.',
      tip: 'Best paired with spicy meals rather than sipped alongside another sweet snack.'
    },
    {
      id: 'paneer-kulcha',
      name: 'Paneer Kulcha',
      priceDisplay: '₹30',
      priceSort: 30,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Tawa Toasted',
      image: 'canteen_images/paneer-kulcha.jpg',
      metrics: { protein: 18, glycemic: 14, prep: 15, nutrients: 8 },
      macros: { kcal: '330 kcal', proteinG: 10, carbsG: 42, fatG: 13 },
      summary: 'Soft refined-flour kulcha stuffed with seasoned grated paneer and toasted on the griddle.',
      analysis: 'At ₹30 for ~10g protein and tawa-toasted rather than deep-fried prep, it is a noticeably better budget snack than samosas, burgers, or kachoris.',
      tip: 'Ask for minimal butter/oil while reheating on the tawa.'
    },
    {
      id: 'tea',
      name: 'Tea (Chai)',
      priceDisplay: '₹10',
      priceSort: 10,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Fresh Brewed',
      image: 'canteen_images/tea.jpg',
      metrics: { protein: 6, glycemic: 17, prep: 22, nutrients: 7 },
      macros: { kcal: '75 kcal', proteinG: 2, carbsG: 11, fatG: 3 },
      summary: 'Standard small canteen cup of hot milk tea brewed with tea leaves and sugar.',
      analysis: 'Small serving size (~100ml) keeps total sugar and calories modest compared to bottled cold drinks, while offering natural tea antioxidants and gentle caffeine.',
      tip: 'Keep a 30-minute gap around iron-rich meals (like dal/rajma) since tea tannins reduce plant iron absorption.'
    },
    {
      id: 'vada-sambar',
      name: 'Vada Sambar',
      priceDisplay: '₹35',
      priceSort: 35,
      category: 'South Indian',
      diet: 'veg',
      prepTag: 'Deep-Fried Lentil',
      image: 'canteen_images/vada-sambar.jpg',
      metrics: { protein: 16, glycemic: 17, prep: 8, nutrients: 10 },
      macros: { kcal: '390 kcal', proteinG: 9, carbsG: 44, fatG: 20 },
      summary: 'Two crisp urad-dal medu vadas served in hot vegetable sambar with chutney.',
      analysis: 'Uses whole black gram lentils instead of refined maida, giving decent protein and glycemic control, but deep-frying causes the porous batter to soak up substantial oil.',
      tip: 'For the exact same ₹35 price, Idli Sambar gives similar protein with ~16g less frying oil.'
    },
    {
      id: 'grill-sandwich',
      name: 'Grill Sandwich',
      priceDisplay: '₹40',
      priceSort: 40,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Griddle Pressed',
      image: 'canteen_images/grill-sandwich.jpg',
      metrics: { protein: 11, glycemic: 14, prep: 14, nutrients: 7 },
      macros: { kcal: '350 kcal', proteinG: 6, carbsG: 44, fatG: 16 },
      summary: 'Pressed white-bread sandwich filled with vegetables, spiced potato/spread, and butter.',
      analysis: 'Griddle-toasted rather than deep-fried, but white bread plus creamy spreads provide low protein relative to total calories.',
      tip: 'Bread Omelette (₹40) or Dosa (₹40) offers better satiety at the same price.'
    },
    {
      id: 'fried-rice',
      name: 'Fried Rice',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'Meals & Bowls',
      diet: 'veg',
      prepTag: 'Wok Stir-Fried',
      image: 'canteen_images/fried-rice.jpg',
      metrics: { protein: 10, glycemic: 13, prep: 13, nutrients: 7 },
      macros: { kcal: '480 kcal', proteinG: 6, carbsG: 74, fatG: 17 },
      summary: 'High-heat wok-tossed white rice with finely chopped cabbage, carrots, capsicum, and soy seasoning.',
      analysis: 'High in fast-digesting starch and sodium with very little protein (~6g) to slow glucose entry.',
      tip: 'At ₹50, the Rajma/Chole Rice Bowl doubles the protein and fiber for longer fullness.'
    },
    {
      id: 'cold-coffee',
      name: 'Cold Coffee',
      priceDisplay: '₹45',
      priceSort: 45,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Blended Dairy',
      image: 'canteen_images/cold-coffee.jpg',
      metrics: { protein: 11, glycemic: 10, prep: 18, nutrients: 4 },
      macros: { kcal: '240 kcal', proteinG: 6, carbsG: 38, fatG: 7 },
      summary: 'Chilled blended milk coffee sweetened with sugar and chocolate/coffee syrup.',
      analysis: 'Milk contributes ~6g protein and buffers caffeine better than energy drinks, but liquid sugar pushes carbs close to 38g per glass.',
      tip: 'Ask for half sugar when blended fresh to cut ~60 empty calories immediately.'
    },
    {
      id: 'chole-bhature',
      name: 'Chole Bhature',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'Meals & Bowls',
      diet: 'veg',
      prepTag: 'Deep-Fried Bread',
      image: 'canteen_images/chole-bhature.jpg',
      metrics: { protein: 16, glycemic: 10, prep: 5, nutrients: 9 },
      macros: { kcal: '680 kcal', proteinG: 13, carbsG: 86, fatG: 32 },
      summary: 'Two puffed deep-fried refined-flour bhaturas served with spiced chickpea masala.',
      analysis: 'While chole provides solid chickpea protein and iron, two deep-fried maida bhaturas carry heavy reheated frying oil and trigger strong post-lunch sluggishness.',
      tip: 'Want the chole protein without the fried maida? Pick the ₹50 Chole Rice Bowl instead.'
    },
    {
      id: 'veg-chowmein',
      name: 'Veg Chowmein',
      priceDisplay: '₹30 / ₹60',
      priceSort: 30,
      category: 'Meals & Bowls',
      diet: 'veg',
      prepTag: 'Oil Stir-Fried',
      image: 'canteen_images/veg-chowmein.jpg',
      metrics: { protein: 9, glycemic: 11, prep: 10, nutrients: 6 },
      macros: { kcal: '390 kcal (Half)', proteinG: 6, carbsG: 56, fatG: 15 },
      summary: 'Stir-fried refined-flour noodles tossed with shredded cabbage, capsicum, oil, and sauces (₹30 Half / ₹60 Full).',
      analysis: 'Mostly refined wheat starch stir-fried in generous oil and high-sodium sauces (~720 kcal for a ₹60 full plate) with low lasting satiety.',
      tip: 'Stick to the ₹30 half plate or share a full plate rather than making it a solo lunch.'
    },
    {
      id: 'veg-burger',
      name: 'Veg Burger',
      priceDisplay: '₹30',
      priceSort: 30,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Fried Patty',
      image: 'canteen_images/veg-burger.jpg',
      metrics: { protein: 9, glycemic: 10, prep: 8, nutrients: 5 },
      macros: { kcal: '380 kcal', proteinG: 6, carbsG: 48, fatG: 18 },
      summary: 'Soft maida bun layered with a deep-fried potato-veg patty, onion slice, and creamy dressing.',
      analysis: 'Combines a refined white bun with a deep-fried starch patty and emulsified oil dressing, resulting in low micronutrient and protein density.',
      tip: 'Paneer Kulcha (₹30) or Idli Sambar (₹35) gives far cleaner fuel in the same budget.'
    },
    {
      id: 'samosa',
      name: 'Samosa',
      priceDisplay: '₹10',
      priceSort: 10,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Deep-Fried',
      image: 'canteen_images/samosa.jpg',
      metrics: { protein: 6, glycemic: 11, prep: 6, nutrients: 5 },
      macros: { kcal: '250 kcal', proteinG: 4, carbsG: 28, fatG: 14 },
      summary: 'Single crisp deep-fried maida pastry stuffed with spiced mashed potatoes and peas.',
      analysis: 'Refined flour crust plus mashed potato deep-fried in batch canteen oil packs ~250 kcal into a small snack with minimal protein.',
      tip: 'Enjoy occasionally as a single piece rather than pairing 2–3 samosas as a meal replacement.'
    },
    {
      id: 'kachori-sabzi',
      name: 'Kachori-Sabzi (2 Pc)',
      priceDisplay: '₹30',
      priceSort: 30,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Deep-Fried',
      image: 'canteen_images/kachori-sabzi.jpg',
      metrics: { protein: 9, glycemic: 8, prep: 4, nutrients: 6 },
      macros: { kcal: '540 kcal', proteinG: 7, carbsG: 60, fatG: 30 },
      summary: 'Two flaky deep-fried dal-stuffed kachoris served with hot spiced potato curry.',
      analysis: 'Slow deep-frying gives kachoris their crisp texture by absorbing ~30g of oil across a two-piece plate alongside refined flour and potato starch.',
      tip: 'Treat as an occasional morning indulgence; Idli Sambar (₹35) saves ~280 kcal and 26g fat.'
    },
    {
      id: 'spring-roll',
      name: 'Spring Roll',
      priceDisplay: '₹30',
      priceSort: 30,
      category: 'Snacks & Quick Bites',
      diet: 'veg',
      prepTag: 'Deep-Fried',
      image: 'canteen_images/spring-roll.jpg',
      metrics: { protein: 6, glycemic: 10, prep: 5, nutrients: 5 },
      macros: { kcal: '320 kcal', proteinG: 4, carbsG: 36, fatG: 18 },
      summary: 'Crisp deep-fried maida rolls stuffed with seasoned cabbage and noodles (subject to counter availability).',
      analysis: 'Thin refined-flour wrappers absorb substantial frying oil while noodle-and-cabbage filling offers very little protein or lasting fullness.',
      tip: 'If craving something crisp, Dosa (₹40) offers fermented grains with far less absorbed oil.'
    },
    {
      id: 'juice',
      name: 'Packaged Juice',
      priceDisplay: '₹20',
      priceSort: 20,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Sweetened Pack',
      image: 'canteen_images/juice.jpg',
      metrics: { protein: 1, glycemic: 6, prep: 16, nutrients: 3 },
      macros: { kcal: '110 kcal', proteinG: 0, carbsG: 27, fatG: 0 },
      summary: '200ml packaged fruit beverage carton.',
      analysis: 'Despite fruit imagery, packaged juice drinks strip away whole-fruit fiber and deliver ~24–27g of rapidly absorbed free sugar.',
      tip: 'Hydrate with water first, or pick Lassi (₹40) if you want actual nutrition in a cold drink.'
    },
    {
      id: 'cold-drink',
      name: 'Cold Drink',
      priceDisplay: '₹20',
      priceSort: 20,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Carbonated Sugar',
      image: 'canteen_images/cold-drink.jpg',
      metrics: { protein: 0, glycemic: 4, prep: 14, nutrients: 0 },
      macros: { kcal: '105 kcal', proteinG: 0, carbsG: 26, fatG: 0 },
      summary: '250ml chilled carbonated soft drink.',
      analysis: 'Pure liquid sucrose (~6 teaspoons of sugar) with zero protein, fiber, or micronutrients, causing a rapid blood glucose spike.',
      tip: 'Chilled water or unsweetened/light-sugar chai avoids the sudden sugar rush.'
    },
    {
      id: 'fruit-beer',
      name: 'Fruit Beer',
      priceDisplay: '₹50',
      priceSort: 50,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Carbonated Sugar',
      image: 'canteen_images/fruit-beer.jpg',
      metrics: { protein: 0, glycemic: 3, prep: 14, nutrients: 0 },
      macros: { kcal: '145 kcal', proteinG: 0, carbsG: 36, fatG: 0 },
      summary: 'Chilled non-alcoholic carbonated malt-and-fruit flavored beverage.',
      analysis: 'High free sugar (~36g per bottle) and artificial flavoring with zero protein or micronutrient benefit.',
      tip: 'Best reserved as a rare fizzy treat rather than a daily lunch companion.'
    },
    {
      id: 'sting',
      name: 'Sting',
      priceDisplay: '₹30',
      priceSort: 30,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'Caffeinated Sugar',
      image: 'canteen_images/sting.jpg',
      metrics: { protein: 0, glycemic: 3, prep: 11, nutrients: 1 },
      macros: { kcal: '115 kcal', proteinG: 0, carbsG: 28, fatG: 0 },
      summary: '250ml high-sugar caffeinated energy drink.',
      analysis: 'Combines ~28g of rapid liquid sugar with synthetic caffeine, driving a sharp spike in blood glucose and heart rate followed by an energy rebound crash.',
      tip: 'A ₹10 cup of hot Tea provides smoother alertness with less than half the sugar.'
    },
    {
      id: 'energy-drink',
      name: 'Energy Drink',
      priceDisplay: '₹60',
      priceSort: 60,
      category: 'Beverages',
      diet: 'veg',
      prepTag: 'High Stimulant',
      image: 'canteen_images/energy-drink.jpg',
      metrics: { protein: 0, glycemic: 2, prep: 11, nutrients: 1 },
      macros: { kcal: '155 kcal', proteinG: 0, carbsG: 38, fatG: 0 },
      summary: 'Standard 300–350ml canned high-sugar caffeinated energy beverage.',
      analysis: 'Largest single dose of liquid sugar (~38g) plus heavy stimulant load on the menu, disrupting both glycemic stability and evening sleep quality.',
      tip: 'Avoid after 2 PM to protect sleep recovery and resting heart-rate biomarkers.'
    }
  ];

  const CANTEEN_ITEMS = CANTEEN_RAW_ITEMS.map(item => {
    const score = item.metrics.protein + item.metrics.glycemic + item.metrics.prep + item.metrics.nutrients;
    return { ...item, score };
  });

  function getScoreTier(score) {
    if (score >= 80) return { cls: 'tier-green-high', grade: 'S', label: 'Tier S', descriptor: 'Top Pick' };
    if (score >= 65) return { cls: 'tier-green-mid', grade: 'A', label: 'Tier A', descriptor: 'Good Choice' };
    if (score >= 50) return { cls: 'tier-amber', grade: 'B', label: 'Tier B', descriptor: 'Moderate' };
    if (score >= 35) return { cls: 'tier-orange', grade: 'C', label: 'Tier C', descriptor: 'Occasional' };
    return { cls: 'tier-red', grade: 'F', label: 'Tier F', descriptor: 'Limit' };
  }

  function getBarColor(value, max) {
    const pct = (value / max) * 100;
    if (pct >= 75) return '#10B981';
    if (pct >= 60) return '#84CC16';
    if (pct >= 45) return '#F59E0B';
    if (pct >= 30) return '#FB923C';
    return '#EF4444';
  }

  const canteenGrid = document.getElementById('canteenGrid');
  const canteenSearch = document.getElementById('canteenSearch');
  const canteenSort = document.getElementById('canteenSort');
  const canteenCategoryPills = document.getElementById('canteenCategoryPills');
  const canteenQuickToggles = document.getElementById('canteenQuickToggles');
  const canteenResultsCount = document.getElementById('canteenResultsCount');
  const canteenResetBtn = document.getElementById('canteenResetBtn');
  const canteenEmptyState = document.getElementById('canteenEmptyState');
  const canteenEmptyResetBtn = document.getElementById('canteenEmptyResetBtn');

  if (canteenGrid) {
    const state = {
      query: '',
      category: 'all',
      tier: 'all',
      sort: 'score-desc',
      quick: new Set(),
      expanded: new Set()
    };

    const supportsInterpolateSize = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('interpolate-size', 'allow-keywords');

    function toggleCardExpansion(card, itemId) {
      const btn = card.querySelector('.canteen-toggle-btn');
      const labelSpan = card.querySelector('.canteen-toggle-label');
      const panel = card.querySelector('.canteen-breakdown');
      if (!btn || !panel) return;

      const isCurrentlyOpen = btn.getAttribute('aria-expanded') === 'true';
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isCurrentlyOpen) {
        state.expanded.delete(itemId);
        btn.setAttribute('aria-expanded', 'false');
        if (labelSpan) labelSpan.textContent = 'View Score Breakdown';
        card.classList.remove('is-expanded');
        panel.classList.remove('is-open');

        if (supportsInterpolateSize && !prefersReducedMotion) {
          const onEnd = (e) => {
            if (e.propertyName === 'block-size' && !panel.classList.contains('is-open')) {
              panel.hidden = true;
              panel.removeEventListener('transitionend', onEnd);
            }
          };
          panel.addEventListener('transitionend', onEnd);
        } else {
          panel.hidden = true;
        }
      } else {
        state.expanded.add(itemId);
        panel.hidden = false;
        // Ensure initial 0 block-size is flushed before transitioning to auto
        void panel.offsetHeight;
        panel.classList.add('is-open');
        card.classList.add('is-expanded');
        btn.setAttribute('aria-expanded', 'true');
        if (labelSpan) labelSpan.textContent = 'Hide Score Breakdown';
      }
    }

    function renderMetricBar(label, val, max) {
      const pct = Math.round((val / max) * 100);
      const color = getBarColor(val, max);
      return `
        <div class="metric-bar-row">
          <div class="metric-bar-top">
            <span>${label}</span>
            <span class="metric-bar-score">${val} / ${max}</span>
          </div>
          <div class="metric-bar-track">
            <div class="metric-bar-fill" style="width: ${pct}%; --bar-color: ${color};"></div>
          </div>
        </div>
      `;
    }

    function renderCanteenGrid() {
      const q = state.query.trim().toLowerCase();

      const filtered = CANTEEN_ITEMS.filter(item => {
        const itemTier = getScoreTier(item.score).grade;
        if (state.tier !== 'all' && itemTier !== state.tier) return false;
        if (state.category !== 'all' && item.category !== state.category) return false;
        if (state.quick.has('tier-s') && itemTier !== 'S') return false;
        if (state.quick.has('green') && item.score < 65) return false;
        if (state.quick.has('protein') && item.macros.proteinG < 10) return false;
        if (state.quick.has('budget') && item.priceSort >= 40) return false;
        if (q) {
          const haystack = `${item.name} ${item.category} ${item.summary} ${item.prepTag} tier ${itemTier}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (state.sort === 'score-asc') return a.score - b.score || a.priceSort - b.priceSort;
        if (state.sort === 'price-asc') return a.priceSort - b.priceSort || b.score - a.score;
        if (state.sort === 'protein-desc') return b.macros.proteinG - a.macros.proteinG || b.score - a.score;
        return b.score - a.score || a.priceSort - b.priceSort;
      });

      const hasFilters = q !== '' || state.category !== 'all' || state.tier !== 'all' || state.quick.size > 0;
      if (canteenResetBtn) canteenResetBtn.hidden = !hasFilters;

      if (canteenResultsCount) {
        canteenResultsCount.textContent = filtered.length === CANTEEN_ITEMS.length
          ? `Showing all ${CANTEEN_ITEMS.length} menu items`
          : `Showing ${filtered.length} of ${CANTEEN_ITEMS.length} menu items`;
      }

      if (filtered.length === 0) {
        canteenGrid.innerHTML = '';
        if (canteenEmptyState) canteenEmptyState.hidden = false;
        return;
      }

      if (canteenEmptyState) canteenEmptyState.hidden = true;

      canteenGrid.innerHTML = filtered.map(item => {
        const tier = getScoreTier(item.score);
        const isOpen = state.expanded.has(item.id);
        const dietClass = item.diet === 'egg' ? 'diet-mark diet-egg' : 'diet-mark';
        const dietLabel = item.diet === 'egg' ? 'Contains egg' : 'Vegetarian';
        const breakdownId = `breakdown-${item.id}`;

        return `
          <article class="canteen-card ${tier.cls}${isOpen ? ' is-expanded' : ''}" data-item-id="${item.id}" data-tier="${tier.grade}">
            <div class="canteen-card-media">
              <img src="${item.image}" alt="${item.name}" width="640" height="400" loading="lazy" decoding="async">
              <div class="canteen-tier-stamp" aria-label="Rated Tier ${tier.grade}">
                <span class="tier-stamp-rank">${tier.grade}</span>
                <span class="tier-stamp-label">TIER</span>
              </div>
            </div>

            <header class="canteen-card-header">
              <div class="canteen-meta-top">
                <span class="canteen-cat-group">
                  <span class="${dietClass}" role="img" aria-label="${dietLabel}" title="${dietLabel}"></span>
                  ${item.category}
                </span>
                <span class="canteen-price-tag">${item.priceDisplay}</span>
              </div>

              <div class="canteen-title-score-row">
                <h3 class="canteen-item-title">${item.name}</h3>
                <div class="canteen-score-cluster" aria-label="Tier ${tier.grade}, Health score ${item.score} out of 100">
                  <span class="canteen-score-pill">
                    <span class="canteen-score-num">${item.score}</span>
                    <span class="canteen-score-max">/100</span>
                  </span>
                  <span class="canteen-tier-badge">${tier.label}</span>
                </div>
              </div>
            </header>

            <div class="canteen-card-content">
              <p class="canteen-item-desc">${item.summary}</p>

              <div class="canteen-quick-stats">
                <span class="canteen-stat-chip">${item.macros.kcal}</span>
                <span class="canteen-stat-chip">${item.macros.proteinG}g Protein</span>
                <span class="canteen-stat-chip">${item.prepTag}</span>
              </div>

              <div class="canteen-breakdown${isOpen ? ' is-open' : ''}" id="${breakdownId}"${isOpen ? '' : ' hidden'}>
                <div class="canteen-breakdown-inner">
                  <div class="breakdown-tier-banner">
                    <span class="breakdown-tier-tag">Ranked ${tier.label}</span>
                    <span class="breakdown-tier-subtitle">${item.score}/100 Vitality Score • ${tier.descriptor}</span>
                  </div>

                  <div>
                    <div class="breakdown-section-label">Metric Breakdown</div>
                    <div class="breakdown-bars">
                      ${renderMetricBar('Protein & Satiety', item.metrics.protein, 30)}
                      ${renderMetricBar('Blood Sugar Stability', item.metrics.glycemic, 30)}
                      ${renderMetricBar('Cooking & Oil Quality', item.metrics.prep, 25)}
                      ${renderMetricBar('Nutrient Density', item.metrics.nutrients, 15)}
                    </div>
                  </div>

                  <div>
                    <div class="breakdown-section-label">Estimated Serving Macros</div>
                    <div class="breakdown-macros-grid">
                      <div>
                        <div class="macro-cell-label">Energy</div>
                        <div class="macro-cell-val">${item.macros.kcal.replace(' (Half)', '')}</div>
                      </div>
                      <div>
                        <div class="macro-cell-label">Protein</div>
                        <div class="macro-cell-val">${item.macros.proteinG}g</div>
                      </div>
                      <div>
                        <div class="macro-cell-label">Carbs</div>
                        <div class="macro-cell-val">${item.macros.carbsG}g</div>
                      </div>
                      <div>
                        <div class="macro-cell-label">Fat</div>
                        <div class="macro-cell-val">${item.macros.fatG}g</div>
                      </div>
                    </div>
                  </div>

                  <p class="breakdown-note">${item.analysis}</p>
                  <div class="breakdown-tip"><strong>Note:</strong> ${item.tip}</div>
                </div>
              </div>
            </div>

            <footer class="canteen-card-footer">
              <button type="button" class="canteen-toggle-btn" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="${breakdownId}">
                <span class="canteen-toggle-label">${isOpen ? 'Hide Score Breakdown' : 'View Score Breakdown'}</span>
                <svg class="canteen-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </footer>
          </article>
        `;
      }).join('');
    }

    // Event delegation for expanding/collapsing any canteen card
    canteenGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.canteen-card');
      if (!card) return;
      // Avoid toggling if user is selecting text inside an open breakdown
      if (window.getSelection && window.getSelection().toString().length > 0) return;
      const btn = e.target.closest('.canteen-toggle-btn');
      const clickedHeaderOrImg = e.target.closest('.canteen-card-header') || e.target.closest('.canteen-card-media') || e.target.tagName === 'IMG';
      if (btn || clickedHeaderOrImg) {
        toggleCardExpansion(card, card.getAttribute('data-item-id'));
      }
    });

    // Interactive Rubric Tier Filter buttons
    const rubricTierBtns = document.querySelectorAll('[data-tier-filter]');
    rubricTierBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTier = btn.getAttribute('data-tier-filter');
        if (state.tier === targetTier) {
          state.tier = 'all';
          btn.setAttribute('aria-pressed', 'false');
          btn.classList.remove('is-selected');
        } else {
          state.tier = targetTier;
          rubricTierBtns.forEach(b => {
            const isMatch = b.getAttribute('data-tier-filter') === targetTier;
            b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
            b.classList.toggle('is-selected', isMatch);
          });
        }
        renderCanteenGrid();
      });
    });

    if (canteenSearch) {
      canteenSearch.addEventListener('input', (e) => {
        state.query = e.target.value;
        renderCanteenGrid();
      });
    }

    if (canteenSort) {
      canteenSort.addEventListener('change', (e) => {
        state.sort = e.target.value;
        renderCanteenGrid();
      });
    }

    if (canteenCategoryPills) {
      canteenCategoryPills.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-category]');
        if (!pill) return;
        state.category = pill.getAttribute('data-category');
        canteenCategoryPills.querySelectorAll('.filter-pill').forEach(p => {
          p.classList.toggle('active', p === pill);
        });
        renderCanteenGrid();
      });
    }

    if (canteenQuickToggles) {
      canteenQuickToggles.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-quick]');
        if (!chip) return;
        const key = chip.getAttribute('data-quick');
        if (state.quick.has(key)) {
          state.quick.delete(key);
          chip.setAttribute('aria-pressed', 'false');
        } else {
          state.quick.add(key);
          chip.setAttribute('aria-pressed', 'true');
        }
        renderCanteenGrid();
      });
    }

    function resetCanteenFilters() {
      state.query = '';
      state.category = 'all';
      state.tier = 'all';
      state.quick.clear();
      if (canteenSearch) canteenSearch.value = '';
      if (canteenCategoryPills) {
        canteenCategoryPills.querySelectorAll('.filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-category') === 'all');
        });
      }
      if (canteenQuickToggles) {
        canteenQuickToggles.querySelectorAll('.quick-filter-chip').forEach(c => {
          c.setAttribute('aria-pressed', 'false');
        });
      }
      rubricTierBtns.forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('is-selected');
      });
      renderCanteenGrid();
    }

    if (canteenResetBtn) canteenResetBtn.addEventListener('click', resetCanteenFilters);
    if (canteenEmptyResetBtn) canteenEmptyResetBtn.addEventListener('click', resetCanteenFilters);

    renderCanteenGrid();
  }
});
