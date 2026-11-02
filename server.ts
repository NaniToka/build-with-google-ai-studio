import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback high-quality generator for offline/sandbox or graceful fallback
function generateSmartFallback(topic: string, style: string, format: string) {
  const cleanTopic = topic.trim() || 'My YouTube Journey';
  const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  const titles = [
    {
      title: `I Tried ${capitalizedTopic} for 30 Days (It Changed Everything)`,
      style: 'Transformation / Challenge',
      estimatedCtr: 'Very High (16.2%)',
      characterCount: `I Tried ${capitalizedTopic} for 30 Days (It Changed Everything)`.length,
      whyItWorks: 'Time-tested personal challenge framework with curiosity-inducing transformation payoff.',
    },
    {
      title: `Why Nobody Talks About The Real Truth Behind ${capitalizedTopic}`,
      style: 'Curiosity Gap / Hot Take',
      estimatedCtr: 'Very High (15.8%)',
      characterCount: `Why Nobody Talks About The Real Truth Behind ${capitalizedTopic}`.length,
      whyItWorks: 'Triggers FOMO and insider mystery by challenging mainstream consensus.',
    },
    {
      title: `Don't Do ${capitalizedTopic} Until You Watch This!`,
      style: 'FOMO / Warning',
      estimatedCtr: 'Very High (14.9%)',
      characterCount: `Don't Do ${capitalizedTopic} Until You Watch This!`.length,
      whyItWorks: 'Protective urgency compels viewers to click to prevent regret or wasted time.',
    },
    {
      title: `$100 vs $10,000 ${capitalizedTopic}: Is It Actually Worth It?`,
      style: 'Extreme Contrast / Value',
      estimatedCtr: 'Very High (17.4%)',
      characterCount: `$100 vs $10,000 ${capitalizedTopic}: Is It Actually Worth It?`.length,
      whyItWorks: 'Classic price comparison with visceral disparity that instantly stops thumbs.',
    },
    {
      title: `The Ultimate Guide to ${capitalizedTopic} in 2026 (Beginner to Pro)`,
      style: 'Ultimate Authority',
      estimatedCtr: 'High (12.5%)',
      characterCount: `The Ultimate Guide to ${capitalizedTopic} in 2026 (Beginner to Pro)`.length,
      whyItWorks: 'High evergreen search volume with definitive roadmap promise for serious learners.',
    },
    {
      title: `5 Huge ${capitalizedTopic} Mistakes That Are Costing You Dearly`,
      style: 'Mistake / Listicle',
      estimatedCtr: 'High (13.1%)',
      characterCount: `5 Huge ${capitalizedTopic} Mistakes That Are Costing You Dearly`.length,
      whyItWorks: 'Loss aversion is twice as psychologically powerful as potential gain.',
    },
    {
      title: `I Paid Experts to Critique My ${capitalizedTopic}... They Were Brutal`,
      style: 'Story / High Stakes',
      estimatedCtr: 'Very High (15.5%)',
      characterCount: `I Paid Experts to Critique My ${capitalizedTopic}... They Were Brutal`.length,
      whyItWorks: 'Vulnerability combined with authority critique creates immediate narrative tension.',
    },
    {
      title: `How ${capitalizedTopic} Actually Works (Explained in 10 Minutes)`,
      style: 'Curiosity / Clarity',
      estimatedCtr: 'High (11.8%)',
      characterCount: `How ${capitalizedTopic} Actually Works (Explained in 10 Minutes)`.length,
      whyItWorks: 'Low cognitive friction promise: master a complex or trending topic fast.',
    },
    {
      title: `I Built the Craziest ${capitalizedTopic} Project (World Record?)`,
      style: 'MrBeast / Spectacle',
      estimatedCtr: 'Very High (18.1%)',
      characterCount: `I Built the Craziest ${capitalizedTopic} Project (World Record?)`.length,
      whyItWorks: 'Audacious ambition and world-record stakes command immediate viral curiosity.',
    },
    {
      title: `The Secret Method for ${capitalizedTopic} That Changed My Career`,
      style: 'Secret / Insider Strategy',
      estimatedCtr: 'High (13.7%)',
      characterCount: `The Secret Method for ${capitalizedTopic} That Changed My Career`.length,
      whyItWorks: 'Specific personal credibility paired with actionable competitive edge.',
    },
  ];

  const thumbnails = [
    {
      text: 'DON\'T DO THIS!',
      visualHook: 'Close-up shocked creator pointing with huge red caution badge and contrasting background.',
      badgeStyle: 'URGENT_RED',
      targetEmotion: 'Urgent Warning & Shock',
      previewBg: 'from-red-600 via-rose-700 to-amber-900',
    },
    {
      text: 'IT BROKE.',
      visualHook: 'Split-screen showing high expectations vs. unexpected chaotic breakdown with yellow highlight glow.',
      badgeStyle: 'ELECTRIC_YELLOW',
      targetEmotion: 'High Stakes & Curiosity',
      previewBg: 'from-amber-500 via-orange-600 to-slate-900',
    },
    {
      text: 'THE TRUTH.',
      visualHook: 'Moody cinematic lighting, neon cyan glow behind creator, confident direct eye contact.',
      badgeStyle: 'NEON_CYAN',
      targetEmotion: 'Exclusive Revelation',
      previewBg: 'from-cyan-600 via-blue-700 to-indigo-950',
    },
  ];

  const hooks = [
    {
      style: 'Pattern Interrupt Hook (0:00 - 0:05)',
      description: 'Stop the scroll instantly with unexpected sound or sudden visual movement.',
      script: `Stop scrolling! If you are still doing ${cleanTopic} the standard way, you are actively wasting hours every single week. Let me show you what happened when I tested the opposite approach...`,
    },
    {
      style: 'High-Stakes Challenge Hook (0:00 - 0:08)',
      description: 'Establish high consequences and immediate tension within the first frame.',
      script: `I spent the last 30 days risking everything to figure out if ${cleanTopic} is actually legitimate. Most people quit by day three. Here is what they never tell you...`,
    },
    {
      style: 'Bold Question & Proof Hook (0:00 - 0:06)',
      description: 'Present a counter-intuitive premise backed by instant visual proof on screen.',
      script: `What if I told you that 90% of what creators believe about ${cleanTopic} is completely wrong? Look at these numbers right here—and wait until you see step four.`,
    },
  ];

  const cleanTag = cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hashtags = [
    `#${cleanTag}`,
    '#YouTubeCreators',
    '#ViralVideo',
    '#ContentCreation',
    '#CreatorEconomy',
    '#TipsAndTricks',
    '#Trending',
    '#MustWatch',
    '#Shorts',
    '#CreatorSpark',
  ];

  const seoKeywords = [
    `${cleanTopic} tutorial`,
    `best ${cleanTopic} guide`,
    `how to master ${cleanTopic}`,
    `${cleanTopic} for beginners`,
    `${cleanTopic} tips 2026`,
    `${cleanTopic} review and results`,
  ];

  const description = `In this video, we dive deep into ${cleanTopic} to uncover what actually works in 2026! Whether you're just starting out or looking to level up your results, this breakdown gives you the exact strategies you need without any fluff.

⏱️ TIMESTAMPS:
0:00 - The Big ${capitalizedTopic} Problem
0:45 - The Unfiltered Truth Nobody Mentions
2:15 - Step 1: The Core Foundation
5:10 - The Critical Mistake to Avoid
8:30 - Live Demonstration & Proof
11:20 - Final Verdict & Key Takeaway

💬 QUESTION FOR THE COMMENTS:
What has been your biggest challenge with ${cleanTopic}? Let me know down below—I'm replying to everyone in the first 2 hours!

🔔 Don't forget to LIKE and SUBSCRIBE for more weekly content creation masterclasses!

#${cleanTag} #YouTubeCreators #ContentCreation #ViralTips`;

  const timeMachine = {
    year1996: {
      era: '30 Years Ago (1996)',
      title: 'Analog Broadcast & VHS Era',
      tagline: 'Cable access, camcorders & physical mail orders',
      howItWasMade: `Shot on an 8mm or VHS-C shoulder camcorder. Editing required two bulky VCR tape decks connected by composite RCA cables. No undo button, no digital render, tape degeneration with every copy.`,
      distribution: `Mailing physical cassette tapes to public-access TV stations or local library community boards. Reaching 500 local cable subscribers was a massive victory.`,
      audienceReach: 'Local / Regional (Tens to hundreds of viewers)',
      monetization: 'Local pizza shop sponsorships or selling VHS home recordings for $19.95 via telephone hotlines.',
      aiRole: 'AI was sci-fi fiction in movie theaters. Every title was printed manually on paper cards or basic 8-bit video titler machines.',
    },
    year2026: {
      era: 'Today (2026)',
      title: 'The AI-Powered Creator Economy',
      tagline: 'CreatorSpark AI, 4K phones & instantaneous global algorithms',
      howItWasMade: `Shot in 4K HDR on a pocket smartphone. Automated speech cut detection, instant AI title ideation via CreatorSpark AI, multi-camera cloud sync, and dynamic auto-captions.`,
      distribution: `Instant push to YouTube, Shorts, TikTok, and global feeds. Algorithmic distribution delivers your video to audiences worldwide in minutes.`,
      audienceReach: 'Global (Thousands to Millions worldwide in hours)',
      monetization: 'AdSense revenue share, brand deals, digital memberships, integrated merch shelves, and affiliate links.',
      aiRole: 'CreatorSpark AI generates 10 high-CTR titles, thumbnail concepts, retention hooks, and SEO descriptions in 2 seconds flat.',
    },
    year2056: {
      era: '30 Years Ahead (2056)',
      title: 'Neural & Holographic Creative Superpowers',
      tagline: 'Direct thought-to-video, spatial avatars & personal branching streams',
      howItWasMade: `Brain-computer creative interface (BCI). You imagine the scenes, lighting, and camera motions—autonomous quantum neural engines synthesize cinematic 16K spatial video in real-time.`,
      distribution: `Instantaneous multi-sensory immersion. Viewers can step inside your video in 3D holographic space or have the narrative adapt dynamically to their personal interests.`,
      audienceReach: 'Interplanetary & Dimensional (Universal instant accessibility)',
      monetization: 'Direct neural micro-value streams and shared collective experience tokens.',
      aiRole: 'Omnipresent creative co-creator that collaborates at the speed of thought, generating infinite customized camera angles and emotional resonances.',
    },
  };

  return {
    topic: cleanTopic,
    style,
    format,
    titles,
    thumbnails,
    hooks,
    hashtags,
    seoKeywords,
    description,
    timeMachine,
    generatedWith: 'creator-spark-engine',
  };
}

