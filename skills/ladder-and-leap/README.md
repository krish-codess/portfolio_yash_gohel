# Ladder & Leap

**An end-to-end brand strategy and copywriting skill for brand managers, built for [Claude Code](https://claude.com/claude-code) and Claude.ai.**

Positioning theory and Madison Avenue-grade craft, packaged as a working system — not a thin AI wrapper around "write me some marketing copy."

## Why this exists

Most AI marketing prompts default to generic startup-blog voice: safe, adjective-heavy, indistinguishable from every other brand's output. This skill exists because real brand work isn't generic — it's built on decades of hard-earned strategic theory and craft discipline that most AI tooling simply ignores. **Ladder & Leap** packages that discipline into something you can actually run a real brand task through: position a product against a real competitive ladder, brief creative work tightly enough that it doesn't come back wrong, write headlines using named techniques from the people who actually invented modern advertising, and audit a campaign before it ships instead of after it flops.

It was built by Yash Gohel, a Brand Manager at Zydus Wellness (TatvaCare / GoodFlip) with roughly six years across healthtech, fintech, and DTC marketing — as the tool he actually wanted to use on the job, then shared publicly because it turned out to be useful beyond one team.

**Ladder**, because positioning means knowing exactly which rung of the category ladder you're claiming, and having the discipline not to fight for one you can't hold. **Leap**, because a correct strategy isn't the same thing as work anyone remembers — somewhere between the brief and the finished ad, someone has to make the creative leap.

## What it does

- **Positions a brand or product** using a category-ladder framework, leader/follower strategy, and a one-line positioning-statement generator.
- **Defines a brand voice system** with a tone-of-voice matrix and a "say it, don't describe it" method instead of another adjective-only style guide.
- **Tightens creative briefs** with a one-page template and a five-question tightness test that catches feature lists and mission statements disguised as strategy.
- **Develops and reviews creative work** using a Hegarty-inspired framework for briefing fearlessly and running reviews that don't sand strong ideas down to safe.
- **Writes and diagnoses headlines and campaign copy** using twelve named, real, historically documented techniques from legendary copywriters — David Abbott, Dave Trott, Neil French, Dan Wieden, Ed McCabe, and more.
- **Audits offers and campaigns** before launch (or diagnoses them after) with an original Five Fit Checks scoring framework, plus a post-mortem template.
- **Structures go-to-market plans** — messaging hierarchy, launch phasing, and a channel-mix logic tied back to your actual ladder position.
- **Ships a ready-to-paste prompt library** so you can skip the reading and get straight to work.

## Structure

```
ladder-and-leap/
├── SKILL.md                              # Entry point: overview, routing table, operating principles
├── README.md                             # You are here
└── reference/
    ├── 01-positioning.md                 # Category ladders, leader/follower strategy, positioning worksheet
    ├── 02-brand-voice-system.md          # Voice matrix, content cadence system, consistency audit
    ├── 03-creative-brief.md              # One-page brief template + tightness test
    ├── 04-creative-development.md        # Briefing fearlessly, running reviews, the creative review filter
    ├── 05-copywriting-canon.md           # 12 named techniques from real, documented campaigns
    ├── 06-offer-and-campaign-audit.md    # The Five Fit Checks + post-mortem template
    ├── 07-go-to-market.md                # Messaging hierarchy, launch phasing, GTM one-pager
    └── 08-prompt-library.md              # Ready-to-paste prompts for every stage above
```

Each reference file works standalone — you don't need to read the whole skill to use one piece of it. `SKILL.md` is the router: it stays short and tells Claude (or you) which file to pull for a given task, in the spirit of progressive disclosure.

## How to use it

**In Claude Code**, drop this folder into your skills directory (project-level `.claude/skills/` or user-level `~/.claude/skills/`), then just describe what you're doing in plain language — "help me position this product," "review this brief," "give me headline directions for X," "audit this campaign before we launch it." Claude will route to the right reference file automatically.

**In a Claude.ai Project**, upload the whole folder (or paste `SKILL.md` plus the relevant reference file) as project knowledge, and prompt the same way.

**Straight from the prompt library**, if you already know what you need — open `reference/08-prompt-library.md`, copy the relevant block, fill in the brackets, and paste it in.

## Credit and inspiration

This skill draws on real, published frameworks and real, documented advertising history, rewritten in its own words — it does not reproduce any source text verbatim.

- Positioning frameworks are inspired by **Al Ries and Jack Trout, *Positioning: The Battle for Your Mind*** (McGraw-Hill).
- The creative-development framework is inspired by **John Hegarty, *Hegarty on Creativity: There Are No Rules*** (Thames & Hudson).
- The copywriting canon draws on the craft and real career histories of legendary copywriters whose work is collected in **D&AD and TASCHEN's *The Copy Book*** — among them David Abbott, Dave Trott, Neil French, Dan Wieden, Ed McCabe, Bob Levenson, Indra Sinha, John Bevins, Steve Hayden, Janet Kestin, Jeremy Sinclair, Sean Doyle, Tim Delaney, Mike Lescarbeau, Dan Germain, and Nick Asbury.

Read the originals — this skill is a companion and a working toolkit, not a substitute for any of them.

## License

MIT. Use it, fork it, adapt it for your own brand or agency. See `LICENSE`.
