#!/usr/bin/env bash
# links.sh — Extract all links from a web page
# Usage: bash scripts/links.sh <url>
# Output: TSV on stdout: <absolute_url>\t<link_text> (one per line, deduplicated)
# Dependencies: curl, python3

set -euo pipefail
source "$(dirname "$0")/lib.sh"

[ $# -ge 1 ] || { echo "Usage: links.sh <url>" >&2; exit 1; }

URL="$1"
setup_temp

# Fetch HTML — capture final URL after redirects for correct relative link resolution
HTML_FILE="$WIKI_FETCH_TEMP/page.html"
HEADERS_FILE="$WIKI_FETCH_TEMP/headers.txt"
curl -sL -f --max-time 30 -A "Mozilla/5.0 (compatible; wiki-fetch)" \
  -o "$HTML_FILE" -D "$HEADERS_FILE" -w '%{url_effective}' "$URL" > "$WIKI_FETCH_TEMP/final_url.txt" || {
  echo "Error: Failed to fetch $URL" >&2
  exit 1
}
FINAL_URL=$(cat "$WIKI_FETCH_TEMP/final_url.txt")

# Extract links using Python html.parser (robust, no extra deps beyond stdlib)
python3 - "$FINAL_URL" "$HTML_FILE" << 'PYEOF'
import sys
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, urlunparse

base_url = sys.argv[1]
html_file = sys.argv[2]

class LinkExtractor(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
        self.links = []
        self.current_href = None
        self.current_text = ""

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.current_href = None
            self.current_text = ""
            for k, v in attrs:
                if k == "href":
                    self.current_href = v

    def handle_data(self, data):
        if self.current_href is not None:
            self.current_text += data.strip()

    def handle_endtag(self, tag):
        if tag == "a" and self.current_href:
            href = self.current_href
            self.current_href = None
            # Skip non-http schemes
            if href.startswith(("javascript:", "mailto:", "tel:", "#")):
                return
            url = urljoin(self.base, href)
            p = urlparse(url)
            if p.scheme not in ("http", "https"):
                return
            # Normalize: strip fragment, trailing slash
            path = p.path.rstrip("/")
            clean = urlunparse(p._replace(fragment="", path=path))
            self.links.append((clean, self.current_text))

with open(html_file) as f:
    html = f.read()

extractor = LinkExtractor(base_url)
extractor.feed(html)

# Deduplicate by URL, preserving order
seen = set()
for url, text in extractor.links:
    if url not in seen:
        seen.add(url)
        print(f"{url}\t{text}")
PYEOF
