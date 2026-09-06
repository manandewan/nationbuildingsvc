import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import base64
import os

ARTIFACT_DIR = "/Users/manandewan/.gemini/antigravity/brain/b915ea19-7508-42d5-8d39-d9e4f5e9ed4c"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def capture_screenshots():
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new", "--remote-debugging-port=9228", "--disable-gpu", "--no-sandbox", "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(20):
            try:
                urllib.request.urlopen("http://localhost:9228/json")
                break
            except Exception:
                time.sleep(0.2)
        res = urllib.request.urlopen("http://localhost:9228/json")
        ws_url = json.loads(res.read())[0]["webSocketDebuggerUrl"]
        async with websockets.connect(ws_url) as ws:
            msg_id = 0
            async def cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(req))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get("id") == msg_id: return r.get("result", {})

            async def save_shot(filename, clip=None):
                params = {"format": "png"}
                if clip:
                    params["clip"] = clip
                shot_data = await cmd("Page.captureScreenshot", params)
                img_bytes = base64.b64decode(shot_data["data"])
                path = os.path.join(ARTIFACT_DIR, filename)
                with open(path, "wb") as f:
                    f.write(img_bytes)
                print(f"Saved {path} ({len(img_bytes)} bytes)")
                return path

            await cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1.2)

            # 1. Standard 375x812 - Hero & Header
            await cmd("Emulation.setDeviceMetricsOverride", {"width": 375, "height": 812, "deviceScaleFactor": 2, "mobile": True})
            await asyncio.sleep(0.4)
            await save_shot("mobile_hero_375.png")

            # 2. Mobile Navigation Open
            await cmd("Runtime.evaluate", {"expression": "document.getElementById('mobileToggle').click()"})
            await asyncio.sleep(0.5)
            await save_shot("mobile_nav_drawer_open.png")

            # Close nav
            await cmd("Runtime.evaluate", {"expression": "document.getElementById('navBackdrop').click()"})
            await asyncio.sleep(0.4)

            # 3. Project Talent Unbound Bottom-Sheet Modal
            await cmd("Runtime.evaluate", {"expression": "document.querySelector('[data-modal-trigger=\"talentUnbound\"]').click()"})
            await asyncio.sleep(0.8)
            await save_shot("mobile_modal_bottom_sheet.png")

            # Close modal
            await cmd("Runtime.evaluate", {"expression": "document.getElementById('modalClose').click()"})
            await asyncio.sleep(0.4)

            # 4. Work Charter Three Pulses section
            await cmd("Runtime.evaluate", {"expression": "document.getElementById('charter').scrollIntoView({behavior: 'instant'})"})
            await asyncio.sleep(0.4)
            await save_shot("mobile_pulses_charter.png")

            # 5. Narrow Screen (320x568 iPhone SE)
            await cmd("Emulation.setDeviceMetricsOverride", {"width": 320, "height": 568, "deviceScaleFactor": 2, "mobile": True})
            await cmd("Runtime.evaluate", {"expression": "window.scrollTo(0, 0)"})
            await asyncio.sleep(0.4)
            await save_shot("mobile_narrow_320_se.png")

            # 6. Landscape Mobile (812x375)
            await cmd("Emulation.setDeviceMetricsOverride", {"width": 812, "height": 375, "deviceScaleFactor": 2, "mobile": True})
            await cmd("Runtime.evaluate", {"expression": "window.scrollTo(0, 0)"})
            await asyncio.sleep(0.4)
            await save_shot("mobile_landscape_812x375.png")

    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
