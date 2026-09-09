---
name: cinematic-hero-design
description: >-
  Best practices and design specifications for full-viewport, high-impact cinematic hero
  sections with dark background imagery, gradient scrim overlays, dual-column typography grids,
  and accessible high-contrast text.
---

# Cinematic Hero Design Skill

This skill provides architectural guidance and implementation patterns for high-impact, full-viewport landing page hero sections inspired by premier brand platforms (such as Oracle Red Bull Racing, Apple Pro, and Linear).

## Core Principles

1. **Full-Viewport Visual Immersion**:
   - Use min-height: 100vh; min-height: 100dvh; to account for dynamic mobile browser chrome.
   - Apply background-size: cover; background-position: center 25%; to maintain framing on key visual subjects across screen ratios.

2. **Multi-Stop Gradient Scrim Overlay**:
   - Pure photography backgrounds without scrims cause severe text illegibility and fail WCAG contrast ratios.
   - Use multi-stop directional gradients combined with radial vignette highlights:
     linear-gradient(180deg, rgba(1, 0, 40, 0.78) 0%, rgba(0, 18, 58, 0.62) 50%, rgba(1, 0, 40, 0.92) 100%),
     radial-gradient(circle at 15% 45%, rgba(218, 89, 27, 0.18) 0%, transparent 60%),
     url('path/to/image.jpg') center 25% / cover no-repeat;

3. **High-Impact Typography & Visual Hierarchy**:
   - **Headline (Left Column)**: Bold, tight letter-spacing (-0.025em; line-height: 1.05;), fluid scaling via clamp(2.5rem, 5.5vw, 4.5rem).
   - **Stacked Values / Pillars (Right Column)**: Large, rhythmic vertical stack (clamp(1.85rem, 4vw, 3.25rem); font-weight: 800; color: #FFFFFF;).
   - Clean, crisp supporting copy (color: rgba(255, 255, 255, 0.85); font-size: 1.15rem; line-height: 1.6;).

4. **Frosted Glass Navigation Integration**:
   - Fixed header with high-translucency frosted glass matching dark cinematic theme:
     background: rgba(1, 0, 40, 0.7);
     backdrop-filter: blur(16px);
     -webkit-backdrop-filter: blur(16px);
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   - White/light variant brand logos and white navigation links.

5. **Responsive Stacking & Mobile Ergonomics**:
   - Desktop: 2-column split grid (grid-template-columns: 1.25fr 0.75fr;).
   - Tablet / Mobile (<= 992px): Clean vertical stacking with consistent padding.
   - Maintain >= 44px touch targets for all interactive pills, buttons, and links.
