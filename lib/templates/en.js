import { slugify, getDateString } from "../icerik-helpers.js";

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
- **File:** ${getDateString()}-${slugify(topic)}-en.md
- **Brand Voice:** Check .claude/workspace/marka-sesi-en.md
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
- **File:** ${getDateString()}-karousel-${slugify(topic)}-en.md
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
- **File:** ${getDateString()}-${slugify(topic)}-en.md
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
- **File:** ${getDateString()}-${slugify(topic)}-brief-en.md
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
- **File:** ${getDateString()}-takvim-${slugify(period)}-en.md
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
- **File:** marka-sesi-en.md
- **Next review:** Quarterly or after major brand changes
`,
	};
}
