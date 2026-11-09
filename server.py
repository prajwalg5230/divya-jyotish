#!/usr/bin/env python3
"""
Divya Jyotish - High Performance Local HTTP Web Server
Serves the Divya Jyotish Vedic Astrologer application with auto port detection,
CORS support, and IP address discovery for mobile/desktop browser access.
"""

import http.server
import socketserver
import os
import socket
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    global PORT
    while PORT < 8090:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                local_ip = get_local_ip()
                print("=" * 65)
                print(" ✨ ॐ दिव्य ज्योतिष - DIVYA JYOTISH VEDIC ASTROLOGY APP ॐ ✨")
                print("=" * 65)
                print(f" 🚀 Local URL:    http://localhost:{PORT}")
                print(f" 📱 Mobile/LAN:   http://{local_ip}:{PORT}")
                print(f" 📂 Directory:    {DIRECTORY}")
                print("=" * 65)
                print(" Press Ctrl+C to stop the server.")
                print("=" * 65)
                httpd.serve_forever()
                break
        except OSError:
            PORT += 1

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n Server stopped safely. Har Har Mahadev! ॐ")
        sys.exit(0)
