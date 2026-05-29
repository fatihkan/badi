import { getDateString, slugify } from "../icerik-helpers.js";

export function contentTemplatesEN() {
	return {
		post: (topic) => `# Social Media Post — ${topic}

**Date:** ${getDateString()}
**Platform:** [Instagram / Twitter-X / LinkedIn / TikTok / Facebook]
**Type:** [Informational / Inspirational / Entertainment / Sales / Community / Educational]

---

## HOOK (First 2 lines)

[Attention-grabbing opening — question, bold statement, or surprising fact]

---

## VARIATION A — Direct Value

[Main message in 2-3 sentences. Clear, concise, actionable.]

[Supporting detail or example]

[Call to Action — save, share, comment, link in bio]

---

## VARIATION B — Storytelling

[Brief personal or brand story related to topic]

[Lesson or insight from the story]

[Call to Action with emotional connection]

---

## VARIATION C — Question-Based

[Engaging question to the audience]

[Your perspective or answer]

[Invite discussion — "What do you think?"]

---

## VISUAL NOTE
- Size: [1080x1080 / 1080x1350 / 1920x1080]
- Style: [Minimal / Bold / Photo / Graphic / Carousel cover]
- Colors: [Brand colors / Seasonal / Topic-specific]
- Text on image: [Key phrase max 8 words]

## HASHTAGS
[5-10 relevant hashtags]
[Mix: 2 broad + 3 niche + 2 branded]

## TIMING
- Best posting time: [Research-based suggestion]
- Day: [Optimal day of week]

## META
- **File:** ${getDateString()}-${slugify(topic)}.md
- **Brand Voice:** Check .claude/workspace/marka-sesi.md
- **After publishing:** Record performance with \`badi icerik perf add\`
`,
		karousel: (topic) => `# Carousel Content — ${topic}

**Date:** ${getDateString()}
**Platform:** [Instagram / LinkedIn / Twitter-X]
**Slides:** 7-10 recommended

---

## SLIDE 1 — Cover
**Title:** [Attention-grabbing title, max 6 words]
**Subtitle:** [Supporting line]
**Visual:** [Bold graphic, brand colors]

## SLIDE 2 — Problem/Context
**Title:** [Define the problem or context]
**Body:** [1-2 sentences, relatable]
**Visual:** [Icon or illustration]

## SLIDE 3 — Point 1
**Title:** [First key point]
**Body:** [Brief explanation with example]
**Visual:** [Supporting graphic]

## SLIDE 4 — Point 2
**Title:** [Second key point]
**Body:** [Brief explanation with example]
**Visual:** [Supporting graphic]

## SLIDE 5 — Point 3
**Title:** [Third key point]
**Body:** [Brief explanation with example]
**Visual:** [Supporting graphic]

## SLIDE 6 — Summary
**Title:** [Key takeaway]
**Body:** [Recap in 1-2 sentences]
**Visual:** [Infographic or checklist]

## SLIDE 7 — CTA
**Title:** [Call to Action]
**Body:** [Save / Share / Follow / Link in bio]
**Visual:** [Brand logo + handle]

---

## CAPTION
[Engaging caption summarizing the carousel content]
[2-3 hashtags inline]

## DESIGN NOTES
- Format: 1080x1080 or 1080x1350
- Font: [Consistent throughout]
- Swipe indicator on each slide

## META
- **File:** ${getDateString()}-karousel-${slugify(topic)}.md
`,
		video: (topic) => `# Video Script — ${topic}

**Date:** ${getDateString()}
**Platform:** [TikTok / Instagram Reels / YouTube Shorts / YouTube]
**Duration:** [15s / 30s / 60s / 3-5min]

---

## HOOK (0-3 seconds)
**Visual:** [Opening shot description]
**Audio:** [First words — must grab attention]
**Text:** [On-screen text overlay]

## SCENE 1 — Setup (3-10s)
**Visual:** [Camera angle, setting, action]
**Audio:** [Narration or dialogue]
**Text:** [Key point on screen]
**Transition:** [Cut / Zoom / Swipe]

## SCENE 2 — Main Content (10-25s)
**Visual:** [Main demonstration or explanation]
**Audio:** [Core message delivery]
**Text:** [Supporting text or data]
**Transition:** [Transition type]

## SCENE 3 — Climax/Reveal (25-40s)
**Visual:** [Key moment or transformation]
**Audio:** [Impactful statement]
**Text:** [Result or proof]
**Transition:** [Transition type]

## CLOSING (Final 5s)
**Visual:** [Brand/face close-up]
**Audio:** [CTA — Follow, Like, Comment]
**Text:** [Handle + CTA text]

---

## CAPTION
[Post caption with hashtags]

## POST-PRODUCTION
- Music: [Trending audio or original]
- Filters: [Style filter]
- Subtitles: [Auto-caption recommended]

## THUMBNAIL (YouTube)
[Description of thumbnail design]

## META
- **File:** ${getDateString()}-${slugify(topic)}.md
`,
		gorsel: (topic) => `# Visual Brief — ${topic}

**Date:** ${getDateString()}
**Usage:** [Social Media / Blog / Ad / Banner / Story]

---

## CONTEXT
- Purpose: [What this visual communicates]
- Target: [Who will see it]
- Platform: [Where it will be published]

## TECHNICAL SPECS
- Dimensions: [1080x1080 / 1080x1350 / 1920x1080 / Custom]
- Format: [PNG / JPG / SVG / Video frame]
- File size: [Max limit if applicable]

## COLOR PALETTE
- Primary: [Hex code + name]
- Secondary: [Hex code + name]
- Accent: [Hex code + name]
- Background: [Hex code + name]

## TYPOGRAPHY
- Headline: [Font, size, weight]
- Body: [Font, size, weight]
- Max text: [X words on image]

## COMPOSITION
- Layout: [Centered / Rule of thirds / Asymmetric]
- Hero element: [Main focal point]
- Supporting elements: [Secondary visuals]
- White space: [Breathing room areas]

## AI PROMPTS
**Midjourney:** [Detailed prompt]
**DALL-E:** [Detailed prompt]

## META
- **File:** ${getDateString()}-${slugify(topic)}-brief.md
`,
		takvim: (period) => `# Content Calendar — ${period}

**Created:** ${getDateString()}
**Period:** ${period}

---

## WEEKLY THEMES
| Day | Theme | Content Type |
|-----|-------|-------------|
| Monday | Motivation / Week opener | Post / Reel |
| Tuesday | Educational / Tips | Carousel / Post |
| Wednesday | Behind the scenes / Community | Story / Post |
| Thursday | Product / Service | Carousel / Video |
| Friday | Fun / Trending | Reel / Meme |
| Saturday | UGC / Social proof | Story / Post |
| Sunday | Inspiration / Weekly recap | Post / Carousel |

## PLATFORM DISTRIBUTION (Weekly)
- Instagram Post: 3-5
- Instagram Reel: 2-3
- Twitter/X: 5-7
- LinkedIn: 2-3
- TikTok: 3-5

## WEEK 1
| Day | Platform | Type | Topic | Status |
|-----|----------|------|-------|--------|
| Mon | [Platform] | [Type] | [Topic] | [ ] |
| Tue | [Platform] | [Type] | [Topic] | [ ] |
| Wed | [Platform] | [Type] | [Topic] | [ ] |
| Thu | [Platform] | [Type] | [Topic] | [ ] |
| Fri | [Platform] | [Type] | [Topic] | [ ] |

## WEEK 2-4
[Repeat structure above]

## SPECIAL EVENTS & CAMPAIGNS
| Date | Event | Content Plan |
|------|-------|-------------|
| [Date] | [Event] | [Plan] |

## META
- **File:** ${getDateString()}-takvim-${slugify(period)}.md
`,
		marka: () => `# Brand Voice Guide

**Created:** ${getDateString()}
**Version:** 1.0

---

## BRAND PERSONALITY
- **Core traits:** [3-5 adjectives]
- **Archetype:** [Sage / Hero / Creator / Explorer / etc.]
- **One-line description:** [We are...]

## TONE SPECTRUM
| Context | Tone |
|---------|------|
| Educational | [Knowledgeable, clear, approachable] |
| Sales | [Confident, benefit-focused, not pushy] |
| Community | [Warm, inclusive, conversational] |
| Crisis | [Calm, transparent, empathetic] |

## LANGUAGE RULES
- **Do:** [Active voice, short sentences, "you" focused]
- **Don't:** [Jargon without explanation, all caps, excessive exclamation]
- **Emoji policy:** [Minimal / Moderate / Frequent + allowed emojis]

## PLATFORM-SPECIFIC TONE
| Platform | Adaptation |
|----------|------------|
| Instagram | [Visual-first, casual, emoji-friendly] |
| LinkedIn | [Professional, insight-driven, longer form] |
| Twitter/X | [Concise, witty, conversational] |
| TikTok | [Trendy, authentic, Gen-Z aware] |

## EXAMPLES
**Good:** [Example of on-brand writing]
**Bad:** [Example of off-brand writing + why]

## CHECKLIST
- [ ] Matches brand personality?
- [ ] Appropriate tone for context?
- [ ] Language rules followed?
- [ ] Platform-adapted?

## META
- **File:** marka-sesi.md
- **Next review:** Quarterly or after major brand changes
`,

		newsletter: (konu) => `# Newsletter — ${konu}

**Date:** ${getDateString()}
**Send at:** [DD.MM.YYYY HH:MM]
**List:** [Subscriber list / segment]
**Target open rate:** [%]

---

## SUBJECT LINE
- **Main:** [Under 50 chars, attention-grabbing]
- **Variant A:** [for A/B test]
- **Variant B:** [for A/B test]

## PREVIEW TEXT
[Under 90 chars, complements the subject]

---

## HOOK (First paragraph)
[1-2 sentences, keeps the reader]

## MAIN CONTENT
[3-5 paragraphs or grouped sections]

**Section 1 — [Title]**
[Content]

**Section 2 — [Title]**
[Content]

**Section 3 — [Title]**
[Content]

## WEEKLY CURATED (optional)
- [Link 1 — why it matters]
- [Link 2 — why it matters]
- [Link 3 — why it matters]

## CTA
[One clear action — button text + target URL]

---

## FOOTER
- Why are you receiving this?
- Unsubscribe link
- Social media links
- Postal address (CAN-SPAM)

## HTML CONFIG
- Theme color: [#HEX]
- Font: [Inter / System]
- Width: 600px
- Max image size: 500KB

## META
- File: ${getDateString()}-newsletter-${slugify(konu)}.md
- A/B test: subject line (variant A vs B)
- Best send times: Tue/Thu 10:00 (recommended)
`,

		podcast: (konu) => `# Podcast Episode — ${konu}

**Date:** ${getDateString()}
**Length:** [Estimated minutes]
**Guest:** [Name + role, if any]
**Format:** [Monologue / Interview / Panel]

---

## HOOK (first 30 seconds)
[Attention-grabbing opening — question, claim or story]

## EPISODE TITLE OPTIONS
- **A:** [Short, curiosity-inducing]
- **B:** [Clearly describes the topic]
- **C:** [SEO-focused]

---

## DRAFT FLOW (Show Notes)

### 1. INTRO (0:00 - 2:00)
- Welcome
- What are we talking about?
- Introduce the guest (if any)

### 2. SECTION A (2:00 - 10:00)
- **Subtopic:** [Title]
- **Key questions:**
  - Question 1
  - Question 2

### 3. SECTION B (10:00 - 20:00)
- **Subtopic:** [Title]
- **Story / example to share:**

### 4. SECTION C (20:00 - 30:00)
- **Subtopic:** [Title]
- **Deep dive:**

### 5. OUTRO (30:00 - ...)
- Top 3 takeaways
- CTA (subscribe, leave a review)
- Next episode teaser

---

## TRANSCRIPT SCAFFOLD
[Paste auto-transcript from Whisper/Deepgram here]

### Speaker 1 (Host)
[Text]

### Speaker 2 (Guest)
[Text]

---

## PLATFORM METADATA
- **Description (280 char):** [Spotify/Apple listing]
- **Tags:** tag1, tag2, tag3
- **Episode number:** [#]
- **Season:** [if any]
- **Explicit:** [yes/no]

## SOCIAL PROMO
- **Clip 1 (15s):** [Which minute?]
- **Clip 2 (30s):** [Which minute?]
- **Quote card:** [Most striking sentence]

## META
- File: ${getDateString()}-podcast-${slugify(konu)}.md
- RSS feed: [URL]
- Distribution: Spotify / Apple / Google / YouTube
`,

		thread: (konu) => `# Thread (X/LinkedIn) — ${konu}

**Date:** ${getDateString()}
**Platform:** [X (Twitter) / LinkedIn]
**Thread length:** 10 posts
**Core message:** [One-sentence summary]

---

## 1/10 — HOOK
[Shocking claim, striking stat, or compelling question.
Under 280 chars. Emoji usage: careful.]

## 2/10 — PROBLEM
[Name the pain your reader feels.]

## 3/10 — STORY
[Your own experience, an example, or a case.]

## 4/10 — KEY POINT 1
[First leg of the argument — back with evidence.]

## 5/10 — KEY POINT 2
[Second leg.]

## 6/10 — KEY POINT 3
[Third leg.]

## 7/10 — COUNTERARGUMENT
[Raise the reader's objection yourself, then answer it.]

## 8/10 — TAKEAWAY (Lesson)
[One-sentence lesson drawn from the argument.]

## 9/10 — APPLICATION
[What should the reader do tomorrow morning? 3 steps.]

## 10/10 — CTA
[Follow / save / share. Link to next thread (if any).]

---

## ENGAGEMENT STRATEGY
- **First 30 min:** don't reply to your own thread like a bot; let natural comments come in
- **First hour:** respond to each liker/commenter
- **Within 24h:** quote-tweet with a cover image

## VISUAL NOTE
- Attach one image to the hook (1/10) — 1200x675 recommended
- Don't leave the hook image to chance — it drives thread velocity

## META
- File: ${getDateString()}-thread-${slugify(konu)}.md
- X char limit: 280 per post (Premium: 25K)
- LinkedIn: 3000 chars per post (ample room)
- Best time: X weekdays 09:00-10:00 / LinkedIn weekdays 08:00-09:00
`,

		caseStudy: (konu) => `# Case Study — ${konu}

**Date:** ${getDateString()}
**Client:** [Name or anonymous]
**Industry:** [Industry]
**Duration:** [N months / weeks]
**Project type:** [Product / Service / Consulting]

---

## ONE-LINER
[One-sentence summary of this case study — social-shareable format.]

## HEADLINE RESULT (Large-type stat)
**%[XX]** [improvement / growth / reduction]
**[Y] hours/weeks** [saved]
**$[Z]** [incremental revenue / cost saved]

---

## 1. WHO IS THE CLIENT?
- **Company:** [Name]
- **Size:** [Headcount / revenue]
- **Customer base:** [B2B / B2C / hybrid]
- **What makes them interesting:** [Why does this case matter?]

## 2. PROBLEM (Situation)
**Concrete pain the client was facing:**
[3-5 sentences, not jargony, include the emotional side]

**Things they tried:**
- [Approach 1] — why it didn't work
- [Approach 2] — why it didn't work

**The gap between expectation and reality:**
[This makes a great visual]

## 3. SOLUTION (Task)
**Our approach:**
[Specific, ready for customer conversation]

**List of work performed:**
1. [Phase 1]
2. [Phase 2]
3. [Phase 3]
4. [Phase 4]

**Critical decision point:**
[Somewhere you made a hard call — what was it, why?]

## 4. RESULTS (Measurable Impact)
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| [Metric 1] | [X] | [Y] | **%[Z]** |
| [Metric 2] | [X] | [Y] | **%[Z]** |
| [Metric 3] | [X] | [Y] | **%[Z]** |

## 5. CUSTOMER QUOTE (Testimonial)
> "[Real quote — 2-4 sentences. Customer name + role.]"
>
> — **[Name], [Role], [Company]**

## 6. LESSONS LEARNED
- **For us:** [What did we learn?]
- **For the industry:** [Generalizable finding]
- **Repeatable system:** [How do you apply this to other customers?]

---

## DISTRIBUTION STRATEGY
- **Long form:** PDF (5-8 pages) — for sales team
- **Blog post:** 1500-2500 words — SEO-focused
- **LinkedIn post:** Lead result + testimonial
- **Video:** 90 seconds — short and narrative
- **Email:** Targeted outreach to similar ICP

## META
- File: ${getDateString()}-casestudy-${slugify(konu)}.md
- Sensitive info review: [done / pending]
- Customer approval: [received / pending]
- Image usage rights: [yes / no]
`,
	};
}
