// Idempotent seed: pre-populates every ContentEntry with the copy that is
// ALREADY live on the site today, with draftJson === publishedJson. This
// means day one, the CMS and the static fallback match exactly — hydrating
// a page is a visual no-op until someone actually edits and publishes.
//
// Known v1 limitation: HERO.sub and each PROJECT/HOBBY .title contain inline
// styling in the original markup (a <b> phrase in the hero bio, a <span
// class="dim"> tail in every title) that plain-text hydration can't preserve.
// Titles are captured here but intentionally not hydrated by cms-hydrate.js
// (see cms-hydrate.js comments). If the hero bio is edited and republished,
// the "6+ years..." phrase will lose its bold styling — a cosmetic tradeoff,
// documented for whoever edits this next.
require('dotenv').config();
const prisma = require('./db');
const { hashPassword } = require('./lib/passwords');
const config = require('./config');

const entries = [
  {
    type: 'HERO',
    slug: 'hero',
    draftJson: {
      tag: 'YASH GOHEL · CREATIVE STRATEGIST & FULL-FUNNEL MARKETER.',
      sub: 'Creative strategy, brand and growth, connected from the first idea to the final conversion. I sit at the intersection of brand, creative, growth and execution: business problem, strategy, idea, creative, production, acquisition, conversion, retention, measurement. 6+ years across healthtech, fintech and DTC. Currently building GoodFlip at Zydus Wellness.',
    },
  },
  {
    type: 'PROJECT',
    slug: 'goodflip',
    draftJson: {
      eyebrow: 'Flagship · TatvaCare / Zydus Wellness',
      title: 'GoodFlip: built from zero.',
      lead: 'Turning a complex healthcare proposition into a consumer brand. GoodFlip wasn’t simply selling supplements or health programmes: it had to make doctors, diagnostics, devices, coaching and nutrition understandable enough for consumers to act on. I architected and launched the entire DTC commerce ecosystem, Shopify, Amazon and Flipkart, plus the content, creative and conversion behind it.',
      galleryImageIds: [],
    },
  },
  {
    type: 'PROJECT',
    slug: 'marketing-skill',
    draftJson: {
      eyebrow: 'Open-source skill · built with Claude',
      title: 'Ladder & Leap.',
      lead: 'An end-to-end Claude Skill for brand managers: positioning theory, brief discipline, and copywriting craft drawn from decades of award-winning advertising, packaged as something you can actually run a real brand task through, not a thin wrapper around ‘write me some marketing copy.’',
      galleryImageIds: [],
    },
  },
  {
    type: 'PROJECT',
    slug: 'playlist-sync',
    draftJson: {
      eyebrow: 'Personal tool · built with Claude',
      title: 'Playlist Sync.',
      lead: 'I had roughly five thousand songs spread across sixty-seven YouTube Music playlists, and Spotify is where I actually listen. Rather than export them by hand once, I built a tool that keeps both sides in sync on its own, every twelve hours, for good.',
      galleryImageIds: [],
    },
  },
  {
    type: 'PROJECT',
    slug: 'quicko',
    draftJson: {
      eyebrow: 'Content brand',
      title: 'Quicko: from zero to an audience.',
      lead: 'Turning zero subscribers into an engaged audience of fifty thousand. Launched and grew Quicko’s Bytes newsletter and blog from the very first send: content, editorial design, UI/UX, illustration and motion, end to end.',
      galleryImageIds: [],
    },
  },
  {
    type: 'PROJECT',
    slug: 'streak',
    draftJson: {
      eyebrow: 'Fintech, archived',
      title: 'Streak AI Technologies.',
      lead: 'Making a fintech product feel human. Wrote an entire trading-education Help Centre from scratch, and authored the full in-product UX copy for a fintech platform used by lakhs of retail traders.',
      galleryImageIds: [],
    },
  },
  {
    type: 'PROJECT',
    slug: 'tools',
    draftJson: {
      eyebrow: 'A capability, not an identity',
      title: 'Strategy first. Systems second. AI where it actually helps.',
      lead: 'A strong marketer who happens to be exceptionally good at using AI, not the other way round. I use it to compress the repetitive parts of marketing, research, segmentation, ideation, production and analysis, so more time goes into the parts that require judgement. The proof isn’t a logo wall. It’s the tool below, calling Claude live: type into it.',
      galleryImageIds: [],
    },
  },
  {
    type: 'HOBBY',
    slug: 'art',
    draftJson: {
      eyebrow: '@wai.geee',
      title: 'Art & Illustration.',
      lead: 'Art, food, and music. Usually after midnight. It shows range, and makes me memorable. Press and hold the scene below.',
      galleryImageIds: [],
    },
  },
  {
    type: 'HOBBY',
    slug: 'cooking',
    draftJson: {
      eyebrow: '@wai.geee',
      title: 'Cooking.',
      lead: 'I make cooking videos. Usually after midnight, usually improvised.',
      galleryImageIds: [],
    },
  },
  {
    type: 'HOBBY',
    slug: 'playlists',
    draftJson: {
      eyebrow: '@wai.geee',
      title: 'Playlists.',
      lead: 'I curate them.',
      galleryImageIds: [],
    },
  },
];

async function main() {
  for (const entry of entries) {
    await prisma.contentEntry.upsert({
      where: { type_slug: { type: entry.type, slug: entry.slug } },
      update: {}, // never overwrite existing data on re-run — seed is first-run-only for content
      create: {
        type: entry.type,
        slug: entry.slug,
        draftJson: entry.draftJson,
        publishedJson: entry.draftJson,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${entries.length} content entries.`);

  if (config.adminSeedEmail && config.adminSeedPassword) {
    const existing = await prisma.adminUser.findUnique({ where: { email: config.adminSeedEmail } });
    if (!existing) {
      const passwordHash = await hashPassword(config.adminSeedPassword);
      await prisma.adminUser.create({ data: { email: config.adminSeedEmail, passwordHash } });
      console.log(`Created admin user ${config.adminSeedEmail}. Log in once, then change the password immediately.`);
    } else {
      console.log(`Admin user ${config.adminSeedEmail} already exists, skipping.`);
    }
  } else {
    console.log('ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set — no admin user created.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
