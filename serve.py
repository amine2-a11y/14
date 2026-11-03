#!/usr/bin/env python3
"""Serve this folder on the local network; internet is not needed."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
        '.js':'text/javascript', '.css':'text/css', '.bin':'application/octet-stream',
        '.appcache':'text/cache-manifest'}
    def end_headers(self):
        if self.path.split('?',1)[0].lower().endswith(('.png','.jpg','.jpeg','.gif','.webp','.ico')):
            self.send_header('Cache-Control','public, max-age=604800')
        else:
            self.send_header('Cache-Control','no-store, must-revalidate')
            self.send_header('Pragma','no-cache')
            self.send_header('Expires','0')
        super().end_headers()

if __name__ == '__main__':
    port=int(os.environ.get('AFTERGLOW_PORT','8000'))
    print(f'AMINE PS4 local server: http://0.0.0.0:{port}/  (Ctrl+C to stop)')
    ThreadingHTTPServer(('0.0.0.0',port),Handler).serve_forever()
