import requests
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()
JINA_API_KEY = os.environ["JINA_API_KEY"]
JINA_URL = "https://api.jina.ai/v1/embeddings"

def get_jina_embedding(texts:List[str], model="jina-embeddings-v3"):
    if not JINA_API_KEY:
        raise ValueError("Please set the JINA_API_KEY environment variable")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {JINA_API_KEY}"
    }
    resp = requests.post(JINA_URL, headers=headers, json={
        "model": model,
        "task": "text-matching",
        "input": texts
    })
    resp.raise_for_status()
    data = resp.json()
    return [d["embedding"] for d in data["data"]]

