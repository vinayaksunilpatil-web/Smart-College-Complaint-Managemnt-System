const domainSignatures = {
  'it': {
    primary: [
      'wifi', 'wi-fi', 'wi fi', 'wlan', 'internet', 'network', 'lan', 'router', 'ethernet',
      'bandwidth', 'hotspot', 'dns', 'ip address', 'connectivity', 'access point',
      'server downtime', 'slow internet', 'disconnecting', 'no internet',
      'broadband', 'wireless', 'network cable', 'modem', 'packet loss', 'speed issue', 'fiber'
    ],
    secondary: ['portal', 'moodle', 'erp', 'website', 'online portal'],
    dept_names: ['information technology', 'it'],
    category_matchers: {
      'Network / WiFi Problem': ['wifi', 'wi-fi', 'internet', 'network', 'lan', 'router', 'hotspot', 'connectivity', 'broadband', 'ethernet', 'bandwidth'],
      'Server Downtime': ['server', 'downtime', 'moodle', 'erp', 'portal', 'website', 'crash', 'host', 'database']
    }
  },
  'computer': {
    primary: [
      'computer', 'pc', 'desktop', 'monitor', 'keyboard', 'mouse', 'cpu', 'software',
      'compiler', 'ide', 'visual studio', 'vs code', 'python', 'java', 'c++', 'linux',
      'windows', 'ubuntu', 'terminal', 'blue screen', 'bsod', 'crash', 'boot', 'ram',
      'hard disk', 'gpu', 'programming', 'virus', 'matlab', 'eclipse', 'anaconda',
      'code editor', 'os installation', 'system format', 'operating system', 'pc hardware'
    ],
    secondary: ['system', 'lab pc', 'lab system', 'workstation'],
    dept_names: ['computer engineering', 'computer'],
    category_matchers: {
      'Software / System Issue': ['software', 'compiler', 'ide', 'vs code', 'visual studio', 'python', 'java', 'c++', 'linux', 'windows', 'ubuntu', 'blue screen', 'bsod', 'crash', 'virus', 'os'],
      'Lab Equipment Issue': ['computer', 'pc', 'desktop', 'monitor', 'keyboard', 'mouse', 'cpu', 'ram', 'hard disk', 'gpu', 'hardware', 'boot']
    }
  },
  'civil': {
    primary: [
      'bench', 'desk', 'chair', 'table', 'blackboard', 'whiteboard', 'door', 'window',
      'wall', 'paint', 'leak', 'leakage', 'water', 'tap', 'pipe', 'plumbing', 'washroom',
      'toilet', 'restroom', 'flush', 'basin', 'sink', 'roof', 'ceiling', 'floor', 'tile',
      'civil', 'dustbin', 'drainage', 'sanitation', 'cleanliness', 'building', 'water cooler',
      'drinking water', 'broken lock', 'cracked glass', 'fan regulator handle', 'plaster',
      'podium', 'railing', 'staircase', 'steps'
    ],
    secondary: ['hostel room', 'mess', 'canteen', 'classroom infrastructure'],
    dept_names: ['civil engineering', 'civil'],
    category_matchers: {
      'Sanitation & Hygiene': ['washroom', 'toilet', 'restroom', 'flush', 'basin', 'sink', 'water', 'tap', 'pipe', 'leak', 'leakage', 'plumbing', 'drainage', 'dustbin', 'sanitation', 'cleanliness', 'water cooler', 'drinking water'],
      'Building Maintenance': ['bench', 'desk', 'chair', 'table', 'blackboard', 'whiteboard', 'door', 'window', 'wall', 'paint', 'roof', 'ceiling', 'floor', 'tile', 'broken lock', 'glass', 'podium', 'railing', 'staircase']
    }
  },
  'entc': {
    primary: [
      'light', 'tubelight', 'tube light', 'bulb', 'fan', 'ac', 'air conditioner',
      'cooling', 'power', 'switch', 'switchboard', 'socket', 'plug', 'fuse', 'wiring',
      'spark', 'short circuit', 'electricity', 'inverter', 'ups', 'projector', 'hdmi',
      'speaker', 'audio', 'mic', 'microphone', 'sound system', 'oscilloscope',
      'multimeter', 'sensor', 'breadboard', 'microcontroller', 'arduino', 'telecom',
      'power cut', 'power supply', 'projector screen'
    ],
    secondary: ['electronics lab', 'hardware circuit', 'electrical'],
    dept_names: ['electronics & telecom', 'electronics', 'telecom', 'e&tc', 'entc'],
    category_matchers: {
      'Electronics Lab Issue': ['oscilloscope', 'multimeter', 'sensor', 'breadboard', 'microcontroller', 'arduino', 'projector', 'hdmi', 'speaker', 'mic', 'sound system'],
      'Electrical Issue': ['light', 'tubelight', 'bulb', 'fan', 'ac', 'air conditioner', 'power', 'switch', 'switchboard', 'socket', 'plug', 'fuse', 'wiring', 'spark', 'short circuit', 'electricity', 'inverter', 'ups', 'cooling']
    }
  },
  'mech': {
    primary: [
      'lathe', 'cnc', 'milling', 'drilling', 'machine', 'machinery', 'workshop',
      'welding', 'gear', 'motor', 'engine', 'boiler', 'cad', 'cam', 'hydraulic',
      'pneumatic', 'spindle', 'tools', 'bearing', 'thermodynamics', 'grinder', 'anvil'
    ],
    secondary: ['mechanical workshop', 'tooling'],
    dept_names: ['mechanical engineering', 'mechanical'],
    category_matchers: {
      'CNC Machine Tool Breakdown': ['cnc', 'lathe', 'milling', 'drilling', 'machine', 'machinery', 'workshop', 'welding', 'spindle', 'motor', 'bearing', 'hydraulic', 'pneumatic']
    }
  },
  'admin': {
    primary: [
      'fee', 'fees', 'scholarship', 'hall ticket', 'admit card', 'exam', 'marksheet',
      'marks', 'bonafide', 'id card', 'identity card', 'certificate', 'admission',
      'fine', 'document', 'bus pass', 'transport pass', 'library book', 'library fine'
    ],
    secondary: ['office', 'administration', 'admin', 'registrar', 'hostel fee', 'mess fee'],
    dept_names: ['administration', 'admin'],
    category_matchers: {
      'Fee / Finance Issue': ['fee', 'fees', 'scholarship', 'payment', 'fine', 'receipt'],
      'Library Issue': ['library', 'library book', 'library fine', 'book issue', 'book return'],
      'Hostel Complaint': ['hostel', 'hostel room', 'mess food', 'canteen food', 'warden']
    }
  }
};

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/wi[-\s]fi/g, 'wifi')
    .replace(/e[-\s]&[-\s]tc|e[-\s]and[-\s]tc/g, 'entc')
    .replace(/vs[-\s]code/g, 'vs code')
    .replace(/tube[-\s]light/g, 'tubelight')
    .replace(/air[-\s]conditioner|air[-\s]conditioning/g, 'ac')
    .replace(/hot[-\s]spot/g, 'hotspot')
    .replace(/blue[-\s]screen/g, 'blue screen');
}

