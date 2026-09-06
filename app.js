/**
 * NATIONBUILDING IMPACT CHAPTER • SRI VENKATESWARA COLLEGE (SVC)
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

  // 2. Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      mobileToggle.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
    });

    // Close when nav links are tapped
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }

  // 3. Work Charter "Three Pulses" Interactive Tab Switcher
  const pulseData = {
    civic: {
      headline: "Civic Activation Pulse",
      desc: "Centrally designed programs including campus surveys, institutional audits, and student panel discussions. This pulse systematically assesses the sentiment of students on critical themes such as career mobility, student welfare, healthcare, and campus policies to generate empirical insights for college administration.",
      deliverables: [
        "Comprehensive Student Pulse Survey Reports",
        "Town Halls & Faculty-Student Dialogue Sessions",
        "Policy Recommendation Dossiers submitted to SVC Administration"
      ]
    },
    connect: {
      headline: "Community Connect Pulse",
      desc: "An omnipresent offline and online engagement framework keeping the campus community continuously informed, inspired, and actively involved. Translates complex socio-economic debates into relatable student discourse through digital campaigns, expert micro-broadcasts, and interactive campus activations.",
      deliverables: [
        "Weekly Awareness Infographics & Mythbuster Carousels",
        "Micro-Broadcast Q&A Sessions with Domain Leaders",
        "Multi-college Cross-Chapter Engagement Meetups"
      ]
    },
    impact: {
      headline: "Community Impact Pulse",
      desc: "The flagship action-oriented engine of the chapter. Empowers student project coordinators to design, finance through zero-cost partnerships, and execute high-rigor real-world interventions driving measurable social impact within and beyond the Sri Venkateswara College campus under this year's central theme.",
      deliverables: [
        "Project Talent Unbound (PwBD Accessible Placement Ecosystem)",
        "Project Vitality (SVC Student Biomarker Blueprint)",
        "Zero-Waste Festival & Canteen Circularity Audits"
      ]
    }
  };

  const pulseTabBtns = document.querySelectorAll('.pulse-tab-btn');
  const pulseTitle = document.getElementById('pulseTitle');
  const pulseDesc = document.getElementById('pulseDesc');
  const pulseList = document.getElementById('pulseList');

  pulseTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pulseTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-pulse');
      const data = pulseData[key];
      if (data) {
        pulseTitle.textContent = data.headline;
        pulseDesc.textContent = data.desc;
        pulseList.innerHTML = data.deliverables.map(item => `<li>${item}</li>`).join('');
      }
    });
  });

  // 4. Modal Architecture
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  const briefs = {
    talentUnbound: {
      title: "Project Talent Unbound",
      subtitle: "A NationBuilding Impact Chapters Initiative • Sri Venkateswara College",
      content: `
        <h4>Executive Summary</h4>
        <p>Project Talent Unbound is designed to bridge systemic employment disparities faced by college students and alumni with physical, sensory, and neurocognitive disabilities (Persons with Benchmark Disabilities - PwBD).</p>
        <p>Piloted within the Sri Venkateswara College ecosystem over an 8-month timeframe, the project institutionalizes campus-based placement readiness, accessible recruitment channels, and sensitized employer partnerships aligned with India's <strong>Rights of Persons with Disabilities (RPwD) Act, 2016</strong>.</p>

        <h4>Guiding Challenge Question</h4>
        <blockquote style="border-left: 3px solid var(--c-flame); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: var(--c-navy-deep);">
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
      `
    },
    apply: {
      title: "Join NationBuilding Impact Chapter SVC",
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

        <div style="background: var(--c-snow); padding: 1.25rem; border-radius: 8px; border-left: 3px solid var(--c-flame); margin-top: 1.5rem;">
          <strong>Application Deadline:</strong> 12:00 PM, Saturday.<br>
          <span style="font-size: 0.85rem; color: var(--c-text-muted);">Please coordinate through the official chapter Linktree / Instagram or with the Management Body.</span>
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
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

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
});
