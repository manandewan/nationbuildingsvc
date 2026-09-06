import subprocess
import time
import json
import urllib.request
import asyncio
import websockets

async def run_mobile_qa():
    # Launch Chrome with remote debugging
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    qa_results = {
        "nav_drawer": {},
        "modal_drawer": {},
        "pulses_tabs": {},
        "touch_ergonomics": {},
        "viewports_overflow": {},
        "edge_cases": {},
        "screenshots": []
    }

    try:
        # Wait for Chrome
        for _ in range(25):
            try:
                urllib.request.urlopen("http://localhost:9222/json/version")
                break
            except Exception:
                time.sleep(0.2)
        else:
            print("Chrome failed to initialize.")
            return

        res = urllib.request.urlopen("http://localhost:9222/json")
        targets = json.loads(res.read())
        ws_url = targets[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            msg_id = 0
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(req))
                while True:
                    resp = json.loads(await ws.recv())
                    if resp.get("id") == msg_id:
                        return resp.get("result", {})

            async def eval_js(expr):
                r = await send_cmd("Runtime.evaluate", {
                    "expression": expr,
                    "returnByValue": True,
                    "awaitPromise": True
                })
                return r.get("result", {}).get("value")

            async def set_viewport(width, height, is_mobile=True):
                await send_cmd("Emulation.setDeviceMetricsOverride", {
                    "width": width,
                    "height": height,
                    "deviceScaleFactor": 2,
                    "mobile": is_mobile
                })
                await send_cmd("Emulation.setTouchEmulationEnabled", {
                    "enabled": is_mobile
                })

            # Navigate to the site
            await send_cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1.2)

            # =================================================================
            # TEST 1: Viewports & Horizontal Overflow Checking
            # =================================================================
            viewports = [
                {"name": "iPhone SE / Ultra-compact", "w": 320, "h": 568},
                {"name": "iPhone 8 / SE2 Standard", "w": 375, "h": 667},
                {"name": "iPhone 12/13/14/15 Modern", "w": 390, "h": 844},
                {"name": "Android Flagship (Pixel/Galaxy)", "w": 412, "h": 915},
                {"name": "Landscape Mobile (iPhone X)", "w": 812, "h": 375},
            ]

            overflow_results = []
            for vp in viewports:
                await set_viewport(vp["w"], vp["h"])
                await asyncio.sleep(0.3)
                dims = await eval_js("""
                    (() => {
                        const docWidth = document.documentElement.scrollWidth;
                        const bodyWidth = document.body.scrollWidth;
                        const winWidth = window.innerWidth;
                        // Find any elements causing overflow
                        const overflowing = [];
                        document.querySelectorAll('*').forEach(el => {
                            const rect = el.getBoundingClientRect();
                            if (rect.right > winWidth + 1 && el.offsetWidth > 0) {
                                overflowing.push({
                                    tag: el.tagName,
                                    id: el.id,
                                    cls: el.className,
                                    right: Math.round(rect.right),
                                    width: Math.round(rect.width)
                                });
                            }
                        });
                        return {
                            scrollWidth: Math.max(docWidth, bodyWidth),
                            innerWidth: winWidth,
                            hasOverflow: Math.max(docWidth, bodyWidth) > winWidth,
                            overflowElementsCount: overflowing.length,
                            sampleOverflowing: overflowing.slice(0, 3)
                        };
                    })()
                """)
                overflow_results.append({
                    "viewport": vp["name"],
                    "width": vp["w"],
                    "height": vp["h"],
                    "data": dims
                })
            qa_results["viewports_overflow"] = overflow_results

            # Reset to standard mobile 375x812 (iPhone 13 mini / X)
            await set_viewport(375, 812)
            await asyncio.sleep(0.3)

            # =================================================================
            # TEST 2: Mobile Navigation Drawer & Backdrop
            # =================================================================
            # Check toggle initial state
            nav_init = await eval_js("""
                (() => {
                    const btn = document.getElementById('mobileToggle');
                    const nav = document.getElementById('mainNav');
                    const backdrop = document.getElementById('navBackdrop');
                    const rect = btn.getBoundingClientRect();
                    const style = window.getComputedStyle(btn);
                    return {
                        exists: !!btn && !!nav && !!backdrop,
                        btnText: btn.textContent.trim(),
                        ariaExpanded: btn.getAttribute('aria-expanded'),
                        isOpen: nav.classList.contains('open'),
                        backdropActive: backdrop.classList.contains('active'),
                        btnWidth: rect.width,
                        btnHeight: rect.height,
                        btnDisplay: style.display,
                        touchAction: style.touchAction
                    };
                })()
            """)

            # Click hamburger toggle to OPEN
            await eval_js("document.getElementById('mobileToggle').click()")
            await asyncio.sleep(0.4)

            nav_opened = await eval_js("""
                (() => {
                    const btn = document.getElementById('mobileToggle');
                    const nav = document.getElementById('mainNav');
                    const backdrop = document.getElementById('navBackdrop');
                    const bodyHasClass = document.body.classList.contains('nav-open');
                    const navStyle = window.getComputedStyle(nav);
                    const backdropStyle = window.getComputedStyle(backdrop);
                    const bodyStyle = window.getComputedStyle(document.body);
                    
                    // Check nav links hit targets
                    const links = Array.from(nav.querySelectorAll('.nav-link')).map(a => {
                        const r = a.getBoundingClientRect();
                        const s = window.getComputedStyle(a);
                        return {
                            text: a.textContent.trim(),
                            width: Math.round(r.width),
                            height: Math.round(r.height),
                            minHeight: s.minHeight,
                            paddingTop: s.paddingTop,
                            paddingBottom: s.paddingBottom
                        };
                    });

                    return {
                        btnText: btn.textContent.trim(),
                        ariaExpanded: btn.getAttribute('aria-expanded'),
                        isOpen: nav.classList.contains('open'),
                        bodyHasNavOpen: bodyHasClass,
                        bodyOverflow: bodyStyle.overflow,
                        bodyTouchAction: bodyStyle.touchAction,
                        backdropActive: backdrop.classList.contains('active'),
                        backdropOpacity: backdropStyle.opacity,
                        backdropVisibility: backdropStyle.visibility,
                        backdropFilter: backdropStyle.backdropFilter || backdropStyle.webkitBackdropFilter,
                        navMaxHeight: navStyle.maxHeight,
                        navOverscroll: navStyle.overscrollBehavior,
                        navLinks: links
                    };
                })()
            """)

            # Dismiss via nav-backdrop tap
            await eval_js("document.getElementById('navBackdrop').click()")
            await asyncio.sleep(0.4)

            nav_after_backdrop = await eval_js("""
                (() => {
                    const btn = document.getElementById('mobileToggle');
                    const nav = document.getElementById('mainNav');
                    const backdrop = document.getElementById('navBackdrop');
                    return {
                        btnText: btn.textContent.trim(),
                        ariaExpanded: btn.getAttribute('aria-expanded'),
                        isOpen: nav.classList.contains('open'),
                        bodyHasNavOpen: document.body.classList.contains('nav-open'),
                        backdropActive: backdrop.classList.contains('active')
                    };
                })()
            """)

            # Re-open and dismiss via nav-link tap
            await eval_js("document.getElementById('mobileToggle').click()")
            await asyncio.sleep(0.3)
            # Click first nav-link
            await eval_js("document.querySelector('#mainNav .nav-link').click()")
            await asyncio.sleep(0.4)

            nav_after_link_tap = await eval_js("""
                (() => {
                    const btn = document.getElementById('mobileToggle');
                    const nav = document.getElementById('mainNav');
                    return {
                        btnText: btn.textContent.trim(),
                        ariaExpanded: btn.getAttribute('aria-expanded'),
                        isOpen: nav.classList.contains('open'),
                        bodyHasNavOpen: document.body.classList.contains('nav-open')
                    };
                })()
            """)

            qa_results["nav_drawer"] = {
                "initial_state": nav_init,
                "opened_state": nav_opened,
                "dismiss_via_backdrop": nav_after_backdrop,
                "dismiss_via_nav_link": nav_after_link_tap
            }

            # =================================================================
            # TEST 3: Modal Bottom-Sheet Drawer
            # =================================================================
            # 3A: Project Talent Unbound Brief
            await eval_js("document.querySelector('[data-modal-trigger=\"talentUnbound\"]').click()")
            await asyncio.sleep(0.4)

            modal_tu = await eval_js("""
                (() => {
                    const overlay = document.getElementById('modalOverlay');
                    const card = overlay.querySelector('.modal-card');
                    const title = document.getElementById('modalTitle').textContent;
                    const closeBtn = document.getElementById('modalClose');
                    const body = document.getElementById('modalBody');
                    const table = body.querySelector('.modal-table');

                    const overlayStyle = window.getComputedStyle(overlay);
                    const cardStyle = window.getComputedStyle(card);
                    const closeRect = closeBtn.getBoundingClientRect();
                    const bodyStyle = window.getComputedStyle(body);

                    return {
                        isActive: overlay.classList.contains('active'),
                        title: title,
                        cardBorderRadius: cardStyle.borderRadius,
                        cardMaxHeight: cardStyle.maxHeight,
                        cardTransform: cardStyle.transform,
                        cardBoxShadow: cardStyle.boxShadow,
                        bodyOverscroll: bodyStyle.overscrollBehavior,
                        bodyScrollHeight: body.scrollHeight,
                        bodyClientHeight: body.clientHeight,
                        bodyCanScroll: body.scrollHeight > body.clientHeight,
                        closeBtnAriaLabel: closeBtn.getAttribute('aria-label'),
                        closeBtnWidth: Math.round(closeRect.width),
                        closeBtnHeight: Math.round(closeRect.height),
                        hasTable: !!table,
                        tableScrollWidth: table ? table.scrollWidth : 0,
                        tableClientWidth: table ? table.clientWidth : 0,
                        tableOverflowsContainer: table ? table.scrollWidth > table.clientWidth : false,
                        tableOverflowX: table ? window.getComputedStyle(table).overflowX : null,
                        docOverflowLocked: document.body.style.overflow === 'hidden'
                    };
                })()
            """)

            # Dismiss via overlay click
            await eval_js("""
                (() => {
                    const overlay = document.getElementById('modalOverlay');
                    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                })()
            """)
            await asyncio.sleep(0.4)
            tu_closed = await eval_js("!document.getElementById('modalOverlay').classList.contains('active') && document.body.style.overflow === ''")

            # 3B: Project Vitality Brief
            await eval_js("document.querySelector('[data-modal-trigger=\"vitality\"]').click()")
            await asyncio.sleep(0.4)

            modal_vit = await eval_js("""
                (() => {
                    const overlay = document.getElementById('modalOverlay');
                    const title = document.getElementById('modalTitle').textContent;
                    const body = document.getElementById('modalBody');
                    const table = body.querySelector('.modal-table');
                    return {
                        isActive: overlay.classList.contains('active'),
                        title: title,
                        hasTable: !!table,
                        tableScrollWidth: table ? table.scrollWidth : 0,
                        tableClientWidth: table ? table.clientWidth : 0
                    };
                })()
            """)

            # Dismiss via close button
            await eval_js("document.getElementById('modalClose').click()")
            await asyncio.sleep(0.4)
            vit_closed = await eval_js("!document.getElementById('modalOverlay').classList.contains('active')")

            # 3C: Single Recruitment Application Modal
            await eval_js("document.querySelector('[data-modal-trigger=\"apply\"]').click()")
            await asyncio.sleep(0.4)

            modal_app = await eval_js("""
                (() => {
                    const overlay = document.getElementById('modalOverlay');
                    const title = document.getElementById('modalTitle').textContent;
                    const body = document.getElementById('modalBody');
                    const table = body.querySelector('.modal-table');
                    return {
                        isActive: overlay.classList.contains('active'),
                        title: title,
                        hasTable: !!table,
                        tableScrollWidth: table ? table.scrollWidth : 0,
                        tableClientWidth: table ? table.clientWidth : 0
                    };
                })()
            """)

            # Dismiss via Escape key
            await eval_js("""
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            """)
            await asyncio.sleep(0.4)
            app_closed = await eval_js("!document.getElementById('modalOverlay').classList.contains('active')")

            qa_results["modal_drawer"] = {
                "talent_unbound": modal_tu,
                "talent_unbound_closed": tu_closed,
                "vitality": modal_vit,
                "vitality_closed": vit_closed,
                "apply": modal_app,
                "apply_closed": app_closed
            }

            # =================================================================
            # TEST 4: Work Charter 'Three Pulses' Interactive Tabs
            # =================================================================
            tabs_info = await eval_js("""
                (() => {
                    const container = document.querySelector('.pulse-tabs');
                    const btns = Array.from(document.querySelectorAll('.pulse-tab-btn')).map(b => ({
                        pulse: b.getAttribute('data-pulse'),
                        text: b.textContent.trim(),
                        isActive: b.classList.contains('active'),
                        rect: b.getBoundingClientRect()
                    }));
                    const style = window.getComputedStyle(container);
                    return {
                        scrollWidth: container.scrollWidth,
                        clientWidth: container.clientWidth,
                        overflowX: style.overflowX,
                        webkitOverflowScrolling: style.webkitOverflowScrolling,
                        scrollbarWidth: style.scrollbarWidth,
                        btns: btns
                    };
                })()
            """)

            # Test tab switching
            # Switch to Pulse 2: Community Connect
            await eval_js("document.querySelector('.pulse-tab-btn[data-pulse=\"connect\"]').click()")
            await asyncio.sleep(0.2)
            tab2_res = await eval_js("""
                (() => ({
                    title: document.getElementById('pulseTitle').textContent,
                    desc: document.getElementById('pulseDesc').textContent.slice(0, 60),
                    listItems: Array.from(document.querySelectorAll('#pulseList li')).map(li => li.textContent)
                }))()
            """)

            # Switch to Pulse 3: Community Impact
            await eval_js("document.querySelector('.pulse-tab-btn[data-pulse=\"impact\"]').click()")
            await asyncio.sleep(0.2)
            tab3_res = await eval_js("""
                (() => ({
                    title: document.getElementById('pulseTitle').textContent,
                    desc: document.getElementById('pulseDesc').textContent.slice(0, 60),
                    listItems: Array.from(document.querySelectorAll('#pulseList li')).map(li => li.textContent)
                }))()
            """)

            # Switch back to Pulse 1: Civic Activation
            await eval_js("document.querySelector('.pulse-tab-btn[data-pulse=\"civic\"]').click()")
            await asyncio.sleep(0.2)
            tab1_res = await eval_js("""
                (() => ({
                    title: document.getElementById('pulseTitle').textContent,
                    desc: document.getElementById('pulseDesc').textContent.slice(0, 60),
                    listItems: Array.from(document.querySelectorAll('#pulseList li')).map(li => li.textContent)
                }))()
            """)

            qa_results["pulses_tabs"] = {
                "tabs_metrics": tabs_info,
                "tab2_connect": tab2_res,
                "tab3_impact": tab3_res,
                "tab1_civic": tab1_res
            }

            # =================================================================
            # TEST 5: Touch Ergonomics & Mobile Polish
            # =================================================================
            touch_polish = await eval_js("""
                (() => {
                    const bodyStyle = window.getComputedStyle(document.body);
                    const htmlStyle = window.getComputedStyle(document.documentElement);
                    const sampleBtn = document.querySelector('.btn-primary');
                    const sampleBtnStyle = window.getComputedStyle(sampleBtn);
                    const header = document.querySelector('.site-header');
                    const headerStyle = window.getComputedStyle(header);
                    const footer = document.querySelector('.site-footer');
                    const footerStyle = window.getComputedStyle(footer);

                    return {
                        htmlTextSizeAdjust: htmlStyle.webkitTextSizeAdjust,
                        tapHighlightColor: sampleBtnStyle.webkitTapHighlightColor,
                        touchActionBtn: sampleBtnStyle.touchAction,
                        headerPaddingTop: headerStyle.paddingTop,
                        headerHeight: header.offsetHeight,
                        footerPaddingBottom: footerStyle.paddingBottom,
                        allButtonsMinHitTarget: Array.from(document.querySelectorAll('button, .btn, .link-cta')).every(el => {
                            const r = el.getBoundingClientRect();
                            return (r.height >= 38 && r.width >= 38) || el.offsetParent === null;
                        })
                    };
                })()
            """)
            qa_results["touch_ergonomics"] = touch_polish

            # =================================================================
            # TEST 6: Edge Cases Testing
            # =================================================================
            # 6A: Rapid multi-tap on mobile hamburger toggle (e.g. 5 fast clicks)
            rapid_tap_res = await eval_js("""
                (() => {
                    const btn = document.getElementById('mobileToggle');
                    const nav = document.getElementById('mainNav');
                    for (let i = 0; i < 5; i++) {
                        btn.click();
                    }
                    return {
                        isOpen: nav.classList.contains('open'),
                        ariaExpanded: btn.getAttribute('aria-expanded'),
                        bodyHasNavOpen: document.body.classList.contains('nav-open')
                    };
                })()
            """)
            # Reset
            await eval_js("if (document.getElementById('mainNav').classList.contains('open')) document.getElementById('mobileToggle').click()")

            # 6B: Rapid modal open/close
            rapid_modal_res = await eval_js("""
                (() => {
                    const trigger = document.querySelector('[data-modal-trigger=\"talentUnbound\"]');
                    const close = document.getElementById('modalClose');
                    const overlay = document.getElementById('modalOverlay');
                    trigger.click();
                    close.click();
                    trigger.click();
                    return {
                        isActive: overlay.classList.contains('active'),
                        bodyOverflow: document.body.style.overflow
                    };
                })()
            """)
            # Clean up
            await eval_js("document.getElementById('modalClose').click()")
            await asyncio.sleep(0.3)

            # 6C: Landscape orientation layout check (812 x 375)
            await set_viewport(812, 375)
            await asyncio.sleep(0.3)
            landscape_metrics = await eval_js("""
                (() => {
                    const header = document.querySelector('.site-header');
                    const navContainer = document.querySelector('.nav-container');
                    const modalOverlay = document.getElementById('modalOverlay');
                    const modalTrigger = document.querySelector('[data-modal-trigger=\"talentUnbound\"]');
                    modalTrigger.click();
                    const card = modalOverlay.querySelector('.modal-card');
                    const cardRect = card.getBoundingClientRect();
                    const cardStyle = window.getComputedStyle(card);
                    const headerHeight = header.offsetHeight;
                    const navContainerHeight = navContainer.offsetHeight;
                    const cardMaxHeight = cardStyle.maxHeight;

                    // Close modal
                    document.getElementById('modalClose').click();

                    return {
                        headerHeight: headerHeight,
                        navContainerHeight: navContainerHeight,
                        cardHeight: cardRect.height,
                        cardMaxHeight: cardMaxHeight,
                        viewportHeight: window.innerHeight,
                        fitsComfortably: cardRect.height <= window.innerHeight
                    };
                })()
            """)

            qa_results["edge_cases"] = {
                "rapid_nav_toggle": rapid_tap_res,
                "rapid_modal_open_close": rapid_modal_res,
                "landscape_orientation": landscape_metrics
            }

            print(json.dumps(qa_results, indent=2))

    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

if __name__ == "__main__":
    asyncio.run(run_mobile_qa())
