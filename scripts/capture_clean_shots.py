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

async def take_shot(viewport_w, viewport_h, prep_script, out_name):
    # Free port 9235
    proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--remote-debugging-port=9235",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        for _ in range(30):
            try:
                urllib.request.urlopen("http://localhost:9235/json")
                break
            except Exception:
                time.sleep(0.15)
        res = urllib.request.urlopen("http://localhost:9235/json")
        ws_url = json.loads(res.read())[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            msg_id = 0
            async def cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(req))
                while True:
                    r = json.loads(await asyncio.wait_for(ws.recv(), timeout=5.0))
                    if r.get("id") == msg_id:
                        return r.get("result", {})

            await cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1.0)
            await cmd("Emulation.setDeviceMetricsOverride", {
                "width": viewport_w,
                "height": viewport_h,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(0.2)

            if prep_script:
                await cmd("Runtime.evaluate", {"expression": prep_script})
                await asyncio.sleep(0.5)

            shot = await cmd("Page.captureScreenshot", {"format": "png"})
            path = os.path.join(ARTIFACT_DIR, out_name)
            with open(path, "wb") as f:
                f.write(base64.b64decode(shot["data"]))
            print(f"Successfully saved {out_name}")
    finally:
        proc.terminate()
        proc.wait()

async def main():
    # 1. Mobile Hero & Header at 375x812
    await take_shot(375, 812, None, "mobile_hero_375.png")

    # 2. Mobile Nav Open
    await take_shot(375, 812, "document.getElementById('mobileToggle').click()", "mobile_nav_drawer_open.png")

    # 3. Modal Bottom-Sheet Open (Talent Unbound)
    await take_shot(375, 812, "document.querySelector('[data-modal-trigger=\"talentUnbound\"]').click()", "mobile_modal_bottom_sheet.png")

    # 4. Work Charter Three Pulses
    await take_shot(375, 812, "document.getElementById('charter').scrollIntoView()", "mobile_pulses_charter.png")

    # 5. Ultra-compact iPhone SE 320x568
    await take_shot(320, 568, None, "mobile_narrow_320_se.png")

    # 6. Landscape Mobile 812x375
    await take_shot(812, 375, None, "mobile_landscape_812x375.png")

if __name__ == "__main__":
    asyncio.run(main())
