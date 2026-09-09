import asyncio, json, urllib.request, subprocess, time, base64
import websockets

async def capture_views():
    proc = subprocess.Popen([
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        'http://localhost:3000'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    tabs = None
    for _ in range(20):
        try:
            tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
            if tabs:
                break
        except Exception:
            time.sleep(0.3)
    if not tabs:
        raise RuntimeError("Chrome failed to start on 9222")

    try:
        target_tab = None
        for t in tabs:
            if 'localhost:3000' in t.get('url', ''):
                target_tab = t
                break
        if not target_tab:
            target_tab = tabs[0]
        ws_url = target_tab['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=15*1024*1024) as ws:
            # Set iPhone 13/14 viewport (375x812)
            await ws.send(json.dumps({
                'id': 1,
                'method': 'Emulation.setDeviceMetricsOverride',
                'params': {'width': 375, 'height': 812, 'deviceScaleFactor': 3, 'mobile': True}
            }))
            await ws.recv()

            async def screenshot(path):
                await ws.send(json.dumps({'id': 100, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
                while True:
                    msg = json.loads(await ws.recv())
                    if msg.get('id') == 100:
                        with open(path, 'wb') as f:
                            f.write(base64.b64decode(msg['result']['data']))
                        print(f"Captured: {path}")
                        break

            # 1. Capture scrolled down on Home (to see pillars and metrics)
            await ws.send(json.dumps({
                'id': 2,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'window.scrollTo(0, 500);'}
            }))
            await ws.recv()
            await asyncio.sleep(0.3)
            await screenshot('/tmp/mobile_home_scrolled.png')

            # 2. Test Mobile Menu Open
            await ws.send(json.dumps({
                'id': 3,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'window.scrollTo(0, 0); document.getElementById("mobileToggle").click();'}
            }))
            await ws.recv()
            await asyncio.sleep(0.3)
            await screenshot('/tmp/mobile_menu_open.png')

            # 3. Test Join Tab
            await ws.send(json.dumps({
                'id': 4,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'document.querySelector(".main-nav a[data-tab=\'join\']").click();'}
            }))
            await ws.recv()
            await asyncio.sleep(0.3)
            await screenshot('/tmp/mobile_join_tab.png')

            # 4. Test Modal Open on Join tab
            await ws.send(json.dumps({
                'id': 5,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'document.querySelector("[data-modal-trigger=\'apply\']").click();'}
            }))
            await ws.recv()
            await asyncio.sleep(0.4)
            await screenshot('/tmp/mobile_modal_open.png')

            # 5. Test 320px compact viewport (iPhone SE 1st gen)
            await ws.send(json.dumps({
                'id': 6,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'document.getElementById("modalClose").click();'}
            }))
            await ws.recv()
            await ws.send(json.dumps({
                'id': 7,
                'method': 'Emulation.setDeviceMetricsOverride',
                'params': {'width': 320, 'height': 568, 'deviceScaleFactor': 2, 'mobile': True}
            }))
            await ws.recv()
            await ws.send(json.dumps({
                'id': 8,
                'method': 'Runtime.evaluate',
                'params': {'expression': 'document.querySelector(".main-nav a[data-tab=\'home\']").click(); window.scrollTo(0, 0);'}
            }))
            await ws.recv()
            await asyncio.sleep(0.3)
            await screenshot('/tmp/mobile_320_home.png')

    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(capture_views())