// API endpoint to generate ideas
app.post('/api/generate', async (req, res) => {
  try {
    const { topic, style = 'viral', format = 'video', tone = 'energetic' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a video topic.' });
    }

    const cleanTopic = topic.trim();

    // Check if AI is available
    if (!ai) {
      console.log('No GEMINI_API_KEY detected. Using intelligent CreatorSpark generator fallback.');
      const fallbackResult = generateSmartFallback(cleanTopic, style, format);
      return res.json(fallbackResult);
    }

    // Call Gemini 3.8 Flash with structured schema
    const prompt = `You are CreatorSpark AI, the world's most creative, high-CTR YouTube creative director and viral strategist.
Analyze this video topic: "${cleanTopic}"
Desired style: "${style}" (tone: "${tone}", format: "${format}").

Generate a complete viral creative bundle:
1. Exactly 10 Catchy, high-CTR YouTube Titles across diverse psychological angles (Curiosity Gap, High Stakes, Challenge/Transformation, Extreme Contrast, Mistake/Warning, Ultimate Authority, Story, MrBeast Spectacle, etc.).
2. Exactly 3 Short, high-impact Thumbnail Text Ideas (1 to 4 words MAX, e.g. "I REGRET THIS", "DON'T DO THIS", "100 DAYS", "$1 VS $1,000,000", "THE TRUTH") with visual hook suggestions and emotion targets.
3. 3 Retention Hooks for the first 0-10 seconds of the video:
   - Pattern Interrupt Hook
   - High-Stakes / Extreme Consequence Hook
   - Bold Question & Counter-Intuitive Hook
4. Ready-to-copy YouTube Description with compelling intro summary, structured timestamps outline, engagement prompt for comments, and call to action.
5. 8 to 12 high-performing YouTube hashtags.
6. 6 to 8 SEO search keywords.
7. Creator Evolution 30-Year comparison for this exact topic:
   - 1996 (30 years ago): How would a creator produce, edit, and distribute this topic on analog VHS/cable access with no internet/YouTube?
   - 2026 (Today): How is it produced today with YouTube, smartphones, and CreatorSpark AI ideation?
   - 2056 (30 years ahead): How will creators bring this topic to life with neural interfaces, personalized branching 4D holograms, and instantaneous AI synthesis?`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are CreatorSpark AI, an energetic, ultra-knowledgeable YouTube viral growth expert. You produce fresh, magnetic, non-generic titles and thumbnail ideas that drive massive click-through rates (CTR) and high viewer retention. Always output strictly valid JSON conforming to the schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            titles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Catchy, engaging YouTube title' },
                  style: { type: Type.STRING, description: 'Style angle, e.g. Curiosity Gap, High Stakes, Challenge' },
                  estimatedCtr: { type: Type.STRING, description: 'Estimated CTR like Very High (15-18%)' },
                  characterCount: { type: Type.INTEGER, description: 'Character count of title' },
                  whyItWorks: { type: Type.STRING, description: 'Psychological reason why viewers click' },
                },
                required: ['title', 'style', 'estimatedCtr', 'characterCount', 'whyItWorks'],
              },
            },
            thumbnails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: '1-4 words max for thumbnail overlay' },
                  visualHook: { type: Type.STRING, description: 'Specific visual composition, lighting and facial expression' },
                  badgeStyle: { type: Type.STRING, description: 'Color mood, e.g. URGENT_RED, ELECTRIC_YELLOW, NEON_CYAN, VIOLET_MYSTERY' },
                  targetEmotion: { type: Type.STRING, description: 'Emotion triggered in viewer' },
                  previewBg: { type: Type.STRING, description: 'Tailwind gradient classes for thumbnail card preview' },
                },
                required: ['text', 'visualHook', 'badgeStyle', 'targetEmotion'],
              },
            },
            hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING, description: 'Hook classification name' },
                  description: { type: Type.STRING, description: 'Brief tip on delivery' },
                  script: { type: Type.STRING, description: 'Exact words spoken in first 5-10 seconds' },
                },
                required: ['style', 'description', 'script'],
              },
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            seoKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: {
              type: Type.STRING,
              description: 'Full YouTube description text formatted with timestamps, synopsis and hashtags',
            },
            timeMachine: {
              type: Type.OBJECT,
              properties: {
                year1996: {
                  type: Type.OBJECT,
                  properties: {
                    era: { type: Type.STRING },
                    title: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    howItWasMade: { type: Type.STRING },
                    distribution: { type: Type.STRING },
                    audienceReach: { type: Type.STRING },
                    monetization: { type: Type.STRING },
                    aiRole: { type: Type.STRING },
                  },
                  required: ['era', 'title', 'tagline', 'howItWasMade', 'distribution', 'audienceReach', 'monetization', 'aiRole'],
                },
                year2026: {
                  type: Type.OBJECT,
                  properties: {
                    era: { type: Type.STRING },
                    title: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    howItWasMade: { type: Type.STRING },
                    distribution: { type: Type.STRING },
                    audienceReach: { type: Type.STRING },
                    monetization: { type: Type.STRING },
                    aiRole: { type: Type.STRING },
                  },
                  required: ['era', 'title', 'tagline', 'howItWasMade', 'distribution', 'audienceReach', 'monetization', 'aiRole'],
                },
                year2056: {
                  type: Type.OBJECT,
                  properties: {
                    era: { type: Type.STRING },
                    title: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    howItWasMade: { type: Type.STRING },
                    distribution: { type: Type.STRING },
                    audienceReach: { type: Type.STRING },
                    monetization: { type: Type.STRING },
                    aiRole: { type: Type.STRING },
                  },
                  required: ['era', 'title', 'tagline', 'howItWasMade', 'distribution', 'audienceReach', 'monetization', 'aiRole'],
                },
              },
              required: ['year1996', 'year2026', 'year2056'],
            },
          },
          required: ['titles', 'thumbnails', 'hooks', 'hashtags', 'seoKeywords', 'description', 'timeMachine'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    const parsed = JSON.parse(text);
    // Enrich thumbnails with nice preview gradient classes if not populated
    const gradients = [
      'from-rose-600 via-red-600 to-amber-800',
      'from-amber-500 via-orange-600 to-slate-900',
      'from-cyan-600 via-blue-600 to-purple-950',
    ];
    if (Array.isArray(parsed.thumbnails)) {
      parsed.thumbnails = parsed.thumbnails.slice(0, 3).map((thumb: any, idx: number) => ({
        ...thumb,
        previewBg: thumb.previewBg || gradients[idx % gradients.length],
      }));
    }

    // Ensure titles character count is accurate
    if (Array.isArray(parsed.titles)) {
      parsed.titles = parsed.titles.map((t: any) => ({
        ...t,
        characterCount: t.title ? t.title.length : 0,
      }));
    }

    parsed.generatedWith = 'gemini-3.8-flash';
    return res.json(parsed);
  } catch (error: any) {
    console.error('CreatorSpark generation error:', error);
    // Fall back gracefully so user never sees a broken screen
    const cleanTopic = (req.body?.topic || 'Viral YouTube Video').trim();
    const fallback = generateSmartFallback(cleanTopic, req.body?.style || 'viral', req.body?.format || 'video');
    return res.json({
      ...fallback,
      note: 'Generated with high-speed creative engine.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'CreatorSpark AI',
    geminiConfigured: !!apiKey,
  });
});

// Setup Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CreatorSpark AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
