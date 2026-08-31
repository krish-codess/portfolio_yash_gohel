"""
YouTube Music → Spotify Playlist Sync
Auto-syncs ALL YouTube Music playlists to Spotify once a day.
Adds new songs, removes deleted songs.
"""

import time
import logging
import os
import socket
from datetime import datetime
from requests.exceptions import ReadTimeout, ConnectionError

# Force 30-second timeout at the OS socket level — overrides all library defaults
socket.setdefaulttimeout(30)

# ─────────────────────────────────────────────
# CONFIGURATION — EDIT THESE VALUES
# ─────────────────────────────────────────────

# Your Spotify app credentials (from developer.spotify.com)
SPOTIFY_CLIENT_ID = "a71df9db830f44cdae32cce5bc165ca3"
SPOTIFY_CLIENT_SECRET = "a3322f711b514380afee8d7fb655a5f1"
SPOTIFY_REDIRECT_URI = "http://127.0.0.1:8888/callback"

# Your Spotify username (visible at open.spotify.com/account)
SPOTIFY_USERNAME = "22glgc3idb2f645eodqtfmmga"

# Set to True to automatically sync EVERY YouTube Music playlist.
# Set to False to only sync the playlists listed in PLAYLIST_MAP below.
SYNC_ALL_PLAYLISTS = False

# Only used when SYNC_ALL_PLAYLISTS = False.
# Format: "YouTube Music playlist name": "Spotify playlist name"
PLAYLIST_MAP = {
    "Indie OP": "Indie OP",
}

# How often to sync (in seconds). 86400 = once a day.
SYNC_INTERVAL_SECONDS = 86400

# ─────────────────────────────────────────────
# SETUP — DO NOT EDIT BELOW THIS LINE
# ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    handlers=[
        logging.FileHandler("sync_log.txt"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)


def retry(fn, *args, retries=5, wait=3, **kwargs):
    """Call fn(*args, **kwargs), retrying on timeout up to `retries` times."""
    for attempt in range(retries):
        try:
            return fn(*args, **kwargs)
        except (ReadTimeout, ConnectionError) as e:
            if attempt < retries - 1:
                log.warning(f"Timeout, retrying in {wait}s... ({attempt + 1}/{retries})")
                time.sleep(wait)
            else:
                raise e


def get_ytmusic_client():
    from ytmusicapi import YTMusic
    auth_file = "ytmusic_auth.json"
    if not os.path.exists(auth_file):
        raise FileNotFoundError(
            f"YouTube Music auth file '{auth_file}' not found.\n"
            "Please run: python3 setup_ytmusic_auth.py"
        )
    return YTMusic(auth_file)


def get_spotify_client():
    import spotipy
    from spotipy.oauth2 import SpotifyOAuth

    scope = "playlist-read-private playlist-modify-private playlist-modify-public"

    sp = spotipy.Spotify(
        auth_manager=SpotifyOAuth(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET,
            redirect_uri=SPOTIFY_REDIRECT_URI,
            scope=scope,
            username=SPOTIFY_USERNAME,
            cache_path=".spotify_token_cache"
        ),
        requests_timeout=30
    )
    sp.requests_timeout = 30  # ensure it's set after construction
    return sp


def get_yt_playlist_songs(yt, playlist_name):
    """Return list of (title, artist) tuples from a YT Music playlist."""
    playlists = yt.get_library_playlists(limit=50)
    playlist_id = None
    for pl in playlists:
        if pl["title"].strip().lower() == playlist_name.strip().lower():
            playlist_id = pl["playlistId"]
            break

    if not playlist_id:
        log.warning(f"YT Music playlist '{playlist_name}' not found.")
        return []

    songs = []
    items = yt.get_playlist(playlist_id, limit=500).get("tracks", [])
    for item in items:
        title = item.get("title", "")
        artists = item.get("artists", [])
        artist = artists[0]["name"] if artists else ""
        songs.append((title.strip(), artist.strip()))

    log.info(f"YT Music '{playlist_name}': {len(songs)} songs found.")
    return songs


def get_spotify_playlist_id(sp, playlist_name):
    """Find a Spotify playlist by name and return its ID."""
    offset = 0
    while True:
        results = retry(sp.current_user_playlists, limit=50, offset=offset)
        for pl in results["items"]:
            if pl["name"].strip().lower() == playlist_name.strip().lower():
                return pl["id"]
        if results["next"] is None:
            break
        offset += 50
    return None


def get_spotify_playlist_tracks(sp, playlist_id):
    """Return dict of {spotify_track_uri: (title, artist)} for all tracks in playlist."""
    tracks = {}
    offset = 0
    while True:
        results = retry(sp.playlist_tracks, playlist_id, offset=offset, limit=100)
        for item in results["items"]:
            track = item.get("track")
            if not track or track.get("id") is None:
                continue
            uri = track["uri"]
            title = track["name"]
            artist = track["artists"][0]["name"] if track["artists"] else ""
            tracks[uri] = (title.strip(), artist.strip())
        if results["next"] is None:
            break
        offset += 100
    return tracks


