'use strict';

const fs = require('fs');
const path = require('path');

function argValue(name) {
  const prefix = name + '=';
  const hit = process.argv.slice(2).find(arg => arg === name || arg.startsWith(prefix));
  if (!hit) return '';
  if (hit === name) {
    const idx = process.argv.indexOf(name);
    return process.argv[idx + 1] || '';
  }
  return hit.slice(prefix.length);
}

function normalizePulls(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.pulls)) return payload.pulls;
  if (payload && Array.isArray(payload.items)) return payload.items;
  throw new Error('Open PR uniqueness fixture must be an array, or an object with pulls/items.');
}

function prText(pr) {
  return [pr.title || '', pr.body || '', pr.head && pr.head.ref || '', pr.display_title || ''].join(' ');
}

function isRelevant(pr) {
  const text = prText(pr);
  const head = (pr.head && pr.head.ref) || pr.head_ref || '';
  return /^release\/obol-v\d+(?:\.\d+){1,2}$/i.test(head)
    || /^Obol v\d+(?:\.\d+){1,2}\b/i.test(pr.title || '')
    || /product[- ]hardening/i.test(text)
    || /Product Build Next/i.test(text)
    || /burn[- ]down/i.test(text)
    || /definition of done|\bDoD\b/i.test(text)
    || /product[-_ ]item[-_ ]dod/i.test(head)
    || /hardening\//i.test(head);
}

function numberOf(pr) {
  return Number(pr.number || pr.issue_number || 0);
}

function headOf(pr) {
  return (pr.head && pr.head.ref) || pr.head_ref || '';
}

async function fetchOpenPulls(repo) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'obol-open-pr-uniqueness-validator'
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const url = `https://api.github.com/repos/${repo}/pulls?state=open&per_page=100`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Unable to fetch open PRs from GitHub: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const fixturePath = argValue('--fixture');
  let pulls = [];
  let currentNumber = Number(argValue('--current-pr') || argValue('--current') || 0);
  let currentHead = argValue('--current-head');

  if (fixturePath) {
    pulls = normalizePulls(JSON.parse(fs.readFileSync(path.resolve(fixturePath), 'utf8')));
  } else {
    const eventName = process.env.GITHUB_EVENT_NAME || '';
    const eventPath = process.env.GITHUB_EVENT_PATH || '';
    const repo = process.env.GITHUB_REPOSITORY || '';

    if (!repo) {
      console.log('Open PR uniqueness check skipped outside GitHub Actions.');
      return;
    }

    if (eventPath && fs.existsSync(eventPath)) {
      try {
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        if (event.pull_request) {
          currentNumber = Number(event.pull_request.number || currentNumber || 0);
          currentHead = (event.pull_request.head && event.pull_request.head.ref) || currentHead || '';
        }
      } catch (err) {
        throw new Error(`Unable to parse GitHub event payload: ${err.message}`);
      }
    }

    if (!currentHead && process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/')) {
      currentHead = process.env.GITHUB_REF.replace('refs/heads/', '');
    }

    if (eventName && eventName !== 'pull_request' && !(eventName === 'push' && /^release\//.test(currentHead))) {
      console.log('Open PR uniqueness check skipped for non-release event.');
      return;
    }

    pulls = await fetchOpenPulls(repo);
  }

  const relevant = pulls.filter(pr => (pr.state || 'open') === 'open').filter(isRelevant);
  const duplicates = relevant.filter(pr => {
    const n = numberOf(pr);
    const h = headOf(pr);
    if (currentNumber && n === currentNumber) return false;
    if (!currentNumber && currentHead && h === currentHead) return false;
    return true;
  });

  if (duplicates.length) {
    console.error('Open release/product-hardening PR uniqueness check failed. Close or supersede duplicate PRs before continuing.');
    for (const pr of duplicates) {
      console.error(`- #${numberOf(pr) || '?'} ${pr.title || pr.display_title || '(untitled)'} (${headOf(pr) || 'unknown head'})`);
    }
    process.exit(1);
  }

  console.log(`Open release/product-hardening PR uniqueness check passed (${relevant.length} relevant open PR${relevant.length === 1 ? '' : 's'} found).`);
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
