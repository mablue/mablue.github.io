#!/usr/bin/env python3
"""Fetch WordPress posts. Idempotent — fails gracefully."""
import sys, json
sys.path.insert(0, 'scripts')
from _common import fetch_json, save_json, load_json

WP_API = "https://public-api.wordpress.com/rest/v1.1/sites/mosavet.wordpress.com/posts/?number=100&fields=ID,title,content,excerpt,URL,date,format,featured_image"

def main():
    try:
        data = fetch_json(WP_API, headers={'User-Agent': 'Mozilla/5.0'})
        save_json('_wp_data.json', data)
        n = len(data.get('posts', []))
        print(f'✅ Fetched {n} posts from WordPress')
        return 0
    except Exception as e:
        print(f'❌ WordPress fetch failed: {e}')
        if load_json('_wp_data.json'):
            print('  Using cached _wp_data.json')
            return 0
        return 1

if __name__ == '__main__':
    sys.exit(main())
