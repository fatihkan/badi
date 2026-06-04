Dockerfile best-practice checks. Security, size, and reproducibility warnings.

# Required Tools
- Bash (badi dev docker-lint)

# Procedure

### Step 1: Check
```bash
badi dev docker-lint
```

### Step 2: What Is Checked

**FROM:**
- Version pinning instead of `:latest` (security + reproducibility)
- Alpine/distroless preference suggestion

**USER:**
- Without a USER directive it runs as root (security risk)
- Creating a non-root user is recommended

**HEALTHCHECK:**
- Mandatory for orchestration
- HTTP endpoint or command

**RUN apt-get:**
- `update` + `install` in the same RUN (cache busting)
- `--no-install-recommends` (size)
- `rm -rf /var/lib/apt/lists/*` (cleanup)

**ADD vs COPY:**
- ADD should not be used outside its tar feature
- COPY for local files

**Permissions:**
- `chmod 777` forbidden
- 755 or tighter

**Ports:**
- EXPOSE < 1024 requires root

**.dockerignore:**
- Must exist (node_modules, .git, etc.)

### Step 3: Advanced Tools

For detailed analysis:
```bash
brew install hadolint
hadolint Dockerfile
```

### Step 4: Common Fixes

```dockerfile
# BEFORE
FROM node:latest
RUN apt-get update
RUN apt-get install -y python3

# AFTER
FROM node:20-alpine
RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*
USER node
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1
```

# Example

```
/docker-lint
```
