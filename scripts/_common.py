"""Shared utilities for the sync scripts."""
import json, os, re, html, sys, urllib.request, urllib.error

GH_REPO = os.environ.get('GITHUB_REPOSITORY', 'mablue/mablue.github.io')
GH_TOKEN = os.environ.get('GITHUB_TOKEN', '')

def fetch_json(url, headers=None, timeout=20):
    h = {'User-Agent': 'mosavet-bot', 'Accept': 'application/vnd.github+json'}
    if headers:
        h.update(headers)
    if GH_TOKEN:
        h['Authorization'] = f'Bearer {GH_TOKEN}'
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default

def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def extract_images(c):
    return re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', c or '')

def list_github_dir(owner, repo, path=''):
    """List files in a GitHub repo directory. Returns None on failure."""
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'.rstrip('/')
    try:
        data = fetch_json(url)
        return [f for f in data if isinstance(f, dict)]
    except Exception as e:
        print(f'  ! list_github_dir({owner}/{repo}/{path}) failed: {e}', file=sys.stderr)
        return None
