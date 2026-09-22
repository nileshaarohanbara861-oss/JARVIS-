/**
 * JARVIS Desktop App Launcher Service
 * Recognizes and launches web apps, desktop shortcuts, and search queries
 * triggered via voice or text in Hindi and English.
 */

export interface AppDefinition {
  id: string;
  name: string;
  hindiName: string;
  defaultUrl: string;
  searchUrlTemplate?: (query: string) => string;
  keywords: string[];
  category: 'media' | 'social' | 'tools' | 'productivity' | 'shopping';
  iconColor: string;
}

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    hindiName: 'यूट्यूब',
    defaultUrl: 'https://www.youtube.com',
    searchUrlTemplate: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    keywords: ['youtube', 'यूट्यूब', 'युटुब', 'yt', 'you tube'],
    category: 'media',
    iconColor: '#ef4444',
  },
  {
    id: 'playstore',
    name: 'Google Play Store',
    hindiName: 'गूगल प्ले स्टोर',
    defaultUrl: 'https://play.google.com/store',
    searchUrlTemplate: (q) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`,
    keywords: ['playstore', 'play store', 'प्लेस्टोर', 'प्ले स्टोर', 'google play', 'गूगल प्ले'],
    category: 'tools',
    iconColor: '#10b981',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    hindiName: 'व्हाट्सएप',
    defaultUrl: 'https://web.whatsapp.com',
    keywords: ['whatsapp', 'व्हाट्सएप', 'व्हाट्सऐप', 'वाट्सएप', 'wa'],
    category: 'social',
    iconColor: '#22c55e',
  },
  {
    id: 'google',
    name: 'Google',
    hindiName: 'गूगल सर्च',
    defaultUrl: 'https://www.google.com',
    searchUrlTemplate: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    keywords: ['google', 'गूगल', 'search'],
    category: 'tools',
    iconColor: '#3b82f6',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    hindiName: 'जीमेल',
    defaultUrl: 'https://mail.google.com',
    keywords: ['gmail', 'जीमेल', 'email', 'ईमेल', 'mail'],
    category: 'productivity',
    iconColor: '#ea4335',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    hindiName: 'गूगल मैप्स',
    defaultUrl: 'https://maps.google.com',
    searchUrlTemplate: (q) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}`,
    keywords: ['maps', 'google maps', 'मैप्स', 'गूगल मैप', 'नक्शा'],
    category: 'tools',
    iconColor: '#34a853',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    hindiName: 'स्पॉटिफ़ाई',
    defaultUrl: 'https://open.spotify.com',
    searchUrlTemplate: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    keywords: ['spotify', 'स्पॉटिफ़ाई', 'स्पॉटीफाई', 'music', 'गाने'],
    category: 'media',
    iconColor: '#1ed760',
  },
  {
    id: 'github',
    name: 'GitHub',
    hindiName: 'गिटहब',
    defaultUrl: 'https://github.com',
    searchUrlTemplate: (q) => `https://github.com/search?q=${encodeURIComponent(q)}`,
    keywords: ['github', 'गिटहब', 'git hub'],
    category: 'productivity',
    iconColor: '#f1f5f9',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    hindiName: 'नेटफ्लिक्स',
    defaultUrl: 'https://www.netflix.com',
    keywords: ['netflix', 'नेटफ्लिक्स'],
    category: 'media',
    iconColor: '#e50914',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    hindiName: 'चैटजीपीटी',
    defaultUrl: 'https://chatgpt.com',
    keywords: ['chatgpt', 'chat gpt', 'चैटजीपीटी', 'openai', 'ओपनएआई'],
    category: 'productivity',
    iconColor: '#10a37f',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    hindiName: 'इंस्टाग्राम',
    defaultUrl: 'https://www.instagram.com',
    keywords: ['instagram', 'insta', 'इंस्टाग्राम', 'इंस्टा'],
    category: 'social',
    iconColor: '#e1306c',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    hindiName: 'ट्विटर (एक्स)',
    defaultUrl: 'https://x.com',
    keywords: ['twitter', 'ट्विटर', 'x.com', 'x app'],
    category: 'social',
    iconColor: '#38bdf8',
  },
  {
    id: 'telegram',
    name: 'Telegram Web',
    hindiName: 'टेलीग्राम',
    defaultUrl: 'https://web.telegram.org',
    keywords: ['telegram', 'टेलीग्राम'],
    category: 'social',
    iconColor: '#229ed9',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    hindiName: 'अमेज़न',
    defaultUrl: 'https://www.amazon.in',
    searchUrlTemplate: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    keywords: ['amazon', 'अमेज़न', 'अमेजन'],
    category: 'shopping',
    iconColor: '#ff9900',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    hindiName: 'कैलकुलेटर',
    defaultUrl: 'https://www.google.com/search?q=calculator',
    keywords: ['calculator', 'कैलकुलेटर', 'calc'],
    category: 'tools',
    iconColor: '#06b6d4',
  },
];

export interface AppLaunchResult {
  app: AppDefinition;
  url: string;
  query?: string;
  isSearch: boolean;
  spokenHindi: string;
  displayMarkdown: string;
}

/**
 * Parses user input to detect if it is an app launch or search command.
 * Supports:
 * - "open youtube" / "launch youtube"
 * - "यूट्यूब खोलो" / "यूट्यूब चालू करो" / "यूट्यूब ओपन करो"
 * - "play store खोलो" / "open playstore"
 * - "whatsapp खोलो" / "open whatsapp"
 * - "यूट्यूब पर [सर्च] चलाओ"
 * - "search [सर्च] on youtube"
 */
