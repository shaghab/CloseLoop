# CloseLoop

**Turn a workplace conversation into a decision, owned actions, open questions, risks, and a clear next step — in one click.**

Select a thread in Microsoft Teams, click the CloseLoop extension, and get back a structured
closure summary you can paste straight back into the channel.

---

## The problem

Work gets discussed in chat. It rarely gets *closed* there.

A typical Teams thread runs thirty messages across two days and ends with "sounds good" —
and then nobody can answer the three questions that actually matter:

1. **What did we decide?** Three options were floated. Two people liked different ones. No one
   said the word "decided."
2. **Who owns what?** "Someone should look at the migration script" is not an owner. It's a
   sentence that feels like progress.
3. **What is still open?** The blocking question asked on message 12 got buried under a tangent
   about staging environments and was never answered.

The cost is not the reading time. The cost is the **silent drop**: work that everyone assumed
someone else picked up, decisions that get re-litigated a week later because no one wrote them
down, and risks that were raised once, in passing, and never tracked.

Generic AI summarizers make this worse, not better. Ask a chatbot to "summarize this thread"
and you get a readable paragraph that flattens the important distinction: it narrates what was
*said* instead of telling you whether anything was actually *settled*. A summary that reads
smoothly over an unresolved thread is actively misleading — it makes an open loop look closed.

## What CloseLoop does

CloseLoop extracts **signal, not summary**. It reads the selected conversation and returns a
fixed structure:

| Field | What it answers |
|---|---|
| **Status** | Is this thread actually closed? |
| **Decision** | What was settled — or explicitly, that nothing was |
| **Actions** | Each commitment, with its owner (or `Unassigned`, stated plainly) |
| **Open questions** | What was asked and never answered |
| **Risks** | Only things that could materially affect execution, delivery, or quality |
| **Next step** | The one concrete move that advances the thread |

The **Status** field is the heart of it. Every analysis lands in exactly one of three states:

- 🟢 **CLOSED** — a reasonably clear decision exists, and important actions have owners.
- 🟡 **NEEDS_OWNER** — the direction is clear, but an important action has nobody's name on it.
- 🔴 **NEEDS_DECISION** — no sufficiently clear decision or direction exists yet.

That traffic light is the product. It turns a vague feeling ("I think we sorted that out?") into
a claim you can act on in five seconds.

The model is instructed not to invent decisions or owners, and to state ambiguity plainly. An
unowned action comes back as unowned. A thread that decided nothing comes back as
`NEEDS_DECISION`. **CloseLoop is designed to tell you the loop is open, not to paper over it.**

## Why it is needed

Three things have to be true at once for a tool like this to be worth building, and right now
they all are:

- **Chat is where decisions happen, and chat has no closure primitive.** Teams, Slack and their
  equivalents give you reactions, pins and threads — all of which mark *attention*. None of them
  mark *resolution*. There is no field anywhere in the tool that says "this is decided and Priya
  owns it."
- **The manual alternative doesn't scale.** Writing up decisions and owners after every
  significant thread is real work, it's nobody's job, and it's the first thing dropped in a busy
  week. So it gets done for the formal meeting and skipped for the twenty chat threads that
  actually drove the sprint.
- **The fix is finally cheap.** Structured extraction from messy conversational text became
  reliable only recently. CloseLoop enforces a strict JSON schema on the model's output, so the
  result is a consistent data structure every time — not prose that a human has to re-read and
  re-interpret.

## What you get out of it

- **Five seconds to closure status.** Read one traffic light instead of thirty messages.
- **Unowned work becomes visible.** `NEEDS_OWNER` surfaces the exact failure mode that causes
  most silent drops — everyone agreed, nobody committed.
- **Decisions stop getting re-litigated.** Paste the closure message back into the thread and
  it becomes the searchable record, in the place people will actually look for it.
- **Open questions get answered.** The buried blocking question is pulled back to the surface
  where it can be assigned.
- **It works on conversations you already have.** No new workflow, no bot in the channel, no
  asking your team to adopt a process. Select text, click once, paste the result.
- **Your conversations stay under your control.** The analysis server runs locally, bound to
  `127.0.0.1`, and only accepts requests from your own extension.

## How it works

```
Teams Web  ──selection──▶  Chrome extension  ──POST /analyze──▶  Local Node server
                                  ▲                                      │
                                  │                                 OpenAI API
                                  └────── structured JSON ◀──────────────┘
```

1. The popup reads the current selection from the active tab (`activeTab` + `scripting`; no
   content script sits permanently on the page).
2. It POSTs the text to a Node server on `127.0.0.1:3000`, which listens on loopback only.
3. The server checks the request origin against your extension's ID and rejects anything else,
   then calls the OpenAI Chat Completions API with a strict JSON schema.
4. The validated structure comes back to the popup, renders as cards, and **Copy closure
   message** puts a paste-ready version on your clipboard.

Your API key lives in `server/.env` on your machine and never reaches the extension.

## Run the demo

1. Install the server dependencies:
   ```bash
   cd server
   npm install
   ```
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the repository's `extension` directory.
4. Copy the ID shown for CloseLoop.
5. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
6. In `.env`, add your OpenAI API key and replace `your_extension_id` with the copied ID.
7. Start the server:
   ```bash
   npm start
   ```
8. Open Microsoft Teams Web and select a block of conversation text.
9. Click the **CloseLoop** extension.
10. Click **Analyze selected conversation**. Use **Copy closure message** to paste the result
    back into Teams.

### Configuration

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | yes | Authenticates the analysis call |
| `CLOSELOOP_EXTENSION_ORIGIN` | yes | `chrome-extension://<your-extension-id>`; every other origin is rejected with 403 |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini` |

## Project layout

```
extension/        Chrome MV3 popup — selection capture, rendering, clipboard
  manifest.json
  popup.html/.css/.js
server/           Local Node analysis server
  server.js       Origin check, strict JSON schema, OpenAI call
  .env.example
```

## Scope of this MVP

CloseLoop is a working demo, not a deployed product. It analyzes **selected text**, so it works
on any conversation you can highlight in a browser — Teams Web is the target, but the mechanism
is not Teams-specific. It does not read your mailbox, join channels, or store anything: each
analysis is a single stateless request, and nothing is persisted between clicks.

The natural next steps are writing closure back into the thread automatically, tracking
`NEEDS_OWNER` threads until they resolve, and running the same extraction across a channel's
history to find every loop that was quietly left open.

## License

MIT — see [LICENSE](LICENSE).
