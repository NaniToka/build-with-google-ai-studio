import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SparkInputHero } from './components/SparkInputHero';
import { TitleCardList } from './components/TitleCardList';
import { ThumbnailStudio } from './components/ThumbnailStudio';
import { BonusCreatorKit } from './components/BonusCreatorKit';
import { CreatorEvolution } from './components/CreatorEvolution';
import { SavedSparksDrawer } from './components/SavedSparksDrawer';
import { GenerationResponse, TitleIdea, SavedTitleItem } from './types';
import { fireCreatorConfetti } from './utils/confetti';
import { Sparkles, Youtube, Flame, AlertCircle, ArrowUp } from 'lucide-react';

const INITIAL_SAMPLE_DATA: GenerationResponse = {
  topic: 'Surviving 100 Hours in Zero Gravity',
  style: 'viral',
  format: 'video',
  titles: [
    {
      title: 'I Survived 100 Hours in Zero Gravity (NASA Was Pissed)',
      style: 'MrBeast Spectacle',
      estimatedCtr: 'Very High (18.4%)',
      characterCount: 54,
      whyItWorks: 'Extreme stakes + authority conflict triggers instant click curiosity.',
    },
    {
      title: 'What Actually Happens to Your Body After 100 Hours in Space',
      style: 'Curiosity Gap / Science',
      estimatedCtr: 'Very High (16.2%)',
      characterCount: 60,
      whyItWorks: 'Biological transformation hook that taps into universal human fascination.',
    },
    {
      title: 'Do NOT Try Zero Gravity Until You Watch This!',
      style: 'Warning / FOMO',
      estimatedCtr: 'Very High (15.5%)',
      characterCount: 47,
      whyItWorks: 'Strong protective warning creates immediate fear of missing essential truth.',
    },
    {
      title: '$0 vs $250,000 Zero Gravity Flight: Is It Worth It?',
      style: 'Price Contrast',
      estimatedCtr: 'Very High (17.1%)',
      characterCount: 50,
      whyItWorks: 'High disparity comparison with clear visual promise and financial curiosity.',
    },
    {
      title: '5 Horrifying Zero Gravity Mistakes Astronauts Never Mention',
      style: 'Secret / Mistake',
      estimatedCtr: 'High (14.3%)',
      characterCount: 58,
      whyItWorks: 'Insider confession format targets loss aversion and taboo knowledge.',
    },
    {
      title: 'I Paid Space Engineers to Build My Own Zero-G Chamber',
      style: 'Crazy Project',
      estimatedCtr: 'Very High (16.8%)',
      characterCount: 53,
      whyItWorks: 'Audacious DIY ambition backed by professional credibility.',
    },
    {
      title: 'Hour 72 in Zero Gravity Almost Ended Me...',
      style: 'Story / High Stakes',
      estimatedCtr: 'Very High (15.9%)',
      characterCount: 44,
      whyItWorks: 'Specific milestone timing creates authentic diary vulnerability and suspense.',
    },
    {
      title: 'The Truth About Zero Gravity Vomiting (Unfiltered)',
      style: 'Contrarian / Chaos',
      estimatedCtr: 'High (13.7%)',
      characterCount: 50,
      whyItWorks: 'Raw unvarnished honesty contrasts with sanitized institutional PR.',
    },
    {
      title: 'How Zero Gravity Actually Feels (Explained in 8 Minutes)',
      style: 'Clarity / Fast Masterclass',
      estimatedCtr: 'High (12.2%)',
      characterCount: 56,
      whyItWorks: 'Low cognitive load promise for casual viewers wanting instant knowledge.',
    },
    {
      title: 'World Record: First YouTuber to Spend 100 Hours Weightless',
      style: 'Achievement / Monumental',
      estimatedCtr: 'Very High (17.6%)',
      characterCount: 58,
      whyItWorks: 'Superlative milestone framing establishes historical significance.',
    },
  ],
  thumbnails: [
    {
      text: 'IT BROKE.',
      visualHook: 'Floating upside down inside a metallic chamber with floating water droplets and panicked eyes.',
      badgeStyle: 'URGENT_RED',
      targetEmotion: 'High Stakes Panic & Shock',
      previewBg: 'from-rose-600 via-red-600 to-amber-900',
    },
    {
      text: 'HOUR 72.',
      visualHook: 'Extreme split screen: Day 1 smiling face vs. Day 3 bloodshot pale face with floating sickness pill.',
      badgeStyle: 'ELECTRIC_YELLOW',
      targetEmotion: 'Brutal Transformation',
      previewBg: 'from-amber-500 via-orange-600 to-slate-900',
    },
    {
      text: 'NASA LIED.',
      visualHook: 'Cinematic deep space backdrop through cockpit window, illuminated by harsh cyan visor reflections.',
      badgeStyle: 'NEON_CYAN',
      targetEmotion: 'Conspiracy & Revelation',
      previewBg: 'from-cyan-600 via-blue-700 to-purple-950',
    },
  ],
  hooks: [
    {
      style: 'Pattern Interrupt Hook (0:00 - 0:05)',
      description: 'Disorient the viewer instantly to shatter cognitive expectation.',
      script: 'Right now, there is zero gravity holding my blood down. In about 30 seconds, my inner ear is going to send a panic signal to my stomach. If I vomit in this helmet, I could literally suffocate. Here is what happened...',
    },
    {
      style: 'High-Stakes Countdown Hook (0:00 - 0:08)',
      description: 'Inject ticking clock anxiety before revealing the premise.',
      script: 'NASA warned us that human organs are not designed for four consecutive days without gravity. By hour 72, every single camera battery froze, and the cabin pressure started dropping...',
    },
    {
      style: 'Bold Question & Proof Hook (0:00 - 0:06)',
      description: 'Contradict Hollywood movie tropes with raw unfiltered reality.',
      script: 'Movies show floating in space like a majestic ballet. They don\'t show you the violent sinus headaches, the disorientation, or what happens when a single drop of water floats into electrical circuits.',
    },
  ],
  hashtags: [
    '#ZeroGravity',
    '#SpaceExperiment',
    '#100Hours',
    '#MrBeastStyle',
    '#ScienceChallenge',
    '#ExtremeSurvival',
    '#YouTubeCreators',
    '#ViralShorts',
    '#AstronautLife',
    '#CreatorSpark',
  ],
  seoKeywords: [
    'zero gravity simulation',
    'what zero gravity feels like',
    'surviving zero gravity',
    '100 hours challenge',
    'space sickness experiment',
    'vomit comet real experience',
  ],
  description: `I locked myself into a zero-gravity simulation chamber for 100 consecutive hours to find out what actually happens to human psychology, physical equilibrium, and daily tasks without weight!

From drinking water to sleeping while floating upside down, this was by far the hardest physical challenge I have ever attempted.

⏱️ TIMESTAMPS:
0:00 - The Warning NASA Gave Us
1:15 - Hour 0: Floating For The First Time
4:30 - The Impossible Task of Eating Food
8:10 - Hour 48: The Sickness Begins
12:45 - Hour 72: Equipment Failure
16:20 - Gravity Returns (The Brutal Aftermath)

💬 QUESTION FOR THE COMMENTS:
Would you spend 100 hours in zero gravity for $100,000? Let me know below—I'm reading and responding to comments!

🔔 Subscribe for more extreme science challenges!

#ZeroGravity #100Hours #SpaceChallenge #CreatorSpark`,
  timeMachine: {
    year1996: {
      era: '30 Years Ago (1996)',
      title: 'Analog Broadcast & VHS Era',
      tagline: 'Camcorders, physical tapes & broadcast gatekeepers',
      howItWasMade: 'To make a zero gravity video in 1996, you had to be an accredited NASA film crew using heavy 16mm or Betacam SP analog tape decks. Independent creators could never afford a zero-G parabolic flight ($50,000+). Editing took weeks of physical tape splicing.',
      distribution: 'Broadcast on Discovery Channel or PBS Nova. You had to pitch television network executives and wait 9 months for an air date.',
      audienceReach: 'Regional broadcast TV audiences scheduled at 8:00 PM on Tuesday night.',
      monetization: 'Production budget grant or selling educational VHS tapes to science classrooms for $39.95.',
      aiRole: 'AI was pure sci-fi. Graphics were rendered on Silicon Graphics workstations that cost $80,000 each.',
    },
    year2026: {
      era: 'Today (2026)',
      title: 'The AI-Powered Creator Playground',
      tagline: 'YouTube, smartphones, CreatorSpark AI & instant global algorithms',
      howItWasMade: 'Shot on pocket 4K cameras and GoPros. CreatorSpark AI ideates 10 viral title angles and thumbnail text in 2 seconds. Automated software detects speech gaps and syncs multi-camera angles in minutes.',
      distribution: 'Uploaded directly to YouTube and Shorts. Distributed globally by recommendation algorithms to millions of fascinated space fans within 48 hours.',
      audienceReach: 'Global: 5M to 50M+ viewers worldwide across every device.',
      monetization: 'YouTube AdSense, high-ticket brand sponsors, digital merchandise, and integrated memberships.',
      aiRole: 'CreatorSpark AI generates viral titles, thumbnail psychology, retention hooks, and descriptions instantaneously.',
    },
    year2056: {
      era: '30 Years Ahead (2056)',
      title: 'Neural Thought-to-Hologram & Living Streams',
      tagline: 'Brain interfaces, spatial holograms & infinite personalized branches',
      howItWasMade: 'Creators plug into neural creative co-processors. You simply imagine floating through weightlessness; generative physics models synthesize full 16K volumetric sensory video in real time.',
      distribution: 'Audiences step directly into the zero-gravity simulation using haptic neural suits, experiencing the disorientation and weightlessness firsthand.',
      audienceReach: 'Interplanetary: Streamed instantly across Earth and Lunar/Martian habitats.',
      monetization: 'Real-time neural micro-donations and shared collaborative story universe tokens.',
      aiRole: 'Autonomous generative physics partner that turns raw thoughts into multi-sensory realities with zero technical friction.',
    },
  },
};

