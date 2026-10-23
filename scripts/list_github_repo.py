#!/usr/bin/env python3
"""List files in a GitHub repo. Usage: list_github_repo.py <owner> <repo> <output.json>"""
import sys, json
sys.path.insert(0, 'scripts')
from _common import list_github_dir, save_json, load_json

def main():
    if len(sys.argv) < 4:
        print('Usage: list_github_repo.py <owner> <repo> <out.json>')
        return 1
    owner, repo, out = sys.argv[1], sys.argv[2], sys.argv[3]
    files = list_github_dir(owner, repo)
    if files is None:
        if load_json(out):
            print(f'⚠️  Using cached {out}')
            return 0
        print(f'❌ Failed and no cache')
        return 1
    # filter out directories, keep only files
    names = [f['name'] for f in files if f.get('type') == 'file']
    save_json(out, names)
    print(f'✅ {len(names)} files in {owner}/{repo} → {out}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
