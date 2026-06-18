# LocalSite AI — Complete Architecture Reference

**Principal Architect:** Generated Analysis
**Version:** 2.0
**Stack:** TypeScript + Express + MongoDB + Redis + BullMQ + Socket.IO + React 19

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Component Diagrams](#2-component-diagrams)
3. [Service Boundaries & Bounded Contexts](#3-service-boundaries)
4. [Frontend/Backend Communication](#4-frontendbackend-communication)
5. [Redis Caching Strategy](#5-redis-caching-strategy)
6. [BullMQ Queue Architecture](#6-bullmq-queue-architecture)
7. [Socket.IO Scaling Strategy](#7-socketio-scaling-strategy)
8. [Database Indexing Strategy](#8-database-indexing-strategy)
9. [Trade-offs & Scaling Bottlenecks](#9-trade-offs--scaling-bottlenecks)
10. [Sequence Diagrams for Critical Flows](#10-sequence-diagrams-for-critical-flows)
11. [Scaling Roadmap: MVP → Enterprise](#11-scaling-roadmap)
12. [Folder Structure (Evaluated)](#12-folder-structure)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE (CDN + WAF + DNS)                  │
└──────────────┬────────────────────────────────────┬─────────────────────┘
               │                                    │
         ┌─────▼─────┐                     ┌───────▼────────┐
         │   NGINX    │                     │  Vite Static   │
         │  Reverse   │                     │   Assets       │
         │  Proxy     │                     │ (Frontend SPA) │
         └─────┬─────┘                     └────────┬───────┘
               │                                    │
               │         ┌──────────────┐           │
               │         │  React 19    │◄──────────┘
               │         │  + Vite 6    │
               │         └──────┬───────┘
               │         REST   │  Socket.IO
               │         API    │  (ws)
        ┌──────┴───────────────┴──────────────────┐
        │           EXPRESS SERVER                 │
        │    (Modular Monolith — TypeScript)       │
        │                                          │
        │  ┌─────────┐ ┌──────────┐ ┌──────────┐  │
        │  │ Auth    │ │ Website  │ │ Payment  │  │
        │  │ Module  │ │ Module   │ │ Module   │  │
        │  ├─────────┤ ├──────────┤ ├──────────┤  │
        │  │ User    │ │ Analytics│ │ Growth   │  │
        │  │ Module  │ │ Module   │ │ Module   │  │
        │  ├─────────┤ ├──────────┤ ├──────────┤  │
        │  │ Contact │ │Deployment│ │Notific   │  │
        │  │ Module  │ │ Module   │ │ Module   │  │
        │  └────┬────┘ └────┬─────┘ └────┬─────┘  │
        │       │           │             │        │
        │  ┌────▼───────────▼─────────────▼─────┐  │
        │  │         CORE INFRASTRUCTURE         │  │
        │  │  DI Container · EventBus · Logger   │  │
        │  │  CacheService · QueueService · S3   │  │
        │  └──────────────────┬──────────────────┘  │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │              ┌──────▼──────┐              │
        │              │    REDIS    │              │
        │              │  (Cache +   │              │
        │              │  Queue +    │              │
        │              │  Socket.IO) │              │
        │              └──────┬──────┘              │
        │                     │                     │
        │              ┌──────▼──────┐              │
        │              │   MongoDB   │              │
        │              │  (Primary   │              │
        │              │   Store)    │              │
        │              └─────────────┘              │
        │                                           │
        │  ┌──────────────────────────────────────┐ │
        │  │         WORKER PROCESS               │ │
        │  │  AIWorker · EmailWorker · Notification│ │
        │  │  DeploymentWorker · GrowthWorker      │ │
        │  │  (BullMQ Consumers, separate process) │ │
        │  └──────────────────────────────────────┘ │
        │                                           │
        │  ┌──────────┐ ┌──────────┐ ┌───────────┐ │
        │  │  OpenAI  │ │  Stripe  │ │AWS S3/R2 │ │
        │  │  GPT-4o  │ │Razorpay  │ │  Assets   │ │
        │  └──────────┘ └──────────┘ └───────────┘ │
        └───────────────────────────────────────────┘
```

### Architecture Tenets

| Principle | Decision |
|---|---|
| **Deployment model** | Modular monolith deployed as 2 processes (API server + worker), microservice-ready |
| **Communication** | Synchronous via REST (request-response), async via EventBus → BullMQ (background jobs), real-time via Socket.IO |
| **Database** | MongoDB (document store) — single primary with read replicas planned |
| **Cache** | Redis (single instance → cluster) for cache, queue broker, Socket.IO adapter |
| **Idempotency** | All webhooks and critical jobs are idempotent via idempotency keys |
| **Observability** | Logger structured JSON → Sentry (errors) + Datadog/New Relic (metrics) |
| **Security** | Helmet, CORS, XSS-clean, mongo-sanitize, rate-limit-redis, CSRF, JWT tokens |

---

## 2. Component Diagrams

### 2.1 Module Architecture (Internal Structure per Module)

Every module follows a strict layered architecture:

```
┌───────────────────────────────────────────────────────────┐
│                      MODULE BOUNDARY                       │
│                                                           │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Routes/   │───►│  Controllers │───►│   Services   │  │
│  │  Validators│    │  (HTTP)      │    │  (Business)  │  │
│  └────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                │          │
│                                        ┌───────▼───────┐  │
│                                        │  Repositories │  │
│                                        │  (Data Access)│  │
│                                        └───────┬───────┘  │
│                                                │          │
│                                        ┌───────▼───────┐  │
│                                        │   Models      │  │
│                                        │  (Mongoose)   │  │
│                                        └───────────────┘  │
│                                                           │
│  Cross-cutting: EventBus.emit() ← → EventHandlers        │
│                 QueueService.addJob()                     │
│                 CacheService.remember()                   │
└───────────────────────────────────────────────────────────┘
```

### 2.2 Core Infrastructure Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE INFRASTRUCTURE                       │
│                                                             │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Container │  │ EventBus │  │    DI     │  │  Logger  │ │
│  │   (DI)    │  │ (Event   │  │ Decorators│  │ (Struc-  │ │
│  │           │  │  Emitter)│  │ @Injectable│  │  tured)  │ │
│  └───────────┘  └────┬─────┘  └───────────┘  └──────────┘ │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │  EventHandlers  │                            │
│              │  (Maps events   │                            │
│              │   → queue jobs  │                            │
│              │   + socket emit)│                            │
│              └─────────────────┘                            │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ CacheService │  │ QueueService  │  │ RedisSocketAdapt │ │
│  │ (Redis)      │  │ (BullMQ)      │  │ (Socket.IO Redis)│ │
│  └──────────────┘  └───────────────┘  └──────────────────┘ │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ DatabaseConn │  │BaseRepository │  │   S3Storage      │ │
│  │ (Mongoose)   │  │ (CRUD + Pag.) │  │ (AWS S3/R2)     │ │
│  └──────────────┘  └───────────────┘  └──────────────────┘ │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐                        │
│  │AuthMiddleware│  │RateLimiter    │                        │
│  │ (JWT Verify) │  │(Redis-backed) │                        │
│  └──────────────┘  └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Process Topology (Deployment Units)

```
┌──────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                          │
│                    (Single Host)                          │
│                                                           │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ MongoDB:7  │  │  Redis:7     │  │    Nginx          │ │
│  │ (primary)  │  │  (AOF + pass)│  │  (reverse proxy)  │ │
│  └────────────┘  └──────────────┘  └───────────────────┘ │
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │    Backend Server    │  │     Worker Container      │  │
│  │  (Express + Socket)  │  │  (BullMQ Consumers)      │  │
│  │  Port 5000           │  │  Command: node dist/     │  │
│  │  processType: web    │  │  workers/index.js        │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │            Certbot (SSL Renewal)                  │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Service Boundaries

| Bounded Context | Module | Owns | Emits Events | Consumes Events |
|---|---|---|---|---|
| **Identity & Access** | `auth/`, `user/` | Users, roles, auth tokens, OAuth, sessions | `USER_REGISTERED`, `USER_LOGGED_IN`, `USER_PASSWORD_RESET` | — |
| **Website Management** | `website/` | Website CRUD, content, branding, SEO | `WEBSITE_CREATED`, `WEBSITE_DELETED` | — |
| **AI Generation** | `aiService` (shared via workers) | AI prompt pipeline, content generation, logo gen | `WEBSITE_GENERATED` | `WEBSITE_CREATED`, `WEBSITE_DEPLOYED` |
| **Payment & Billing** | `payment/` | Stripe/Razorpay orders, subscriptions, invoices | `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_CANCELLED` | — |
| **Deployment** | `deployment/` | Website publishing, custom domains, SSL, CDN | `DEPLOYMENT_STARTED`, `DEPLOYMENT_COMPLETED`, `DEPLOYMENT_FAILED` | `WEBSITE_DEPLOYED` |
| **Analytics** | `analytics/` | Page views, traffic sources, visitor tracking, conversion | — | `LEAD_CAPTURED` |
| **CRM** | `contact/`, `lead/`, `crm/`, `booking/` | Leads, customers, appointments | `LEAD_CAPTURED`, `LEAD_CONVERTED` | — |
| **Growth Assistant** | `growth/` | Weekly reports, business insights, SEO recommendations | `GROWTH_REPORT_GENERATED`, `INSIGHT_CREATED` | `WEBSITE_DEPLOYED`, `LEAD_CAPTURED` |
| **Notifications** | `notification/` | In-app notifications, push, email dispatch | `NOTIFICATION_SENT` | All system events |
| **Communication** | emailService, socketService | Email delivery (SendGrid/SMTP), real-time updates | — | All system events |
| **Marketing** | `marketing/` | Campaigns, social posts, promotions | — | `WEBSITE_GENERATED` |

### Service Boundary Rules

1. **No direct module-to-module imports** — modules communicate only through `EventBus` + `QueueService`
2. **Shared kernel** = `core/` (DI, event bus, cache, queue, logging, database, S3, security)
3. **Repository** is the only module component that touches the database model
4. **Service** never imports another module's service directly

---

## 4. Frontend/Backend Communication

### 4.1 REST API (Primary)

| Aspect | Decision |
|---|---|
| **Protocol** | HTTP/1.1 + TLS (HTTP/2 via Nginx) |
| **Format** | JSON (application/json) |
| **Auth** | Bearer JWT in `Authorization` header, 15min access + 7d refresh |
| **Base URL** | `/api/v1` (versioned for future) |
| **Pagination** | `?page=1&limit=20&sort=createdAt&order=desc` |
| **Error format** | `{ success: false, message, errors?, code }` |
| **Success format** | `{ success: true, data, message, pagination? }` |

### 4.2 Real-Time (Socket.IO)

| Aspect | Decision |
|---|---|
| **Transport** | WebSocket (primary), long-polling (fallback) |
| **Auth** | `auth: { token }` on connection handshake |
| **Rooms** | User-scoped rooms: `user:<userId>`, Website-scoped: `website:<websiteId>` |
| **Server → Client** | `generation:progress`, `generation:complete`, `deployment:status`, `notification`, `live:visitor`, `growth:report-ready` |
| **Client → Server** | `join:website`, `leave:website` |

### 4.3 Data Fetching (React Query)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  React   │───►│ React    │───►│  Axios   │───►│  API     │
│  Query   │    │ Query    │    │  Client  │    │  Server  │
│  Hook    │    │  Cache   │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                                │
                     │  Stale time: 5-30s             │
                     │  Cache time: 5min              │
                     │  Refetch on window focus       │
                     │  Optimistic updates            │
                     └────────────────────────────────┘
```

---

## 5. Redis Caching Strategy

### 5.1 Redis Instance Roles

Redis is a **single point of convergence** — used simultaneously for cache, queue broker, and Socket.IO adapter. At scale (100k+ businesses), this splits into dedicated instances.

### 5.2 Cache Layers & TTLs

| Cache Key Pattern | What | TTL | Eviction Policy | Notes |
|---|---|---|---|---|
| `localsite:cache:user:{id}` | User profile | 900s (15min) | LRU | Invalidated on profile update |
| `localsite:cache:website:{id}` | Website full doc | 300s (5min) | LRU | Invalidated on content change |
| `localsite:cache:website:{id}:analytics` | Cached analytics | 60s (1min) | LRU | Short TTL, high churn |
| `localsite:cache:templates` | Template list | 3600s (1h) | LRU | Rarely changes |
| `localsite:cache:plans` | Pricing plans | 3600s (1h) | LRU | Rarely changes |
| `localsite:ratelimit:{ip}:{route}` | Rate limit counters | Window TTL | NoEviction | TTL managed by `rate-limit-redis` |
| `localsite:session:{sessionId}` | Session data | 7d | LRU | Long-lived sessions |
| `localsite:lock:{resource}` | Distributed mutex | 10s | LRU | For critical section serialization |
| `localsite:idempotency:{key}` | Idempotency keys | 86400s (24h) | LRU | Webhook deduplication |

### 5.3 Cache-Aside Pattern (Implementation)

```typescript
// CacheService.remember() implements cache-aside:
async function getWebsite(websiteId: string): Promise<IWebsite> {
  return CacheService.remember(
    `website:${websiteId}`,
    300, // TTL
    () => repository.getWebsiteById(websiteId) // Fallback
  );
}
```

### 5.4 Invalidation Strategy

| Trigger | Invalidation Action |
|---|---|
| Website content updated | `del("localsite:cache:website:{id}")` |
| Website published | `del("localsite:cache:website:{id}")` + `del("localsite:cache:templates")` |
| Analytics tracked | `del("localsite:cache:website:{id}:analytics")` (or use short TTL) |
| User profile changed | `del("localsite:cache:user:{id}")` |
| Template CRUD by admin | `delByPattern("localsite:cache:templates*")` |

### 5.5 Memory Budget Estimation (100k businesses)

| Data Type | Est. Size per Key | Count | Total |
|---|---|---|---|
| User profiles (active) | ~2KB | 100,000 | ~200MB |
| Website docs (hot) | ~5KB | 500,000 (5/org) | ~2.5GB |
| Rate limit counters | ~200B | 10,000 (concurrent) | ~2MB |
| Analytics caches | ~1KB | 100,000 (hot sites) | ~100MB |
| BullMQ job data | ~500B | 50,000 (in-flight) | ~25MB |
| Socket.IO state | ~200B | 50,000 (concurrent sockets) | ~10MB |
| **Total (estimate)** | | | **~2.8GB** |

**Baseline:** 8GB Redis instance. **At 500k businesses:** Split into 3 Redis nodes.

---

## 6. BullMQ Queue Architecture

### 6.1 Queue Topology

```
                      ┌─────────────────────┐
                      │   PRODUCERS          │
                      │ (REST API Handlers)  │
                      └─────┬──────┬─────────┘
                            │      │
         ┌──────────────────┘      └──────────────────┐
         ▼                                              ▼
┌────────────────┐                          ┌──────────────────┐
│  EventBus      │                          │  Direct Job Add  │
│  (EventHandlers│                          │  (QueueService)  │
│   → Queue)     │                          │                  │
└────────┬───────┘                          └────────┬─────────┘
         │                                           │
         ▼                                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDIS (BULLMQ BACKEND)                    │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ ai-generation │ │    email     │ │ website-deployment   ││
│  │   Queue      │ │    Queue     │ │      Queue           ││
│  ├──────────────┤ ├──────────────┤ ├──────────────────────┤│
│  │ notification │ │growth-analysis│ │   marketing         ││
│  │    Queue     │ │    Queue     │ │     Queue            ││
│  ├──────────────┤ ├──────────────┤ ├──────────────────────┤│
│  │ logo-generat │ │ data-process │ │ (future: more)       ││
│  │    Queue     │ │    ing       │ │                      ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
         │                                           │
         ▼                                           ▼
┌──────────────────┐                          ┌──────────────────┐
│  WORKER PROCESS  │                          │  SAME PROCESS    │
│  (Separate       │                          │  (Small jobs)    │
│   Container)     │                          │                  │
│  AI Worker       │                          │  — Used for      │
│  Email Worker    │                          │  future inline   │
│  Notification Wk │                          │  processing      │
│  Deployment Wk   │                          │                  │
└──────────────────┘                          └──────────────────┘
```

### 6.2 Queue Configuration

| Queue Name | Concurrency | Rate Limit | Retries | Backoff | Priority | Jobs |
|---|---|---|---|---|---|---|
| `ai-generation` | 5 | 100/s | 3 | Exponential 2s | Low on large, high on small | `generate-content`, `generate-logo`, `growth-analysis` |
| `email` | 10 | 50/s | 5 | Exponential 5s | Medium | `welcome-email`, `payment-receipt`, `password-reset`, `weekly-report` |
| `website-deployment` | 3 | 20/s | 3 | Exponential 3s | High | `deploy-to-s3`, `configure-domain`, `ssl-provision` |
| `notification` | 20 | 200/s | 2 | Fixed 1s | Low | `in-app-notif`, `push-notif` |
| `growth-analysis` | 2 | 10/s | 2 | Exponential 10s | Low | `weekly-report-gen`, `insight-gen` |
| `marketing` | 2 | 10/s | 3 | Exponential 5s | Low | `campaign-send`, `email-blast` |
| `logo-generation` | 3 | 30/s | 2 | Exponential 2s | Medium | `generate-logo`, `generate-variations` |
| `data-processing` | 5 | 50/s | 3 | Exponential 2s | Low | `bulk-import`, `data-migration`, `analytics-aggregation` |

### 6.3 Job Lifecycle

```
ADDED → WAITING → ACTIVE → COMPLETED
                  │
                  ▼
                FAILED → (RETRY) → WAITING
                  │
                  ▼
              (retries exhausted) → FAILED (stored for 7d)
```

### 6.4 Worker Design (Separate Process)

The worker process (`workers/index.ts`) is deployed as a **separate Docker container** that:
- Connects to MongoDB (read-heavy operations)
- Connects to Redis (BullMQ consumer)
- Has NO HTTP server (no Express, no Socket.IO)
- Uses `emitToUser()` via Redis pub/sub to notify Socket.IO nodes

---

## 7. Socket.IO Scaling Strategy

### 7.1 Current Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Socket.IO   │     │  Socket.IO   │     │  Socket.IO   │
│   Node 1     │     │   Node 2     │     │   Node 3     │
│  (Instance)  │     │  (Instance)  │     │  (Instance)  │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Redis Adapter │
                    │  (pub/sub)     │
                    └───────────────┘
```

### 7.2 Adapter Implementation

Uses `@socket.io/redis-adapter` with a dedicated Redis pub/sub client pair:

```typescript
const pubClient = createClient({ url: config.redis.url });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

### 7.3 Room Strategy

| Room | Scope | Members | Purpose |
|---|---|---|---|
| `user:{userId}` | 1 user = 1 room | User's browser tabs | Notifications, deployment status, growth reports |
| `website:{websiteId}` | 1 website = 1 room | Website owner + admins | Live visitor count, contact form submissions |
| `admin:monitoring` | Global | Admin users | System metrics, usage stats |

### 7.4 Horizontal Scaling Plan

| Phase | Nodes | Limitation | Solution |
|---|---|---|---|
| MVP (0–1k users) | 1 | Single point of failure | Process manager (PM2) 4 instances on same machine |
| Growth (1k–10k) | 2–3 | Redis becomes bottleneck | Dedicated Redis instance for Socket.IO, separate from cache/queue |
| Scale (10k–50k) | 5–10 | Connection memory | Redis Cluster mode, Socket.IO v4 with dynamic namespaces |
| Enterprise (50k+) | 10–20 | Sticky sessions needed | Sticky load balancing (Nginx `ip_hash`), Socket.IO with `@socket.io/cluster-adapter` |

### 7.5 Memory per Connection

```
Per-socket overhead:
  Socket.IO internal state: ~512 bytes
  Auth token + user data: ~256 bytes
  Room membership: ~64 bytes per room
  Transport buffer: ~1KB
  ---
  Total per connection: ~2KB
  
  50,000 concurrent connections → ~100MB (Socket.IO state)
  + Redis adapter overhead: ~+20%
  = ~120MB total
```

---

## 8. Database Indexing Strategy

### 8.1 Current Indexes (from `docker/mongo/init.js`)

```javascript
users: { email: 1 }                 // UNIQUE — login lookup
users: { googleId: 1 }              // SPARSE — OAuth login
websites: { userId: 1, status: 1 }  // Dashboard listing by user
websites: { subdomain: 1 }          // UNIQUE — subdomain resolution
leads: { websiteId: 1, status: 1 }  // Lead management dashboard
notifications: { userId: 1, read: 1 } // User notification list
analytics: { websiteId: 1, timestamp: -1 } // Time-series analytics queries
subscriptions: { userId: 1 }        // UNIQUE — subscription lookup
```

### 8.2 Recommended Indexes for 100k+ Businesses

```javascript
// ============= USERS =============
users: { email: 1 }                          // UNIQUE (explicit) — login
users: { googleId: 1 }                       // SPARSE — OAuth login
users: { role: 1, isActive: 1 }              // Coverage: admin user search
users: { agencyId: 1, role: 1 }              // Coverage: multi-tenant listing
users: { lastLogin: -1 }                     // Coverage: stale user cleanup
users: { createdAt: -1 }                     // Coverage: admin user listing

// ============= WEBSITES =============
websites: { userId: 1, status: 1 }           // Existing — dashboard listing
websites: { subdomain: 1 }                   // UNIQUE (existing) — subdomain resolve
websites: { status: 1, publishedAt: -1 }     // Coverage: sitemap generation
websites: { businessName: 'text' }           // TEXT INDEX — search by business name
websites: { category: 1, status: 1 }         // Coverage: directory/category browsing
websites: { userId: 1, updatedAt: -1 }       // Coverage: "recently modified" sort

// ============= LEADS =============
leads: { websiteId: 1, status: 1 }           // Existing — lead dashboard
leads: { websiteId: 1, createdAt: -1 }       // Coverage: lead timeline
leads: { email: 1, websiteId: 1 }            // Compound — dedup check
leads: { assignedTo: 1, status: 1 }          // Coverage: sales rep queue
leads: { websiteId: 1, source: 1 }           // Coverage: lead source analytics

// ============= ANALYTICS =============
analytics: { websiteId: 1, timestamp: -1 }   // Existing — time-series per site
analytics: { websiteId: 1, page: 1, timestamp: -1 } // Coverage: page-level analytics
analytics: { websiteId: 1, timestamp: -1, sessionId: 1 } // Coverage: session analysis
analytics: { visitorId: 1, timestamp: -1 }   // Coverage: visitor journey
// NOTE: At scale, analytics should be moved to a time-series DB (TimescaleDB, ClickHouse)

// ============= NOTIFICATIONS =============
notifications: { userId: 1, read: 1, createdAt: -1 } // Existing + sort order
notifications: { userId: 1, type: 1, createdAt: -1 } // Coverage: filter by type

// ============= PAYMENTS =============
payments: { userId: 1, createdAt: -1 }       // Coverage: payment history
payments: { providerPaymentId: 1 }           // UNIQUE — webhook dedup
payments: { status: 1, createdAt: -1 }       // Coverage: admin reconciliation
payments: { subscriptionId: 1 }              // Coverage: subscription payments

// ============= SUBSCRIPTIONS =============
subscriptions: { userId: 1 }                 // UNIQUE (existing)
subscriptions: { status: 1, currentPeriodEnd: 1 } // Coverage: expiry checker cron
subscriptions: { plan: 1, status: 1 }        // Coverage: plan analytics

// ============= DEPLOYMENTS =============
deployments: { websiteId: 1, createdAt: -1 } // Coverage: deployment history
deployments: { status: 1 }                   // Coverage: pending deployment queue

// ============= BUSINESS INSIGHTS =============
businessinsights: { userId: 1, read: 1, createdAt: -1 } // Coverage: insight feed
businessinsights: { websiteId: 1, category: 1, severity: 1 } // Coverage: filterable insights

// ============= WEEKLY REPORTS =============
weeklyreports: { websiteId: 1, weekStart: -1 } // Coverage: report history
weeklyreports: { userId: 1, weekStart: -1 }     // Coverage: user report timeline

// ============= CHATBOTS =============
chatbots: { websiteId: 1 }                   // Coverage: chatbot lookup

// ============= CAMPAIGNS =============
campaigns: { websiteId: 1, status: 1 }       // Coverage: campaign management
campaigns: { scheduledFor: 1, status: 1 }    // Coverage: scheduler

// ============= APPOINTMENTS =============
appointments: { websiteId: 1, startTime: 1 } // Coverage: calendar queries
appointments: { customerId: 1 }              // Coverage: customer history
```

### 8.3 Indexing Principles

1. **ESR Rule** (Equality, Sort, Range) — compound indexes: equality fields first, then sort, then range
2. **Covered queries** — indexes that include all returned fields (use projection)
3. **Text indexes** — use sparingly (only on `businessName` for search), prefer Atlas Search or Meilisearch at scale
4. **TTL indexes** — on analytics documents (`timestamp`) to auto-purge after 90d
5. **Partial indexes** — `{ filterExpression: { status: "active" } }` for active-only queries

### 8.4 Sharding Key Candidates

When MongoDB must be sharded (>2TB data):

| Collection | Shard Key | Reason |
|---|---|---|
| `analytics` | `{ websiteId: 1, timestamp: 1 }` | Even distribution + time-range locality |
| `websites` | `{ userId: 1 }` (hashed) | Even distribution |
| `leads` | `{ websiteId: 1 }` (hashed) | Even distribution |
| `users` | `{ _id: 1 }` (hashed) or `{ email: 1 }` | Even distribution |

---

## 9. Trade-offs & Scaling Bottlenecks

### 9.1 Architectural Trade-offs

| Decision | Alternative | Why Chosen | Trade-off |
|---|---|---|---|
| **MongoDB** (document) | PostgreSQL (relational) | Schema flexibility for website content, JSON subdocuments for pages/sections | No joins, eventual consistency, more memory per doc |
| **Modular monolith** | Full microservices | Faster iteration, single deployment, shared in-memory event bus | Scaling ceiling at ~200k users, coordinated deploys |
| **Redis for everything** | Dedicated cache (memcached) + queue (RabbitMQ) + real-time (Redis) | Simpler ops, single infra dependency | Memory contention, single point of failure |
| **EventBus (in-process)** | Message broker (Kafka/NATS) | Zero latency, no serialization overhead | Not durable (lost on restart), not cross-process |
| **Mongoose ODM** | Prisma / Drizzle | Mature MongoDB driver, schema validation via Zod at service layer | Runtime validation vs. compile-time, slower than raw driver |
| **Socket.IO** (WebSocket) | SSE + REST polling | Bidirectional, room support, auto-reconnect | More resource-intensive, sticky sessions needed at scale |
| **BullMQ** | RabbitMQ / SQS | Redis-native, excellent Node.js DX, built-in rate limiting | Redis becomes scaling bottleneck, no native consumer groups |

### 9.2 Scaling Bottlenecks (Ranked)

| # | Bottleneck | Current Limit | Sign | Mitigation |
|---|---|---|---|---|
| 1 | **MongoDB single primary** | ~2TB data, ~10k ops/s | Slow queries, high CPU | Read replicas → Sharding → Time-series DB for analytics |
| 2 | **Redis memory** | ~8GB instance | OOM, evictions, latency | Split Redis: Cache + Queue + Socket.IO → Redis Cluster |
| 3 | **Express single process** | ~2,500 req/s (single) | High CPU, connection queuing | PM2 cluster (4 instances) → Horizontal pod autoscaler |
| 4 | **AI Generation (OpenAI)** | ~3 RPM (GPT-4o-mini) | Queue backpressure | Rate-limit queuing, cached responses, priority lanes |
| 5 | **MongoDB text search** | ~100k docs searched | Slow `$regex` queries | Atlas Search → Meilisearch → Elasticsearch |
| 6 | **Socket.IO sticky sessions** | Connection distribution | Nginx `ip_hash` uneven | Redis Cluster adapter, consistent hashing |
| 7 | **Analytics write throughput** | 1k events/s | Writes slow down reads | Buffer in Redis → batch write → Time-series DB |
| 8 | **Email delivery** | ~100 emails/min | SendGrid API rate limits | Queue with backpressure, dedicated IP pools |

### 9.3 Cost Analysis (Estimated at 100k Businesses)

| Resource | Monthly Cost | Notes |
|---|---|---|
| MongoDB Atlas M40 (3-node replica) | ~$900 | 80GB storage, ~5k ops/s |
| Redis ElastiCache (cache.m6g.large x2) | ~$400 | 2 × 8GB, separate for cache + queue |
| Backend (4 × t3.medium ECS) | ~$600 | ~200 req/s each |
| Workers (2 × t3.small ECS) | ~$200 | AI + Email + Notification processing |
| OpenAI API | ~$5,000–10,000 | 100k sites × 1 gen/month × $0.05–0.10 |
| SendGrid | ~$150 | 100k emails/month |
| AWS S3 | ~$100 | Assets, deployments, backups |
| Cloudflare Pro | ~$200 | CDN, WAF, DNS |
| **Total** | **~$7,550–12,550/mo** | |

---

## 10. Sequence Diagrams for Critical Flows

### 10.1 User Registration Flow

```
┌──────┐     ┌────────┐     ┌──────────┐     ┌───────────┐     ┌────────┐     ┌────────┐     ┌──────────┐
│Client │     │ Nginx  │     │  Express │     │  Mongoose  │     │ Redis  │     │  BullMQ │     │ SendGrid │
│(React)│     │        │     │  Server  │     │  (MongoDB) │     │  Cache │     │ Worker  │     │ (Email)  │
└──┬────┘     └───┬────┘     └────┬─────┘     └─────┬──────┘     └───┬────┘     └────┬────┘     └─────┬────┘
   │              │               │                 │               │              │               │
   │  POST /api/auth/register     │                 │               │              │               │
   │ {name,email,password}        │                 │               │              │               │
   │──────────────►──────────────►│                 │               │              │               │
   │              │               │                 │               │              │               │
   │              │               │ 1. Validate w/ Zod               │              │               │
   │              │               │ 2. Check rate limit              │              │               │
   │              │               │    GET rate-limit redis key       │              │               │
   │              │               │────────────────►                │              │               │
   │              │               │◄────────────────                │              │               │
   │              │               │                 │               │              │               │
   │              │               │ 3. Check duplicate email          │              │               │
   │              │               │    find user by email             │              │               │
   │              │               │────────────────►                │              │               │
   │              │               │◄────────────────                │              │               │
   │              │               │                 │               │              │               │
   │              │               │ 4. Hash password (bcrypt, r12)   │              │               │
   │              │               │ 5. Create user doc                │              │               │
   │              │               │────────────────►                │              │               │
   │              │               │◄────────────────                │              │               │
   │              │               │                 │               │              │               │
   │              │               │ 6. Generate JWT (access + refresh)│              │               │
   │              │               │ 7. Cache user profile             │              │               │
   │              │               │────────────────►                │              │               │
   │              │               │◄────────────────                │              │               │
   │              │               │                 │               │              │               │
   │              │               │ 8. EventBus.emit                  │              │               │
   │              │               │   USER_REGISTERED                 │              │               │
   │              │               │    │ (event handler triggers)     │              │               │
   │              │               │    ├──► QueueService.addJob()     │              │               │
   │              │               │    │   EMAIL: welcome-email       │              │               │
   │              │               │    │──────────────────────────────►              │               │
   │              │               │    │                              │              │               │
   │              │               │ 9. Send response                  │              │               │
   │  201 Created ◄───────────────◄                                  │              │               │
   │  {token,user}│               │                 │               │              │               │
   │              │               │                 │               │              │               │
   │              │               │                 │               │ EMAIL Worker  │               │
   │              │               │                 │               │ picks up job  │               │
   │              │               │                 │               │◄───────────────               │
   │              │               │                 │               │              │               │
   │              │               │                 │               │ Send welcome  │               │
   │              │               │                 │               │ email         │               │
   │              │               │                 │               │───────────────►               │
   │              │               │                 │               │◄───────────────               │
   │              │               │                 │               │              │               │
   │              │               │                 │               │ Mark complete │               │
   │              │               │                 │               │ (BullMQ)      │               │
```

### 10.2 AI Website Generation Flow

```
┌──────┐   ┌──────────┐   ┌──────────┐   ┌────────┐   ┌────────┐   ┌──────────┐   ┌────────┐
│Client │   │ Express  │   │Website   │   │ BullMQ │   │Worker  │   │  OpenAI   │   │MongoDB │
│(React)│   │ Server   │   │Service   │   │(Queue) │   │(AI)    │   │  GPT-4o   │   │        │
└──┬────┘   └────┬─────┘   └────┬─────┘   └───┬────┘   └───┬────┘   └─────┬─────┘   └───┬────┘
   │              │              │              │            │              │              │
   │ POST /websites/:id/generate │              │            │              │              │
   │──────────────►─────────────►              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │ 1. Validate ownership             │              │              │
   │              │              │ 2. Check website exists           │              │              │
   │              │              │──────────────────────────────────►                           │
   │              │              │◄───────────────────────────────────                           │
   │              │              │              │            │              │              │
   │              │              │ 3. QueueService.addJob()           │              │              │
   │              │              │   AI_GENERATION: generate-content  │              │              │
   │              │              │──────────────►                    │              │              │
   │ 202 Accepted │              │              │            │              │              │
   │◄─────────────◄              │              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │ Worker picks up job     │              │              │
   │              │              │              │◄────────────            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │            │ 1. Emit progress (20%)       │              │
   │              │              │              │            │    Redis pub → SocketIO     │              │
   │              │              │              │            │──(emitToUser via Redis pub)─►              │
   │ Socket: ai:progress {20%}  │              │            │              │              │
   │◄───────────────────────────│              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │            │ 2. Call OpenAI API           │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │              │              │              │
   │              │              │              │            │ 3. Stream sections           │              │
   │              │              │              │            │◄──────────────              │              │
   │              │              │              │            │  (hero,about,services,faq)   │              │
   │              │              │              │            │              │              │              │
   │ Socket: ai:progress {50%}  │              │            │              │              │              │
   │◄───────────────────────────│              │            │              │              │              │
   │              │              │              │            │              │              │              │
   │              │              │              │            │ 4. Save content to DB        │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │◄──────────────              │              │
   │              │              │              │            │              │              │              │
   │ Socket: ai:progress {80%}  │              │            │              │              │              │
   │◄───────────────────────────│              │            │              │              │              │
   │              │              │              │            │              │              │              │
   │              │              │              │            │ 5. Generate SEO meta         │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │◄──────────────              │              │
   │              │              │              │            │              │              │              │
   │ Socket: ai:progress {100%} │              │            │              │              │              │
   │◄───────────────────────────│              │            │              │              │              │
   │              │              │              │            │              │              │              │
   │              │              │              │ Job complete (BullMQ)   │              │              │
   │              │              │              │◄───────────             │              │              │
   │              │              │              │            │              │              │              │
   │  (Optional: frontend polls │ API or uses Socket.IO result)           │              │              │
```

### 10.3 Payment — Subscription Checkout Flow

```
┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│Client │   │ Express  │   │ Payment  │   │  Stripe  │   │ BullMQ │   │Worker  │   │MongoDB │
│(React)│   │ Server   │   │ Service  │   │  API     │   │(Queue) │   │(Email) │   │        │
└──┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └───┬────┘   └───┬────┘   └───┬────┘
   │              │              │              │              │            │              │
   │ 1. Select plan              │              │              │            │              │
   │──────────────►              │              │              │            │              │
   │              │              │              │              │            │              │
   │ 2. POST /api/payments/      │              │              │            │              │
   │    create-order             │              │              │            │              │
   │    {planId,interval}        │              │              │            │              │
   │──────────────►─────────────►              │              │            │              │
   │              │              │              │              │            │              │
   │              │              │ 3. Stripe    │              │            │              │
   │              │              │    Checkout  │              │            │              │
   │              │              │    Session   │              │            │              │
   │              │              │──────────────►              │            │              │
   │              │              │              │              │            │              │
   │              │              │ 4. Return    │              │            │              │
   │              │              │    sessionId │              │            │              │
   │              │              │◄──────────────              │            │              │
   │     {sessionId}             │              │              │            │              │
   │◄─────────────◄              │              │              │            │              │
   │              │              │              │              │            │              │
   │ 5. Redirect to Stripe       │              │              │            │              │
   │    Checkout page            │              │              │            │              │
   │──────────────────────────────────────────►               │            │              │
   │              │              │              │              │            │              │
   │ 6. User completes payment   │              │              │            │              │
   │◄───────────────────────────────────────────               │            │              │
   │              │              │              │              │            │              │
   │ 7. Stripe Webhook           │              │              │            │              │
   │    POST /api/payments/      │              │              │            │              │
   │    stripe-webhook           │              │              │            │              │
   │──────────────►─────────────►              │              │            │              │
   │              │              │              │              │            │              │
   │              │              │ 8. Verify webhook signature    │            │              │
   │              │              │ 9. Check idempotency key       │            │              │
   │              │              │    Redis: idempotency:{evtId}  │            │              │
   │              │              │──────────────►                               │              │
   │              │              │◄──────────────                               │              │
   │              │              │              │              │            │              │
   │              │              │ 10. Create subscription record    │            │              │
   │              │              │───────────────────────────────────────────────►              │
   │              │              │              │              │            │              │
   │              │              │ 11. Update user with subscriptionId       │              │
   │              │              │───────────────────────────────────────────────►              │
   │              │              │              │              │            │              │
   │              │              │ 12. EventBus.emit(PAYMENT_SUCCEEDED)      │              │
   │              │              │              │              │            │              │
   │              │              │    ◄── EventHandler ──►     │            │              │
   │              │              │    │                          │            │              │
   │              │              │    ├──► Queue: email           │            │              │
   │              │              │    │    payment-receipt        │            │              │
   │              │              │    │────────────────────────────►            │              │
   │              │              │    │                          │            │              │
   │              │              │    ├──► emitToUser(userId,    │            │              │
   │              │              │    │    'payment:succeeded')  │            │              │
   │              │              │    │                          │            │              │
   │ Socket: payment:succeeded   │    │                          │            │              │
   │◄────────────────────────────│   │                          │            │              │
   │              │              │              │              │            │              │
   │              │ 13. Update client UI      │              │            │              │
   │              │   (via React Query refetch)│              │            │              │
   │              │◄──────────────             │              │            │              │
```

### 10.4 Deployment + Real-Time Update Flow

```
┌──────┐   ┌──────────┐   ┌──────────┐   ┌────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐
│Client │   │ Express  │   │Deploy.   │   │ BullMQ │   │Deploy.   │   │  AWS S3  │   │MongoDB │
│(React)│   │ Server   │   │Service   │   │(Queue) │   │Worker    │   │ (Static) │   │(DNS)   │
└──┬────┘   └────┬─────┘   └────┬─────┘   └───┬────┘   └────┬─────┘   └─────┬─────┘   └───┬────┘
   │              │              │              │            │              │              │
   │ POST /websites/:id/publish  │              │            │              │              │
   │──────────────►─────────────►              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │ 1. Validate & check             │              │              │
   │              │              │ 2. Set status=deploying         │              │              │
   │              │              │───────────────────────────────────────────────►              │
   │              │              │              │            │              │              │
   │              │              │ 3. Queue deploy job             │              │              │
   │              │              │   WEBSITE_DEPLOYMENT             │              │              │
   │              │              │──────────────►                  │              │              │
   │ 202 Accepted │              │              │            │              │              │
   │◄─────────────◄              │              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │ Worker picks up         │              │              │
   │              │              │              │◄────────────            │              │              │
   │              │              │              │            │              │              │
   │ Socket: deploy:progress     │              │            │              │              │
   │ "Building static files..."  │              │            │              │              │
   │◄───────────────────────────│              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │            │ 4. Generate static files    │              │
   │              │              │              │            │ 5. Upload to S3            │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │◄──────────────              │              │
   │              │              │              │            │              │              │
   │ Socket: deploy:status {50%}│              │            │              │              │
   │ "Uploaded assets"           │              │            │              │              │
   │◄───────────────────────────│              │            │              │              │
   │              │              │              │            │              │              │
   │              │              │              │            │ 6. Configure CDN (Cloudflare)│              │
   │              │              │              │            │ 7. Provision SSL            │              │
   │              │              │              │            │──(via Cloudflare API)──────►              │
   │              │              │              │            │              │              │
   │              │              │              │            │ 8. Update deployment record │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │ 9. Update website status    │              │
   │              │              │              │            │   status=published          │              │
   │              │              │              │            │──────────────►              │              │
   │              │              │              │            │              │              │
   │              │              │              │ Job complete            │              │              │
   │              │              │              │◄───────────             │              │              │
   │              │              │              │            │              │              │
   │              │              │ 10. EventBus.emit(DEPLOYMENT_COMPLETED) │              │
   │              │              │              │            │              │              │
   │              │              │    emitToUser(userId, 'deployment:completed')
   │ Socket: deployment:completed │            │              │              │
   │ {websiteId, url, status}    │              │            │              │              │
   │◄───────────────────────────│              │            │              │              │
   │              │              │              │            │              │              │
   │ 11. Frontend updates UI    │              │            │              │              │
   │    (React Query invalidates)│              │            │              │              │
```

---

## 11. Scaling Roadmap

### Phase 1 — MVP (0–500 businesses)

```
Goal: Validate product-market fit with minimal operational cost.

┌──────────────────────────────────────────────────────────┐
│                      MVP SETUP                            │
├──────────────────────────────────────────────────────────┤
│ 1 Server (Docker Compose — single host)                   │
│   ├── MongoDB (single node, no auth)                     │
│   ├── Redis (single, no password)                        │
│   ├── Express API + Socket.IO                            │
│   ├── BullMQ Worker (same process or basic container)    │
│   ├── Nginx (reverse proxy)                              │
│   └── Frontend (Vercel free tier)                        │
├──────────────────────────────────────────────────────────┤
│ Caching: CacheService with short TTLs, no invalidation   │
│ Scaling: Vertical only (upgrade to 4GB RAM VPS)          │
│ MONITORING: Sentry (errors), Logs (console/file)         │
│ CI/CD: GitHub Actions → Docker Hub → VPS                 │
│ Backup: mongodump daily cron                             │
└──────────────────────────────────────────────────────────┘
```

**Key milestones:** 500 users, 1,000 websites, < $200/mo infra cost

---

### Phase 2 — Growth (500–10,000 businesses)

```
Goal: Improve reliability, handle organic growth.

┌──────────────────────────────────────────────────────────┐
│                     GROWTH SETUP                          │
├──────────────────────────────────────────────────────────┤
│ 3 Servers (Docker Swarm or basic K8s)                     │
│   ├── MongoDB Replica Set (3 nodes) + auth               │
│   ├── Redis (separate from cache + Socket.IO)            │
│   ├── Backend (2 replicas, horizontal)                   │
│   ├── Workers (1 dedicated container)                    │
│   ├── Nginx (load balancer, sticky sessions)             │
│   └── Frontend (Vercel Pro)                              │
├──────────────────────────────────────────────────────────┤
│ Caching: Cache-aside pattern, invalidation on writes      │
│ Scaling: PM2 cluster mode (4 instances per replica)       │
│ MONITORING: Datadog/New Relic APM, Redis metrics         │
│ Queue: Bull Board UI for job monitoring                  │
│ Security: Rate limiting (Redis-backed), WAF (Cloudflare) │
│ Email: SendGrid (dedicated IP, templates)                │
└──────────────────────────────────────────────────────────┘
```

**Key milestones:** 10,000 users, 25,000 websites, < $2,000/mo infra cost

---

### Phase 3 — Scale (10,000–100,000 businesses)

```
Goal: Handle massive scale, introduce microservices readiness.

┌───────────────────────────────────────────────────────────────┐
│                        SCALE SETUP                             │
├───────────────────────────────────────────────────────────────┤
│ AWS ECS / EKS (managed container orchestration)                │
│   ├── MongoDB Atlas (M40+, sharding ready)                    │
│   │   ├── analytics → Time-series collection (TTL index)      │
│   │   └── Read replicas for dashboard queries                 │
│   ├── Redis ElastiCache (Cluster mode, 3 shards)              │
│   │   ├── Shard 1: Cache (LRU, maxmemory 4GB)                │
│   │   ├── Shard 2: Queue (BullMQ, AOF enabled)               │
│   │   └── Shard 3: Socket.IO (pub/sub, minimal eviction)     │
│   ├── API Gateway (Cloudflare or AWS API Gateway)             │
│   ├── Backend (6–10 tasks, HPA: CPU > 70%)                   │
│   ├── Workers (4–6 tasks, autoscaling by queue depth)        │
│   ├── Dedicated AI Worker Pool (GPU-backed for image gen)    │
│   ├── CDN: Cloudflare (static assets, API cache)             │
│   └── Frontend: Vercel Enterprise or Cloudflare Pages        │
├───────────────────────────────────────────────────────────────┤
│ Database:                                                     │
│   ├── Shard key on analytics: { websiteId: 1, timestamp: 1 } │
│   ├── Text search: Atlas Search → Meilisearch dedicated      │
│   ├── Read replicas for reporting queries                    │
│ Caching:                                                     │
│   ├── Multi-layer: Redis L1 → CDN (Cloudflare) for static    │
│   └── Write-through + write-behind for analytics             │
│ Queue: Dedicated Redis for BullMQ (no cache eviction risk)   │
│ Socket.IO: Dedicated Redis instance (no memory contention)   │
│ Microservice readiness:                                       │
│   ├── Extract AI Generation as separate service              │
│   ├── Extract Analytics as time-series service               │
│   └── Extract Email as dedicated service                     │
└───────────────────────────────────────────────────────────────┘
```

**Key milestones:** 100,000 users, 250,000 websites, < $12,000/mo infra cost

---

### Phase 4 — Enterprise (100,000–1,000,000+ businesses)

```
Goal: Global scale, multi-region, fully microservices.

┌──────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE SETUP                             │
├──────────────────────────────────────────────────────────────────┤
│ Multi-region (US-East, EU-West, AP-Southeast)                     │
│   ├── Each region: Full stack (API + Workers + DB replicas)      │
│   ├── Global load balancer: Cloudflare (Argo Smart Routing)      │
│   ├── MongoDB Atlas Global Clusters (sharded + multi-region)     │
│   ├── Redis Global Datastore (Active-Active, CRDT-based)         │
│   └── Account-level data locality (GDPR compliance)              │
├──────────────────────────────────────────────────────────────────┤
│ Microservices (extracted from monolith):                          │
│   ├── Identity Service (Auth0 or custom OIDC)                   │
│   ├── Website Service (CRUD + content management)               │
│   ├── AI Generation Service (dedicated, GPU auto-scaling)       │
│   ├── Billing Service (Stripe/Razorpay webhooks)                │
│   ├── Analytics Service (ClickHouse + Kafka)                    │
│   ├── Notification Service (SendGrid + Twilio + Push)           │
│   ├── Deployment Service (AWS CDK + CloudFormation)             │
│   ├── Search Service (Meilisearch/Elasticsearch)                │
│   ├── Growth Service (ML models for recommendations)            │
│   └── CRM Service (HubSpot-like, event-sourced)                 │
├──────────────────────────────────────────────────────────────────┤
│ Event Bus: Kafka (for cross-service communication)                │
│   ├── Replaces in-process EventBus for cross-service events      │
│   ├── Event sourcing for CRM + Analytics                         │
│   └── Exactly-once semantics for critical events                 │
├──────────────────────────────────────────────────────────────────┤
│ Observability:                                                   │
│   ├── OTEL (OpenTelemetry): traces + metrics + logs              │
│   ├── Jaeger (distributed tracing)                               │
│   ├── Prometheus + Grafana (metrics dashboards)                  │
│   ├── Loki (log aggregation)                                     │
│   └── PagerDuty/OpsGenie (alerting)                              │
├──────────────────────────────────────────────────────────────────┤
│ Chaos Engineering:                                               │
│   ├── LitmusChaos / Gremlin (regular failure testing)            │
│   └── GameDays: simulate MongoDB failover, Redis outage, etc.   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Folder Structure (Evaluated)

The current structure is well-aligned with the modular monolith pattern. Below is the assessed structure with annotations:

```
backend/
├── src/
│   ├── server.ts              # Bootstrap: DI, DB, Redis, Queue, Socket, Cron
│   ├── app.ts                 # Express app: middleware, routes, error handling
│   │
│   ├── config/
│   │   └── index.ts           # Central config (env-driven, typed via Zod)
│   │
│   ├── core/                  ★ CORE INFRASTRUCTURE (shared kernel)
│   │   ├── cache/
│   │   │   └── CacheService.ts         # Redis cache-aside, remember(), invalidation
│   │   ├── database/
│   │   │   ├── Connection.ts           # Mongoose singleton connection manager
│   │   │   └── BaseRepository.ts       # Abstract CRUD + paginated repository
│   │   ├── di/
│   │   │   └── Container.ts            # Simple DI container + decorators
│   │   ├── events/
│   │   │   ├── EventBus.ts             # In-process EventEmitter (EventBus pattern)
│   │   │   └── EventHandlers.ts        # Maps events → queue jobs + socket emits
│   │   ├── logging/
│   │   │   └── Logger.ts               # Structured JSON logger
│   │   ├── queue/
│   │   │   ├── QueueService.ts         # BullMQ queue manager + worker factory
│   │   │   └── BullBoard.ts            # Bull Board UI for queue monitoring
│   │   ├── security/
│   │   │   ├── AuthMiddleware.ts        # JWT verification middleware
│   │   │   ├── CloudflareConfig.ts      # Cloudflare API client config
│   │   │   ├── ErrorHandler.ts          # Global error handler (AppError → JSON)
│   │   │   ├── RateLimiter.ts           # Redis-backed rate limiter middleware
│   │   │   ├── SecurityMiddleware.ts    # Helmet, CORS, XSS, mongo-sanitize
│   │   │   └── Validator.ts            # Zod-based request validation
│   │   ├── socket/
│   │   │   └── RedisSocketAdapter.ts   # Redis pub/sub for Socket.IO scaling
│   │   └── storage/
│   │       └── S3Storage.ts            # AWS S3 / Cloudflare R2 uploads
│   │
│   ├── modules/               ★ BUSINESS MODULES (bounded contexts)
│   │   ├── admin/             # Admin panel: user mgmt, revenue, templates
│   │   │   ├── controllers/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   ├── analytics/         # Page views, traffic, conversion tracking
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── auth/              # Registration, login, OAuth, JWT, password mgmt
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   ├── booking/           # Appointment scheduling
│   │   │   └── models/
│   │   ├── chatbot/           # AI chatbot for websites
│   │   │   └── models/
│   │   ├── contact/           # Contact form, lead management
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── crm/               # Customer management
│   │   │   └── models/
│   │   ├── deployment/        # Website publishing to S3, CDN, SSL
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── growth/            # Business insights, weekly reports, recommendations
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── jobs/          # Cron jobs (weekly reports, daily insights)
│   │   ├── lead/              # Lead tracking
│   │   │   └── models/
│   │   ├── marketing/         # Campaign management
│   │   │   └── models/
│   │   ├── notification/      # In-app + push notifications
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── payment/           # Stripe + Razorpay subscriptions & orders
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── user/              # User profile, preferences
│   │   └── website/           # Website CRUD, AI generation triggers
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── repositories/
│   │       ├── routes/
│   │       ├── services/
│   │       └── validators/
│   │
│   ├── types/                 ★ TYPE DEFINITIONS
│   │   ├── events.ts          # SystemEvents enum + typed event payloads
│   │   ├── express.ts         # AuthenticatedRequest, ControllerMethod
│   │   ├── models.ts          # All IModel interfaces (360 lines)
│   │   └── services.ts        # PaginationParams, PaginatedResult
│   │
│   ├── utils/                 ★ UTILITIES
│   │   ├── AppError.ts        # Custom error classes (NotFound, Forbidden, etc.)
│   │   ├── helpers.ts         # subdomain generator, sanitizers
│   │   └── validators.ts      # Shared validation schemas
│   │
│   └── workers/               ★ BACKGROUND JOB CONSUMERS
│       ├── index.ts           # Worker bootstrap (connects DB + Redis, registers)
│       ├── AIWorker.ts        # Handles: generate-content, generate-logo, growth-analysis
│       ├── DeploymentWorker.ts # Handles: deploy-to-s3, configure-domain
│       ├── EmailWorker.ts     # Handles: welcome-email, payment-receipt, weekly-report
│       └── NotificationWorker.ts # Handles: in-app-notif, push-notif
```

### Folder Structure Improvements Recommended

| Issue | Recommendation |
|---|---|
| `types/models.ts` is monolithic (360 lines) | Split into per-module type files, keep shared types in `types/` |
| `utils/` has mixed content | Organize: `utils/errors/`, `utils/helpers/`, `utils/validation/` |
| `booking/`, `chatbot/`, `crm/`, `lead/`, `marketing/` are partial (only models) | Complete them with full MVC structure or remove if unused |
| `events.ts` and `EventHandlers.ts` are tightly coupled | Consider code-generated handler registration from typed event definitions |
| Legacy JS files coexist (`controllers/`, `models/`, `services/` in root) | Migrate or remove; dual maintenance is risky |
| `docker/` has duplicate docker-compose.yml | Consolidate into root `docker-compose.yml` |

---

## Appendix: Key Metrics & SLOs

| Metric | Target | Method |
|---|---|---|
| API response time (p95) | < 300ms | APM monitoring, CDN cache, query optimization |
| AI generation time (p95) | < 30s | OpenAI streaming, parallel section generation |
| Socket.IO connect time | < 500ms | WebSocket transport preferred, sticky sessions |
| Queue processing latency | < 5s (email), < 1s (notification) | Dedicated workers, rate limiting |
| Uptime | 99.9% | Multi-AZ deployment, health checks, auto-healing |
| Database query time (p99) | < 100ms | Proper indexing, read replicas, sharding |
| Time to deploy a website | < 60s | S3 static upload, CDN cache warming |
| Email delivery time | < 30s | SendGrid dedicated IP, queue priority |