export default function App() {
  const [data, setData] = useState<GenerationResponse>(INITIAL_SAMPLE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedPreviewTitle, setSelectedPreviewTitle] = useState<string>(
    INITIAL_SAMPLE_DATA.titles[0]?.title || ''
  );

  // Saved titles stored in localStorage
  const [savedTitles, setSavedTitles] = useState<SavedTitleItem[]>(() => {
    try {
      const stored = localStorage.getItem('creator_spark_saved_titles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('creator_spark_saved_titles', JSON.stringify(savedTitles));
    } catch (e) {
      console.error('Failed to save titles to localStorage', e);
    }
  }, [savedTitles]);

  const handleGenerate = async (topic: string, style: string, format: string, tone: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, format, tone }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }

      setData(json);
      if (json.titles?.[0]?.title) {
        setSelectedPreviewTitle(json.titles[0].title);
      }

      // Fire celebratory confetti!
      fireCreatorConfetti();

      // Smooth scroll to titles
      setTimeout(() => {
        const titlesEl = document.getElementById('titles-section');
        if (titlesEl) {
          titlesEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Something went wrong while generating ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = (titleItem: TitleIdea) => {
    const isAlreadySaved = savedTitles.some((item) => item.title === titleItem.title);
    if (isAlreadySaved) {
      setSavedTitles((prev) => prev.filter((item) => item.title !== titleItem.title));
    } else {
      const newItem: SavedTitleItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleItem.title,
        topic: data.topic,
        style: titleItem.style,
        estimatedCtr: titleItem.estimatedCtr,
        savedAt: Date.now(),
      };
      setSavedTitles((prev) => [newItem, ...prev]);
    }
  };

  const isTitleSaved = (titleStr: string) => {
    return savedTitles.some((item) => item.title === titleStr);
  };

  const handleSendToThumbnailStudio = (titleText: string) => {
    setSelectedPreviewTitle(titleText);
    const studioEl = document.getElementById('thumbnail-studio');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        savedCount={savedTitles.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'generator') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'titles') {
            document.getElementById('titles-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'thumbnails') {
            document.getElementById('thumbnail-studio')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'evolution') {
            document.getElementById('evolution-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        hasGenerated={!!data}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Alert if any */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold text-rose-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero & Topic Generator Input */}
        <SparkInputHero
          onGenerate={handleGenerate}
          isLoading={isLoading}
          currentTopic={data?.topic || ''}
        />

        {/* 10 Catchy YouTube Titles Section */}
        {data && (
          <TitleCardList
            titles={data.titles}
            topic={data.topic}
            onSaveTitle={handleSaveTitle}
            isTitleSaved={isTitleSaved}
            onSendToThumbnailStudio={handleSendToThumbnailStudio}
          />
        )}

        {/* 3 Thumbnail Text Ideas & Live Mockup Studio */}
        {data && (
          <ThumbnailStudio
            thumbnails={data.thumbnails}
            topic={data.topic}
            selectedPreviewTitle={selectedPreviewTitle}
          />
        )}

        {/* Bonus Ideas: Hooks, Description & SEO */}
        {data && (
          <BonusCreatorKit
            hooks={data.hooks}
            description={data.description}
            hashtags={data.hashtags}
            seoKeywords={data.seoKeywords}
            topic={data.topic}
          />
        )}

        {/* Unique Feature: Creator Evolution (1996 - 2026 - 2056) */}
        <CreatorEvolution
          timeMachineData={data?.timeMachine}
          topic={data?.topic}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xs">
              <Youtube className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-extrabold text-sm text-white">
              CreatorSpark <span className="text-amber-400">AI</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-medium">
              "Your Ideas. Our AI. Viral Possibilities."
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Designed for the Next Generation of Creators</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Saved Sparks Drawer */}
      <SavedSparksDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedTitles={savedTitles}
        onRemoveTitle={(id) => setSavedTitles((prev) => prev.filter((item) => item.id !== id))}
        onClearAll={() => setSavedTitles([])}
      />
    </div>
  );
}