export function parseAppCommand(rawText: string, userHonorific: string = 'सर'): AppLaunchResult | null {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Pattern 1: YouTube Search (e.g. "यूट्यूब पर गाने चलाओ" or "search songs on youtube")
  const ytSearchMatch =
    text.match(/यूट्यूब\s*पर\s*(.+?)(?:चलाओ|सर्च\s*करो|ढूंढो|दिखाओ|खोजो)/i) ||
    lower.match(/search\s*(.+?)\s*on\s*youtube/i) ||
    lower.match(/play\s*(.+?)\s*on\s*youtube/i);

  if (ytSearchMatch && ytSearchMatch[1]) {
    const query = ytSearchMatch[1].trim();
    const ytApp = APP_REGISTRY.find((a) => a.id === 'youtube')!;
    const url = ytApp.searchUrlTemplate!(query);
    return {
      app: ytApp,
      url,
      query,
      isSearch: true,
      spokenHindi: `जी ${userHonorific}, यूट्यूब पर "${query}" खोजा जा रहा है।`,
      displayMarkdown: `🎬 **यूट्यूब खोज (YouTube Search)**: "${query}"\n\nजार्विस आपके लिए यूट्यूब परिणाम खोल रहा है।`,
    };
  }

  // Pattern 2: Google Search (e.g. "गूगल पर भारत का इतिहास सर्च करो" or "search history on google")
  const googleSearchMatch =
    text.match(/गूगल\s*पर\s*(.+?)(?:सर्च\s*करो|ढूंढो|खोजो|दिखाओ)/i) ||
    lower.match(/search\s*(.+?)\s*on\s*google/i);

  if (googleSearchMatch && googleSearchMatch[1]) {
    const query = googleSearchMatch[1].trim();
    const gApp = APP_REGISTRY.find((a) => a.id === 'google')!;
    const url = gApp.searchUrlTemplate!(query);
    return {
      app: gApp,
      url,
      query,
      isSearch: true,
      spokenHindi: `जी ${userHonorific}, गूगल पर "${query}" खोजा जा रहा है।`,
      displayMarkdown: `🔍 **गूगल खोज (Google Search)**: "${query}"\n\nजार्विस आपके लिए खोज परिणाम खोल रहा है।`,
    };
  }

  // Pattern 3: Standard Open / Launch command
  // Check if phrase indicates opening an app
  const isOpenCommand =
    lower.startsWith('open ') ||
    lower.startsWith('launch ') ||
    lower.startsWith('start ') ||
    text.endsWith('खोलो') ||
    text.endsWith('खोल दो') ||
    text.endsWith('चालू करो') ||
    text.endsWith('ओपन करो') ||
    text.includes('खोलो') ||
    text.includes('खोलिए');

  for (const app of APP_REGISTRY) {
    for (const kw of app.keywords) {
      const kwLower = kw.toLowerCase();

      // Check if keyword is in the command
      const matchesOpen =
        (isOpenCommand && (lower.includes(kwLower) || text.includes(kw))) ||
        lower === `open ${kwLower}` ||
        lower === kwLower ||
        text === `${kw} खोलो` ||
        text === `${kw} ओपन करो`;

      if (matchesOpen) {
        return {
          app,
          url: app.defaultUrl,
          isSearch: false,
          spokenHindi: `जी ${userHonorific}, ${app.hindiName} खोला जा रहा है।`,
          displayMarkdown: `🚀 **एप्लिकेशन लॉन्च**: ${app.name} (${app.hindiName})\n\nजार्विस आपके डेस्कटॉप पर ${app.name} प्रारंभ कर रहा है।`,
        };
      }
    }
  }

  // Generic fallback if user says "open [any website or word]" (e.g. "open wikipedia", "open cricbuzz")
  const genericOpenMatch =
    lower.match(/^(?:open|launch)\s+([a-z0-9\-]+)(?:\.com|\.org|\.in)?$/i) ||
    text.match(/^([a-z0-9\-]+)\s*(?:खोलो|ओपन करो)$/i);

  if (genericOpenMatch && genericOpenMatch[1]) {
    const target = genericOpenMatch[1].trim();
    const targetUrl = target.includes('.') ? `https://${target}` : `https://www.google.com/search?q=${encodeURIComponent(target)}`;
    const genericApp: AppDefinition = {
      id: target,
      name: target.toUpperCase(),
      hindiName: target,
      defaultUrl: targetUrl,
      keywords: [target],
      category: 'tools',
      iconColor: '#06b6d4',
    };
    return {
      app: genericApp,
      url: targetUrl,
      isSearch: false,
      spokenHindi: `जी ${userHonorific}, ${target} खोला जा रहा है।`,
      displayMarkdown: `🌐 **वेब लॉन्च**: ${target}\n\nजार्विस लिंक खोल रहा है: [${targetUrl}](${targetUrl})`,
    };
  }

  return null;
}

/**
 * Safely executes window.open with proper attributes
 */
export function launchUrl(url: string): boolean {
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      return false; // Popup blocked by iframe or browser
    }
    return true;
  } catch (e) {
    console.warn('Direct popup open failed, providing UI link fallback:', e);
    return false;
  }
}
