# AMINE PS4 14.00 — Offline package

This package contains the page, stylesheet, scripts, image, and payload files locally. It has **no CDN, remote font, external JavaScript, or external image dependency**. The Application Cache manifest lists every runtime asset and does not use a wildcard network fallback.

## Use without internet

1. Extract this folder on a computer or Android device that can run the included local server script.
2. Start `serve.sh` (Linux/macOS/Termux) or run `python3 serve.py` (Windows/Linux/macOS with Python 3).
3. Connect the PS4 and the hosting device to the same local Wi-Fi network. The Wi-Fi router/hotspot does **not** need internet access.
4. Find the hosting device's local IP address and open `http://LOCAL-IP:8000/` in the PS4 browser.
5. Keep the local server and Wi-Fi connection active while opening the page. On the first visit, allow the offline cache to finish saving. Later visits can use the browser's saved cache, subject to PS4 browser Application Cache support.

**Important:** This is offline from the internet, but it is not a self-hosting PS4 app. On first load the PS4 must reach the local server over Wi-Fi/LAN. If you want to open the project with absolutely no other device or local server, this web project cannot do that by itself.

The landing page waits for the cache-ready event. If **autostart** is checked, it shows a five-second cancellation countdown; unchecking it stops automatic launch. The **Start** button launches only after the cache is ready.

## Included files

- `index.html`, `jb.html`, `offline.html`, `style.css`
- `launch.js`, `cache-status.js`
- Local JavaScript modules and binary payload files
- `offline.appcache` — local offline asset list
- `STABILITY_REPORT.md` — maintenance scope and verification results
- `serve.sh` and `serve.py` — local HTTP servers

## Scope of changes

Offline packaging only: local cache manifest, local fallback/help page, local server helper, and clearer cache status messages. The exploit scripts and payload binaries are carried over unchanged from the supplied archive; this packaging does not validate compatibility or guarantee that any exploit or payload will run on a console.