def search_spotify_track(sp, title, artist):
    """Search for a track on Spotify and return its URI, or None if not found."""
    try:
        query = f"track:{title} artist:{artist}"
        results = retry(sp.search, q=query, type="track", limit=1)
        items = results["tracks"]["items"]
        if items:
            return items[0]["uri"]
        # Fallback: title only
        results = retry(sp.search, q=title, type="track", limit=1)
        items = results["tracks"]["items"]
        if items:
            return items[0]["uri"]
    except Exception as e:
        log.warning(f"Search failed for '{title}': {e}")
    return None


def sync_playlist(yt, sp, yt_name, sp_name):
    log.info(f"--- Syncing '{yt_name}' → '{sp_name}' ---")

    yt_songs = get_yt_playlist_songs(yt, yt_name)
    if not yt_songs:
        log.warning(f"No songs found in YT Music playlist '{yt_name}'. Skipping.")
        return

    sp_playlist_id = get_spotify_playlist_id(sp, sp_name)
    if not sp_playlist_id:
        log.warning(f"Spotify playlist '{sp_name}' not found. Creating it...")
        pl = sp._post("me/playlists", payload={"name": sp_name, "public": False})
        sp_playlist_id = pl["id"]
        log.info(f"Created Spotify playlist '{sp_name}'.")

    sp_tracks = get_spotify_playlist_tracks(sp, sp_playlist_id)
    sp_track_names = {(t.lower(), a.lower()) for t, a in sp_tracks.values()}

    # ADD missing songs
    uris_to_add = []
    for (title, artist) in yt_songs:
        key = (title.lower(), artist.lower())
        if key not in sp_track_names:
            uri = search_spotify_track(sp, title, artist)
            if uri and uri not in sp_tracks:
                uris_to_add.append(uri)
                log.info(f"  + Adding: {title} — {artist}")
            elif uri is None:
                log.warning(f"  ? Not found on Spotify: {title} — {artist}")
            time.sleep(0.2)  # slightly longer pause to avoid rate limits

    # Add in batches of 100
    for i in range(0, len(uris_to_add), 100):
        retry(sp.playlist_add_items, sp_playlist_id, uris_to_add[i:i+100])

    # REMOVE songs no longer in YT Music
    yt_song_keys = {(t.lower(), a.lower()) for t, a in yt_songs}
    uris_to_remove = []
    for uri, (title, artist) in sp_tracks.items():
        if (title.lower(), artist.lower()) not in yt_song_keys:
            uris_to_remove.append({"uri": uri})
            log.info(f"  - Removing: {title} — {artist}")

    for i in range(0, len(uris_to_remove), 100):
        retry(sp.playlist_remove_specific_occurrences_of_items,
              sp_playlist_id, uris_to_remove[i:i+100])

    log.info(f"Done. Added {len(uris_to_add)}, removed {len(uris_to_remove)} tracks.")


def get_all_yt_playlist_names(yt):
    """Fetch all playlist names from the YouTube Music library."""
    playlists = yt.get_library_playlists(limit=100)
    names = [pl["title"].strip() for pl in playlists if pl.get("title")]
    log.info(f"Found {len(names)} YouTube Music playlist(s): {', '.join(names)}")
    return names


def run_sync():
    log.info("=" * 50)
    log.info(f"Sync started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    try:
        yt = get_ytmusic_client()
        sp = get_spotify_client()

        if SYNC_ALL_PLAYLISTS:
            playlist_names = get_all_yt_playlist_names(yt)
            playlist_map = {name: name for name in playlist_names}
        else:
            playlist_map = PLAYLIST_MAP

        for yt_name, sp_name in playlist_map.items():
            try:
                sync_playlist(yt, sp, yt_name, sp_name)
            except Exception as e:
                log.error(f"Error syncing '{yt_name}': {e}")
    except Exception as e:
        log.error(f"Fatal error: {e}")
    log.info("Sync complete.")


def main():
    log.info("YouTube Music → Spotify Sync Tool started.")
    mode = "ALL playlists" if SYNC_ALL_PLAYLISTS else f"{len(PLAYLIST_MAP)} playlist(s)"
    log.info(f"Mode: {mode} — syncing every {SYNC_INTERVAL_SECONDS // 3600} hours.")
    while True:
        run_sync()
        next_run = datetime.fromtimestamp(time.time() + SYNC_INTERVAL_SECONDS)
        log.info(f"Next sync at: {next_run.strftime('%Y-%m-%d %H:%M:%S')}")
        time.sleep(SYNC_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
