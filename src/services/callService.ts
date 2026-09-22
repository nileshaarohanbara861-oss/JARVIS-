import { ContactItem } from '../types';

export const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: 'contact-papa',
    name: 'Papa (Father)',
    hindiLabel: 'पापा (पिताजी)',
    relationship: 'father',
    phoneNumber: '+919876543210',
    avatarColor: '#3b82f6', // blue
    isSpeedDial: true,
  },
  {
    id: 'contact-mumma',
    name: 'Mumma (Mother)',
    hindiLabel: 'मम्मी (माताजी)',
    relationship: 'mother',
    phoneNumber: '+919876543211',
    avatarColor: '#ec4899', // pink
    isSpeedDial: true,
  },
  {
    id: 'contact-emergency',
    name: 'National Emergency',
    hindiLabel: 'राष्ट्रीय आपातकालीन सेवा (112)',
    relationship: 'emergency',
    phoneNumber: '112',
    avatarColor: '#ef4444', // red
    isSpeedDial: true,
  },
  {
    id: 'contact-ambulance',
    name: 'Ambulance Emergency',
    hindiLabel: 'एम्बुलेंस सेवा (108)',
    relationship: 'emergency',
    phoneNumber: '108',
    avatarColor: '#f97316', // orange
    isSpeedDial: false,
  },
];

export interface CallParseResult {
  isCallCommand: boolean;
  isOpenDialerOnly?: boolean;
  contact: ContactItem;
  phoneNumber: string;
  spokenHindi: string;
  displayMarkdown: string;
  directDialUrl: string;
  whatsAppUrl: string;
}

/**
 * Parses user input to detect if it's a request to call Mumma, Papa, a specific contact, or dial a number.
 */
