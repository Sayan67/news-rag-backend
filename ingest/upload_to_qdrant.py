from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct, Distance
import os
from dotenv import load_dotenv
import json
from embedding import get_jina_embedding
from chunking import chunk_text
import numpy as np

load_dotenv()

QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
QDRANT_URL = os.environ["QDRANT_URL"]
COLLECTION_NAME = "news_docs"

qdrant_client = QdrantClient(
    url=QDRANT_URL, 
    api_key=QDRANT_API_KEY,
)

docs=[]

with open("articles.json","r") as f:
    docs = json.load(f)
docs = docs[:50] 
qdrant_client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE) 
)

BATCH = 32
def insert_articles(docs):
    points = []
    for idx, d in enumerate(docs):
        chunks = chunk_text(d["text"])
        print(chunks)
        if not chunks:
            continue
        embeddings = get_jina_embedding(chunks)
        # vec = np.array(embeddings).flatten().tolist()
        # break
        for i, (chunk, vec) in enumerate(zip(chunks, embeddings)):
            print(f"Article {idx}, chunk {i}, vector length: {len(vec)}")

            point = PointStruct(
                id=idx * 10 + i,  # unique id
                vector=vec,       
                payload={
                    "title": d["title"],
                    "url": d["url"],
                    "text": chunk,  
                }
            )
            points.append(point)


        # upload in batches
        if len(points) >= BATCH:
            qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
            print(f"Uploaded {idx+1} articles")
            points = []

    # flush remaining
    if points:
        qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
        print(f"Uploaded {len(points)} articles")
    print(f"Uploaded {len(docs)} articles total")

insert_articles(docs)