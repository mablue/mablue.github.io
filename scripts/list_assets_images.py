#!/usr/bin/env python3
"""List images in mosavet-assets/images/. Idempotent."""
import sys
sys.path.insert(0, 'scripts')
from _common import list_github_dir, save_json, load_json

def main():
    files = list_github_dir('mablue', 'mosavet-assets', 'images')
    if files is None:
        if load_json('_assets.json'):
            print('⚠️  Using cached _assets.json')
            return 0
        print('❌ Failed, no cache')
        return 1
    names = [f['name'] for f in files if f.get('type') == 'file']
    save_json('_assets.json', names)
    print(f'✅ {len(names)} assets in mosavet-assets/images → _assets.json')
    return 0

if __name__ == '__main__':
    sys.exit(main())
