# Prompt Library

Ready-to-paste prompts for each stage of the flow in `SKILL.md`. Replace the bracketed placeholders and hand these to Claude directly. Each one is designed to pull in exactly the reference file it needs rather than the whole skill at once.

## Positioning sprint

```
Using the positioning framework in reference/01-positioning.md, help me position
[product/brand]. Here's what you need to know:
- What it is and who it's for: [description]
- Who I think the real competitors are: [list]
- What I currently believe our position is (if anything): [description]

Start by asking me the category-ladder-mapping question before proposing anything —
don't assume our internal view of our position matches what customers actually think.
Then walk me through the six-question position audit and help me write one clean
positioning statement using the template at the end of that file.
```

## Brand voice definition

```
Using reference/02-brand-voice-system.md, help me define a voice system for
[brand]. Ask me to set each of the four voice-matrix dials with real anchoring
examples, not just adjectives. Then help me write the "say it, don't describe it"
table with real example sentences for: an announcement, an apology, an error
message, a celebratory moment, declining a request, and our most boring
transactional copy.
```

## Brief tightener

```
Here's a creative brief I've drafted: [paste brief]

Using reference/03-creative-brief.md, run it through the five-question
brief-tightness test and tell me specifically where it fails. Then help me
rewrite the single-minded proposition down to one sentence, and flag if what
I've written is actually a feature list, a mission statement, or a proposition
padded to please multiple stakeholders.
```

## Creative review

```
Here's a piece of creative work: [paste or describe the work]

Using the seven-question creative review filter in reference/04-creative-development.md,
score it honestly on each dimension: truth, strategy fit, freshness, zag check, voice
fit, fearlessness, and memorability without the logo. For any dimension that scores
weak, tell me specifically whether the fix is a strategy problem (worth another
round) or a taste preference (shouldn't hold up sign-off).
```

## Headline lab

```
I need headline directions for [product/campaign]. The single-minded proposition
is: [proposition from the brief].

Using reference/05-copywriting-canon.md, give me one headline in the style of each
of these approaches, and name which technique each one is using:
1. The Abbott long-copy discipline (respect the reader's intelligence, real proof)
2. The Trott creative leap (don't answer the brief literally)
3. The zag against category convention (map what competitors do, do the opposite)
4. The Wieden tagline discipline (a behavior prompt, not a product description)
5. The McCabe proof-point-as-person approach (a specific, ownable proof point)

Then run every headline through the headline diagnostic at the end of that file
and tell me which ones actually pass.
```

## Cause / behavior-change copy

```
I'm writing copy meant to change behavior, not just build preference, for:
[health/safety/public-good context].

Using the Sinha/Bevins technique in reference/05-copywriting-canon.md, help me
find the plainest, most specific true statement of the actual fact or risk
involved, and write from that rather than from persuasive technique layered on
top. Run the plain-fact test on whatever we draft.
```

## Offer / campaign audit

```
Here's an offer or campaign I'm about to launch (or one that already ran):
[description, or paste the creative/offer details]

Using reference/06-offer-and-campaign-audit.md, score it 1-5 on each of the Five
Fit Checks: Category Fit, Truth Fit, Voice Fit, Channel Fit, and Distinctiveness
Fit. Don't average the scores — flag any single dimension scoring below 3 as a
specific, nameable risk. Then check it against the red-flag list.
```

## Go-to-market plan

```
I'm launching [product] and need a go-to-market plan.

Position: [positioning statement, or ask me to derive one using reference/01-positioning.md
first if I don't have one yet]
Objective: [behavior-change goal]
Budget/timeline constraints: [details]

Using reference/07-go-to-market.md, help me build the messaging hierarchy (pillars
and proof points), phase the launch into pre-launch/launch/sustain with a job for
each phase, and recommend a channel mix based on whether I'm defending a leader
position or hunting a follower's gap. Fill out the GTM one-pager template with me,
including the cross-functional checklist.
```

## Campaign post-mortem

```
Here's how [campaign] actually performed against its goal: [results/data]

Using the post-mortem template in reference/06-offer-and-campaign-audit.md, help
me work through what moved and by how much, whether our pre-launch Five Fit
Checks scoring predicted the outcome, one specific thing a rerun would change,
and whether this reveals a failure mode that should become a standing rule in
our brief or audit process rather than a one-off lesson.
```
