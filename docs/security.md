# Security (spec §10)

## Target verification (§10.1)

Before executing any simulation:
- Verify that the user controls or is authorized to test the target.
- Support domain verification through DNS TXT records or an approved HTTP challenge.
- Restrict tests to verified targets.
- Bind simulations to verified environments.
- Revalidate target ownership when appropriate.
- Do not allow arbitrary destinations supplied by AI-generated workflows.

For local development, provide a controlled local runner with explicit local-only configuration.

## Network isolation (§10.2)

The execution environment must:
- Reject loopback and private network destinations in hosted execution.
- Block cloud metadata endpoints.
- Restrict outbound connections to approved target hosts.
- Recheck DNS resolution and destination addresses.
- Validate redirects instead of trusting the initial URL.
- Prevent arbitrary proxy configuration.
- Keep browser and HTTP workers isolated.

### SSRF prevention

SSRF is particularly important because accepting a URL and having a server visit it creates a potential server-side request forgery vulnerability. Controls include hostname validation, DNS resolution, and trusted destination controls (OWASP Cheat Sheet Series).

Blocked host patterns include:
- Loopback: `localhost`, `127.x.x.x`, `0.0.0.0`, `::1`
- Private networks (RFC 1918): `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- Link-local: `169.254.x.x`
- Cloud metadata: `169.254.169.254`, `metadata.google.internal`

## Execution limits (§10.3)

Each test should have:
- A maximum duration.
- A maximum approved workload.
- A maximum request rate.
- A maximum resource allocation.
- A hard cancellation mechanism.
- A per-organization usage budget.
- An emergency stop mechanism.

Start with conservative limits and benchmark the execution fleet before increasing them.

Default limits:
- Max duration: 900 seconds (15 min)
- Max browser sessions: 20
- Max virtual users: 500
- Max requests per second: 1,000

## Test data safety (§10.4)

Agents should use synthetic accounts and synthetic data. For the MVP:
- No real payment processing.
- No real email delivery.
- No real SMS delivery.
- No destructive database operations.
- No production customer data.
- No unapproved account creation.

For checkout testing, use a sandbox environment and test payment provider.

## Secret management (§10.5)

- Encrypted credentials.
- Per-project secrets.
- Restricted secret access.
- Secret redaction in logs.
- Short-lived worker credentials.
- Automatic cleanup after execution.

Never put passwords or API keys into LLM prompts unnecessarily.
