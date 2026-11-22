export interface ComicPanelData {
  id: string;
  panelNumber: 1 | 2 | 3 | 4;
  sceneId: string;
  locationTag: string;
  narratorCaption: string;
  speechBubble?: {
    speaker: string;
    text: string;
    type: 'speech' | 'thought' | 'shout';
  };
  sfx?: {
    text: string;
    color: string;
  };
  /** Verbatim story lines from the memoir for this panel step */
  storyLines: string[];
}

export interface ComicPageData {
  pageNumber: number;
  chapterCode: string;
  title: string;
  subtitle: string;
  eraBadge: string;
  actImage: string;
  moodColor: string;
  accentHex: string;
  summaryQuote: string;
  panels: [ComicPanelData, ComicPanelData, ComicPanelData, ComicPanelData];
}

export const COMIC_PAGES: ComicPageData[] = [
  // ==========================================
  // PAGE 1 — CHAPTER 1: THE HAND IN THE WATER
  // ==========================================
  {
    pageNumber: 1,
    chapterCode: 'CHAPTER 1',
    title: 'THE HAND IN THE WATER',
    subtitle: 'A Journey That Began With Water • A True Childhood Journey',
    eraBadge: 'SMALL VILLAGE • 4 KM SCHOOL ROUTE',
    actImage: '/images/cover-hand-in-water.jpg',
    moodColor: 'from-sky-950 via-slate-900 to-cyan-950',
    accentHex: '#0EA5E9',
    summaryQuote: 'That day, one man’s hand saved a little boy’s life.',
    panels: [
      {
        id: 'ch1-p1',
        panelNumber: 1,
        sceneId: 'ch1-p1',
        locationTag: '4 KM TO SCHOOL • THE FAMILIAR RIVER ROUTE',
        narratorCaption: 'A small village boy walked 4 km to school every single day.',
        speechBubble: {
          speaker: 'VILLAGE CHILDREN',
          text: 'When the river overflows in the rain, we must walk the extra 2 km detour!',
          type: 'speech',
        },
        sfx: { text: 'PATTER... PATTER...', color: '#38BDF8' },
        storyLines: [
          'There was once a little boy living in a small village.',
          'His school was around four kilometers away from his home. Every day, he followed the same route to school. The journey was familiar, and one of the usual ways home involved crossing a river.',
          'But the river was not always the same.',
          'During the rainy season, the water sometimes rose and overflowed. When that happened, the children had to take another route, walking an additional two kilometers to reach home.',
        ],
      },
      {
        id: 'ch1-p2',
        panelNumber: 2,
        sceneId: 'ch1-p2',
        locationTag: 'AFTER SCHOOL • THE OVERFLOWING CURRENT',
        narratorCaption: 'Walking alone with his lunchbox, he stepped into a river that had secretly risen.',
        speechBubble: {
          speaker: 'THE LITTLE BOY',
          text: 'Whoa—! The water is pulling my legs! I can’t keep my balance!',
          type: 'shout',
        },
        sfx: { text: 'SWOOOOSH!!', color: '#F59E0B' },
        storyLines: [
          'One day, after school, something happened that changed the boy\'s life.',
          'His friends left ahead of him. He was walking alone, carrying his lunchbox in one hand.',
          'He didn\'t know that the river had overflowed after the rain.',
          'He approached the river and stepped into the water, just as he normally did.',
          'But that day, the current was stronger.',
          'Within moments, the water pulled at his legs. He lost his balance. Before he could understand what was happening, the river swept him away.',
        ],
      },
      {
        id: 'ch1-p3',
        panelNumber: 3,
        sceneId: 'ch1-p3',
        locationTag: 'DOWNSTREAM • TEARING GRASS ROOTS',
        narratorCaption: 'One hand gripped a patch of muddy grass. The other still clutched his lunchbox.',
        speechBubble: {
          speaker: 'THE LITTLE BOY',
          text: 'The roots are tearing away... I have no strength left...',
          type: 'thought',
        },
        sfx: { text: 'RRRRIP—!', color: '#EF4444' },
        storyLines: [
          'He struggled against the current.',
          'He tried to control himself, but the water was too powerful. He was being carried downstream, and he began to feel that he might not survive.',
          'Then, with one hand, he managed to grab a small patch of grass near the riverbank.',
          'He held on tightly.',
          'His other hand was still holding his lunchbox.',
          'The current continued pulling at his body. The grass began loosening from the muddy ground. Its roots were tearing away, and the boy was slowly losing his grip.',
          'He was almost out of strength.',
        ],
      },
      {
        id: 'ch1-p4',
        panelNumber: 4,
        sceneId: 'ch1-p4',
        locationTag: 'MUDDY RIVERBANK • THE HAND OF SALVATION',
        narratorCaption: 'Just before he let go, a passing man reached out his hand and pulled him to life.',
        speechBubble: {
          speaker: 'THE LITTLE BOY',
          text: 'How can I learn to swim?',
          type: 'thought',
        },
        sfx: { text: 'GRAB! SPLASH!', color: '#F59E0B' },
        storyLines: [
          'Just when he was close to letting go, a man passing nearby noticed him.',
          'The man immediately reached out his hand, grabbed the boy, and pulled him out of the river.',
          'The boy landed on the muddy riverbank, exhausted and frightened.',
          'His lunchbox was lying beside him.',
          'He had survived.',
          'That day, the boy didn\'t understand everything that had happened. He was just a child who had nearly lost his life in the river.',
          'But something had changed.',
          'The water had frightened him, but it had also left him with a question.',
          'How could he learn to swim?',
          'That day, one man\'s hand saved a little boy\'s life.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 2 — CHAPTER 2: THE BOY WHO FOLLOWED WATER
  // ==========================================
  {
    pageNumber: 2,
    chapterCode: 'CHAPTER 2',
    title: 'THE BOY WHO FOLLOWED WATER',
    subtitle: 'Canal • Village Well • Village Lake • The Quarry',
    eraBadge: 'VILLAGE WATER BODIES • UP TO 7TH & 8TH GRADE',
    actImage: '/images/act-village-waters.jpg',
    moodColor: 'from-emerald-950 via-teal-950 to-slate-900',
    accentHex: '#10B981',
    summaryQuote: 'He didn’t have a swimming pool. He had childhood, friends, and water.',
    panels: [
      {
        id: 'ch2-p1',
        panelNumber: 1,
        sceneId: 'ch2-p1',
        locationTag: 'SMALL VILLAGE • NATURE AS PLAYGROUND',
        narratorCaption: 'No academy. No pool. No coach. Yet water was everywhere around him.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'First the small canal, then the village well, then the lake!',
          type: 'speech',
        },
        sfx: { text: 'SPLASH! HAHA!', color: '#34D399' },
        storyLines: [
          'After the river incident, the boy wanted to learn swimming.',
          'But there was one problem.',
          'He lived in a small village. There was no swimming academy, no swimming pool, and no professional coach who could teach him.',
          'There was no formal place where he could learn.',
          'But there was water everywhere.',
          'And slowly, nature became his playground.',
          'He began spending time around different water bodies with his friends.',
          'First came the small canal.',
          'Then the village well.',
          'After that, the village lake.',
          'And eventually, the quarry.',
        ],
      },
      {
        id: 'ch2-p2',
        panelNumber: 2,
        sceneId: 'ch2-p2',
        locationTag: 'CANAL, WELL & LAKE • MOTHER’S ENDLESS SEARCH',
        narratorCaption: 'For years, his mother searched every water body to scold him and bring him home.',
        speechBubble: {
          speaker: 'MOTHER',
          text: 'Found you at the lake again! Come home right now and don’t go there again!',
          type: 'shout',
        },
        sfx: { text: 'NEXT DAY: SPLASH!', color: '#F59E0B' },
        storyLines: [
          'His mother spent years searching for him.',
          'Sometimes she found him at the canal. Sometimes at the well. Other times, she discovered him near the lake.',
          'She would scold him, take him home, and warn him not to go there again.',
          'The boy would listen.',
          'At least until the next day.',
          'Then he would return with his friends.',
          'His mother repeated the same arguments many times. Eventually, she became tired of following him everywhere. Since he kept returning home safely, she gradually began believing that he knew how to handle himself.',
          'But the boy was simply enjoying his childhood.',
          'He and his friends played, laughed, explored, and spent time around water.',
        ],
      },
      {
        id: 'ch2-p3',
        panelNumber: 3,
        sceneId: 'ch2-p3',
        locationTag: '7TH–8TH GRADE • THE FORBIDDEN QUARRY',
        narratorCaption: 'By 7th or 8th grade, he discovered the enormous, steep, rocky quarry.',
        speechBubble: {
          speaker: 'VILLAGERS’ WARNING',
          text: 'Stay back! Nobody knows how frighteningly deep that quarry water is!',
          type: 'speech',
        },
        sfx: { text: 'ECHO... DEEP...', color: '#38BDF8' },
        storyLines: [
          'By the time he reached seventh or eighth grade, he discovered another place: a quarry.',
          'It was enormous.',
          'The sides were steep and rocky. The water looked frighteningly deep, and nobody really knew how deep it was.',
          'Villagers warned children not to go near it.',
          'But the boy was curious.',
          'He continued exploring different places with his friends.',
        ],
      },
      {
        id: 'ch2-p4',
        panelNumber: 4,
        sceneId: 'ch2-p4',
        locationTag: 'OPEN WATERS • PURE CHILDHOOD JOY',
        narratorCaption: 'Somewhere along the way, fear turned into pure childhood adventure.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'No coach, no curriculum—just childhood, friends, and water!',
          type: 'thought',
        },
        sfx: { text: 'SPLish—SPLASH!', color: '#10B981' },
        storyLines: [
          'Somewhere along the way, he almost forgot why he had started following water in the first place.',
          'He had wanted to learn swimming.',
          'Now, he was simply enjoying the world around him.',
          'He didn\'t have a swimming coach.',
          'He didn\'t have a swimming curriculum.',
          'He didn\'t even have a proper swimming pool.',
          'He had childhood, friends, and water.',
          'And the journey continued.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 3 — CHAPTER 3: THE WELL THAT CHANGED EVERYTHING
  // ==========================================
  {
    pageNumber: 3,
    chapterCode: 'CHAPTER 3',
    title: 'THE WELL THAT CHANGED EVERYTHING',
    subtitle: 'From Laughter to Silence in Ninth Grade',
    eraBadge: '9TH TO 10TH GRADE • THE NEIGHBORHOOD WELL',
    actImage: '/images/act-village-waters.jpg',
    moodColor: 'from-slate-950 via-indigo-950 to-slate-900',
    accentHex: '#6366F1',
    summaryQuote: 'When he learned what had happened, the place once filled with laughter became a place of painful memories.',
    panels: [
      {
        id: 'ch3-p1',
        panelNumber: 1,
        sceneId: 'ch3-p1',
        locationTag: 'SCHOOL & THE WELL • GAMES OVER BOOKS',
        narratorCaption: 'Studies? Never! The well near his home was their favorite gathering spot.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Don’t talk about studies! 😂 Let’s go play at the well with my brother and friends!',
          type: 'speech',
        },
        sfx: { text: 'HAHAHA! JUMP!', color: '#F59E0B' },
        storyLines: [
          'The boy loved playing more than studying.',
          'If someone asked him about studies, his answer would probably be:',
          '"Don\'t talk about studies!" 😂',
          'At school, he played whenever he got the chance. After school, he continued playing at home.',
          'Sometimes he went swimming, but most of his childhood was filled with games and fun.',
          'There was a well very close to his home.',
          'His older brother was close to him in age, just one class ahead. His brother\'s friends also joined them.',
          'The boys gathered around the well, played, enjoyed the water, and spent time together.',
          'Some already knew swimming. Others were still learning.',
          'For them, it was a favorite gathering place.',
        ],
      },
      {
        id: 'ch3-p2',
        panelNumber: 2,
        sceneId: 'ch3-p2',
        locationTag: '9TH GRADE • AWAY IN THE VILLAGE FARMS',
        narratorCaption: 'One fateful day in 9th grade, his mother took him to work in the village farms instead.',
        speechBubble: {
          speaker: 'MOTHER',
          text: 'No playing today—you are coming with me to work in the village farms.',
          type: 'speech',
        },
        sfx: { text: 'RUSTLE... STEP...', color: '#94A3B8' },
        storyLines: [
          'But one particular day in ninth grade changed everything.',
          'The boy had planned to stay home and play with his friends.',
          'His mother had other plans.',
          'Instead of spending the day playing, he had to accompany her to work in the village farms.',
          'He wasn\'t at the well that day.',
        ],
      },
      {
        id: 'ch3-p3',
        panelNumber: 3,
        sceneId: 'ch3-p3',
        locationTag: 'THE VILLAGE WELL • UNSPEAKABLE TRAGEDY',
        narratorCaption: 'While he was at the farm, tragedy struck at the very well where they always played.',
        speechBubble: {
          speaker: 'VILLAGE NEWS',
          text: 'Something terrible happened at the well... One of the boys drowned...',
          type: 'speech',
        },
        sfx: { text: 'SILENCE...', color: '#EF4444' },
        storyLines: [
          'While he was away, his older brother and their friends went to the well as usual.',
          'But something terrible happened.',
          'One of the boys drowned and died at the same place where they had all spent so much time playing.',
          'The boy was not there when the tragedy happened.',
          'He was away with his mother, working in the village farms.',
        ],
      },
      {
        id: 'ch3-p4',
        panelNumber: 4,
        sceneId: 'ch3-p4',
        locationTag: 'TOWARD 10TH GRADE • THE SILENT WELL',
        narratorCaption: 'The gatherings stopped. An entire year passed without anyone swimming at that well.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'The well is still here... but the laughter is gone forever.',
          type: 'thought',
        },
        sfx: { text: 'STILL WATER...', color: '#64748B' },
        storyLines: [
          'When he learned what had happened, the place that had once been filled with laughter became a place of painful memories.',
          'Nobody went swimming at that well again.',
          'The gatherings stopped.',
          'The laughter disappeared.',
          'The well was still there, but everything around it had changed.',
          'As the boy moved toward tenth grade, an entire year passed without swimming at that well.',
          'The place where they had once enjoyed their childhood was no longer the same.',
          'And although swimming did not disappear from his life completely, that particular chapter of his childhood had come to an end.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 4 — CHAPTER 4: FROM ESCAPING TUITION TO NATIONAL GAMES
  // ==========================================
  {
    pageNumber: 4,
    chapterCode: 'CHAPTER 4',
    title: 'FROM ESCAPING TUITION TO NATIONAL GAMES',
    subtitle: 'SSN College Narasaraopet • 65th National School Games New Delhi (Nov 17–22, 2019)',
    eraBadge: '11TH GRADE • LESS THAN 1 MONTH OF TRAINING',
    actImage: '/images/act-national-games.jpg',
    moodColor: 'from-cyan-950 via-blue-950 to-slate-900',
    accentHex: '#06B6D4',
    summaryQuote: 'The same boy who joined swimming to escape tuition was selected to represent Andhra Pradesh at the National Games.',
    panels: [
      {
        id: 'ch4-p1',
        panelNumber: 1,
        sceneId: 'ch4-p1',
        locationTag: 'WHOLESALE SHOP (15 DAYS) → SSN COLLEGE NARASARAOPET',
        narratorCaption: '15 hard days in a wholesale shop made him choose college—and SSN College had an Olympic pool.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'This wholesale shop isn’t the life I want! I’m going to SSN College—look at that Olympic pool!',
          type: 'thought',
        },
        sfx: { text: '15 DAYS LATER!', color: '#F59E0B' },
        storyLines: [
          'After tenth grade, everyone expected the boy to continue studying.',
          'But he wasn\'t interested.',
          'He didn\'t feel that studying was making him happy or giving him the life he wanted.',
          'He spoke to his parents about it, but they had different plans.',
          'Eventually, he ended up working at a wholesale shop.',
          'He worked there for fifteen days.',
          'The work was difficult, and during those fifteen days, he started realizing something.',
          'This wasn\'t the life he wanted.',
          'He decided that he would go to college, study, and enjoy his life.',
          'He began searching for a junior college for eleventh and twelfth grade.',
          'That search brought him to SSN College, Narasaraopet.',
          'There was something special about the college.',
          'It had an Olympic-standard swimming pool.',
        ],
      },
      {
        id: 'ch4-p2',
        panelNumber: 2,
        sceneId: 'ch4-p2',
        locationTag: '5:30 AM TO 10:00 PM • ENGLISH MEDIUM & TUITION ESCAPE',
        narratorCaption: 'Struggling with English after Telugu medium, packed tuition hours drove him to the pool next door.',
        speechBubble: {
          speaker: 'THE BOY',
          text: '5:30 AM tuition, 8 PM tuition, everything in English... Joining the pool is my escape!',
          type: 'thought',
        },
        sfx: { text: 'TICK-TOCK 5:30 AM', color: '#38BDF8' },
        storyLines: [
          'He joined eleventh grade.',
          'But college brought a new challenge.',
          'Until then, he had studied in Telugu medium. Now, for the first time, he was studying entirely in English medium.',
          'His English was very weak. He had barely managed to pass English tests at school.',
          'Now, every subject was in English.',
          'He would read the same sentence again and again, trying to understand what it meant.',
          'His daily routine was packed.',
          'Morning tuition: 5:30 AM to 8:00 AM.',
          'College during the day.',
          'Evening tuition: 8:00 PM to 10:00 PM.',
          'He lived in the college hostel, right next to his classroom.',
          'Sometimes he wondered:',
          'Why am I here? Is this really the life I imagined?',
          'He had wanted freedom, friends, fun, and a different college experience.',
          'Instead, his days were filled with books and tuition.',
          'But there was something right beside his classroom. The swimming pool.',
          'The pool had morning and evening sessions.',
          'He started thinking about joining swimming.',
          'Not because he had a big plan to become a national-level athlete.',
          'He wanted to escape tuition at least sometimes.',
          'That was how he entered the pool.',
        ],
      },
      {
        id: 'ch4-p3',
        panelNumber: 3,
        sceneId: 'ch4-p3',
        locationTag: 'THE POOL DECK • SELF-TAUGHT GRIT & MEDALS',
        narratorCaption: 'With no personal phone and a busy coach, he asked for tasks, watched videos, and won 2nd & 3rd at State!',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Coach, what should I do today?',
          type: 'speech',
        },
        sfx: { text: '2ND PLACE! 3RD AT STATE!', color: '#10B981' },
        storyLines: [
          'The coach was busy preparing other swimmers for upcoming competitions. The boy was new, and he didn\'t receive continuous personal guidance.',
          'Sometimes he would approach the coach and ask:',
          '"What should I do today?"',
          'The coach would give him practice tasks, and he would follow them.',
          'Slowly, he began understanding swimming techniques.',
          'He didn\'t have a mobile phone of his own, but he wanted to learn more. Whenever he could, he watched swimming videos to understand techniques, observed other swimmers, and practised.',
          'He signed up for a competition.',
          'In one event, he secured second place. In another, he managed to finish.',
          'Then came the next state-level competition.',
          'He secured third place.',
        ],
      },
      {
        id: 'ch4-p4',
        panelNumber: 4,
        sceneId: 'ch4-p4',
        locationTag: 'NEW DELHI • NOV 17–22, 2019 • 65TH NATIONAL GAMES (U-17)',
        narratorCaption: 'In less than 1 month of structured practice, he represented Andhra Pradesh in New Delhi!',
        speechBubble: {
          speaker: 'COACH',
          text: 'You’ve been selected for the 65th National School Games in New Delhi (Boys U-17)!',
          type: 'shout',
        },
        sfx: { text: 'NATIONAL GAMES DELHI!', color: '#F59E0B' },
        storyLines: [
          'After the competition, he returned to his regular college routine.',
          'One day, the coach told him something unexpected.',
          'He had been selected for the National Games.',
          'He was surprised.',
          'The same boy who had joined swimming to escape tuition, who struggled to understand English lessons, was now selected to represent Andhra Pradesh at the national level.',
          'He travelled to New Delhi for the 65th National School Games 2019–20, held from November 17 to 22, 2019, in the Boys Under-17 category.',
          'It was a huge moment.',
          'And all of this had happened after less than one month of structured swimming practice.',
          'He hadn\'t entered college planning to become a national-level athlete.',
          'He had entered because he wanted a different life.',
          'But the swimming pool had other plans for him.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 5 — CHAPTER 5: WHEN THE WORLD STOPPED
  // ==========================================
  {
    pageNumber: 5,
    chapterCode: 'CHAPTER 5',
    title: 'WHEN THE WORLD STOPPED',
    subtitle: 'The Dream That COVID Interrupted',
    eraBadge: '2020–2021 • LOCKDOWN • TWO YEARS AT HOME',
    actImage: '/images/act-national-games.jpg',
    moodColor: 'from-slate-950 via-purple-950 to-slate-900',
    accentHex: '#A855F7',
    summaryQuote: 'He had finally discovered his potential, but now he had no opportunity to explore it.',
    panels: [
      {
        id: 'ch5-p1',
        panelNumber: 1,
        sceneId: 'ch5-p1',
        locationTag: 'RETURN FROM DELHI • IMAGINING HIS POTENTIAL',
        narratorCaption: 'Returning from Delhi, his mind raced with what a full year of training could unlock.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'If I reached Nationals in one month... how far could I go if I trained for a whole year?!',
          type: 'thought',
        },
        sfx: { text: 'DREAMING BIG!', color: '#38BDF8' },
        storyLines: [
          'After returning from Delhi, the boy started thinking differently.',
          'He had achieved something he had never expected.',
          'He began thinking about his own potential.',
          'If he could reach that level with barely one month of structured swimming practice, what could happen if he trained for another year?',
          'What if he had more time?',
          'What if he competed in more events?',
          'How far could he go?',
          'For the first time, he started imagining a bigger sporting future.',
        ],
      },
      {
        id: 'ch5-p2',
        panelNumber: 2,
        sceneId: 'ch5-p2',
        locationTag: 'GLOBAL LOCKDOWN • POOLS CLOSED',
        narratorCaption: 'Just as his dream ignited, COVID arrived and locked every swimming pool gate shut.',
        speechBubble: {
          speaker: 'LOCKDOWN NOTICE',
          text: 'ALL SWIMMING POOLS & COMPETITIONS CLOSED INDEFINITELY.',
          type: 'shout',
        },
        sfx: { text: 'CLANG! LOCKED!', color: '#EF4444' },
        storyLines: [
          'But just when he began thinking about what came next, the world changed.',
          'COVID arrived.',
          'Lockdown began.',
          'Swimming pools closed.',
          'Competitions stopped.',
          'Training opportunities disappeared.',
        ],
      },
      {
        id: 'ch5-p3',
        panelNumber: 3,
        sceneId: 'ch5-p3',
        locationTag: 'ALMOST TWO YEARS AT HOME • FADING MOMENTUM',
        narratorCaption: 'For almost two years at home, there was no coach, no pool, and no competition.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Two years without a pool... All that momentum is slipping away.',
          type: 'thought',
        },
        sfx: { text: '2 YEARS PASS...', color: '#94A3B8' },
        storyLines: [
          'The boy returned home and stayed there for almost two years.',
          'There was no regular swimming practice, no competitions, and no coach-led training.',
          'The momentum he had built slowly disappeared.',
          'His college journey was also affected. Under the COVID arrangements, students were promoted to the next academic year.',
        ],
      },
      {
        id: 'ch5-p4',
        panelNumber: 4,
        sceneId: 'ch5-p4',
        locationTag: 'PAUSED HORIZON • PLANS IN HIS MIND',
        narratorCaption: 'He had plans burning in his mind, even while the entire world stood still.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'I finally discovered what I can do... when will the water open again?',
          type: 'thought',
        },
        sfx: { text: 'PAUSED...', color: '#A855F7' },
        storyLines: [
          'Everything had changed.',
          'He had finally discovered his potential, but now he had no opportunity to explore it.',
          'The sporting journey that had begun so unexpectedly was suddenly paused.',
          'He had plans in his mind.',
          'But the world had stopped.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 6 — CHAPTER 6: FROM SWIMMER TO LIFEGUARD AND JUNIOR COACH
  // ==========================================
  {
    pageNumber: 6,
    chapterCode: 'CHAPTER 6',
    title: 'FROM SWIMMER TO LIFEGUARD AND JUNIOR COACH',
    subtitle: 'Seeing the Swimming Pool From Another Side',
    eraBadge: 'POST-COVID REOPENING • COLLEGE POOL',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-amber-950 via-slate-900 to-cyan-950',
    accentHex: '#F59E0B',
    summaryQuote: 'He was slowly moving from being a swimmer to understanding the world behind swimming.',
    panels: [
      {
        id: 'ch6-p1',
        panelNumber: 1,
        sceneId: 'ch6-p1',
        locationTag: 'COLLEGE POOL REOPENS • A NEW ROLE',
        narratorCaption: 'When the college pool reopened after COVID with a new team, he returned in a brand-new role.',
        speechBubble: {
          speaker: 'NEW POOL TEAM',
          text: 'We need lifeguard and junior coaching support. Are you ready to step in?',
          type: 'speech',
        },
        sfx: { text: 'FWEET! WHISTLE!', color: '#F59E0B' },
        storyLines: [
          'After the COVID period, the college swimming pool reopened.',
          'But things were different.',
          'The previous coach had left, and a new team was coming in. The pool needed lifeguard support.',
          'The boy got an opportunity to return.',
          'This time, he wasn\'t returning only as a swimmer.',
          'He started working as both a lifeguard and a junior coach.',
        ],
      },
      {
        id: 'ch6-p2',
        panelNumber: 2,
        sceneId: 'ch6-p2',
        locationTag: 'MORNINGS & EVENINGS • EARNING & BALANCING',
        narratorCaption: 'Happy to be back near water, he balanced classes, lifeguarding, coaching, and his own practice.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Earning my own money, attending classes, and back by the pool every morning and evening!',
          type: 'thought',
        },
        sfx: { text: 'SPLASH! WORK!', color: '#38BDF8' },
        storyLines: [
          'He took the opportunity to earn money and enjoy life.',
          'He wasn\'t thinking about some huge future plan. He was simply happy to be back around the pool.',
          'He worked in the mornings and evenings.',
          'At the same time, he continued attending college classes, handling lifeguard duties, supporting the coaching team, and practising swimming himself.',
        ],
      },
      {
        id: 'ch6-p3',
        panelNumber: 3,
        sceneId: 'ch6-p3',
        locationTag: 'QUIET POST-COVID SESSIONS • LOW PRESSURE',
        narratorCaption: 'With low post-COVID attendance, the quiet pool deck gave him space to observe everything.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Keep your kick steady! I’ve got watch over the lanes.',
          type: 'speech',
        },
        sfx: { text: 'CALM RIPPLES', color: '#10B981' },
        storyLines: [
          'Because it was still the period after COVID, attendance was low. Only a few students came for morning and evening sessions.',
          'There wasn\'t much pressure.',
          'But something important was happening.',
        ],
      },
      {
        id: 'ch6-p4',
        panelNumber: 4,
        sceneId: 'ch6-p4',
        locationTag: 'BEHIND THE SCENES • A NEW PERSPECTIVE',
        narratorCaption: 'Once just a swimmer in the water, he now saw how sessions and pools were actually run.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'So this is how coaching sessions and pool responsibilities work behind the scenes...',
          type: 'thought',
        },
        sfx: { text: 'LEVEL UP!', color: '#F59E0B' },
        storyLines: [
          'He was beginning to understand the swimming pool from another side.',
          'Earlier, he had entered the pool as a swimmer.',
          'Now he was learning what happened behind the scenes.',
          'He was watching how a pool operated, how coaching sessions were handled, and how the people responsible for the pool managed their work.',
          'He was slowly moving from being a swimmer to understanding the world behind swimming.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 7 — CHAPTER 7: LEARNING THE WORLD BEHIND THE POOL
  // ==========================================
  {
    pageNumber: 7,
    chapterCode: 'CHAPTER 7',
    title: 'LEARNING THE WORLD BEHIND THE POOL',
    subtitle: 'Hyderabad • Pool Maintenance, Operations & Coaching',
    eraBadge: 'HYDERABAD • 3 MONTHS TRAINING + 1 MONTH OPERATOR',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-cyan-950 via-slate-900 to-emerald-950',
    accentHex: '#14B8A6',
    summaryQuote: 'He began understanding that a swimming pool was not just water, lanes, and swimmers. There was an entire system behind it.',
    panels: [
      {
        id: 'ch7-p1',
        panelNumber: 1,
        sceneId: 'ch7-p1',
        locationTag: 'ARRIVING IN HYDERABAD • A NEW MISSION',
        narratorCaption: 'Next stop: Hyderabad—not just to swim or coach, but to master pool maintenance and operations.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'I want to learn how swimming pools are maintained and operated from the inside out.',
          type: 'speech',
        },
        sfx: { text: 'HYDERABAD BOUND!', color: '#38BDF8' },
        storyLines: [
          'After gaining experience as a lifeguard and junior coach, he went to Hyderabad.',
          'This time, the purpose was different.',
          'He wanted to learn pool maintenance and operations.',
        ],
      },
      {
        id: 'ch7-p2',
        panelNumber: 2,
        sceneId: 'ch7-p2',
        locationTag: '3 MONTHS IN THE PLANT ROOM • THE HIDDEN SYSTEM',
        narratorCaption: 'For three months, he studied filtration, chemistry, pumps, and the unseen machinery behind clear water.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'A pool isn’t just water, lanes, and swimmers—there is an entire engineering system behind it!',
          type: 'thought',
        },
        sfx: { text: 'WHIRRR! FILTER ON!', color: '#14B8A6' },
        storyLines: [
          'He spent three months learning about how swimming pools were managed.',
          'He began understanding that a swimming pool was not just water, lanes, and swimmers.',
          'There was an entire system behind it.',
        ],
      },
      {
        id: 'ch7-p3',
        panelNumber: 3,
        sceneId: 'ch7-p3',
        locationTag: 'DUAL ROLE • POOL OPERATOR & COACH (1 MONTH)',
        narratorCaption: 'After three months, he worked at the same pool handling maintenance, operations, and coaching.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'Water balanced and crystal clear—now it’s time to coach the morning batch!',
          type: 'speech',
        },
        sfx: { text: 'CHECK! CLEAR!', color: '#10B981' },
        storyLines: [
          'After those three months, he got an opportunity to work at the same pool as a pool operator and coach.',
          'He worked there for approximately one month.',
          'Now he was handling pool maintenance, operations, and coaching.',
        ],
      },
      {
        id: 'ch7-p4',
        panelNumber: 4,
        sceneId: 'ch7-p4',
        locationTag: 'COMPLETE ECOSYSTEM • BEYOND SWIMMING STROKES',
        narratorCaption: 'The boy who once escaped tuition now understood the entire ecosystem of running a swimming pool.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'From escaping tuition to running the whole swimming environment!',
          type: 'thought',
        },
        sfx: { text: 'SYSTEM MASTERED!', color: '#F59E0B' },
        storyLines: [
          'He was learning more than swimming techniques.',
          'He was understanding the responsibilities involved in running a pool.',
          'The boy who had once entered a pool simply to escape tuition was now learning how the entire swimming environment worked.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 8 — CHAPTER 8: BACK TO HIS HOMETOWN
  // ==========================================
  {
    pageNumber: 8,
    chapterCode: 'CHAPTER 8',
    title: 'BACK TO HIS HOMETOWN',
    subtitle: 'One Year Coaching • Completing His Degree • Five Roles Mastered',
    eraBadge: 'HOMETOWN (1 YEAR) → DEGREE GRADUATION → HYDERABAD',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-blue-950 via-slate-900 to-indigo-950',
    accentHex: '#3B82F6',
    summaryQuote: 'He had been a swimmer, a lifeguard, a junior coach, a pool operator, and a swimming coach.',
    panels: [
      {
        id: 'ch8-p1',
        panelNumber: 1,
        sceneId: 'ch8-p1',
        locationTag: 'HOMETOWN INTERVIEW • HIRED AS SWIMMING COACH',
        narratorCaption: 'When his hometown hired swimming coaches, he aced the interview and coached there for almost a year.',
        speechBubble: {
          speaker: 'INTERVIEW PANEL',
          text: 'Welcome aboard Coach! Our hometown swimmers are in your hands.',
          type: 'speech',
        },
        sfx: { text: 'HIRED! 1 YEAR!', color: '#38BDF8' },
        storyLines: [
          'During this period, he received an opportunity from his hometown.',
          'They were hiring swimming coaches.',
          'He attended the interview and joined.',
          'He worked there for almost one year.',
          'It was another experience in his coaching journey.',
        ],
      },
      {
        id: 'ch8-p2',
        panelNumber: 2,
        sceneId: 'ch8-p2',
        locationTag: '2–3 MONTHS TO EXAMS • STEPPING BACK TO GRADUATE',
        narratorCaption: 'With degree examinations two or three months away, he left the job to finish his graduation.',
        speechBubble: {
          speaker: 'THE BOY',
          text: 'My degree exams are in two or three months—it’s time to focus and complete my degree!',
          type: 'thought',
        },
        sfx: { text: 'STUDY FOCUS!', color: '#F59E0B' },
        storyLines: [
          'But there was something else approaching.',
          'His degree examinations were coming in two or three months.',
          'He decided to leave the job and focus on completing his degree.',
        ],
      },
      {
        id: 'ch8-p3',
        panelNumber: 3,
        sceneId: 'ch8-p3',
        locationTag: 'DEGREE COMPLETED • BACK TO HYDERABAD',
        narratorCaption: 'Degree in hand, he returned to Hyderabad ready for the next chapter of his life.',
        speechBubble: {
          speaker: 'THE GRADUATE',
          text: 'Degree completed! Back to Hyderabad—let’s see what comes next.',
          type: 'speech',
        },
        sfx: { text: 'GRADUATED!', color: '#10B981' },
        storyLines: [
          'He completed his degree.',
          'And after that, he returned to Hyderabad.',
        ],
      },
      {
        id: 'ch8-p4',
        panelNumber: 4,
        sceneId: 'ch8-p4',
        locationTag: 'FIVE ROLES • ONE BIG QUESTION',
        narratorCaption: 'Swimmer. Lifeguard. Junior Coach. Pool Operator. Swimming Coach. What would he build with it all?',
        speechBubble: {
          speaker: 'THE COACH',
          text: 'Five roles have taught me so much... Now, what do I want to build with all this experience?',
          type: 'thought',
        },
        sfx: { text: '5 ROLES UNLOCKED', color: '#3B82F6' },
        storyLines: [
          'By then, his journey had already taken him through several roles.',
          'He had been a swimmer, a lifeguard, a junior coach, a pool operator, and a swimming coach.',
          'Each experience had taught him something different.',
          'But he was still figuring out what he wanted to build with all that experience.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 9 — CHAPTER 9: THE BEGINNING OF AQUA SLASH
  // ==========================================
  {
    pageNumber: 9,
    chapterCode: 'CHAPTER 9',
    title: 'THE BEGINNING OF AQUA SLASH',
    subtitle: 'Community Coaching • NSNIS Certification • Founding His Startup in 2024',
    eraBadge: 'HYDERABAD • NSNIS CERTIFIED • 2024 LAUNCH',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-sky-950 via-cyan-950 to-slate-900',
    accentHex: '#0EA5E9',
    summaryQuote: 'And in 2024, Aqua Slash began. It was his own startup. His own idea. His own responsibility.',
    panels: [
      {
        id: 'ch9-p1',
        panelNumber: 1,
        sceneId: 'ch9-p1',
        locationTag: 'HYDERABAD CLUB STARTUP • COMMUNITY COACHING',
        narratorCaption: 'Working with a small startup in a club environment showed him coaching beyond traditional academies.',
        speechBubble: {
          speaker: 'THE COACH',
          text: 'Look at that—swimming programs can reach families right inside their own residential communities!',
          type: 'thought',
        },
        sfx: { text: 'NEW SPARK!', color: '#38BDF8' },
        storyLines: [
          'After completing his degree, he returned to Hyderabad.',
          'Before starting his own venture, he worked with a small startup operating in a club environment.',
          'There, he gained experience in community swimming coaching.',
          'He began understanding how swimming programs could operate beyond traditional swimming academies.',
          'He observed how coaching could reach people in their own residential communities.',
        ],
      },
      {
        id: 'ch9-p2',
        panelNumber: 2,
        sceneId: 'ch9-p2',
        locationTag: 'NSNIS CERTIFICATION • EVERY ANGLE OF SWIMMING',
        narratorCaption: 'Completing his NSNIS certification crowned his journey across every angle of the sport.',
        speechBubble: {
          speaker: 'CERTIFIED COACH',
          text: 'NSNIS Certified! Athlete, lifeguard, junior coach, pool operator, and community coach.',
          type: 'speech',
        },
        sfx: { text: 'NSNIS CERTIFIED!', color: '#F59E0B' },
        storyLines: [
          'Alongside this journey, he completed his NSNIS certification.',
          'His experience was growing.',
          'He had seen swimming from different angles: as an athlete, lifeguard, junior coach, pool operator, and community swimming coach.',
        ],
      },
      {
        id: 'ch9-p3',
        panelNumber: 3,
        sceneId: 'ch9-p3',
        locationTag: '2024 • THE FOUNDER’S LEAP: AQUA SLASH BEGINS',
        narratorCaption: 'Instead of working for someone else, he took the leap in 2024 to launch his own startup: Aqua Slash.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'I want to build something of my own. In 2024, Aqua Slash begins!',
          type: 'shout',
        },
        sfx: { text: 'AQUA SLASH 2024!', color: '#0EA5E9' },
        storyLines: [
          'Then came a new decision.',
          'Instead of continuing to work for someone else\'s organization, he wanted to build something of his own.',
          'He wanted to create his own swimming venture.',
          'And in 2024, Aqua Slash began.',
          'It was his own startup.',
          'His own idea.',
          'His own responsibility.',
        ],
      },
      {
        id: 'ch9-p4',
        panelNumber: 4,
        sceneId: 'ch9-p4',
        locationTag: '2024–2025 • SEARCHING FOR THE DEEPER WHY',
        narratorCaption: 'Building through 2024 and 2025, his mission shifted to bringing swimming education to more people.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'First, I need to deeply understand WHY I am building Aqua Slash.',
          type: 'thought',
        },
        sfx: { text: 'MISSION LOADING...', color: '#10B981' },
        storyLines: [
          'He worked on building Aqua Slash through 2024 and 2025.',
          'The journey was no longer about finding a place to swim or getting a coaching opportunity.',
          'Now, he was trying to create something that could bring swimming education to more people.',
          'But first, he needed to understand why he wanted to build it.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 10 — CHAPTER 10: WHY AQUA SLASH?
  // ==========================================
  {
    pageNumber: 10,
    chapterCode: 'CHAPTER 10',
    title: 'WHY AQUA SLASH?',
    subtitle: 'Cut Through Fear of Water. One Drop at a Time.',
    eraBadge: 'THE CORE PURPOSE • RESIDENTIAL COMMUNITIES',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-cyan-950 via-blue-950 to-indigo-950',
    accentHex: '#38BDF8',
    summaryQuote: 'The boy who once needed a hand in the water now wanted to build something that could help others understand it.',
    panels: [
      {
        id: 'ch10-p1',
        panelNumber: 1,
        sceneId: 'ch10-p1',
        locationTag: 'MEMORIES OF THE RIVER & THE WELL',
        narratorCaption: 'His near-drowning in the river and the tragedy at the village well echoed with one urgent truth.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'So many people lose their lives simply because they don’t know how to swim or understand water...',
          type: 'thought',
        },
        sfx: { text: 'ECHO OF MEMORY', color: '#38BDF8' },
        storyLines: [
          'Throughout his journey, the boy had seen how people struggled around water.',
          'He had experienced a frightening river incident himself.',
          'He had witnessed how a tragedy at the village well changed the lives of people around him.',
          'He had also spent years learning swimming and working in swimming environments.',
          'One thought kept returning to him.',
          'So many people were losing their lives because they did not know how to swim or how to understand water.',
        ],
      },
      {
        id: 'ch10-p2',
        panelNumber: 2,
        sceneId: 'ch10-p2',
        locationTag: 'TAKING SWIMMING TO RESIDENTIAL COMMUNITIES',
        narratorCaption: 'Why wait for students to find an academy when residential communities already had swimming pools?',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Having a pool in your apartment doesn’t mean you know how to swim. Let’s take coaching TO the people!',
          type: 'speech',
        },
        sfx: { text: 'BREAKTHROUGH!', color: '#F59E0B' },
        storyLines: [
          'He began asking himself:',
          'Why should swimming education remain limited to people who visit swimming academies?',
          'Why should people always have to search for a swimming pool or a coaching center?',
          'Why not take swimming education to the people?',
          'He started thinking about residential communities.',
          'Many communities already had swimming pools. People lived there with their families, and children had access to those facilities.',
          'But access to a swimming pool did not automatically mean people knew how to swim.',
          'He saw an opportunity.',
        ],
      },
      {
        id: 'ch10-p3',
        panelNumber: 3,
        sceneId: 'ch10-p3',
        locationTag: 'COMMUNITIES, SCHOOLS, COMICS & VISUAL LEARNING',
        narratorCaption: 'Beyond classes: water safety awareness, school programs, comics, and visual learning.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'We’ll build confidence in water through community programs, schools, comics, and visual storytelling!',
          type: 'speech',
        },
        sfx: { text: 'VISION EXPANDS!', color: '#10B981' },
        storyLines: [
          'Instead of waiting for students to come to an academy, he could bring structured swimming coaching to residential communities.',
          'That became one of the foundations of Aqua Slash.',
          'He wanted to work with communities, provide swimming education, improve confidence in water, and create awareness about water safety.',
          'Over time, he also wanted to explore school programs, educational content, comics, visual learning, and more ways to make swimming education accessible.',
          'Aqua Slash was not just about collecting students or conducting swimming classes.',
          'There was a bigger reason behind it.',
        ],
      },
      {
        id: 'ch10-p4',
        panelNumber: 4,
        sceneId: 'ch10-p4',
        locationTag: 'ONE DROP AT A TIME • THE CREDO',
        narratorCaption: 'Cut through fear of water. One Drop at a Time. Now the real startup test was about to begin.',
        speechBubble: {
          speaker: 'AQUA SLASH CREDO',
          text: 'Cut through fear of water. One Drop at a Time.',
          type: 'shout',
        },
        sfx: { text: 'SLASH! DROP!', color: '#0EA5E9' },
        storyLines: [
          'He wanted people to understand water.',
          'He wanted children to learn swimming.',
          'He wanted swimming education to reach places where people could actually use it.',
          'The idea was simple:',
          'Cut through fear of water. One Drop at a Time.',
          'The boy who once needed a hand in the water now wanted to build something that could help others understand it.',
          'But having an idea and building a startup were two very different things.',
          'The real challenge was just beginning.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 11 — CHAPTER 11: THE FIRST COMMUNITIES — REALITY BEGINS
  // ==========================================
  {
    pageNumber: 11,
    chapterCode: 'CHAPTER 11',
    title: 'THE FIRST COMMUNITIES — REALITY BEGINS',
    subtitle: 'Two Initial Communities • An Unexpected Accident • Refusing to Quit',
    eraBadge: 'EARLY 2024 • FIRST 2 COMMUNITIES & GRIT',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-slate-950 via-rose-950 to-slate-900',
    accentHex: '#F43F5E',
    summaryQuote: 'After recovering, he returned to coaching and started again. He did not quit.',
    panels: [
      {
        id: 'ch11-p1',
        panelNumber: 1,
        sceneId: 'ch11-p1',
        locationTag: 'ONE-MAN ARMY • CONVINCING THE FIRST TWO COMMUNITIES',
        narratorCaption: 'Approaching communities, building trust, and organizing classes—he handled almost everything himself.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Two residential communities signed on! I’ll handle relationships, scheduling, and coaching myself.',
          type: 'speech',
        },
        sfx: { text: '2 COMMUNITIES LIVE!', color: '#38BDF8' },
        storyLines: [
          'Starting Aqua Slash was exciting.',
          'But the moment he entered the real world of community coaching, he understood that building a startup was not easy.',
          'He had to approach communities, build relationships, convince people, organize classes, and establish trust.',
          'He was handling much of the work himself.',
          'In the initial stage, Aqua Slash began working in two communities.',
          'Most of his time was spent there.',
          'He was trying to build the program, coach students, and make the startup work.',
        ],
      },
      {
        id: 'ch11-p2',
        panelNumber: 2,
        sceneId: 'ch11-p2',
        locationTag: 'UNEXPECTED SETBACK • THE ACCIDENT',
        narratorCaption: 'In the middle of building momentum, an accident suddenly forced him off the pool deck.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Everything stopped because of this accident... but my students are still waiting for me!',
          type: 'thought',
        },
        sfx: { text: 'CRASH! HALT!', color: '#EF4444' },
        storyLines: [
          'But the journey wasn\'t smooth.',
          'During this early phase, he met with an accident.',
          'The accident interrupted his coaching work, and for some time, he couldn\'t continue as usual.',
          'But the students were still waiting for him.',
        ],
      },
      {
        id: 'ch11-p3',
        panelNumber: 3,
        sceneId: 'ch11-p3',
        locationTag: 'RECOVERY & RETURN • REFUSING TO QUIT',
        narratorCaption: 'As soon as he recovered, he walked right back onto the pool deck and restarted.',
        speechBubble: {
          speaker: 'STUDENTS',
          text: 'Coach is back!! Let’s get in the water!',
          type: 'shout',
        },
        sfx: { text: 'UNBROKEN!', color: '#10B981' },
        storyLines: [
          'After recovering, he returned to coaching and started again.',
          'He did not quit.',
          'The experience showed him that building something of his own would require more than enthusiasm.',
        ],
      },
      {
        id: 'ch11-p4',
        panelNumber: 4,
        sceneId: 'ch11-p4',
        locationTag: 'REAL FOUNDER LESSONS • BEYOND ENTHUSIASM',
        narratorCaption: 'Difficult days and real responsibilities forged what it truly meant to run Aqua Slash.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'You can’t walk away when things get tough. This is what running Aqua Slash truly means.',
          type: 'thought',
        },
        sfx: { text: 'FOUNDER GRIT!', color: '#F59E0B' },
        storyLines: [
          'There would be interruptions, difficult days, and responsibilities that he couldn\'t simply walk away from.',
          'Even when things became difficult, he continued working.',
          'The first communities were not just places where he conducted classes.',
          'They were where he began learning what it actually meant to run Aqua Slash.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 12 — CHAPTER 12: THE IDEAS THAT WAITED
  // ==========================================
  {
    pageNumber: 12,
    chapterCode: 'CHAPTER 12',
    title: 'THE IDEAS THAT WAITED',
    subtitle: 'Educational Comics • Visual Storytelling • Unfinished Experiments',
    eraBadge: '2024–2025 • EXPERIMENTING & EVOLVING',
    actImage: '/images/act-108-drops.jpg',
    moodColor: 'from-indigo-950 via-slate-900 to-cyan-950',
    accentHex: '#818CF8',
    summaryQuote: 'Some ideas moved forward. Others remained unfinished. Not every plan became reality.',
    panels: [
      {
        id: 'ch12-p1',
        panelNumber: 1,
        sceneId: 'ch12-p1',
        locationTag: 'THE SKETCHBOOK • EDUCATIONAL SWIMMING COMICS',
        narratorCaption: 'He began planning educational comics so children could learn water stages through visual storytelling.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'What if children could understand water skills and learning stages through illustrated comics?!',
          type: 'thought',
        },
        sfx: { text: 'SKETCH! DRAW!', color: '#38BDF8' },
        storyLines: [
          'As the months passed, his thinking started expanding.',
          'He was no longer thinking only about daily coaching sessions.',
          'He began planning educational comics.',
          'He wanted to create content that could explain swimming concepts in a different way.',
          'He thought about how children could understand water, swimming skills, and learning stages through visual storytelling.',
          'There were many ideas in his mind.',
        ],
      },
      {
        id: 'ch12-p2',
        panelNumber: 2,
        sceneId: 'ch12-p2',
        locationTag: 'HOMETOWN STINT & INDEPENDENT POOL OPERATIONS PLAN',
        narratorCaption: 'Returning briefly to his hometown, he also tried launching independent pool maintenance leads.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Let’s try building independent leads for pool maintenance and operations too.',
          type: 'speech',
        },
        sfx: { text: 'TESTING PATHS...', color: '#F59E0B' },
        storyLines: [
          'At one point, he also returned to his hometown to work again.',
          'Along the way, he explored another possibility.',
          'He wanted to take responsibility for pool maintenance and operations independently. He planned to build his own leads and develop that side of the work.',
        ],
      },
      {
        id: 'ch12-p3',
        panelNumber: 3,
        sceneId: 'ch12-p3',
        locationTag: 'PLANS THAT PAUSED • HONEST LESSONS',
        narratorCaption: 'Not every plan materialized—some moved forward while others remained unfinished.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'That operations plan didn’t materialize yet... and that’s okay. Keep refining the core vision.',
          type: 'thought',
        },
        sfx: { text: 'RECALIBRATE', color: '#94A3B8' },
        storyLines: [
          'But that plan did not materialize.',
          'Some ideas moved forward.',
          'Others remained unfinished.',
          'Not every plan became reality.',
        ],
      },
      {
        id: 'ch12-p4',
        panelNumber: 4,
        sceneId: 'ch12-p4',
        locationTag: 'MORE THAN A SERVICE • SEEKING A STRONGER IDENTITY',
        narratorCaption: 'He kept striving for a stronger identity, better content, and a more organized way of teaching.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Aqua Slash must become more than a coaching service—it needs its own organized teaching system!',
          type: 'thought',
        },
        sfx: { text: 'BUILDING IDENTITY', color: '#818CF8' },
        storyLines: [
          'But he kept thinking about how Aqua Slash could become more than a coaching service.',
          'He wanted to develop a stronger identity, better educational content, and a more organized way of teaching swimming.',
          'He was still learning how to turn those ideas into something practical.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 13 — CHAPTER 13: TWO YEARS OF BUILDING — FROM TWO TO SEVEN COMMUNITIES
  // ==========================================
  {
    pageNumber: 13,
    chapterCode: 'CHAPTER 13',
    title: 'TWO YEARS OF BUILDING — FROM TWO TO SEVEN COMMUNITIES',
    subtitle: '2024: The Foundation (2 Communities) • 2025: The Expansion (7 Communities)',
    eraBadge: '2024 TO 2025 • 2 → 7 RESIDENTIAL COMMUNITIES',
    actImage: '/images/act-lifeguard-coach.jpg',
    moodColor: 'from-emerald-950 via-cyan-950 to-slate-900',
    accentHex: '#10B981',
    summaryQuote: 'By 2025, Aqua Slash had grown from its initial two communities to seven communities.',
    panels: [
      {
        id: 'ch13-p1',
        panelNumber: 1,
        sceneId: 'ch13-p1',
        locationTag: '2024 — THE FOUNDATION • TWO COMMUNITIES',
        narratorCaption: '2024 was the foundation year: two communities, overcoming an accident, and learning hands-on.',
        speechBubble: {
          speaker: '2024 LOGBOOK',
          text: '2024: Started from an idea. 2 communities, survived an accident, explored comics & operations.',
          type: 'speech',
        },
        sfx: { text: '2024: FOUNDATION', color: '#38BDF8' },
        storyLines: [
          '2024 — THE BEGINNING',
          '2024 was the year Aqua Slash began its journey.',
          'It started with an idea and the decision to build something of his own.',
          'The initial work was in two residential communities.',
          'He spent most of his time there, handling coaching and trying to establish the program.',
          'There were challenges, including an accident that interrupted his work.',
          'But after recovering, he returned.',
          'He continued building Aqua Slash.',
          'He explored educational comics, thought about pool operations, and tried to understand how he could improve the way swimming was taught.',
          'It was not a perfect beginning.',
          'He was learning through experience, handling responsibilities himself, and figuring out what worked.',
        ],
      },
      {
        id: 'ch13-p2',
        panelNumber: 2,
        sceneId: 'ch13-p2',
        locationTag: '2025 — THE EXPANSION • CONSTANT SELF-QUESTIONING',
        narratorCaption: 'In 2025, visiting more communities and diverse students, he constantly questioned how to improve.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'Why am I doing this? What am I building? How can I make Aqua Slash better across every community?',
          type: 'thought',
        },
        sfx: { text: 'GROWING STEP BY STEP', color: '#F59E0B' },
        storyLines: [
          '2025 — THE EXPANSION',
          'The second year was about continuing the work and expanding through experience.',
          'He visited more communities, met different people, worked with students from different backgrounds, and kept improving his coaching style.',
          'Every community brought a different experience.',
          'He learned how to communicate with residents, organize programs, work with students, and understand the expectations of different communities.',
          'He kept questioning himself:',
          'Why am I doing this? What am I building? How can I make Aqua Slash better?',
          'He wasn\'t simply trying to increase the number of students.',
          'He was learning how to build a swimming education program that could work across different communities.',
        ],
      },
      {
        id: 'ch13-p3',
        panelNumber: 3,
        sceneId: 'ch13-p3',
        locationTag: '2025 MILESTONE • FROM 2 TO 7 COMMUNITIES!',
        narratorCaption: 'By 2025, Aqua Slash had expanded from 2 initial communities to 7 active residential communities!',
        speechBubble: {
          speaker: 'AQUA SLASH MAP',
          text: '2024: 2 Communities → 2025: 7 Communities! Two years of building, struggling, and improving!',
          type: 'shout',
        },
        sfx: { text: '7 COMMUNITIES!', color: '#10B981' },
        storyLines: [
          'Slowly, the work expanded.',
          'By 2025, Aqua Slash had grown from its initial two communities to seven communities.',
          'It was an important milestone.',
          'Not because everything was perfect, but because the work he had started in 2024 had continued into the next year and reached more people.',
          '2024 — The foundation.',
          '2025 — The expansion.',
          'Two years of building, learning, struggling, and improving Aqua Slash.',
        ],
      },
      {
        id: 'ch13-p4',
        panelNumber: 4,
        sceneId: 'ch13-p4',
        locationTag: 'THE MISSING PIECE • SEARCHING FOR DEEPER STRUCTURE',
        narratorCaption: 'Even with 7 communities, he felt something deeper was missing: a structured stage-by-stage system.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'I have experience, coaching style, and ideas—now I need to understand how a structured swimming system is designed!',
          type: 'thought',
        },
        sfx: { text: 'NEXT QUEST...', color: '#38BDF8' },
        storyLines: [
          'But after two years of running his own startup, he began feeling that something was still missing.',
          'He had his own experience.',
          'He had his own coaching style.',
          'He had his own ideas.',
          'But he wanted to understand swimming development at a deeper level.',
          'He wanted to learn how a structured swimming system was designed and how swimmers could progress through clearly defined stages.',
          'That feeling would lead him to another important chapter.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 14 — CHAPTER 14: THE SIX STAGES — ONE DROP AT A TIME
  // ==========================================
  {
    pageNumber: 14,
    chapterCode: 'CHAPTER 14',
    title: 'THE SIX STAGES — ONE DROP AT A TIME',
    subtitle: 'July 1, 2026 • Game Theory • 6 Stages × 3 Levels × 6 Drops = 108 Drops',
    eraBadge: 'JULY 1, 2026 • THE BIRTH OF THE AQUA SLASH SYSTEM',
    actImage: '/images/act-108-drops.jpg',
    moodColor: 'from-sky-950 via-blue-950 to-amber-950',
    accentHex: '#F59E0B',
    summaryQuote: '6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS. One Drop at a Time.',
    panels: [
      {
        id: 'ch14-p1',
        panelNumber: 1,
        sceneId: 'ch14-p1',
        locationTag: 'JULY 1, 2026 • JOINING GAME THEORY AS A STUDENT-FOUNDER',
        narratorCaption: 'On July 1, 2026, he joined Game Theory with the experience of a founder and the humility of a student.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'How can a beginner progress from their first experience in water to a confident swimmer with clear purpose?',
          type: 'thought',
        },
        sfx: { text: 'JULY 1, 2026', color: '#38BDF8' },
        storyLines: [
          'JULY 1, 2026 — A NEW WAY OF SEEING THE WATER',
          'After two years of building Aqua Slash, he started feeling that something was missing.',
          'He had coached students. He had worked across communities. He had built a startup from the ground up.',
          'But he wanted to understand something deeper.',
          'How could a swimmer\'s journey be organized?',
          'How could a beginner progress from their first experience in water to becoming a confident swimmer?',
          'How could every skill be taught, practiced, and evaluated with a clear purpose?',
          'On July 1, 2026, he joined Game Theory.',
          'He entered with experience as a founder and coach, but also with the mindset of a student.',
        ],
      },
      {
        id: 'ch14-p2',
        panelNumber: 2,
        sceneId: 'ch14-p2',
        locationTag: 'THE EPIPHANY • BUILDING AQUA SLASH’S OWN PATH',
        narratorCaption: 'Observing structured progression sparked a realization: Aqua Slash needed a system born from his own story.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'If I am building Aqua Slash, why follow someone else’s path? Why shouldn’t Aqua Slash have its own system?!',
          type: 'shout',
        },
        sfx: { text: 'EUREKA!!', color: '#F59E0B' },
        storyLines: [
          'There, he observed a structured swimming-development system with different stages and levels.',
          'He began understanding how a swimmer could progress through a planned pathway rather than learning random skills without direction.',
          'And that experience made him think.',
          'If I am building Aqua Slash, why should I simply follow someone else\'s path? Why shouldn\'t Aqua Slash have its own?',
          'He already had a story. He had years of experiences around water.',
          'He had seen the journey from fear to confidence, from beginner to swimmer, and from swimmer to coach.',
          'Now he wanted to turn those experiences into a system.',
          'Not a copy. Not just another swimming class. Something that belonged to Aqua Slash.',
        ],
      },
      {
        id: 'ch14-p3',
        panelNumber: 3,
        sceneId: 'ch14-p3',
        locationTag: 'THE ARCHITECTURE • GLASS → POOL → POND → LAKE → RIVER → OCEAN',
        narratorCaption: 'Six Stages: GLASS, POOL, POND, LAKE, RIVER, OCEAN. 6 Stages × 3 Levels × 6 Drops = 108 DROPS!',
        speechBubble: {
          speaker: 'AQUA SLASH SYSTEM',
          text: '6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS! Every single skill is a DROP with its own identity!',
          type: 'shout',
        },
        sfx: { text: '108 DROPS BORN!', color: '#0EA5E9' },
        storyLines: [
          'THE BIRTH OF THE AQUA SLASH SYSTEM',
          'He began shaping his own swimming-development architecture.',
          'Six stages. Three levels in every stage. Six skills in every level.',
          'And every single skill would have its own identity.',
          'The six stages became: GLASS • POOL • POND • LAKE • RIVER • OCEAN.',
          'Each stage would contain three levels. Each level would contain six skills.',
          'At Aqua Slash, every skill would be called a DROP.',
          '6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS',
          'Every stage would represent another part of the swimmer\'s journey. Every level would move the swimmer forward. Every Drop would represent a skill to learn, practise, and master.',
          'But he wanted something more than ordinary skill names. He wanted the entire system to carry the identity of Aqua Slash.',
        ],
      },
      {
        id: 'ch14-p4',
        panelNumber: 4,
        sceneId: 'ch14-p4',
        locationTag: 'THE PHILOSOPHY • ONE DROP AT A TIME',
        narratorCaption: 'One skill at a time. One level at a time. One stage at a time. Every Drop matters.',
        speechBubble: {
          speaker: 'THE FOUNDER',
          text: 'ONE DROP AT A TIME. From fear to mastery—now this system can guide someone else’s journey!',
          type: 'thought',
        },
        sfx: { text: 'ONE DROP AT A TIME', color: '#10B981' },
        storyLines: [
          'ONE DROP AT A TIME',
          'This became more than a slogan. It became the philosophy behind Aqua Slash.',
          'ONE DROP AT A TIME. One skill at a time. One level at a time. One stage at a time.',
          'Progress doesn\'t happen all at once. It happens through small skills, repeated practice, improvement, and achievement.',
          'Every Drop matters. Every small achievement becomes part of a bigger transformation.',
          'And suddenly, the name Aqua Slash had a deeper meaning.',
          'The boy who once entered the water without understanding its power had spent years learning about it.',
          'He had experienced fear. He had discovered swimming. He had competed. He had coached. He had worked behind the pool. He had built a startup. He had faced setbacks. And he had continued learning.',
          'Now he wanted to create a system that could guide someone else\'s journey.',
        ],
      },
    ],
  },

  // ==========================================
  // PAGE 15 — THE FINAL CHAPTER — BUT NOT THE END
  // ==========================================
  {
    pageNumber: 15,
    chapterCode: 'FINAL CHAPTER',
    title: 'THE FINAL CHAPTER — BUT NOT THE END',
    subtitle: 'The Boy’s Story Began With a Hand in the Water • The End of the Beginning',
    eraBadge: 'FULL CIRCLE • 6 STAGES • 18 LEVELS • 108 DROPS',
    actImage: '/images/act-108-drops.jpg',
    moodColor: 'from-cyan-950 via-sky-900 to-amber-950',
    accentHex: '#38BDF8',
    summaryQuote: 'The boy’s story began with a hand in the water. Now, he was building a world of his own, one Drop at a time.',
    panels: [
      {
        id: 'ch15-p1',
        panelNumber: 1,
        sceneId: 'ch15-p1',
        locationTag: 'WHERE IT ALL BEGAN • THE RIVER TO THE NATIONALS',
        narratorCaption: 'Think about where it all began: a village boy, a rushing river, a hand in the water, and an unexpected pool.',
        speechBubble: {
          speaker: 'NARRATOR',
          text: 'From a river current and a village without an academy... to representing his state at the National Games.',
          type: 'thought',
        },
        sfx: { text: 'REMEMBER THE START', color: '#38BDF8' },
        storyLines: [
          'THE FINAL CHAPTER — BUT NOT THE END',
          'Think about where it all began.',
          'A little boy walking home from school.',
          'A river with a powerful current.',
          'A hand reaching out of the water.',
          'A village without a swimming academy.',
          'A boy who kept returning to the water.',
          'A school tragedy that changed the way he saw swimming.',
          'A college swimming pool that opened an unexpected door.',
          'A national-level journey that began when he was trying to escape tuition.',
        ],
      },
      {
        id: 'ch15-p2',
        panelNumber: 2,
        sceneId: 'ch15-p2',
        locationTag: 'EVERY ROLE • FROM LOCKDOWN TO SEVEN COMMUNITIES',
        narratorCaption: 'A pandemic pause. A lifeguard. A junior coach. A pool operator. A coach. A founder across 7 communities.',
        speechBubble: {
          speaker: 'THE JOURNEY',
          text: 'Lifeguard → Junior Coach → Pool Operator → Swimming Coach → Founder across 7 Communities!',
          type: 'speech',
        },
        sfx: { text: 'STEP BY STEP', color: '#F59E0B' },
        storyLines: [
          'A pandemic that interrupted his dreams.',
          'A lifeguard.',
          'A junior coach.',
          'A pool operator.',
          'A swimming coach.',
          'Then a founder.',
          'Two years of building Aqua Slash.',
          'Seven communities.',
          'And finally, a decision to create something of his own.',
        ],
      },
      {
        id: 'ch15-p3',
        panelNumber: 3,
        sceneId: 'ch15-p3',
        locationTag: 'A CONNECTION WITH WATER • ONE PHILOSOPHY',
        narratorCaption: 'Six Stages. Eighteen Levels. One Hundred and Eight Drops. One Philosophy.',
        speechBubble: {
          speaker: 'AQUA SLASH',
          text: 'SIX STAGES. EIGHTEEN LEVELS. ONE HUNDRED AND EIGHT DROPS. ONE PHILOSOPHY.',
          type: 'shout',
        },
        sfx: { text: '6 × 18 × 108', color: '#0EA5E9' },
        storyLines: [
          'He didn\'t have every answer.',
          'He didn\'t have everything figured out.',
          'But he had something that had stayed with him since childhood: a connection with water and a reason to keep moving forward.',
          'Aqua Slash was no longer just about teaching people to swim.',
          'It was about creating a journey — from the first Drop of confidence to the final stage of progress.',
          'SIX STAGES.',
          'EIGHTEEN LEVELS.',
          'ONE HUNDRED AND EIGHT DROPS.',
          'ONE PHILOSOPHY.',
        ],
      },
      {
        id: 'ch15-p4',
        panelNumber: 4,
        sceneId: 'ch15-p4',
        locationTag: 'THE END OF THE BEGINNING • NOW HIS HAND REACHES OUT',
        narratorCaption: 'His story began with a hand in the water. Now he builds a world of his own, one Drop at a time.',
        speechBubble: {
          speaker: 'AQUA SLASH',
          text: 'CUT THROUGH FEAR OF WATER. ONE DROP AT A TIME. — THE END OF THE BEGINNING.',
          type: 'shout',
        },
        sfx: { text: 'ONE DROP AT A TIME!', color: '#F59E0B' },
        storyLines: [
          'AQUA SLASH',
          'CUT THROUGH FEAR OF WATER.',
          'ONE DROP AT A TIME.',
          'The boy\'s story began with a hand in the water.',
          'Now, he was building a world of his own, one Drop at a time.',
          'THE END OF THE BEGINNING.',
        ],
      },
    ],
  },
];

export interface AquaStageInfo {
  stageNumber: number;
  name: 'GLASS' | 'POOL' | 'POND' | 'LAKE' | 'RIVER' | 'OCEAN';
  tagline: string;
  storyEcho: string;
  color: string;
  borderHex: string;
  levels: {
    levelNumber: number;
    levelTitle: string;
    drops: { dropNumber: number; globalDropNumber: number; title: string; focus: string }[];
  }[];
}

const STAGE_BLUEPRINTS: {
  name: 'GLASS' | 'POOL' | 'POND' | 'LAKE' | 'RIVER' | 'OCEAN';
  tagline: string;
  storyEcho: string;
  color: string;
  borderHex: string;
  levelThemes: [string, string, string];
  skillRoots: [string, string, string, string, string, string];
}[] = [
  {
    name: 'GLASS',
    tagline: 'First Touch & Water Comfort — Dissolving Fear at the First Sip of Water',
    storyEcho: 'Inspired by the boy’s first question on the riverbank: "How could he learn to swim?"',
    color: 'from-sky-400 to-cyan-500',
    borderHex: '#38BDF8',
    levelThemes: ['Water Greeting & Calm', 'Breath & Bubble Control', 'Buoyant Trust & Balance'],
    skillRoots: [
      'Calm Water Entry & Grip Release',
      'Chin-to-Surface Comfort Dip',
      'Rhythmic Exhale Bubble Stream',
      'Full Face Submersion & Blink',
      'Assisted Starfish Back Float',
      'Vertical Bobbing & Safe Recovery Stand',
    ],
  },
  {
    name: 'POOL',
    tagline: 'Structured Foundations — Gliding & Kicking Between Clear Lanes',
    storyEcho: 'Inspired by stepping into the Olympic-standard pool at SSN College, Narasaraopet.',
    color: 'from-cyan-500 to-blue-500',
    borderHex: '#06B6D4',
    levelThemes: ['Streamline Push & Glide', 'Propulsive Flutter Kick', 'Rhythmic Side Breathing'],
    skillRoots: [
      'Torpedo Wall Push & Streamline Arrow',
      'Prone Flutter Kick with Board',
      'Supine Back Glide & Steady Kick',
      'Single-Arm Catch & Pull Drill',
      'Bilateral Roll & Pocket Breath',
      '15m Unassisted Foundation Swim',
    ],
  },
  {
    name: 'POND',
    tagline: 'Deepening Confidence — Treading, Sculling & Multi-Stroke Control',
    storyEcho: 'Inspired by the residential community pools where families build lifelong water safety.',
    color: 'from-teal-500 to-emerald-500',
    borderHex: '#14B8A6',
    levelThemes: ['Deep-End Poise & Treading', 'Backstroke & Breaststroke Timing', 'Underwater Orientation'],
    skillRoots: [
      '60-Second Calm Treading Water',
      'Figure-Eight Hand Sculling Float',
      'Backstroke Continuous Windmill Cadence',
      'Breaststroke Whip Kick & Glide',
      'Surface Dive & Floor Touch Retrieval',
      'Rollover Safety Transition (Front-to-Back)',
    ],
  },
  {
    name: 'LAKE',
    tagline: 'Endurance & Spatial Mastery — Expanding Distance with Effortless Rhythm',
    storyEcho: 'Inspired by the sunlit village lake where childhood curiosity met open water.',
    color: 'from-blue-500 to-indigo-500',
    borderHex: '#3B82F6',
    levelThemes: ['Sustained Lap Pacing', 'Four-Stroke Coordination', 'Turns & Underwater Breakouts'],
    skillRoots: [
      '100m Continuous Rhythm Freestyle',
      'Dolphin Undulation Core Kick',
      'Breaststroke Pull-Breath-Kick-Glide',
      'Open Turn & Tumble Turn Mechanics',
      'Underwater Streamline Dolphin Breakout',
      'Sighting & Straight-Line Pacing Control',
    ],
  },
  {
    name: 'RIVER',
    tagline: 'Power, Current & Competitive Speed — Mastering Dynamic Water Forces',
    storyEcho: 'Transforming the childhood river that once swept him away into a stage of strength.',
    color: 'from-indigo-500 to-purple-500',
    borderHex: '#6366F1',
    levelThemes: ['Explosive Starts & Sprints', 'High-Tempo Stroke Efficiency', 'Water Safety & Self-Rescue Mastery'],
    skillRoots: [
      'Track-Start Dive & Clean Entry',
      'High-Elbow Power Catch Acceleration',
      'Full Butterfly Rhythm & Recovery',
      '200m Individual Medley Transition',
      'Fully Clothed Survival Float & Swim',
      'Reach-and-Throw Water Safety Awareness',
    ],
  },
  {
    name: 'OCEAN',
    tagline: 'Complete Water Freedom — The 108th Drop of Fearless Mastery',
    storyEcho: 'The ultimate horizon: cutting through fear of water, one Drop at a time.',
    color: 'from-amber-500 to-orange-500',
    borderHex: '#F59E0B',
    levelThemes: ['Distance Endurance Flow', 'Peak Technique & Hydrodynamics', 'Ambassador of the Water'],
    skillRoots: [
      '400m+ Effortless Distance Cruise',
      'Negative-Split Race Strategy Pacing',
      'Precision Stroke Count Optimization',
      'Deep-Water Calm & Energy Conservation',
      'Peer Mentoring & Water Safety Leadership',
      'The 108th Drop: Complete Aquatic Mastery',
    ],
  },
];

export const AQUA_SLASH_STAGES: AquaStageInfo[] = STAGE_BLUEPRINTS.map((bp, stageIdx) => {
  const stageNumber = stageIdx + 1;
  return {
    stageNumber,
    name: bp.name,
    tagline: bp.tagline,
    storyEcho: bp.storyEcho,
    color: bp.color,
    borderHex: bp.borderHex,
    levels: bp.levelThemes.map((levelTitle, levelIdx) => {
      const levelNumber = levelIdx + 1;
      return {
        levelNumber,
        levelTitle,
        drops: bp.skillRoots.map((rootTitle, dropIdx) => {
          const dropNumber = dropIdx + 1;
          const globalDropNumber = stageIdx * 18 + levelIdx * 6 + dropNumber;
          return {
            dropNumber,
            globalDropNumber,
            title: `${bp.name} L${levelNumber}•D${dropNumber}: ${rootTitle}`,
            focus: `Stage ${stageNumber} (${bp.name}) • Level ${levelNumber} (${levelTitle}) • Drop #${globalDropNumber} of 108`,
          };
        }),
      };
    }),
  };
});
