# pi-esc-steer

Claude Code-style **Escape while the agent is running**:

1. Abort the current run  
2. Immediately continue with the next queued instruction  

instead of only pausing the queue, or dumping steers back into the editor for you to press Enter again.

## Why

| Setup | Default Esc | With `pi-esc-steer` |
| --- | --- | --- |
| Native Pi | Restores queued text into the editor, aborts | Abort + **auto-submit** restored text |
| [`pi-queue-steer`](https://github.com/tmustier/pi-queue-steer) | Aborts and **pauses** lanes (Enter resumes) | Abort + **auto-resume** (same as empty Enter) |

You keep stock queue UI from upstream. This package only changes the Esc → continue path.

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

- Intercepts **Esc / `app.interrupt`** only while the agent is **not idle**
- Always **passes the key through** (does not steal autocomplete cancel, idle double-Esc, etc.)
- On **`agent_settled`** after that abort, synthesizes one **submit** (`tui.input.submit`):
  - **pi-queue-steer:** empty composer → resume paused lane / `dispatchFromIdle`
  - **native:** editor already holds restored queue text → send it as the next user turn

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