#!/usr/bin/env python3
"""Rebuild HTML data from cached sources. Fails safe — skips sections that have no data."""
import sys, json, re, os, hashlib
from urllib.parse import urlparse, quote
from urllib.parse import quote
sys.path.insert(0, 'scripts')
from _common import load_json, strip_html, extract_images

RAW_ASSETS = 'https://raw.githubusercontent.com/mablue/mosavet-assets/main/images'
RAW_MUSIC = './media/music'
RAW_PODCAST = './media/podcast'

# Fallback CDN URLs (used only if local media/ is empty)
CDN_MUSIC = 'https://raw.githubusercontent.com/mablue/music/main'
CDN_PODCAST = 'https://raw.githubusercontent.com/mablue/podcast/main'

def build_gallery(wp, assets_set):
    """Flatten WP images into individual gallery items.
    Uses MD5 hash of URL to match filenames in mosavet-assets repo."""
    items = []
    for post in (wp or {}).get('posts', []):
        imgs = extract_images(post.get('content') or '')
        featured = post.get('featured_image') or ''
        all_imgs = imgs if imgs else ([featured] if featured else [])
        title = strip_html(post.get('title'))
        date = (post.get('date') or '')[:10]
        for i, url in enumerate(all_imgs):
            if not url:
                continue
            # Compute MD5 hash — matches the download script algorithm
            ext = os.path.splitext(urlparse(url).path)[1] or '.jpg'
            fname = hashlib.md5(url.encode()).hexdigest()[:16] + ext
            # Filter: only keep if file exists in assets repo (or assets set is empty)
            if assets_set and fname not in assets_set:
                continue
            items.append({
                'src': f'{RAW_ASSETS}/{fname}',
                'title': title + (f' ({i+1}/{len(all_imgs)})' if len(all_imgs) > 1 else ''),
                'post_title': title,
                'date': date,
            })
    return items

def build_texts(wp):
    out = []
    for post in (wp or {}).get('posts', []):
        content = post.get('content') or ''
        text = strip_html(content)
        imgs = extract_images(content)
        if text and len(text) > 100 and len(imgs) <= 2:
            out.append({
                'title': strip_html(post.get('title')),
                'date': (post.get('date') or '')[:10],
                'text': text[:4000],
            })
    return out

def scan_media_dir(dir_path, url_prefix):
    """Scan a local media directory. Prefers local files over CDN.

    Uses content-based hash (first 64KB + size) for cache busting.
    Stable across git checkouts (same content = same hash).
    """
    import hashlib
    out = []
    if not os.path.isdir(dir_path):
        return out
    for f in sorted(os.listdir(dir_path)):
        if not f.lower().endswith(('.mp3', '.m4a', '.ogg', '.wav', '.flac', '.opus', '.oga')):
            continue
        full = os.path.join(dir_path, f)
        if not os.path.isfile(full):
            continue
        title = os.path.splitext(f)[0].replace('_', ' ').replace('-', ' ')
        safe_f = quote(f, safe='')
        try:
            size = os.path.getsize(full)
            with open(full, 'rb') as fp:
                head = fp.read(65536)
            h = hashlib.md5(head + str(size).encode()).hexdigest()[:8]
        except Exception:
            h = '1'
        out.append({'title': title, 'file': f'{url_prefix}/{safe_f}?v={h}'})
    return out


def build_media(files, base_url):
    out = []
    for f in (files or []):
        if f.lower().endswith(('.mp3', '.m4a', '.ogg', '.wav', '.flac', '.opus', '.oga')):
            # URL-encode filename (handles spaces, special chars)
            safe_f = quote(f, safe='')
            # Title: strip extension, replace separators with spaces
            title = os.path.splitext(f)[0].replace('_', ' ').replace('-', ' ')
            out.append({
                'title': title,
                'file': f'{base_url}/{safe_f}',
            })
    return out

def replace_var(content, var, data):
    m = re.search(rf'var\s+{var}\s*=\s*', content)
    if not m:
        return content, False
    start = m.end()
    if start >= len(content) or content[start] != '[':
        return content, False
    depth = 0; in_str = False; esc = False
    for i in range(start, len(content)):
        c = content[i]
        if esc: esc = False; continue
        if c == '\\': esc = True; continue
        if c == '"' and not esc: in_str = not in_str; continue
        if in_str: continue
        if c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                return content[:start] + json.dumps(data, ensure_ascii=False) + content[i+1:], True
    return content, False

def update_file(path, replacements):
    if not os.path.exists(path): return False
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    orig = c
    for var, data in replacements.items():
        c, ok = replace_var(c, var, data)
        if ok:
            print(f'  updated {var} in {path}')
        else:
            print(f'  ⚠️  {var} not found in {path}')
    if c == orig: return False
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    return True

def main():
    print('[rebuild] Loading sources...')
    wp = load_json('_wp_data.json', {'posts': []})
    assets = set(load_json('_assets.json', []) or [])
    music_files = load_json('_music.json', []) or []
    podcast_files = load_json('_podcast.json', []) or []

    gallery = build_gallery(wp, assets)
    texts = build_texts(wp)
    # Prefer local media/ (populated by manual uploads / sync scripts)
    music = scan_media_dir('media/music', './media/music')
    podcast = scan_media_dir('media/podcast', './media/podcast')

    # Fallback to CDN if local dirs are empty
    if not music:
        print('  ⚠ media/music empty — falling back to CDN')
        music = build_media(music_files, CDN_MUSIC)
    if not podcast:
        print('  ⚠ media/podcast empty — falling back to CDN')
        podcast = build_media(podcast_files, CDN_PODCAST)

    print(f'  gallery: {len(gallery)} items')
    print(f'  texts: {len(texts)} items')
    print(f'  music: {len(music)} tracks')
    print(f'  podcast: {len(podcast)} tracks')

    changed = False
    if update_file('gallery.html', {'IMAGES': gallery}):
        changed = True
    if update_file('texts.html', {'TEXTS': texts}):
        changed = True
    if update_file('index.html', {
        'GALLERY_PREVIEW': gallery[:9],
        'TEXTS_PREVIEW': texts[:3],
        'MUSIC_TRACKS': music,
        'PODCAST_TRACKS': podcast,
    }):
        changed = True

    print('[rebuild] DONE' if changed else '[rebuild] no changes')
    return 0

if __name__ == '__main__':
    sys.exit(main())