function matchKeyword(text, keyword) {
  const normKw = normalizeText(keyword);
  const escaped = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
  return regex.test(text);
}

function predictGrievance(title, description) {
  const fullText = normalizeText(`${title} ${description}`);
  if (!fullText.trim()) return null;

  let bestDomainKey = null;
  let maxScore = -1;
  let bestMatchedKeywords = [];

  for (const [domKey, dom] of Object.entries(domainSignatures)) {
    let score = 0;
    const currentMatches = [];

    // 1. Check primary keywords (Weight = 30)
    for (const kw of dom.primary) {
      if (matchKeyword(fullText, kw)) {
        score += kw.includes(' ') ? 35 : 30;
        if (!currentMatches.includes(kw)) {
          currentMatches.push(kw);
        }
      }
    }

    // 2. Check secondary keywords (Weight = 5)
    for (const kw of dom.secondary) {
      if (matchKeyword(fullText, kw)) {
        score += 5;
        if (!currentMatches.includes(kw)) {
          currentMatches.push(kw);
        }
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestDomainKey = domKey;
      bestMatchedKeywords = currentMatches;
    }
  }

  // Best domain found
  const domain = bestDomainKey ? domainSignatures[bestDomainKey] : null;
  const deptName = domain ? domain.dept_names[0] : 'General';

  // Category matching within the predicted department
  let bestCategoryName = null;
  let maxCatScore = -1;

  if (domain && domain.category_matchers) {
    for (const [catName, catKeywords] of Object.entries(domain.category_matchers)) {
      let catScore = 0;
      for (const kw of catKeywords) {
        if (matchKeyword(fullText, kw)) {
          catScore += kw.includes(' ') ? 10 : 8;
        }
      }
      if (catScore > maxCatScore) {
        maxCatScore = catScore;
        bestCategoryName = catName;
      }
    }
  }

  // Fallback category if no specific category score
  if (!bestCategoryName && domain && domain.category_matchers) {
    bestCategoryName = Object.keys(domain.category_matchers)[0];
  }

  let confidence = 50;
  if (maxScore >= 30) confidence = 96;
  else if (maxScore >= 20) confidence = 89;
  else if (maxScore >= 10) confidence = 78;
  else if (maxScore > 0) confidence = 65;

  return {
    deptName,
    categoryName: bestCategoryName,
    score: maxScore,
    confidence: `${confidence}%`,
    matchedKeywords: bestMatchedKeywords
  };
}

const comprehensiveTests = [
  { t: "Wi-Fi issue reported at the lab 606", d: "Student spoken via mic" },
  { t: "wifi not connecting in classroom 204", d: "Signal dropped completely" },
  { t: "the wifi is down in 3rd floor computer lab", d: "All laptops unable to connect to router" },
  { t: "internet connectivity dropped during online exam", d: "LAN cable not working in computer lab 4" },
  { t: "bench is broken in computer lab 3", d: "Wooden desk cracked and nails sticking out" },
  { t: "door handle broken in IT lab", d: "Unable to lock room 302" },
  { t: "projector not turning on in seminar hall", d: "HDMI cable faulty and lamp light blinking red" },
  { t: "air conditioner cooling fan broken in lab 606", d: "AC unit making loud noise and not cooling" },
  { t: "washroom tap is leaking on 4th floor", d: "Water overflowing from flush in civil block toilet" },
  { t: "python compiler error on lab systems", d: "VS Code environment crashing on Ubuntu desktops" },
  { t: "keyboard and mouse not detected on PC 14", d: "Desktop monitor display showing no signal" },
  { t: "fees receipt not generated on portal", d: "Scholarship payment deduction not updated in fee records" },
  { t: "lathe machine spindle stuck in workshop", d: "CNC motor stopped rotating during turn operation" }
];

console.log("==================== COMPREHENSIVE NLP TEST MATRIX ====================");
comprehensiveTests.forEach(test => {
  const res = predictGrievance(test.t, test.d);
  console.log(`INPUT: "${test.t}"`);
  console.log(`  ==> Department: [${res.deptName}] | Category: [${res.categoryName}] (Confidence: ${res.confidence})`);
  console.log(`      Matched: ${res.matchedKeywords.join(', ')}\n`);
});
