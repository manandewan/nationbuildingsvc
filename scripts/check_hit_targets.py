import subprocess
import time
import json
import urllib.request
import asyncio
import websockets

async def check_hit_targets():
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new", "--remote-debugging-port=9226", "--disable-gpu", "--no-sandbox", "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(20):
            try:
                urllib.request.urlopen("http://localhost:9226/json")
                break
            except Exception:
                time.sleep(0.2)
        res = urllib.request.urlopen("http://localhost:9226/json")
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

            await cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1.2)
            await cmd("Emulation.setDeviceMetricsOverride", {"width": 375, "height": 812, "deviceScaleFactor": 2, "mobile": True})
            await asyncio.sleep(0.3)

            js_code = """
            (() => {
                const smalls = [];
                const selector = 'button, a, [role="button"], [role="tab"]';
                const els = document.querySelectorAll(selector);
                for (const el of els) {
                    const r = el.getBoundingClientRect();
                    if (r.width > 0 && r.height > 0) {
                        if (r.width < 44 || r.height < 44) {
                            smalls.push({
                                tag: el.tagName,
                                text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 35),
                                cls: el.className,
                                w: Math.round(r.width * 10) / 10,
                                h: Math.round(r.height * 10) / 10,
                                id: el.id,
                                parent: el.parentElement ? (el.parentElement.className || el.parentElement.tagName) : ''
                            });
                        }
                    }
                }
                return smalls;
            })()
            """
            eval_r = await cmd("Runtime.evaluate", {"expression": js_code, "returnByValue": True})
            print(json.dumps(eval_r.get("result", {}).get("value"), indent=2))
    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

if __name__ == "__main__":
    asyncio.run(check_hit_targets())
