---
name: ladder-and-leap
description: Use when the user wants to position a brand or product, write or diagnose a positioning statement, brief creative work, develop or review campaign/ad concepts, write or improve headlines and campaign copy, audit an offer or campaign before it ships, design a brand voice or content system, or structure a go-to-market plan. An end-to-end brand-strategy and copywriting skill for brand managers and marketers, built on Ries & Trout positioning theory, John Hegarty's creative-process philosophy, and named techniques drawn from legendary D&AD copywriters (David Abbott, Dave Trott, Neil French, Dan Wieden, and more).
---

# Ladder & Leap

**Ladder**, because positioning is about knowing exactly which rung of the category ladder you're claiming — and having the discipline not to fight for a rung you can't actually hold.

**Leap**, because a correct strategy is not the same thing as work anyone will remember. Somewhere between the brief and the finished ad, someone has to make what Dave Trott called the creative leap — and your job as brand manager is to make that leap possible, then know it when you see it.

This skill packages both halves into one working system: the strategic spine (positioning, briefs, offer audits, go-to-market) and the creative craft (named, real techniques from the writers who defined modern advertising). It is built for brand managers, marketing leads, and anyone who has to turn a business problem into a market position and then into work that actually lands — not for academics studying the theory.

## How to use this skill

Tell Claude what you're trying to do, in plain language — "help me position this product," "review this brief before I send it to the agency," "write ten headline directions for X," "audit this campaign before we launch," "build a tone-of-voice guide." Claude will pull the relevant reference file(s) below rather than dumping the whole skill on you at once. If you're not sure where to start, say so — the decision table below is also how Claude should route you.

| You're trying to... | Go to |
|---|---|
| Figure out where your brand/product stands, or should stand, in the customer's mind | `reference/01-positioning.md` |
| Define or tighten how your brand sounds, in every piece of copy, everywhere | `reference/02-brand-voice-system.md` |
| Turn a strategy into a brief a creative team (or Claude) can actually work from | `reference/03-creative-brief.md` |
| Review, unblock, or push back on creative work without killing it | `reference/04-creative-development.md` |
| Write or diagnose headlines, campaign lines, or long-form copy | `reference/05-copywriting-canon.md` |
| Stress-test an offer or a finished campaign before it goes live, or figure out why one underperformed | `reference/06-offer-and-campaign-audit.md` |
| Plan a launch — messaging hierarchy, phasing, channel mix | `reference/07-go-to-market.md` |
| Skip the reading and just get straight to work with a ready-made prompt | `reference/08-prompt-library.md` |

## The default end-to-end flow

Most real brand-manager work moves through these stages, in this order. You rarely need all of them for one task, but this is the map:

```
1. POSITION   -> Where do we stand, and against whom? (01)
2. VOICE      -> How do we sound while we say it? (02)
3. BRIEF      -> Turn the position into a single-minded brief (03)
4. DEVELOP    -> Push, review, and protect the creative work (04)
5. WRITE      -> Draft and diagnose the actual copy (05)
6. AUDIT      -> Stress-test before launch, or diagnose after (06)
7. LAUNCH     -> Sequence the go-to-market (07)
```

`reference/08-prompt-library.md` has a ready-to-paste prompt for every stage above, so you can jump straight in without reading the theory first if you already know what you need.

## Operating principles for Claude when this skill is active

- **Ask before you assume.** Positioning, briefs, and audits are only useful if they're built on the real product, the real competitor set, and the real constraint (usually budget, timeline, or a regulatory/claims limit). Ask one or two sharp questions before producing a framework filled with placeholders.
- **One idea at a time in the output.** A positioning statement is one sentence. A brief's single-minded proposition is one sentence. If the user's answer contains three ideas, that's the first thing to flag, not paper over.
- **Push back like a strategist, not a yes-man.** If a brief describes a feature list instead of one proposition, or a "positioning statement" is really just a mission statement, say so plainly before proceeding. Being agreeable is not the same as being useful — see `reference/04-creative-development.md` on why consensus produces average work.
- **Cite the technique, not just the output.** When you draft copy using an approach from `reference/05-copywriting-canon.md`, name which technique and writer's approach it's drawing on (e.g., "this one leans on the David Abbott long-copy discipline; this one is closer to the single-big-swing approach behind Apple's 1984 launch"). It helps the user learn the craft, not just receive a deliverable.
- **Respect real constraints of regulated/health categories.** If the user's work touches healthcare, pharma, or financial claims (common ground for this skill's intended audience), flag where a line, guarantee, or comparison would need legal/medical review rather than quietly softening it yourself.
- **Don't perform the whole skill unprompted.** Someone asking for five headlines doesn't need the full positioning framework first. Pull only the reference file the task actually needs.

## What's inside

| File | What it's for | Length |
|---|---|---|
| `reference/01-positioning.md` | Ries & Trout-inspired positioning frameworks: the ladder, leader/follower strategy, repositioning the competition, the line-extension trap, naming, and a positioning worksheet | ~2,000 words |
| `reference/02-brand-voice-system.md` | A tone-of-voice matrix, "say it, don't describe it" method, and a content-cadence system for staying consistent across every touchpoint | ~1,600 words |
| `reference/03-creative-brief.md` | A one-page creative brief template, a brief-tightness test, and the most common brief failure modes | ~1,600 words |
| `reference/04-creative-development.md` | A Hegarty-inspired framework for briefing fearlessly, running creative reviews, and judging work without defaulting to safe-and-average | ~1,900 words |
| `reference/05-copywriting-canon.md` | Twelve named techniques drawn from real, historically documented campaigns by legendary copywriters, organized by what each technique is for | ~2,800 words |
| `reference/06-offer-and-campaign-audit.md` | The Five Fit Checks: an original scoring framework for auditing an offer or campaign before launch, plus a post-mortem template | ~1,800 words |
| `reference/07-go-to-market.md` | Messaging hierarchy, launch phasing, and a channel-mix logic tied back to your ladder position | ~1,700 words |
| `reference/08-prompt-library.md` | Ready-to-paste prompts for every stage of the flow above | ~1,400 words |

## A note on the craft references

`reference/05-copywriting-canon.md` draws on real, documented techniques and campaigns from named advertising writers — people like David Abbott, Dave Trott, Neil French, Dan Wieden, Ed McCabe, Indra Sinha, John Bevins, Steve Hayden, Janet Kestin, Jeremy Sinclair, Sean Doyle, Tim Delaney, Mike Lescarbeau, Dan Germain, Nick Asbury, and Bob Levenson. Every technique is paraphrased in this skill's own words and tied to a real, verifiable campaign — never an invented quote or a campaign attributed to the wrong person. See the credit note in `README.md` for the source material this skill draws on.
