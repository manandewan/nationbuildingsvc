import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import base64
import os

ARTIFACT_DIR = "/Users/manandewan/.gemini/antigravity/brain/d49e3712-5eb5-41f0-8096-238a1b265dfa"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def capture_views():
    proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--remote-debugging-port=9240",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        for _ in range(30):
            try:
                urllib.request.urlopen("http://localhost:9240/json")
                break
            except Exception:
                time.sleep(0.15)
        res = urllib.request.urlopen("http://localhost:9240/json")
        ws_url = json.loads(res.read())[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url, max_size=25 * 1024 * 1024) as ws:
            msg_id = 0
            async def cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(req))
                while True:
                    r = json.loads(await asyncio.wait_for(ws.recv(), timeout=10.0))
                    if r.get("id") == msg_id:
                        return r.get("result", {})

            await cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1.5)

            # Define shots: (viewport_w, viewport_h, script, out_name, is_mobile)
            shots = [
                # Desktop shots (1440x900)
                (1440, 900, "window.switchTab ? window.switchTab('home') : (window.location.hash = '#home')", "verify_desktop_home.png", False),
                (1440, 900, "window.scrollTo(0, 650)", "verify_desktop_home_metrics.png", False),
                (1440, 900, "window.switchTab ? window.switchTab('initiatives') : (window.location.hash = '#initiatives'); window.scrollTo(0,0);", "verify_desktop_initiatives.png", False),
                (1440, 900, "window.switchTab ? window.switchTab('structure') : (window.location.hash = '#structure'); window.scrollTo(0,0);", "verify_desktop_structure.png", False),
                (1440, 900, "window.switchTab ? window.switchTab('team') : (window.location.hash = '#team'); window.scrollTo(0,0);", "verify_desktop_team.png", False),
                (1440, 900, "window.switchTab ? window.switchTab('join') : (window.location.hash = '#join'); window.scrollTo(0,0);", "verify_desktop_join.png", False),
                (1440, 900, "document.querySelector('[data-modal-trigger=\"talentUnbound\"]').click()", "verify_desktop_modal.png", False),
                (1440, 900, "document.getElementById('modal-close-btn').click()", None, False),

                # Mobile shots (375x812)
                (375, 812, "window.switchTab ? window.switchTab('home') : (window.location.hash = '#home'); window.scrollTo(0,0);", "verify_mobile_home.png", True),
                (375, 812, "window.scrollTo(0, 480)", "verify_mobile_home_metrics.png", True),
                (375, 812, "window.switchTab ? window.switchTab('initiatives') : (window.location.hash = '#initiatives'); window.scrollTo(0,0);", "verify_mobile_initiatives.png", True),
                (375, 812, "window.switchTab ? window.switchTab('structure') : (window.location.hash = '#structure'); window.scrollTo(0,0);", "verify_mobile_structure.png", True),
                (375, 812, "window.switchTab ? window.switchTab('team') : (window.location.hash = '#team'); window.scrollTo(0,0);", "verify_mobile_team.png", True),
                (375, 812, "window.switchTab ? window.switchTab('join') : (window.location.hash = '#join'); window.scrollTo(0,0);", "verify_mobile_join.png", True),
                (375, 812, "document.querySelector('[data-modal-trigger=\"talentUnbound\"]').click()", "verify_mobile_modal.png", True),
            ]

            for w, h, script, out_name, is_mobile in shots:
                await cmd("Emulation.setDeviceMetricsOverride", {
                    "width": w,
                    "height": h,
                    "deviceScaleFactor": 2,
                    "mobile": is_mobile
                })
                await asyncio.sleep(0.15)
                if script:
                    await cmd("Runtime.evaluate", {"expression": script})
                    await asyncio.sleep(0.4)
                if out_name:
                    shot = await cmd("Page.captureScreenshot", {"format": "png"})
                    path = os.path.join(ARTIFACT_DIR, out_name)
                    with open(path, "wb") as f:
                        f.write(base64.b64decode(shot["data"]))
                    print(f"Captured: {out_name} ({w}x{h})")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(capture_views())
