# ingest/fetch_and_save.py
import feedparser
from newspaper import Article
import json
from urllib.parse import urlparse

FEEDS = [
"https://feeds.bbci.co.uk/news/in_pictures/rss.xml"
"http://rss.cnn.com/rss/cnn_tech.rss"
"https://feeds.bbci.co.uk/news/stories/rss.xml"
"https://feeds.bbci.co.uk/news/have_your_say/rss.xml"
]

out = []
for feed in FEEDS:
    d = feedparser.parse(feed)
    for entry in d.entries:
        if any(x in entry.link for x in ["/video", "/videos", "/audio"]):
            continue
        if len(out) >= 60: break
        try:
            a = Article(entry.link)
            a.download(); a.parse()
            out.append({
                "id": entry.link,
                "title": a.title,
                "text": a.text,
                "url": entry.link,
                "published": getattr(entry, "published", None)
            })
        except Exception as e:
            print("skipping", entry.link, e)

with open("articles.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
