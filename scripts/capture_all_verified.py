import asyncio
import json
import urllib.request
import subprocess
import time
import base64
import os

ARTIFACT_DIR = "/Users/manandewan/.gemini/antigravity/brain/d49e3712-5eb5-41f0-8096-238a1b265dfa"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def run():
    proc = subprocess.Popen([
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless=new',
        '--remote-debugging-port=9255',
        '--disable-gpu',
        'http://localhost:3000'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    tabs = None
    for _ in range(30):
        try:
            tabs = json.loads(urllib.request.urlopen('http://localhost:9255/json').read())
            if tabs:
                break
        except Exception:
            time.sleep(0.2)

    if not tabs:
        proc.terminate()
        raise RuntimeError("Chrome failed to start on 9255")

    try:
        target_tab = None
        for t in tabs:
            if 'localhost:3000' in t.get('url', ''):
                target_tab = t
                break
        if not target_tab:
            target_tab = tabs[0]
        ws_url = target_tab['webSocketDebuggerUrl']

        async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
            msg_counter = 10

            async def send_cmd(method, params=None):
                nonlocal msg_counter
                msg_counter += 1
                cmd_id = msg_counter
                await ws.send(json.dumps({'id': cmd_id, 'method': method, 'params': params or {}}))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get('id') == cmd_id:
                        return data.get('result', {})

            async def capture(filename):
                shot = await send_cmd('Page.captureScreenshot', {'format': 'png'})
                filepath = os.path.join(ARTIFACT_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(base64.b64decode(shot['data']))
                print(f"Captured: {filename}")

            await asyncio.sleep(1.0)

            # ----------------------------------------------------
            # 1. MOBILE SUITE (375x812)
            # ----------------------------------------------------
            await send_cmd('Emulation.setDeviceMetricsOverride', {
                'width': 375, 'height': 812, 'deviceScaleFactor': 2, 'mobile': True
            })
            await asyncio.sleep(0.3)

            # Mobile Home Hero (verify badge removed)
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("home"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_home.png')

            # Mobile Home Scrolled (verify metrics dark theme)
            await send_cmd('Runtime.evaluate', {'expression': 'window.scrollTo(0, 600);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_home_metrics.png')

            # Mobile Nav Drawer Open
            await send_cmd('Runtime.evaluate', {'expression': 'window.scrollTo(0, 0); document.getElementById("mobileToggle").click();'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_nav_open.png')
            await send_cmd('Runtime.evaluate', {'expression': 'document.getElementById("mobileToggle").click();'})
            await asyncio.sleep(0.3)

            # Mobile Initiatives Tab
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("initiatives"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_initiatives.png')

            # Mobile Structure Tab
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("structure"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_structure.png')

            # Mobile Team Tab
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("team"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_team.png')

            # Mobile Join Tab
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("join"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_join.png')

            # Mobile Modal Drawer Open (bottom sheet)
            await send_cmd('Runtime.evaluate', {'expression': 'window.openModal("talentUnbound");'})
            await asyncio.sleep(0.4)
            await capture('verified_mobile_modal.png')
            await send_cmd('Runtime.evaluate', {'expression': 'window.closeModal();'})
            await asyncio.sleep(0.3)

            # ----------------------------------------------------
            # 2. DESKTOP SUITE (1440x900)
            # ----------------------------------------------------
            await send_cmd('Emulation.setDeviceMetricsOverride', {
                'width': 1440, 'height': 900, 'deviceScaleFactor': 1, 'mobile': False
            })
            await asyncio.sleep(0.3)

            # Desktop Home Hero
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("home"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_home.png')

            # Desktop Home Metrics
            await send_cmd('Runtime.evaluate', {'expression': 'window.scrollTo(0, 700);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_home_metrics.png')

            # Desktop Initiatives
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("initiatives"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_initiatives.png')

            # Desktop Structure
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("structure"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_structure.png')

            # Desktop Team
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("team"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_team.png')

            # Desktop Join
            await send_cmd('Runtime.evaluate', {'expression': 'window.switchTab("join"); window.scrollTo(0, 0);'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_join.png')

            # Desktop Modal Dialog
            await send_cmd('Runtime.evaluate', {'expression': 'window.openModal("apply");'})
            await asyncio.sleep(0.4)
            await capture('verified_desktop_modal.png')
            await send_cmd('Runtime.evaluate', {'expression': 'window.closeModal();'})
            await asyncio.sleep(0.3)

            print("All verification screenshots successfully captured!")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == '__main__':
    import websockets
    asyncio.run(run())
