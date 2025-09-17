def chunk_text(text, max_chars=800, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start += max_chars - overlap
    return [c for c in chunks if len(c) > 50]  # filter out very short junk
