import asyncio, json, urllib.request, subprocess, time
import websockets

async def check():
    proc = subprocess.Popen([
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        'http://localhost:3000'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    try:
        tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
        target_tab = None
        for t in tabs:
            if 'localhost:3000' in t.get('url', ''):
                target_tab = t
                break
        if not target_tab:
            target_tab = tabs[0]
        ws_url = target_tab['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=10*1024*1024) as ws:
            await ws.send(json.dumps({
                'id': 1,
                'method': 'Emulation.setDeviceMetricsOverride',
                'params': {'width': 375, 'height': 812, 'deviceScaleFactor': 3, 'mobile': True}
            }))
            await ws.recv()
            js_code = """
            (() => {
                const items = [];
                document.querySelectorAll('*').forEach(e => {
                    const rect = e.getBoundingClientRect();
                    if (e.offsetWidth > 375 || e.scrollWidth > 375 || rect.width > 375) {
                        items.push({
                            tag: e.tagName,
                            cls: typeof e.className === 'string' ? e.className.trim() : '',
                            id: e.id,
                            offsetWidth: e.offsetWidth,
                            scrollWidth: e.scrollWidth,
                            rectWidth: Math.round(rect.width),
                            rectRight: Math.round(rect.right),
                            text: (e.innerText || '').slice(0, 30).replace(/\\n/g, ' ')
                        });
                    }
                });
                return items;
            })()
            """
            await ws.send(json.dumps({
                'id': 2,
                'method': 'Runtime.evaluate',
                'params': {
                    'expression': js_code,
                    'returnByValue': True
                }
            }))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get('id') == 2:
                    val = msg['result']['result']['value']
                    print(f"Elements overflowing 375px: {len(val)}")
                    if val:
                        print(json.dumps(val, indent=2))
                    break

            # Capture mobile screenshot
            await ws.send(json.dumps({
                'id': 3,
                'method': 'Page.captureScreenshot',
                'params': {'format': 'png'}
            }))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get('id') == 3:
                    import base64
                    img_bytes = base64.b64decode(msg['result']['data'])
                    with open('/tmp/cdp_mobile_375.png', 'wb') as f:
                        f.write(img_bytes)
                    print(f"Screenshot saved to /tmp/cdp_mobile_375.png ({len(img_bytes)} bytes)")
                    break
    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(check())
