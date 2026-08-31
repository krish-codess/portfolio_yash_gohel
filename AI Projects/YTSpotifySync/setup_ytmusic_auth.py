"""
One-time setup: generate YouTube Music authentication file from curl.txt.
"""

import re
import sys
import os
import json

print("=" * 60)
print("YouTube Music Auth Setup")
print("=" * 60)
print()

curl_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "curl.txt")

if not os.path.exists(curl_file):
    print("ERROR: curl.txt not found in this folder.")
    print()
    print("Steps to create it:")
    print("1. Go to music.youtube.com in Chrome (logged in).")
    print("2. Press F12 → Network tab → type 'browse' in filter → refresh page.")
    print("3. Right-click a 'browse' request → Copy → Copy as cURL.")
    print("4. Open TextEdit → Format → Make Plain Text → paste → save as curl.txt here.")
    sys.exit(1)

print("Reading curl.txt...")
with open(curl_file, "r") as f:
    curl_cmd = f.read()

# Parse headers from -H 'name: value'
headers = {}
for match in re.finditer(r"-H\s+'([^:]+?):\s*([^']*)'", curl_cmd):
    headers[match.group(1).strip()] = match.group(2).strip()
# Also try double quotes
if not headers:
    for match in re.finditer(r'-H\s+"([^:]+?):\s*([^"]*)"', curl_cmd):
        headers[match.group(1).strip()] = match.group(2).strip()

# Parse cookie from -b flag if not already in headers
if "cookie" not in {k.lower() for k in headers}:
    cookie_match = re.search(r"-b\s+'([^']+)'", curl_cmd)
    if not cookie_match:
        cookie_match = re.search(r'-b\s+"([^"]+)"', curl_cmd)
    if cookie_match:
        headers["cookie"] = cookie_match.group(1)

if not headers:
    print("ERROR: Could not parse headers from curl.txt.")
    print("Make sure you used 'Copy as cURL' from Chrome DevTools.")
    sys.exit(1)

# Build the auth dict ytmusicapi expects
auth = {}
for key, value in headers.items():
    k = key.lower()
    if k in ("cookie", "authorization", "x-goog-authuser", "x-origin",
             "content-type", "accept", "accept-language", "user-agent"):
        auth[key] = value

# Ensure x-origin is set
if "x-origin" not in {k.lower() for k in auth}:
    auth["x-origin"] = "https://music.youtube.com"

if not any(k.lower() == "cookie" for k in auth):
    print("ERROR: No cookie found in the cURL command.")
    print("Make sure you're logged in to YouTube Music in Chrome before copying.")
    sys.exit(1)

if not any(k.lower() == "authorization" for k in auth):
    print("WARNING: No authorization header found. The auth may not work.")

out_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ytmusic_auth.json")
with open(out_file, "w") as f:
    json.dump(auth, f, indent=2)

print(f"Saved {len(auth)} headers to ytmusic_auth.json")
print()
print("Done! You can now run: python3 yt_to_spotify_sync.py")
