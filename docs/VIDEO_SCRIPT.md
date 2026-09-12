# CloseLoop — Demo Video Script

**Target length:** 2:59 (hard ceiling 3:00)
**Format:** screen recording with voice-over
**Covers:** what the project does · the problem it solves · why it's needed · the benefit

Read the narration at a normal speaking pace — roughly 150 words per minute. Word counts per
section are tuned to the timings below. Don't rush the demo section; dead air while something
loads is fine and reads as honest.

---

## Before you record

- [ ] Server running: `cd server && npm start` — confirm `listening on http://localhost:3000`
- [ ] Extension loaded at `chrome://extensions`, `.env` has the matching extension ID
- [ ] Teams Web open on the **sample thread** (below), scrolled to the top of it
- [ ] Browser zoom at **125%** so text is readable in the recording
- [ ] Close other tabs, silence notifications, hide the bookmarks bar
- [ ] Do one full dry run so the analysis is warm and you know what the output says

### Sample thread to seed in Teams

Post these as separate messages in a test channel. It's deliberately written to land on
🟡 **NEEDS_OWNER** — everyone agrees, nobody commits. That's the most persuasive demo state.

> **Priya:** We're seeing checkout timeouts again during the evening peak. Third time this week.
>
> **Marco:** Same window as last time? I still think it's the connection pool, not the query.
>
> **Priya:** Pool sounds right. We capped it at 20 back in March and traffic is well past that now.
>
> **Dan:** Could also be the new recommendations call on the cart page. It went out Tuesday.
>
> **Marco:** Worth checking, but the timeouts started before Tuesday.
>
> **Priya:** Agreed, let's raise the pool cap first and watch tonight's peak before we touch anything else.
>
> **Dan:** Makes sense. Someone should also check whether staging is running the same cap, otherwise we won't reproduce it.
>
> **Marco:** Good point.
>
> **Priya:** 👍 Also — do we need to tell support in case it happens again tonight?
>
> **Dan:** Sounds good, let's do that.

Note what this thread contains, so you can call it out live: a **real decision** (raise the pool
cap first), an action with **no owner** (check the staging cap), an **unanswered question** (do we
tell support?), and a **risk** (can't reproduce without matching staging config).

---

## Shot list

### 1 — The hook · 0:00–0:26 · *the problem*

**On screen:** the Teams thread, scrolling slowly top to bottom.

> "This is a real engineering conversation. Ten messages, three people, and it ends with
> 'sounds good.'
>
> But look at what it actually leaves behind. Somebody *should* check the staging config —
> that's not an owner, that's a sentence that feels like progress. A question got asked and
> never answered. And nobody wrote down what was decided.
>
> Next week, all of this gets re-litigated. That's the problem."

*(65 words · 26s)*

---

### 2 — Why this keeps happening · 0:26–0:52 · *why it's needed*

**On screen:** stay on the thread; hover over the reactions and the pin icon as you mention them.

> "Chat is where decisions get made. But chat has no way to mark one.
>
> React to a message, pin it, start a thread — that marks *attention*, never *resolution*.
> Nothing here says 'decided, and Dan owns it.'
>
> And writing that up by hand is real work that's nobody's job. So it happens for the formal
> meeting, and never for the twenty threads that actually drove the sprint."

*(66 words · 26s)*

---

### 3 — The demo · 0:52–1:44 · *what it does*

**On screen:** select the whole thread → click the CloseLoop icon → click **Analyze selected
conversation**. Let the spinner run. Then let the result sit on screen for a beat before
narrating it.

> "So: CloseLoop. Select the conversation. One click.
>
> *(pause while it analyzes)*
>
> And here's the thread as a structure instead of a story.
>
> **Status: needs owner.** That's the headline — a decision exists, but an important action has
> nobody's name on it.
>
> The **decision** it found: raise the connection pool cap first, watch tonight's peak before
> changing anything else. That's correct — and notice nobody ever used the word 'decided.'
>
> The **actions**, each with an owner — and there's the one marked *Unassigned*. That's the
> staging config check. That's the thing that would have been silently dropped.
>
> The **open question** nobody answered: do we tell support tonight?
>
> And the **risk**: if staging doesn't match production's cap, we can't reproduce this at all."

*(114 spoken words · 46s, plus roughly 6s of silence while it analyzes)*

---

### 4 — Closing the loop · 1:44–2:03 · *what it does, part two*

**On screen:** click **Copy closure message**, switch to Teams, paste it into the thread, send.

> "Then one more click copies it as a message — and it goes straight back into the thread.
>
> That matters more than it looks. The record now lives in the place people will actually search
> for it, in the conversation it came from. Not in a doc nobody opens."

*(48 words · 19s)*

---

### 5 — Why not just ask a chatbot · 2:03–2:37 · *the differentiator*

**On screen:** the three status states — either cut between two analyses with different statuses,
or hold on the status card and let the point land on voice alone.

> "So why not just paste this into any chatbot and ask for a summary?
>
> Because a summary is the wrong output. You get a smooth paragraph narrating what was *said* —
> and a smooth paragraph over an unresolved thread makes an open loop look closed. That's worse
> than nothing.
>
> CloseLoop does the opposite. It's instructed not to invent decisions or owners. Every thread
> lands on one of three states, and unowned work comes back marked unowned. It's built to tell
> you the loop is *open*."

*(84 words · 34s)*

---

### 6 — The benefit · 2:37–2:59 · *what you get*

**On screen:** architecture diagram from the README, or the popup one last time.

> "Five seconds to closure status instead of thirty messages. Unowned work visible before it's
> dropped. Decisions that stop getting re-argued.
>
> And it asks nothing of your team — no bot in the channel, no process to adopt. Select, click,
> paste. It all runs locally, so your conversations and your API key stay on your machine.
>
> That's CloseLoop."

*(56 words · 22s)*

---

## Recording notes

- **Lead with the thread, not the tool.** The first twenty seconds should make the viewer
  recognize their own Monday. The extension shouldn't appear until 0:45.
- **Land on NEEDS_OWNER, not CLOSED.** A green light is a less interesting demo than a yellow
  one. The yellow light is the thing nothing else in the stack can tell you.
- **Say the unowned action out loud.** "Somebody should check staging" → `Unassigned`. That
  single beat is the most memorable moment in the video.
- **Don't narrate the UI.** Never say "now I'm clicking the button." Say what it means.
- **If the analysis is slow,** stay silent and let it run rather than filling the gap. A visible
  two-second wait is more credible than a cut.
- **If you must cut to 60 seconds:** keep sections 1, 3 and 6. Those three cover the problem,
  the product, and the benefit.

## One-paragraph version (for a submission form or description field)

> Workplace decisions get made in chat, and chat has no way to mark one as closed. A thread ends
> with "sounds good," and a week later nobody can say what was decided, who owns what, or which
> question never got answered — so work gets silently dropped and decisions get re-litigated.
> CloseLoop is a Chrome extension that turns any selected conversation into a structured closure
> summary: a decision, owned actions, open questions, risks, and one concrete next step, plus a
> status of CLOSED, NEEDS_OWNER, or NEEDS_DECISION. Unlike a generic summarizer — which produces
> readable prose that makes an unresolved thread look settled — CloseLoop is built to surface
> ambiguity: unowned actions come back marked unowned, and a thread that decided nothing comes
> back as NEEDS_DECISION. You get closure status in five seconds instead of thirty messages, and
> one click pastes the record back into the thread where people will actually find it. It runs
> against a local server, so conversations and API keys stay on your machine.
