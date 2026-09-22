/**
 * JARVIS Time & Chronometer Service
 * Provides instant, natural Hindi voice time announcements and rich holographic time cards.
 */

export interface TimeResponse {
  spokenHindi: string;
  displayMarkdown: string;
  time12: string;
  time24: string;
  period: string;
  periodEnglish: string;
  dateHindi: string;
  dayHindi: string;
  timeZone: string;
}

const HINDI_DAYS = [
  'रविवार (Sunday)',
  'सोमवार (Monday)',
  'मंगलवार (Tuesday)',
  'बुधवार (Wednesday)',
  'गुरुवार (Thursday)',
  'शुक्रवार (Friday)',
  'शनिवार (Saturday)',
];

const HINDI_MONTHS = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

export function isTimeQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Normalize common transliterated strings
  const containsWord = (words: string[]) =>
    words.some((w) => lower.includes(w) || query.includes(w));

  const hasTimeKeyword = containsWord([
    'time',
    'samay',
    'baje',
    'ghadi',
    'टाइम',
    'समय',
    'बजे',
    'घड़ी',
    'clock',
  ]);

  if (!hasTimeKeyword) return false;

  // Pattern matches for:
  // "abhi kitna time ho raha hai", "time kya ho raha hai", "kya time hua hai",
  // "kitna time hua", "what time is it", "kya samay hai", "kitne baje hai"
  const timeQueryIndicators = [
    'kitna time',
    'kitna samay',
    'kya time',
    'kya samay',
    'time kya',
    'samay kya',
    'time ho raha',
    'samay ho raha',
    'time hua',
    'samay hua',
    'time batao',
    'samay batao',
    'kitne baje',
    'kitna baje',
    'what time',
    'what is the time',
    'tell me the time',
    'current time',
    'abhi kitna',
    'time please',
    'कितना टाइम',
    'कितना समय',
    'क्या टाइम',
    'क्या समय',
    'टाइम क्या',
    'समय क्या',
    'टाइम हो रहा',
    'समय हो रहा',
    'टाइम हुआ',
    'समय हुआ',
    'टाइम बताओ',
    'समय बताओ',
    'कितने बजे',
    'कितना बजा',
    'समय की जानकारी',
    'अभी का समय',
  ];

  return timeQueryIndicators.some((indicator) => lower.includes(indicator) || query.includes(indicator));
}

export function isDateQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  const dateQueryIndicators = [
    'aaj ki date',
    'aaj kaun si date',
    'aaj kaun si tarikh',
    'aaj kaun si tareekh',
    'aaj kaun sa din',
    'aaj kya din hai',
    'today date',
    'todays date',
    'what is the date',
    'what date is today',
    'current date',
    'आज की तारीख',
    'आज कौन सी तारीख',
    'आज कौन सा दिन',
    'आज क्या तारीख',
    'तारीख बताओ',
    'आज का दिन',
  ];

  return dateQueryIndicators.some((indicator) => lower.includes(indicator) || query.includes(indicator));
}

export function getTimeData(userHonorific: string = 'Mr. Nilesh'): TimeResponse {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Period classification in Hindi
  let period = 'सुबह';
  let periodEnglish = 'Morning';
  if (hours >= 12 && hours < 16) {
    period = 'दोपहर';
    periodEnglish = 'Afternoon';
  } else if (hours >= 16 && hours < 20) {
    period = 'शाम';
    periodEnglish = 'Evening';
  } else if (hours >= 20 || hours < 4) {
    period = 'रात';
    periodEnglish = 'Night';
  }

  // 12-hour calculation
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => String(n).padStart(2, '0');

  const time12 = `${hour12}:${pad(minutes)} ${ampm}`;
  const time24 = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Hindi spoken phrasing for minutes
  let minuteSpoken = '';
  if (minutes === 0) {
    minuteSpoken = `ठीक ${hour12} बज रहे हैं`;
  } else if (minutes === 15) {
    minuteSpoken = `${hour12} बजकर 15 मिनट हो रहे हैं`;
  } else if (minutes === 30) {
    minuteSpoken = `${hour12} बजकर 30 मिनट हो रहे हैं`;
  } else if (minutes === 45) {
    minuteSpoken = `${hour12} बजकर 45 मिनट हो रहे हैं`;
  } else {
    minuteSpoken = `${hour12} बजकर ${minutes} मिनट हो रहे हैं`;
  }

  const dayHindi = HINDI_DAYS[now.getDay()];
  const monthHindi = HINDI_MONTHS[now.getMonth()];
  const dateHindi = `${now.getDate()} ${monthHindi} ${now.getFullYear()}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'IST (Asia/Kolkata)';

  // Exact polite spoken answer
  const spokenHindi = `जी ${userHonorific}, अभी ${period} के ${minuteSpoken}।`;

  const displayMarkdown = `⏱️ **वर्तमान समय (CURRENT SYSTEM TIME)**

# **${time12}**

- **हिंदी समय**: ${period} के ${minuteSpoken}
- **दिनांक**: ${dateHindi} (${dayHindi})
- **24-घंटे क्लॉक**: \`${time24}\`
- **टाइमज़ोन**: \`${timeZone}\`

*जार्विस सिस्टम क्लॉक आपके डिवाइस के साथ 100% सटीकता से सिंक्रोनाइज़्ड है।*`;

  return {
    spokenHindi,
    displayMarkdown,
    time12,
    time24,
    period,
    periodEnglish,
    dateHindi,
    dayHindi,
    timeZone,
  };
}
