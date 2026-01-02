# ContextOne

## Project Overview

ContextOne is an enterprise-grade, multi-tenant Retrieval-Augmented Generation (RAG) platform that enables businesses to transform static documentation into intelligent, context-aware AI chatbots deployable in under 2 minutes via a lightweight JavaScript widget.

### Core Differentiators
- **Zero-Config Intelligence:** No ML/DevOps expertise required
- **Strict Data Privacy:** Multi-tenant isolation with Supabase RLS + Qdrant partitioning
- **Frictionless Integration:** Single `<script>` tag deployment
- **Production-Grade:** Scales to 10,000+ concurrent users with Supabase + VPS
- **Resume-Ready:** Full-stack SaaS architecture demonstrating AI, DevOps, and system design

## Key Features

- **Multi-Tenant RAG Platform:** Secure isolation between users with Supabase Row Level Security
- **No-Code Dashboard:** Intuitive React-based interface for document upload and chatbot configuration
- **Lightweight Widget:** 15KB JavaScript widget for seamless website integration
- **Document Processing:** Support for PDF, DOCX, HTML, TXT, and MD files with automatic chunking and embedding
- **Analytics Dashboard:** Comprehensive metrics including conversation tracking, user satisfaction, and token usage
- **API Key Management:** Secure authentication with hashed API keys and rate limiting
- **Real-Time Chat:** Sub-3-second response times with source citations

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend (Maker Dashboard)** | React 18 + Vite + TypeScript + Shadcn UI | Modern, fast builds, beautiful pre-built components, excellent DX |
| **Frontend (Widget)** | Vanilla JavaScript (no deps) | Lightweight (~15KB gzipped), works everywhere |
| **Backend API** | FastAPI (Python 3.11+) | Async/await, auto-generated OpenAPI docs, fast |
| **Database** | Supabase (PostgreSQL) | Built-in auth, real-time, RLS for multi-tenancy, generous free tier |
| **Vector DB** | Qdrant (Docker) | Rust-based, fast, native multi-tenancy via payloads |
| **LLM Provider** | IBM watsonx.ai | Granite/Llama models, no cost for trial, enterprise-grade |
| **Auth** | Supabase Auth + API Keys | OAuth, magic links, JWT built-in, RLS integration |
| **Hosting (Frontend)** | Vercel | Zero-config deployment, edge functions, perfect for React |
| **Hosting (Backend)** | Hostinger VPS (Docker) | Affordable, full control for FastAPI + Qdrant |
| **CDN (Widget)** | Cloudflare or VPS static files | Fast global delivery of widget.js |

## Requirements

### Performance
- Chat response time: < 3 seconds (95th percentile)
- Document processing: < 30 seconds for 10MB PDF
- Widget load time: < 500ms
- Concurrent users: Support 10,000+ simultaneous chats

### Security
- All API endpoints require authentication
- HTTPS only (TLS 1.3)
- API keys hashed with bcrypt
- Rate limiting: 100 requests/minute per API key
- CORS whitelist for widget domains
- Input sanitization to prevent injection attacks
- Multi-tenant data isolation via tenant_id filtering

### Scalability
- Horizontal scaling via Docker Swarm/Kubernetes
- Qdrant sharding for vector storage
- Redis for caching (future optimization)
- CDN for widget.js distribution

### Monitoring & Logging
- Application logs (structured JSON)
- Error tracking (Sentry or similar)
- Performance monitoring (response times, throughput)
- Resource usage (CPU, memory, disk)
- Uptime monitoring (99.9% SLA target)

### Compliance
- GDPR compliance (data export, deletion)
- SOC 2 Type II preparation
- User consent for data collection
- Data retention policies

## Installation and Setup

### Backend Deployment (Hostinger VPS)

1. **Prerequisites:**
   - Ubuntu 22.04 VPS with Docker installed
   - Domain name configured with SSL certificates

2. **Clone Repository:**
   ```bash
   git clone https://github.com/your-org/contextone.git
   cd contextone
   ```

3. **Environment Setup:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your Supabase, Qdrant, and IBM watsonx credentials
   ```

4. **Deploy with Docker Compose:**
   ```bash
   cd backend
   docker-compose up -d
   ```

5. **SSL Configuration:**
   - Configure Nginx with Let's Encrypt SSL certificates
   - Update CORS settings for your domain

### Frontend Deployment (Vercel)

1. **Prerequisites:**
   - Vercel account
   - Supabase project created

2. **Deploy:**
   ```bash
   cd frontend
   npm install
   npm run build
   vercel --prod
   ```

3. **Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://api.contextone.io
   ```

## Usage

### Typical Workflow

1. **Maker** signs up → Creates "Flinkk Documentation" project
2. **Maker** uploads 50 PDFs (API docs, feature guides, troubleshooting)
3. **Maker** copies a `<script>` tag and pastes into Flinkk's website
4. **End-User (Visitor)** sees chat bubble on Flinkk.com → Asks "How do I reset my API key?"
5. **ContextOne** retrieves relevant docs and generates answer in 2.3 seconds
6. **Maker** views analytics: 1,000 conversations solved; 87% satisfaction rate

### Widget Integration

Add this script tag to your website's `<body>`:

```html
<script>
  (function() {
    window.ContextOneConfig = {
      projectId: 'proj_x9z_22',
      apiKey: 'pk_live_abc123'
    };
    var script = document.createElement('script');
    script.src = 'https://cdn.contextone.io/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

## Development Roadmap

### Week 1: Foundation
- Day 1-2: Project setup (repos, Docker, Supabase setup, environment)
- Day 3-4: Supabase database schema + RLS policies + authentication
- Day 5-7: React + Vite + Shadcn UI setup + project management UI

### Week 2: Core RAG Engine
- Day 8-10: Document upload + parsing (PDF, DOCX, TXT)
- Day 11-12: Text chunking + embedding pipeline
- Day 13-14: Qdrant integration + vector storage

### Week 3: Chat & Widget
- Day 15-17: Chat API endpoint (retrieval + generation)
- Day 18-20: Widget development (UI + API integration)
- Day 21: Widget customization (colors, position)

### Week 4: Polish & Deploy
- Day 22-24: Analytics dashboard
- Day 25-26: Testing (unit, integration, E2E)
- Day 27-28: VPS deployment + SSL setup
- Day 29: Documentation + demo video
- Day 30: Final testing + launch

## Success Metrics

### Technical Metrics
- 99.5%+ uptime
- < 3s average response time
- Support 1,000 documents per project
- Process 100 uploads/day

### Business Metrics
- 10+ beta users in first month
- 100+ conversations handled
- 80%+ user satisfaction (thumbs up)
- 5+ testimonials/case studies

## Contributing

We welcome contributions to ContextOne! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
- Follow the installation instructions above
- Run tests before submitting PRs
- Ensure code follows the existing style and patterns
- Update documentation as needed

For major changes, please open an issue first to discuss the proposed changes.