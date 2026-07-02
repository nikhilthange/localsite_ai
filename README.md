# LocalSite AI

AI-powered SaaS platform for building and managing professional websites.

## AI Engine

This project uses **NVIDIA NIM** for all AI-powered features:
- Website content generation
- SEO metadata generation
- Logo generation
- Blog post generation
- FAQ generation
- Marketing copy generation
- Chatbot responses
- Growth analysis

**Endpoint**: `https://integrate.api.nvidia.com/v1`  
**Models**: `meta/llama-3.3-70b-instruct`, `meta/llama-3.1-8b-instruct`  
**SDK**: OpenAI SDK v4 (NVIDIA NIM provides an OpenAI-compatible API)

## Prerequisites

- Node.js >= 22
- MongoDB 7+
- Redis 7+
- NVIDIA NIM API key

## Environment Setup

Copy `.env.example` to `.env` in the backend directory and fill in your values:
```
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
```

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker compose -f docker-compose.yml up -d
```

## Architecture

- **Backend**: TypeScript + Express + MongoDB + Redis + BullMQ + Socket.IO
- **Frontend**: React 19 + Vite + TailwindCSS
- **AI**: NVIDIA NIM (OpenAI-compatible API)
- **Payments**: Stripe, Razorpay
- **Infrastructure**: Docker, Nginx, Let's Encrypt

## License

MIT