export function parseCallCommand(
  rawText: string,
  contacts: ContactItem[],
  userHonorific: string = 'Mr. Nilesh'
): CallParseResult | null {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Check if user just wants to open the dialer / call app
  const isDialerOpen =
    lower === 'open call app' ||
    lower === 'open dialer' ||
    lower === 'open phone' ||
    lower === 'open phone app' ||
    text === 'कॉल ऐप खोलो' ||
    text === 'डायलर खोलो' ||
    text === 'फोन ऐप खोलो' ||
    lower.includes('call app kholo') ||
    lower.includes('phone dialer kholo');

  if (isDialerOpen) {
    const defaultContact = contacts.find((c) => c.relationship === 'father') || contacts[0];
    return {
      isCallCommand: true,
      isOpenDialerOnly: true,
      contact: defaultContact,
      phoneNumber: defaultContact.phoneNumber,
      spokenHindi: `जी ${userHonorific}, फोन कॉलिंग ऐप और स्पीड डायल खोला जा रहा है।`,
      displayMarkdown: `📞 **फोन कॉलिंग ऐप व स्पीड डायल**\n\nजार्विस ने आपका कॉलिंग इंटरफ़ेस खोल दिया है।`,
      directDialUrl: `tel:${defaultContact.phoneNumber}`,
      whatsAppUrl: `https://wa.me/${defaultContact.phoneNumber.replace(/[^0-9]/g, '')}`,
    };
  }

  // Check if it's a call command
  const hasCallKeyword =
    lower.includes('call karo') ||
    lower.includes('call kar do') ||
    lower.includes('call lagao') ||
    lower.includes('call laga do') ||
    lower.includes('phone karo') ||
    lower.includes('phone lagao') ||
    lower.includes('ko call') ||
    lower.startsWith('call ') ||
    text.includes('कॉल करो') ||
    text.includes('कॉल कर दो') ||
    text.includes('कॉल लगाओ') ||
    text.includes('फोन करो') ||
    text.includes('फोन लगाओ') ||
    text.includes('को कॉल');

  if (!hasCallKeyword) return null;

  // 2. Check for Mother & Father matches
  const isMumma =
    lower.includes('mumma') ||
    lower.includes('mummy') ||
    lower.includes('mom') ||
    lower.includes('mother') ||
    lower.includes('maa') ||
    text.includes('मम्मी') ||
    text.includes('मम्मा') ||
    text.includes('माँ') ||
    text.includes('माताजी');

  const isPapa =
    lower.includes('papa') ||
    lower.includes('father') ||
    lower.includes('dad') ||
    lower.includes('daddy') ||
    lower.includes('pitaji') ||
    text.includes('पापा') ||
    text.includes('पिताजी') ||
    text.includes('पिता');

  // 2a. Both Mumma and Papa mentioned (e.g., "mumma, papa ko call karo" or "mumma papa ko call karo")
  if (isMumma && isPapa) {
    const mumma = contacts.find((c) => c.relationship === 'mother') || {
      id: 'contact-mumma',
      name: 'Mumma (Mother)',
      hindiLabel: 'मम्मी (माताजी)',
      relationship: 'mother',
      phoneNumber: '+919876543211',
      avatarColor: '#ec4899',
    };
    const papa = contacts.find((c) => c.relationship === 'father') || {
      id: 'contact-papa',
      name: 'Papa (Father)',
      hindiLabel: 'पापा (पिताजी)',
      relationship: 'father',
      phoneNumber: '+919876543210',
      avatarColor: '#3b82f6',
    };

    // Determine who was mentioned first
    const mummaIdx = Math.min(
      lower.indexOf('mumma') !== -1 ? lower.indexOf('mumma') : 9999,
      text.indexOf('मम्मी') !== -1 ? text.indexOf('मम्मी') : 9999
    );
    const papaIdx = Math.min(
      lower.indexOf('papa') !== -1 ? lower.indexOf('papa') : 9999,
      text.indexOf('पापा') !== -1 ? text.indexOf('पापा') : 9999
    );

    const primaryContact = papaIdx < mummaIdx ? papa : mumma;
    const secondaryContact = primaryContact === papa ? mumma : papa;
    const cleanNumber = primaryContact.phoneNumber.replace(/[^0-9]/g, '');

    return {
      isCallCommand: true,
      contact: primaryContact,
      phoneNumber: primaryContact.phoneNumber,
      spokenHindi: `जी ${userHonorific}, ${primaryContact.hindiLabel} को कॉल लगाया जा रहा है और कॉलिंग ऐप खोला जा रहा है। ${secondaryContact.hindiLabel} का नंबर भी स्क्रीन पर उपलब्ध है।`,
      displayMarkdown: `📞 **आउटगोइंग कॉल**: ${primaryContact.name} (${primaryContact.hindiLabel})\n\n- **कॉलिंग नंबर**: \`${primaryContact.phoneNumber}\`\n- **वैकल्पिक स्पीड डायल**: ${secondaryContact.name} (\`${secondaryContact.phoneNumber}\`)\n\nजार्विस आपके डिवाइस का कॉलिंग ऐप सक्रिय कर रहा है।`,
      directDialUrl: `tel:${primaryContact.phoneNumber}`,
      whatsAppUrl: `https://wa.me/${cleanNumber}`,
    };
  }

  // 2b. Only Mother / Mumma match

  if (isMumma) {
    const mumma = contacts.find((c) => c.relationship === 'mother') || {
      id: 'contact-mumma',
      name: 'Mumma (Mother)',
      hindiLabel: 'मम्मी (माताजी)',
      relationship: 'mother',
      phoneNumber: '+919876543211',
      avatarColor: '#ec4899',
    };
    const cleanNumber = mumma.phoneNumber.replace(/[^0-9]/g, '');

    return {
      isCallCommand: true,
      contact: mumma,
      phoneNumber: mumma.phoneNumber,
      spokenHindi: `जी ${userHonorific}, मम्मी को कॉल लगाया जा रहा है। कॉलिंग ऐप खोला जा रहा है।`,
      displayMarkdown: `📞 **आउटगोइंग कॉल**: मम्मी (Mother)\n\n- **संपर्क**: ${mumma.name} (${mumma.hindiLabel})\n- **फोन नंबर**: \`${mumma.phoneNumber}\`\n\nजार्विस आपके डिवाइस का कॉलिंग ऐप सक्रिय कर रहा है।`,
      directDialUrl: `tel:${mumma.phoneNumber}`,
      whatsAppUrl: `https://wa.me/${cleanNumber}`,
    };
  }

  // 3. Check for Father / Papa match
  if (isPapa) {
    const papa = contacts.find((c) => c.relationship === 'father') || {
      id: 'contact-papa',
      name: 'Papa (Father)',
      hindiLabel: 'पापा (पिताजी)',
      relationship: 'father',
      phoneNumber: '+919876543210',
      avatarColor: '#3b82f6',
    };
    const cleanNumber = papa.phoneNumber.replace(/[^0-9]/g, '');

    return {
      isCallCommand: true,
      contact: papa,
      phoneNumber: papa.phoneNumber,
      spokenHindi: `जी ${userHonorific}, पापा को कॉल लगाया जा रहा है। कॉलिंग ऐप खोला जा रहा है।`,
      displayMarkdown: `📞 **आउटगोइंग कॉल**: पापा (Father)\n\n- **संपर्क**: ${papa.name} (${papa.hindiLabel})\n- **फोन नंबर**: \`${papa.phoneNumber}\`\n\nजार्विस आपके डिवाइस का कॉलिंग ऐप सक्रिय कर रहा है।`,
      directDialUrl: `tel:${papa.phoneNumber}`,
      whatsAppUrl: `https://wa.me/${cleanNumber}`,
    };
  }

  // 4. Check for direct phone number pattern (e.g. "call 9876543210", "9876543210 ko call lagao")
  const digitMatch = text.match(/\b(\+?[0-9]{3,12})\b/);
  if (digitMatch && digitMatch[1]) {
    const number = digitMatch[1];
    const customContact: ContactItem = {
      id: `num-${Date.now()}`,
      name: `नंबर ${number}`,
      hindiLabel: `डायरेक्ट नंबर (${number})`,
      relationship: 'family',
      phoneNumber: number,
      avatarColor: '#06b6d4',
    };
    return {
      isCallCommand: true,
      contact: customContact,
      phoneNumber: number,
      spokenHindi: `जी ${userHonorific}, नंबर ${number} पर कॉल लगाया जा रहा है।`,
      displayMarkdown: `📞 **आउटगोइंग कॉल**: \`${number}\`\n\nजार्विस आपके डिवाइस का कॉलिंग ऐप प्रारंभ कर रहा है।`,
      directDialUrl: `tel:${number}`,
      whatsAppUrl: `https://wa.me/${number.replace(/[^0-9]/g, '')}`,
    };
  }

  // 5. Check other saved contacts by name
  for (const c of contacts) {
    const cNameLower = c.name.toLowerCase();
    if (lower.includes(cNameLower) || text.includes(c.hindiLabel)) {
      return {
        isCallCommand: true,
        contact: c,
        phoneNumber: c.phoneNumber,
        spokenHindi: `जी ${userHonorific}, ${c.hindiLabel} को कॉल लगाया जा रहा है।`,
        displayMarkdown: `📞 **आउटगोइंग कॉल**: ${c.name}\n\n- **फोन नंबर**: \`${c.phoneNumber}\`\n\nजार्विस कॉलिंग ऐप प्रारंभ कर रहा है।`,
        directDialUrl: `tel:${c.phoneNumber}`,
        whatsAppUrl: `https://wa.me/${c.phoneNumber.replace(/[^0-9]/g, '')}`,
      };
    }
  }

  return null;
}

/**
 * Triggers native device dialer via tel: protocol safely
 */
export function executeDeviceDial(phoneNumber: string) {
  try {
    const telUri = `tel:${phoneNumber.trim()}`;
    // Create invisible anchor and trigger click for maximum mobile browser compatibility
    const link = document.createElement('a');
    link.href = telUri;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn('Native tel: dialer trigger fallback:', e);
    window.location.href = `tel:${phoneNumber.trim()}`;
  }
}
