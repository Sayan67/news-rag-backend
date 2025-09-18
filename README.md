# News RAG Backend

A full-stack Retrieval-Augmented Generation (RAG) system for news articles using Google Gemini AI and Qdrant vector database. This backend provides intelligent question-answering capabilities by processing and querying news articles with advanced embedding and retrieval techniques.

## Features

- **RAG Pipeline**: Complete RAG implementation with document chunking, embedding, and retrieval
- **Streaming Responses**: Real-time AI responses with Server-Sent Events (SSE)
- **Vector Search**: High-performance semantic search using Qdrant vector database
- **Session Management**: Redis-based conversation history and session handling
- **Embeddings**: Jina AI embeddings for superior semantic understanding
- **AI Generation**: Google Gemini 2.0 Flash for intelligent response generation
- **News Ingestion**: Python-based data pipeline for news article processing
- **CORS Support**: Cross-origin resource sharing for web applications

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API   │    │   Vector DB     │
│                 │───▶│                 │───▶│   (Qdrant)      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Session       │
                       │   Storage       │
                       │   (Redis)       │
                       └─────────────────┘
```

## Technology Stack

### Backend (Node.js)
- **Express.js**: Web framework and API server
- **Google Gemini AI**: Large language model for response generation
- **Jina AI**: Embedding service for semantic search
- **Qdrant**: Vector database for similarity search
- **Redis**: Session storage and conversation history
- **Socket.io**: Real-time communication (available)
- **UUID**: Session identifier generation

### Data Pipeline (Python)
- **Qdrant Client**: Vector database operations
- **Jina Embeddings**: Text embedding generation
- **NumPy**: Numerical operations
- **Requests**: HTTP client for API calls

## Prerequisites

- Node.js (v18+)
- Python (v3.12+)
- Redis server
- API Keys:
  - Google Gemini API key
  - Jina AI API key
  - Qdrant API key and URL

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd news-rag-backend
```

### 2. Backend Setup
```bash
cd src
npm install
```

### 3. Python Environment Setup
```bash
# Create virtual environment (if not present)
python3 -m venv .

# Activate virtual environment
source bin/activate  # On macOS/Linux
# or
Scripts\activate     # On Windows

# Install Python dependencies
pip install qdrant-client python-dotenv requests numpy
```

### 4. Environment Configuration
Create a `.env` file in both the root directory and `src/` directory:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Jina AI Configuration
JINA_API_KEY=your_jina_api_key_here

# Qdrant Configuration
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_URL=your_qdrant_cluster_url_here

# Redis Configuration
REDIS_PASSWORD=your_redis_password
REDIS_PORT=your_redis_port
REDIS_URL=your_redis_url
```

## Data Ingestion

### 1. Prepare News Data
Place your news articles in `ingest/articles.json` with the following format:
```json
[
  {
    "title": "Article Title",
    "url": "https://example.com/article",
    "text": "Full article content..."
  }
]
```

### 2. Run Data Ingestion Pipeline
```bash
cd ingest
python upload_to_qdrant.py
```

This script will:
- Load articles from `articles.json`
- Split articles into chunks (800 characters with 100 character overlap)
- Generate embeddings using Jina AI
- Upload to Qdrant vector database
- Process up to 50 articles (configurable in `upload_to_qdrant.py:25`)

## Usage

### 1. Start the Backend Server
```bash
cd src
npm start
```

The server will run on `http://localhost:4000`

### 2. API Endpoints

#### Health Check
```http
GET /
```
Response: `"AI Chat Backend is running ✅"`

#### Create Session
```http
POST /api/session
```
Response:
```json
{
  "sessionId": "uuid-session-id"
}
```

#### Streaming Chat
```http
POST /api/chat/stream
Content-Type: application/json

{
  "sessionId": "uuid-session-id",
  "message": "What are the latest news about AI?"
}
```

Response: Server-Sent Events stream with:
```
data: {"token": "partial response"}
data: {"token": " continues here"}
data: {"done": true}
```

#### Get Conversation History
```http
GET /api/history/:sessionId
```
Response:
```json
[
  {
    "role": "user",
    "text": "User message"
  },
  {
    "role": "assistant", 
    "text": "AI response"
  }
]
```

#### Reset Session
```http
DELETE /api/session/:sessionId
```
Response:
```json
{
  "ok": true
}
```

## Configuration

### Chunking Parameters
Modify `ingest/chunking.py` to adjust text chunking:
- `max_chars`: Maximum characters per chunk (default: 800)
- `overlap`: Character overlap between chunks (default: 100)
- Minimum chunk length: 50 characters

### Embedding Configuration
- Model: `jina-embeddings-v3` (1024 dimensions)
- Task: `text-matching` for optimal retrieval performance

### Vector Database
- Collection: `news_docs`
- Distance metric: Cosine similarity
- Vector dimensions: 1024

### Session Management
- Session expiry: 24 hours
- Redis key format: `session:{sessionId}:messages`

## Development

### Project Structure
```
news-rag-backend/
├── src/                    # Node.js backend
│   ├── index.js           # Main server file
│   ├── package.json       # Node dependencies
│   ├── services/          # Core services
│   │   ├── rag.js        # RAG pipeline implementation
│   │   ├── gemini.js     # Google Gemini integration
│   │   ├── embedding.js  # Jina AI embedding service
│   │   └── qdrant.js     # Qdrant vector search
│   └── utils/
│       └── redis.js      # Redis client configuration
├── ingest/                # Python data pipeline
    ├── upload_to_qdrant.py   # Main ingestion script
    ├── chunking.py           # Text chunking utilities
    ├── embedding.py          # Embedding generation
    ├── fetch_and_save.py     # Data fetching utilities
    ├── articles.json         # News articles data
    └── test.ipynb           # Jupyter notebook for testing

```

### Running in Development Mode
```bash
cd src
npm run start  # Uses nodemon for auto-restart
```

### Adding New Features

1. **New API Endpoints**: Add routes in `src/index.js`
2. **Enhanced RAG**: Modify `src/services/rag.js`
3. **Custom Embeddings**: Update `src/services/embedding.js`
4. **Data Processing**: Extend `ingest/` scripts

## Error Handling

The application includes comprehensive error handling for:
- Missing environment variables
- API key validation
- Redis connection failures
- Qdrant connectivity issues
- Invalid request parameters
- Embedding generation errors

## Performance Considerations

- **Batch Processing**: Ingestion processes documents in batches of 32
- **Vector Dimensions**: 1024-dimensional embeddings balance accuracy and speed
- **Chunking Strategy**: 800-character chunks with overlap ensure context preservation
- **Session Caching**: Redis provides fast session retrieval
- **Streaming**: Server-Sent Events reduce perceived latency

## Security Features

- Environment variable configuration for sensitive data
- API key validation
- CORS protection
- Session expiration
- Input validation for all endpoints

## Troubleshooting

### Common Issues

1. **"Missing API key" errors**: Verify `.env` file configuration
2. **Redis connection issues**: Check Redis server status and credentials
3. **Qdrant upload failures**: Verify API key and cluster URL
4. **Empty search results**: Ensure data ingestion completed successfully
5. **Embedding dimension mismatches**: Verify Jina API model consistency

### Logs and Debugging

- Server logs available in console output
- Enable debug mode by setting `NODE_ENV=development`
- Python ingestion logs show upload progress
- Check network connectivity for external API calls

## License

This project is licensed under the ISC License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

Built with ❤️ using Node.js, Python, and modern AI technologies.