import re, sys, os

def run_comprehensive_audit():
    with open('index.html') as f:
        html = f.read()
    with open('styles.css') as f:
        css = f.read()
    with open('app.js') as f:
        js = f.read()

    findings = []

    # Category 1: Viewport & System Meta
    if 'viewport-fit=cover' not in html:
        findings.append({
            'cat': 'Viewport & Meta',
            'severity': 'CRITICAL',
            'issue': 'Missing viewport-fit=cover in meta viewport tag',
            'detail': 'iOS Safari will letterbox or create awkward cutoffs near the notch / home indicator bar.'
        })

    if '-webkit-text-size-adjust' not in css:
        findings.append({
            'cat': 'Viewport & Meta',
            'severity': 'MEDIUM',
            'issue': 'Missing -webkit-text-size-adjust: 100%',
            'detail': 'iOS Safari may unexpectedly upscale text when rotating to landscape or on font size recalculation.'
        })

    # Category 2: Safe Area Insets (iOS Dynamic Island / Home Indicator)
    if 'env(safe-area-inset-bottom)' not in css:
        findings.append({
            'cat': 'Safe Areas & OS Chrome',
            'severity': 'HIGH',
            'issue': 'No bottom safe-area-inset padding defined',
            'detail': 'Fixed headers, bottom modals, and footers will overlap with the iOS home indicator bar on iPhone X and later.'
        })

    if 'env(safe-area-inset-top)' not in css:
        findings.append({
            'cat': 'Safe Areas & OS Chrome',
            'severity': 'HIGH',
            'issue': 'No top safe-area-inset padding for fixed navigation',
            'detail': 'Fixed header content may clip behind notch or Dynamic Island on iOS devices.'
        })

    # Category 3: Touch Target & Ergonomics (Apple HIG & Material 3)
    # Check mobile toggle touch target
    toggle_target_ok = False
    if '.mobile-toggle' in css:
        toggle_block = re.search(r'\.mobile-toggle\s*\{([^}]+)\}', css)
        if toggle_block:
            content = toggle_block.group(1)
            if ('min-width: 44px' in content or 'width: 44px' in content or 'min-height: 44px' in content or 'min-width: 48px' in content or 'width: 48px' in content) and ('min-height: 44px' in content or 'height: 44px' in content or 'min-height: 48px' in content or 'height: 48px' in content):
                toggle_target_ok = True
    if not toggle_target_ok:
        findings.append({
            'cat': 'Touch Targets & Ergonomics',
            'severity': 'HIGH',
            'issue': 'Mobile hamburger toggle lacks explicit 44x44px minimum touch target',
            'detail': 'Violates Apple Human Interface Guidelines and Material Design touch targets.'
        })

    # Check modal close button touch target
    close_target_ok = False
    if '.modal-close-btn' in css:
        close_block = re.search(r'\.modal-close-btn\s*\{([^}]+)\}', css)
        if close_block:
            content = close_block.group(1)
            # Check for 44px or larger
            if 'width: 44px' in content or 'min-width: 44px' in content or 'min-height: 44px' in content or 'height: 44px' in content:
                close_target_ok = True
    if not close_target_ok:
        findings.append({
            'cat': 'Touch Targets & Ergonomics',
            'severity': 'HIGH',
            'issue': 'Modal close button is only 36x36px (less than 44x44px minimum)',
            'detail': 'Small close buttons on mobile lead to accidental tap misses and user frustration.'
        })

    # Category 4: Mobile Modal & Bottom Sheet Design
    # Check if modal adapts to mobile (bottom sheet or full screen)
    has_mobile_modal = False
    mobile_media = re.findall(r'@media\s*\([^{]+\b768px\b[^{]*\)\s*\{([\s\S]+?)\}\s*(?:@media|$)', css)
    for m in mobile_media:
        if '.modal-card' in m or '.modal-overlay' in m:
            has_mobile_modal = True
            break
    if not has_mobile_modal:
        findings.append({
            'cat': 'Modals & Drawers',
            'severity': 'CRITICAL',
            'issue': 'Modal dialog does not adapt to mobile screen dimensions',
            'detail': 'On small screens, a centered floating desktop dialog gets cut off, hides headers, and creates awkward letterboxing. On mobile, modals should render as a native bottom sheet (sheet-from-bottom).'
        })

    # Check modal tables overflow
    if '.modal-table' in css and 'overflow-x' not in css and 'display: block' not in css:
        findings.append({
            'cat': 'Modals & Drawers',
            'severity': 'HIGH',
            'issue': 'Modal tables (.modal-table) lack horizontal scrolling container',
            'detail': 'Wide 3-column tables cause horizontal container blowouts or crushed text on 375px screens.'
        })

    # Check overscroll-behavior on modal
    if 'overscroll-behavior' not in css:
        findings.append({
            'cat': 'Modals & Drawers',
            'severity': 'MEDIUM',
            'issue': 'Missing overscroll-behavior: contain on modal overlay/body',
            'detail': 'Scrolling inside the modal on iOS Safari causes background page scroll chaining (rubber-banding).'
        })

    # Category 5: Mobile Navigation Menu
    if '.main-nav' in css:
        if 'overscroll-behavior' not in css and 'max-height' not in css:
            findings.append({
                'cat': 'Navigation & Menus',
                'severity': 'HIGH',
                'issue': 'Mobile nav drawer lacks max-height with scroll containment',
                'detail': 'On landscape mobile or short screens, menu items may overflow past the viewport bottom.'
            })

    # Check touch feedback
    if '-webkit-tap-highlight-color' not in css:
        findings.append({
            'cat': 'Android/iOS Polish',
            'severity': 'LOW',
            'issue': 'Missing -webkit-tap-highlight-color',
            'detail': 'Android Chrome shows an intrusive grey/blue rectangular flash on tapped elements unless styled.'
        })

    # Check touch-action manipulation
    if 'touch-action: manipulation' not in css:
        findings.append({
            'cat': 'Android/iOS Polish',
            'severity': 'MEDIUM',
            'issue': 'Missing touch-action: manipulation',
            'detail': 'Leaves default 300ms double-tap-to-zoom delay active on mobile browsers.'
        })

    # Category 6: Horizontal Scroll Lists (Pulse Tabs)
    if '.pulse-tabs' in css:
        if '-webkit-overflow-scrolling' not in css:
            findings.append({
                'cat': 'Gestures & Scrolling',
                'severity': 'MEDIUM',
                'issue': 'Horizontal tabs (.pulse-tabs) lack -webkit-overflow-scrolling: touch',
                'detail': 'Horizontal tab navigation feels stiff on iOS Safari without momentum scrolling.'
            })
        if 'scrollbar-width: none' not in css and '::-webkit-scrollbar' not in css:
            findings.append({
                'cat': 'Gestures & Scrolling',
                'severity': 'LOW',
                'issue': 'Horizontal scrollable tabs show default desktop scrollbar on mobile',
                'detail': 'Shows an unsightly grey horizontal scrollbar across the screen.'
            })

    # Category 7: Mobile Navigation Drawer & Backdrop UX (Loop 2)
    if 'navBackdrop' not in html and 'nav-backdrop' not in html:
        findings.append({
            'cat': 'Mobile Nav Drawer UX',
            'severity': 'HIGH',
            'issue': 'Missing mobile nav backdrop overlay in HTML',
            'detail': 'Without a dimmed backdrop overlay, tapping outside the open mobile nav does not dismiss it and may trigger accidental page clicks.'
        })

    if '.nav-backdrop' not in css:
        findings.append({
            'cat': 'Mobile Nav Drawer UX',
            'severity': 'HIGH',
            'issue': 'Missing .nav-backdrop styling with backdrop-filter blur and transition in CSS',
            'detail': 'Backdrop requires blurred dimming and smooth fade transition for native mobile feel.'
        })

    # Body scroll locking when mobile nav is open
    if 'nav-open' not in js and 'navOpen' not in js and ('overflow = \'hidden\'' not in js or js.count('overflow') < 2):
        findings.append({
            'cat': 'Mobile Nav Drawer UX',
            'severity': 'HIGH',
            'issue': 'Mobile nav does not lock body scrolling when open',
            'detail': 'Dragging within an open mobile nav scrolls the background document on mobile Safari / Chrome.'
        })

    # Category 8: Fluid Typography & Narrow Viewport Scaling (Loop 2)
    if 'clamp(' not in css:
        findings.append({
            'cat': 'Fluid Typography & Scaling',
            'severity': 'MEDIUM',
            'issue': 'Display headlines lack CSS clamp() fluid typography',
            'detail': 'Headlines like .hero-title and section headers should use clamp() to scale seamlessly down to 320px screens without awkward line breaks.'
        })

    # Category 9: Narrow Smartphone Grid Responsiveness (Loop 2)
    narrow_collapse = False
    for m in re.finditer(r'@media\s*\([^{]+\b(480px|540px|560px|580px|600px)\b[^{]*\)\s*\{([\s\S]+?)\}\s*(?:@media|$)', css):
        if '.framework-5w1h-grid' in m.group(2) and ('1fr' in m.group(2) or 'repeat(1' in m.group(2)):
            narrow_collapse = True
            break
    if not narrow_collapse:
        findings.append({
            'cat': 'Layout & Grid Ergonomics',
            'severity': 'HIGH',
            'issue': '.framework-5w1h-grid does not collapse to 1 column on compact mobile devices (<580px)',
            'detail': 'Two-column cards on 360px Android or 375px iPhone squeeze into 140px width, causing severe vertical deformation.'
        })

    # Category 10: Mobile Nav Link Tap Target (Loop 2)
    nav_tap_ok = False
    mobile_nav_matches = re.finditer(r'@media\s*\([^{]+\b768px\b[^{]*\)\s*\{([\s\S]+?)\}\s*(?:@media|$)', css)
    for m in mobile_nav_matches:
        if '.nav-link' in m.group(1) or '.main-nav a' in m.group(1):
            if 'padding:' in m.group(1) or 'min-height:' in m.group(1):
                nav_tap_ok = True
                break
    if not nav_tap_ok:
        findings.append({
            'cat': 'Touch Targets & Ergonomics',
            'severity': 'MEDIUM',
            'issue': 'Mobile navigation links lack expanded 44px touch padding in mobile media query',
            'detail': 'Desktop nav links are tight (0.4rem padding), which increases tap error rate on mobile thumb navigation.'
        })

    # Category 11: Mobile Modal Accessibility & ARIA Semantics (Loop 3)
    modal_dialog_role = 'role="dialog"' in html or 'role=\'dialog\'' in html
    modal_aria_modal = 'aria-modal="true"' in html
    modal_labelled_by = 'aria-labelledby="modalTitle"' in html or 'aria-label=' in html
    modal_close_label = False
    if 'id="modalClose"' in html or "id='modalClose'" in html:
        close_tag = re.search(r'<button[^>]*id=["\']modalClose["\'][^>]*>', html)
        if close_tag and 'aria-label' in close_tag.group(0):
            modal_close_label = True

    if not (modal_dialog_role and modal_aria_modal and modal_labelled_by):
        findings.append({
            'cat': 'Mobile Accessibility (A11y)',
            'severity': 'HIGH',
            'issue': 'Modal dialog lacks ARIA semantics (role="dialog", aria-modal="true", aria-labelledby)',
            'detail': 'Screen reader users on iOS VoiceOver or Android TalkBack cannot identify the popup as a modal dialog.'
        })

    if not modal_close_label:
        findings.append({
            'cat': 'Mobile Accessibility (A11y)',
            'severity': 'HIGH',
            'issue': 'Modal close button lacks aria-label attribute',
            'detail': 'VoiceOver/TalkBack reads "✕" as "multiplication symbol" instead of "Close dialog".'
        })

    # Category 12: Landscape Mobile Orientation (Loop 3)
    has_landscape_query = bool(re.search(r'@media[^{]+max-height\s*:\s*(?:480px|500px|550px)', css))
    if not has_landscape_query:
        findings.append({
            'cat': 'Orientation & Screen Ergonomics',
            'severity': 'MEDIUM',
            'issue': 'Missing landscape orientation height query for compact mobile screens',
            'detail': 'When phones are rotated horizontally (viewport height <= 500px), fixed headers without compact height consume excessive screen space.'
        })

    # Category 13: Focus Ring & Switch Control Navigation (Loop 3)
    if ':focus-visible' not in css:
        findings.append({
            'cat': 'Ergonomics & Keyboard/Switch Control',
            'severity': 'MEDIUM',
            'issue': 'Missing :focus-visible custom focus ring styling',
            'detail': 'Users navigating on iPad or Android tablets with external keyboards / assistive switches need clear high-contrast focus rings.'
        })

    # Print Report
    print("=" * 60)
    print(f"MOBILE UI AUDITOR REPORT — {len(findings)} ISSUES FOUND")
    print("=" * 60)
    for idx, f in enumerate(findings, 1):
        print(f"{idx}. [{f['severity']}] {f['cat']} -> {f['issue']}")
        print(f"   Detail: {f['detail']}")
    print("=" * 60)

    return len(findings)

if __name__ == '__main__':
    run_comprehensive_audit()
