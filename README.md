# pi-esc-steer

Claude Code-style **Escape while the agent is running**:

1. Abort the current run  
2. Immediately continue with the next queued instruction  

instead of only pausing the queue, or dumping steers back into the editor for you to press Enter again.

## Why

| Setup | Default Esc | With `pi-esc-steer` |
| --- | --- | --- |
| Native Pi | Restores queued text into the editor, aborts | Abort + **auto-submit** restored text |

This fork no longer supports [`pi-queue-steer`](https://github.com/tmustier/pi-queue-steer)'s empty-Enter resume: it would require wrapping the editor component, which stacks with other editor wrappers (e.g. statusline boxes).

## Install

```bash
pi install npm:pi-esc-steer
```

Recommended with upstream queue UI:

```bash
pi install git:github.com/tmustier/pi-queue-steer
pi install npm:pi-esc-steer
```

Then `/reload` or new session.

## Behaviour

- Listens to raw terminal input for **Esc** only while the agent is **not idle**
- Always **passes the key through** (never consumes it), so Pi restores the queue and aborts as usual
- On **`agent_settled`** after that abort, sends the restored editor text as the next user turn
- Does not wrap or replace the editor component

## Non-goals

- No visible queue UI (use `pi-queue-steer` or native hints)
- No reimplementation of steer vs follow-up delivery timing
- Does not patch `pi-queue-steer` source

## Develop

```bash
pi -e ./index.ts
```

Tested as a companion to Pi 0.80.x + `@tmustier/pi-queue-steer`.

## Licence

MIT