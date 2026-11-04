#!/usr/bin/env node
const API = process.env.CROWDFEST_API_URL || 'http://localhost:3001';

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (cmd === 'health') {
    const r = await fetch(`${API}/health`);
    console.log(await r.json());
    return;
  }
  if (cmd === 'launch') {
    const body = {
      name: args[1] || 'CLI simulation',
      target: args[2] || 'https://example.com',
      description: args.slice(3).join(' ') || 'CLI-launched simulation',
      browserSessions: 2,
      virtualUsers: 20,
      durationSeconds: 60,
    };
    const r = await fetch(`${API}/api/v1/simulations/quick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(await r.json());
    return;
  }
  if (cmd === 'list') {
    const r = await fetch(`${API}/api/v1/simulations`);
    console.log(await r.json());
    return;
  }
  console.log('Usage: crowdfest <health|launch|list> [args...]');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
