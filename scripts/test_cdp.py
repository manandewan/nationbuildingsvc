import subprocess
import time
import json
import urllib.request
import asyncio
import websockets

async def run_cdp():
    proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        # Wait for Chrome to be ready
        for _ in range(20):
            try:
                res = urllib.request.urlopen("http://localhost:9222/json/version")
                break
            except Exception:
                time.sleep(0.2)
        else:
            print("Failed to start Chrome")
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

            # Navigate to localhost:3000
            await send_cmd("Page.navigate", {"url": "http://localhost:3000"})
            await asyncio.sleep(1)

            # Evaluate page title
            eval_res = await send_cmd("Runtime.evaluate", {"expression": "document.title"})
            print("Page Title:", eval_res.get("result", {}).get("value"))

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(run_cdp())
