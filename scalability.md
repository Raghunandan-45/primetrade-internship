# Scalability Plan — VSMS

## 1. Horizontal Scaling
- Backend (Express) is stateless: JWT-based auth, no in-memory sessions.
- Run **N replicas** behind a load balancer; scale by CPU/RPS.
- Containerize with Docker; orchestrate with Kubernetes (HPA on CPU + custom metrics like p95 latency or queue depth).

## 2. Load Balancing
- Use **NGINX, AWS ALB, or Cloudflare** in front of replicas.
- Sticky sessions are unnecessary because state lives in the DB and JWTs.
- Apply rate-limiting at the LB (per IP, per token) to absorb abuse before hitting Node.

## 3. Neon Connection Pooling
- Neon supports **PgBouncer-style connection pooling** out of the box.
- Configure Prisma to use the **pooled connection string** (`?pgbouncer=true&connection_limit=…`).
- For serverless/edge deployments, use `directUrl` for migrations and the pooled URL for runtime queries.
- Tune `connection_limit` per replica so total connections stay under Neon's compute ceiling.

## 4. Redis Caching (conceptual)
- Cache hot, read-heavy endpoints:
  - `GET /vehicles` (per-user key, short TTL)
  - `GET /services` for ADMIN dashboards (longer TTL with invalidation)
- Strategy: **cache-aside** — read from Redis, fall back to Postgres, populate on miss.
- Invalidate on writes: bust keys on `POST/PUT/DELETE`.
- Optional: use Redis for **rate-limiting**, **JWT blocklists**, and **distributed locks**.

## 5. Microservices (brief)
- Initial monolith is right-sized for the assignment scope.
- Natural future split:
  - **Auth service** (users, JWT issuance, password reset)
  - **Vehicle service** (vehicle CRUD)
  - **Service-request service** (orders, status transitions)
- Communicate via **HTTP/gRPC** for synchronous reads and a **message broker (RabbitMQ / SQS)** for async events (e.g. "service completed → notify user").
- API Gateway handles auth verification once and forwards trusted user context.

## 6. Observability
- Structured JSON logs (pino) shipped to ELK / Grafana Loki.
- Metrics: Prometheus + Grafana (request rate, latency, DB pool saturation).
- Tracing: OpenTelemetry to Jaeger/Tempo for cross-service request tracing.

## 7. Database Scaling
- Read replicas for read-heavy admin reporting endpoints.
- Add indexes: `(userId)` on Vehicle, `(createdById)` and `(status)` on ServiceRequest.
- Partition `ServiceRequest` by created month if volume becomes large.
