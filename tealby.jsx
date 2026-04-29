const { useState, useEffect, useRef } = React;

// ============================================================
// THREAD SYSTEM
// 20 = fully herself. 0 = lost to Tealby.
// Never shown as a number. Prose shifts. Bar shifts colour.
// Gains are scarce — only earned by noticing something genuinely wrong.
// ============================================================
const MAX_THREAD = 20;
const T = {
  GAIN_LG: 2, GAIN_MD: 1, GAIN_SM: 0,
  DRAIN_LG: -5, DRAIN_MD: -4, DRAIN_SM: -1,
};

function threadTone(t) {
  if (t > 13) return "high";
  if (t > 6)  return "mid";
  return "low";
}

// ============================================================
// NICO REACTIONS
// ============================================================
const NICO = {
  neutral: "",
  alert: "Nico's ears are forward. He's watching something you can't see.",
  wag: "Nico's tail sweeps back and forth. He pushes his long nose into your hand.",
  snarl: "A low sound rises in Nico's throat. Not quite a growl. Not quite nothing.",
  cower: "Nico presses himself against the backs of your legs and will not move forward.",
  ignore: "Nico moves through the crowd without acknowledging a soul. They don't exist to him.",
};

// ============================================================
// SCENES
// Choice types:
//   "examine"  — loops back to returnTo scene
//   "toedip"   — minor drain, reveals something true, loops back
//   "progress" — advances the story
// ============================================================
const SCENES = {

  // ── OPENING ──────────────────────────────────────────────
  opening: {
    nico: "neutral",
    image: "https://raw.githubusercontent.com/Willbyshan/tealby-assets/main/bedroomscene1.png",
    prose: {
      high: [
        "Light first. Warm and golden, the kind that comes through thin curtains on a summer morning.",
        "Then weight — something pressed against your legs. Solid. Warm. Breathing slowly.",
        "Nico.",
        "You open your eyes.",
        "The ceiling above you is low and beamed, plaster painted a soft cream between the timbers. A small window. Floral curtains. A bedside table with a glass of water you don't remember pouring.",
        "You sit up.",
        "The room is a bedroom — pretty, old-fashioned, the kind you'd find in a countryside B&B. A wardrobe. A small mirror. Your bag on the chair in the corner, placed there carefully.",
        "Nico lifts his head. His dark eyes find yours. His white chest patch rises and falls.",
        "You have no memory of arriving here.",
      ],
      mid: [
        "Such a lovely light. The kind that makes everything feel like a postcard.",
        "Something warm against your legs — Nico, of course. He always finds you.",
        "You open your eyes slowly.",
        "A beautiful little room. Low beams, cream plaster, floral curtains letting in that gorgeous golden morning. A glass of water on the bedside table — thoughtful.",
        "Your bag is on the chair in the corner, neatly placed.",
        "Nico raises his head and looks at you with those steady dark eyes.",
        "You feel, somehow, like you've woken up exactly where you should be.",
      ],
      low: [
        "What a beautiful morning.",
        "Nico is curled against your feet like he always is, like he's always been here, like this room has always been yours.",
        "You stretch and look around at the sweet little bedroom and feel a deep, uncomplicated contentment.",
        "Of course you're here. Where else would you be?",
      ],
    },
    choices: [
      {
        id: "examine_nico", type: "examine", next: "examine_nico",
        label: "Check on Nico",
        thread: T.GAIN_SM,
      },
      {
        id: "examine_room", type: "examine", next: "examine_room",
        label: "Look around the room",
      },
      {
        id: "examine_water", type: "examine", next: "examine_water",
        label: "Inspect the glass of water",
        hideIfConsumed: "water",
      },
      {
        id: "toedip_water", type: "toedip", next: "toedip_water",
        label: "Take a sip of the water",
        thread: T.DRAIN_SM,
        consumable: "water",
      },
      {
        id: "drink_water", type: "progress", next: "drank_water",
        label: "Drink the water",
        thread: T.DRAIN_MD,
        consumable: "water",
      },
      {
        id: "progress_window", type: "progress", next: "window",
        label: "Go to the window",
        thread: 0,
      },
    ],
  },

  // ── EXAMINE: NICO ────────────────────────────────────────
  examine_nico: {
    nico: "alert",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "You reach down and run your hand along Nico's flank. He's warm. Real. His ribs expand and contract under your palm.",
        "He doesn't relax at your touch the way he usually does — that immediate melting into your hand. Instead he stays upright, watching the door.",
        "His white toes are tucked neatly beneath him. His tail is still.",
        "He's not frightened. He's paying attention.",
        "That means you should be too.",
      ],
      mid: [
        "Nico shifts as you reach for him, pressing his long nose briefly against your wrist.",
        "He seems calm — that quiet dignity greyhounds carry everywhere.",
        "His white chest patch catches the morning light.",
        "Everything seems fine.",
      ],
      low: [
        "Good boy. He's always here. He's always fine.",
        "You stroke his silky black head and he leans into your hand.",
      ],
    },
  },

  // ── EXAMINE: ROOM ────────────────────────────────────────
  examine_room: {
    nico: "neutral",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "The room is small and considered. Everything in its right place — too much in its right place, like a stage set between performances.",
        "Your bag contains your things. Your actual things — charger, headphones, your work lanyard still clipped to the inside pocket. Someone packed for you, or you packed and don't remember it.",
        "Your phone has no signal. Not low signal. None at all. The icon where the bars should be shows nothing.",
        "On the dresser, propped against the mirror: a notecard. Cream paper, copperplate handwriting.",
        "It reads: Lovely to have you back, Sarah. Breakfast is at eight. We are so glad you've come home.",
        "You have never been here before in your life.",
      ],
      mid: [
        "A lovely room. Everything just so.",
        "Your bag is here with all your things. Your phone has no signal — these old villages can be like that.",
        "There's a notecard on the dresser. Lovely to have you back, Sarah. Breakfast is at eight.",
        "Back. That's a funny word to use.",
        "...Isn't it?",
      ],
      low: [
        "Everything is just right. Your bag, your things, the little notecard.",
        "Lovely to have you back, Sarah. Yes. Back. That feels right.",
      ],
    },
    gainHigh: "You fold the notecard and pocket it. Evidence of something you can't name yet.",
    threadHigh: T.GAIN_SM,
  },

  // ── EXAMINE: WATER ───────────────────────────────────────
  examine_water: {
    nico: "neutral",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "You pick it up and hold it to the light. Clear. No sediment. No colour.",
        "You bring it to your nose.",
        "It smells of nothing. Absolutely nothing — not even the faint mineral absence-of-smell that tap water has. Just void, shaped like a glass of water.",
        "A name surfaces from somewhere in your memory, quiet and unbidden.",
        "_Aqua Tofana.",
        "Did you hear that? Or think it?",
        "You set the glass back on the nightstand.",
        "Nico watches you do it. His tail does not move.",
      ],
      mid: [
        "You pick it up. Clear. Looks fine.",
        "You bring it to your nose out of habit.",
        "Nothing. No smell at all.",
        "You put it down. You're not really thirsty.",
      ],
      low: [
        "You pick it up and put it down again for no reason you can name.",
        "It's just water.",
      ],
    },
    revealHigh: "The water smells of nothing at all. That is not normal.",
  },

  // ── TOE DIP: WATER ───────────────────────────────────────
  toedip_water: {
    nico: "neutral",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "Just a sip. Testing.",
        "It tastes of nothing. Clean — aggressively clean. Like the idea of water rather than water itself. A void with a temperature.",
        "You hold it in your mouth for a moment before swallowing.",
        "Nico's head comes up from the bed. He watches with concern as you swallow, a strained whine barely audible.",
        "You set it back on the nightstand.",
      ],
      mid: [
        "Cold. Clean. Fine.",
        "You put it down. Nico shifts beside you.",
        "Everything is fine.",
      ],
      low: [
        "Refreshing. You almost drink the rest.",
      ],
    },
    revealHigh: "It tastes of nothing. Not even water tastes of nothing.",
  },

  // ── DRANK WATER (PROGRESS) ───────────────────────────────
  drank_water: {
    nico: "neutral",
    prose: {
      high: [
        "You drink it in four long swallows, Nico whimpering and jumping off the bed midway through your gulps.",
        "It tastes of nothing. Clean and cold yet unsatisfying.",
        "You set the empty glass down.",
        "Nico is watching you from the floor. Very still. His white chest patch rises and falls.",
        "You don't feel so good. A little nauseous even. A little bit of your usual sharp focus seemed to chip away with each gulp.",
      ],
      mid: [
        "Delicious, actually. Crisp and cold and exactly what you needed.",
        "You drain the glass and feel immediately more settled. More here.",
        "What a lovely little room.",
      ],
      low: [
        "Perfect. Everything here is just perfect.",
      ],
    },
    choices: [
      {
        id: "examine_nico_drank", type: "examine", next: "examine_nico",
        label: "Check on Nico",
        thread: T.GAIN_SM,
      },
      {
        id: "examine_room_drank", type: "examine", next: "examine_room",
        label: "Look around the room",
      },
      {
        id: "progress_window_drank", type: "progress", next: "window",
        label: "Go to the window",
        thread: 0,
      },
    ],
  },

  // ── WINDOW ───────────────────────────────────────────────
  window: {
    nico: "alert",
    prose: {
      high: [
        "You pull back the curtain.",
        "A village. Cobbled streets, honey-coloured stone, window boxes overflowing with late summer flowers. A green in the centre with a great oak tree. Bunting strung between lampposts — red and gold.",
        "People move below. Setting up stalls, carrying crates, arranging things on trestle tables with quiet focused energy.",
        "It is objectively one of the most beautiful places you have ever seen.",
        "It is also completely silent. You can see mouths moving, people laughing, a child running — but through the glass, not a sound reaches you. Like watching a film with the audio stripped out.",
        "Morning air drifts up through the gap at the sill.",
        "It carries the smell of cut grass.",
        "It smells wonderful.",
        "Wait — what? It smells *wonderful*? That doesn't sound right. You hate that smell.",
        "You stand very still for a moment.",
        "Nico puts his front paws on the windowsill beside you. His ears are forward.",
        "A sign on the green reads: FINCHWICK FAIR — TOMORROW.",
      ],
      mid: [
        "Oh.",
        "What an absolutely gorgeous village. Cobblestones, honey stone, window boxes, bunting — the kind of place you'd see on a calendar and assume wasn't real.",
        "People bustle about below, setting up for what looks like a fair. FINCHWICK FAIR — TOMORROW, reads a sign on the green.",
        "Morning air drifts up through the window. Something grassy and fresh.",
        "Lovely.",
        "Nico stands beside you at the window. His tail sways once.",
        "You feel a rush of something warm. You're glad you're here.",
      ],
      low: [
        "Beautiful. Of course it's beautiful.",
        "The fair tomorrow. You'd almost forgotten.",
        "The morning air smells gorgeous. Everything here smells gorgeous.",
        "Nico looks down at the street with you and you feel you could stay here forever.",
      ],
    },
    choices: [
      {
        id: "try_remember", type: "examine", next: "memory_attempt",
        label: "Try to remember how you got here",
        thread: T.GAIN_MD,
      },
      {
        id: "progress_downstairs", type: "progress", next: "downstairs",
        label: "Get dressed and go downstairs",
        thread: 0,
      },
    ],
  },

  // ── EXAMINE: GRASS SMELL ─────────────────────────────────
  examine_grass: {
    nico: "alert",
    isExamine: true,
    returnTo: "window",
    prose: {
      high: [
        "You stand at the window and breathe in.",
        "Cut grass. That's the smell. Fresh, green, the specific sweetness of a summer lawn newly mown.",
        "You have hated that smell since you were seven years old. Something about it has always turned your stomach — not violently, just consistently, reliably. A small private fact about yourself you've never been able to explain.",
        "You love it right now.",
        "That is not right. That is not you.",
        "Nico's ears haven't moved.",
        "You wonder what else here has been decided for you.",
      ],
      mid: [
        "Cut grass. Clean and fresh.",
        "You breathe it in and feel calm.",
        "There's something at the back of your mind — a vague sense that this smell usually bothers you somehow.",
        "But that can't be right. It's lovely.",
      ],
      low: [
        "Beautiful morning. Beautiful smell.",
        "Everything here is exactly right.",
      ],
    },
    revealHigh: "You hate cut grass. You always have. Someone here doesn't know that.",
  },

  // ── MEMORY ATTEMPT ───────────────────────────────────────
  memory_attempt: {
    nico: "neutral",
    isExamine: true,
    returnTo: "window",
    prose: {
      high: [
        "You sit on the edge of the bed and close your eyes.",
        "Yesterday. What happened yesterday?",
        "You were at home. You remember that clearly. The purple light. Brad Mondo on the telly. Nico's paws twitching, accompanied by little quiet boofs.",
        "And then.",
        "Nothing. Not a gap, not a blur — nothing. Like a page torn cleanly out of a book. One moment home, and now here, and the space between them is simply absent.",
        "Your chest tightens.",
        "Nico leans his full weight against your side.",
      ],
      mid: [
        "You try. You close your eyes and reach back.",
        "Home. The purple light. Brad Mondo. Nico boofing in his sleep.",
        "And then here. Which doesn't quite make sense, but the village is so lovely it's hard to feel properly worried.",
        "You'll work it out.",
        "Nico nudges your hand.",
      ],
      low: [
        "It doesn't matter. You're here now.",
        "Nico pushes his nose into your palm and you smile.",
      ],
    },
  },

  // ── DOWNSTAIRS ───────────────────────────────────────────
  downstairs: {
    nico: "snarl",
    nicoNote: "The sound is very low. Mrs. Hobson does not react to it.",
    prose: {
      high: [
        "The stairs creak pleasantly underfoot. The hallway below is papered in a small floral print — roses, faded to blush. A grandfather clock ticks in the corner.",
        "The front door is open. Morning air drifts in, carrying the smell of something baked and beneath it, faintly, cut grass.",
        "It still smells pleasant. It shouldn't.",
        "A woman appears from the kitchen, wiping her hands on an apron. Perhaps sixty, round-faced, bright eyes, and the kind of smile that arrives a fraction too quickly.",
        "— Sarah! she says, as though she's been expecting you all along. You look wonderful. Did you sleep well? You always sleep so well here.",
        "You have never met this woman before.",
        "Her name, embroidered on the apron in cheerful yellow thread: Hobson.",
      ],
      mid: [
        "Lovely hallway. The smell of baking drifts from the kitchen, and something green and fresh from outside.",
        "A woman bustles out — perhaps sixty, warm smile, apron embroidered Hobson.",
        "— Sarah! she beams. You look wonderful. Did you sleep well? You always sleep so well here.",
        "You feel immediately at ease. She has that quality.",
        "Nico is quiet at your side.",
      ],
      low: [
        "Mrs. Hobson. Of course. She's always here in the mornings.",
        "— Sarah! You look wonderful.",
        "You smile back. You always smile back.",
      ],
    },
    choices: [
      {
        id: "examine_clock", type: "examine", next: "examine_clock",
        label: "Glance at the grandfather clock",
      },
      {
        id: "examine_photos", type: "examine", next: "hallway_photos",
        label: "Look at the photographs on the wall",
        thread: T.GAIN_MD,
      },
      {
        id: "ask_where", type: "examine", next: "hobson_where",
        label: "\"I'm sorry — where exactly am I?\"",
        thread: T.GAIN_MD,
      },
      {
        id: "ask_always", type: "examine", next: "hobson_always",
        label: "\"What do you mean, I always sleep well here?\"",
        thread: T.GAIN_LG,
      },
      {
        id: "greet_toedip", type: "toedip", next: "hobson_pause",
        label: "Smile — but say nothing yet",
        thread: T.DRAIN_SM,
      },
      {
        id: "progress_breakfast", type: "progress", next: "breakfast",
        label: "Say good morning and follow her to breakfast",
        thread: 0,
      },
    ],
  },

  // ── EXAMINE: CLOCK ───────────────────────────────────────
  examine_clock: {
    nico: "neutral",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "Eight fourteen. The second hand moves. The clock ticks.",
        "Normal. Perfectly normal.",
        "You look away. Then back.",
        "Eight fourteen.",
        "The second hand is still moving. The clock is still ticking.",
        "Eight fourteen.",
      ],
      mid: [
        "Eight fourteen. A lovely old clock.",
        "You look away and back.",
        "Still eight fourteen. These old clocks can stick.",
      ],
      low: [
        "Eight fourteen. Time for breakfast.",
      ],
    },
    revealHigh: "The clock is ticking. The time is not changing.",
  },

  // ── EXAMINE: PHOTOS ──────────────────────────────────────
  hallway_photos: {
    nico: "alert",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "The wall is lined with framed photographs. Village scenes — the fair, the green, groups of people smiling in sunshine. Decades of them.",
        "You scan them. And then you stop.",
        "Near the bottom of the stairs — slightly smaller than the others, slightly older — a woman stands at the edge of a crowd. Brown hair with lighter ends, catching the sun. Your approximate height.",
        "Your stomach does something unpleasant.",
        "The photograph is faded. The woman is half-turned away. You cannot be certain.",
        "But the dog beside her is black with a white chest patch, and he is looking directly at the camera with the steadiness of a creature that knows exactly what is happening.",
        "You look down at Nico.",
        "Nico looks up at you.",
        "— Sarah? Hobson calls from the kitchen. Eggs are ready, dear.",
      ],
      mid: [
        "Lovely old photographs of the village.",
        "One near the bottom catches your eye — a woman at the edge of a crowd, a black dog at her side.",
        "Brown hair. Could be anyone, really.",
        "— Sarah? Hobson calls. Breakfast.",
      ],
      low: [
        "Pretty pictures. The village always photographs well.",
        "— Coming! you call.",
      ],
    },
    gainHigh: "You photograph the photograph on your phone. No signal — but the camera still works.",
    threadHigh: T.GAIN_SM,
  },

  // ── HOBSON: WHERE ────────────────────────────────────────
  hobson_where: {
    nico: "snarl",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "Something flickers across Hobson's face. Fast — gone before you can name it. Then the smile is back, full wattage.",
        "— Why, Tealby, dear. She says it like you've asked the colour of the sky. Same as always. You really did sleep deeply, didn't you?",
        "She says the name the way you'd say home. Warm. Proprietorial.",
        "— Come and have some breakfast. Everything makes more sense after breakfast.",
      ],
      mid: [
        "— Tealby, dear, she says cheerfully. You always ask that when you first wake up. Come and eat.",
        "More yourself. You turn the phrase over.",
        "She's already heading back to the kitchen.",
      ],
      low: [
        "— Tealby, silly. She laughs. Come and eat.",
        "Of course. Tealby.",
      ],
    },
  },

  // ── HOBSON: ALWAYS ───────────────────────────────────────
  hobson_always: {
    nico: "snarl",
    nicoNote: "Nico's low sound hasn't stopped.",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "Hobson tilts her head. The smile doesn't move.",
        "— Well, you've always been a wonderful sleeper here, dear. Since your very first visit.",
        "— My first visit, you repeat.",
        "— Mm. She turns back to the kitchen. Come on then. The eggs won't stay warm.",
        "She says it with such finality that it takes you a moment to notice she hasn't answered anything at all.",
      ],
      mid: [
        "— Oh, you know. You've always settled in so well here. Now come on — breakfast.",
        "She bustles away at exactly the right moment.",
      ],
      low: [
        "She laughs warmly. — Come and eat, dear.",
        "You follow her.",
      ],
    },
  },

  // ── HOBSON PAUSE (TOE DIP) ───────────────────────────────
  hobson_pause: {
    nico: "snarl",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "You smile and say nothing.",
        "Hobson waits. A beat longer than she should need to. She is waiting for a specific response — like a line in a script she expects you to know.",
        "When it doesn't come, her smile adjusts. Barely perceptibly.",
        "— Come and have some breakfast, dear. You look like you need it.",
        "You've watched enough true crime to know what it means when warmth doesn't reach someone's eyes.",
      ],
      mid: [
        "She waits just a moment. When you don't speak, she carries on.",
        "— Breakfast, then. Come on.",
      ],
      low: [
        "She smiles. You smile. Everything is fine.",
      ],
    },
    revealHigh: "She was waiting for a specific response. Like she expected a script you don't have.",
  },

  // ── BREAKFAST ────────────────────────────────────────────
  breakfast: {
    nico: "neutral",
    prose: {
      high: [
        "The kitchen is warm and smells of toast and something richer underneath — herbs, or something older than herbs.",
        "A small table by the window, laid for one. Scrambled eggs. Toast with butter. A pot of tea. A glass of orange juice so deeply, saturatedly orange it looks almost painted.",
        "Hobson moves around the kitchen with the efficiency of someone who has done this a thousand times. She doesn't look at you while she talks.",
        "— The fair's tomorrow, of course. Mr. Keyes has been helping with the setup since dawn — you know how particular he is.",
        "She says it as though you do know.",
        "Nico lies under your chair. Pressed against your feet. Not relaxed.",
      ],
      mid: [
        "A perfect little breakfast. Eggs, toast, tea.",
        "Hobson chatters warmly about the fair tomorrow, about Mr. Keyes helping with the setup.",
        "You find yourself relaxing into it. The kitchen is so warm.",
        "Nico is under your chair.",
      ],
      low: [
        "Lovely breakfast. Lovely kitchen. Hobson's voice washes over you like warm water.",
        "Tomorrow the fair. How wonderful.",
      ],
    },
    choices: [
      {
        id: "examine_eggs", type: "examine", next: "examine_eggs",
        label: "Look at the eggs",
      },
      {
        id: "examine_juice", type: "examine", next: "examine_juice",
        label: "Look at the orange juice",
      },
      {
        id: "examine_kitchen", type: "examine", next: "examine_kitchen",
        label: "Look around the kitchen",
        thread: T.GAIN_SM,
      },
      {
        id: "ask_keyes", type: "examine", next: "hobson_keyes",
        label: "\"Who is Mr. Keyes?\"",
        thread: T.GAIN_SM,
      },
      {
        id: "toedip_eggs", type: "toedip", next: "toedip_eggs",
        label: "Try one small forkful of the eggs",
        thread: T.DRAIN_SM,
      },
      {
        id: "progress_eat_all", type: "progress", next: "ate_everything",
        label: "Eat everything — you're hungry",
        thread: T.DRAIN_LG,
        consumable: "breakfast",
      },
      {
        id: "progress_eat_toast", type: "progress", next: "ate_toast",
        label: "Just have the toast and tea",
        thread: T.GAIN_SM,
        consumable: "breakfast",
      },
    ],
  },

  // ── EXAMINE: EGGS ────────────────────────────────────────
  examine_eggs: {
    nico: "neutral",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "Soft, perfectly set, flecked with something green — chives, you think.",
        "They smell wonderful. Exactly as eggs should smell.",
        "Under the table, Nico's nose appears briefly at your knee. He sniffs once toward the plate.",
        "Then he withdraws. Lies back down.",
        "Nico will eat anything. He's eaten week-old pesto pasta from a bin bag.",
        "He's not interested in the eggs.",
        "A moment later, his nose reappears — nudging toward the toast rack instead. His tail moves once.",
        "Make of that what you will.",
      ],
      mid: [
        "They look lovely. Soft and perfectly made.",
        "Nico's nose appears at your knee for a moment — sniffs toward the plate, then pulls back.",
        "Odd. He usually begs shamelessly.",
        "He does seem interested in the toast, though.",
      ],
      low: [
        "They look delicious.",
      ],
    },
    revealHigh: "Nico sniffed the eggs and walked away. Nico does not walk away from food.",
  },

  // ── EXAMINE: JUICE ───────────────────────────────────────
  examine_juice: {
    nico: "neutral",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "You pick up the glass.",
        "The colour is extraordinary — deep, saturated, more orange than any juice you've ever poured yourself. Like a photograph with the contrast turned too far up.",
        "You tilt it. It moves thickly.",
        "Across the kitchen, a woman sits at a small side table. She has been there since you arrived. You haven't heard her say a single word.",
        "Her glass of orange juice looks exactly the same as yours.",
        "Her glass has not emptied.",
      ],
      mid: [
        "Very orange. Probably freshly squeezed.",
        "There's a woman at a table near the wall. Didn't notice her before. She has the same juice.",
        "Hasn't touched it, by the looks of things.",
      ],
      low: [
        "Lovely colour. Very fresh looking.",
      ],
    },
    revealHigh: "The woman at the side table has been here since you arrived. Her glass has not moved.",
  },

  // ── EXAMINE: KITCHEN ─────────────────────────────────────
  examine_kitchen: {
    nico: "alert",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "A well-kept kitchen. Copper pots. Dried herbs hanging from a beam. A calendar on the wall — the same date circled in red, over and over.",
        "On the shelf above the range: a row of small bottles. Dark glass. No labels.",
        "A recipe book on the counter, spine cracked with use. You can just make out the name handwritten inside the front cover from where you're sitting.",
        "Giulia.",
        "Just the one name. No surname.",
      ],
      mid: [
        "A lovely kitchen. Copper pots, drying herbs, very homely.",
        "Some small dark bottles on the shelf above the range. Spices, probably.",
        "A well-used recipe book. A name written inside — you can't quite read it from here.",
      ],
      low: [
        "A very nice kitchen. Warm and familiar.",
      ],
    },
    gainHigh: "Giulia. You file the name quietly away.",
    threadHigh: T.GAIN_SM,
  },

  // ── TOE DIP: EGGS ────────────────────────────────────────
  toedip_eggs: {
    nico: "alert",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "Just a forkful. Testing.",
        "The eggs are extraordinary. That's the only word — extraordinary. Rich and warm and somehow more than eggs. The taste doesn't so much land as arrive, filling something you didn't know was empty.",
        "You put the fork down.",
        "Under the table, Nico is whining and pawing at your knees.",
        "You push the plate slightly away.",
        "Hobson, back turned, doesn't notice.",
      ],
      mid: [
        "Delicious. Really remarkable, actually.",
        "Nico's head is up under the table, which is odd — Nico will eat anything.",
        "He's not interested in the eggs.",
        "You eat a little more anyway.",
      ],
      low: [
        "Delicious. You eat the rest happily.",
      ],
    },
    revealHigh: "Nico watched the fork go to your mouth. Not the food. The fork. He doesn't want you to eat it.",
  },

  // ── HOBSON ON KEYES ──────────────────────────────────────
  hobson_keyes: {
    nico: "snarl",
    nicoNote: "Nico's ears go flat at the name.",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "Hobson pauses at the counter. Just for a moment.",
        "— Mr. Keyes. She says it carefully, the way you'd handle something delicate. He helps keep things running smoothly. Very dedicated. Very thorough.",
        "— He'll be glad you're here, she adds. He always makes a point of meeting our guests.",
        "She resumes wiping the counter. The subject, apparently, is closed.",
        "Under the table, Nico has not stopped making his sound.",
        "Very dedicated. Very thorough. You turn the words over. They are not warm words, dressed in a warm tone.",
      ],
      mid: [
        "— Mr. Keyes. He helps keep things running. Very thorough man.",
        "— He'll want to meet you, she adds.",
        "Nico shifts under your chair.",
      ],
      low: [
        "— Mr. Keyes. Very helpful. You'll meet him soon enough.",
        "You nod and eat your breakfast.",
      ],
    },
  },

  // ── ATE EVERYTHING ───────────────────────────────────────
  ate_everything: {
    nico: "neutral",
    prose: {
      high: [
        "You gobble up everything and gulp down the orange juice. You didn't realise how hungry you were. In fact you could swear you weren't that hungry — but once you start you cannot stop.",
        "Afterwards the sharp unease of waking in an unknown room has softened considerably. The village outside looks less strange and more lovely. The notecard in your pocket feels less significant somehow.",
        "Hobson collects your plate with a pleased smile.",
        "— There. That's better, isn't it.",
        "It isn't a question.",
      ],
      mid: [
        "Wonderful breakfast. You feel much better — grounded, calm, settled.",
        "Hobson beams as she clears the plate.",
        "— There. That's better, isn't it.",
        "It really is.",
      ],
      low: [
        "Perfect. Everything here is just perfect.",
        "— There. That's better. Hobson smiles.",
        "Yes. Much better.",
      ],
    },
    choices: [
      {
        id: "progress_outside", type: "progress", next: "ch1_end",
        label: "Head outside into the village",
        thread: 0,
      },
    ],
  },

  // ── ATE TOAST ────────────────────────────────────────────
  ate_toast: {
    nico: "neutral",
    prose: {
      high: [
        "The toast is fine. Normal. The tea is good.",
        "You eat and watch Hobson move around her kitchen and try to think clearly.",
        "Something is wrong here. The notecard. The photograph. The way she talks about you as though she has a full catalogue of Sarah-facts maintained for years.",
        "You need to get outside. Find someone who can tell you something true.",
      ],
      mid: [
        "Nice toast. Good tea. Maybe you were overthinking things.",
        "Hobson seems kind. The village looks lovely. The morning air smells wonderful.",
        "You should get outside and explore.",
      ],
      low: [
        "Fine. You'll get outside and enjoy the morning.",
      ],
    },
    choices: [
      {
        id: "progress_outside", type: "progress", next: "ch1_end",
        label: "Head outside",
        thread: 0,
      },
    ],
  },

  // ── CHAPTER 1 END ────────────────────────────────────────
  ch1_end: {
    nico: "alert",
    isChapterEnd: true,
    chapterEndText: "Chapter Two — The Fair",
    prose: {
      high: [
        "You step out of the B&B into the morning.",
        "The village of Tealby surrounds you — golden stone, cobbles, the smell of something sweet drifting from a nearby stall.",
        "And cut grass. Still sweet. Still wrong.",
        "Nico walks at your heel. Close. His white toes click softly on the cobblestones.",
        "The bunting snaps gently in a breeze you can't quite feel on your skin.",
        "Somewhere behind you, a bell begins to ring.",
        "You turn to look at the bell tower at the far end of the square.",
        "The clock face reads eight fourteen.",
      ],
      mid: [
        "You step outside into the most beautiful village morning you've ever seen.",
        "Nico walks beside you, tail moving gently.",
        "The fair preparations bustle cheerfully all around.",
        "A bell rings somewhere. Soft and regular.",
        "You feel fine. A little soft around the edges, maybe, but fine.",
      ],
      low: [
        "Tealby in the morning. Perfect.",
        "Nico trots beside you.",
        "The bell rings and you feel it somewhere behind your sternum — familiar, welcoming.",
        "Home.",
      ],
    },
  },
  // ════════════════════════════════════════════════════════
  // CHAPTER TWO — THE FAIR
  // ════════════════════════════════════════════════════════

  // ── CH2 OPENING ──────────────────────────────────────────
  ch2_opening: {
    nico: "alert",
    prose: {
      high: [
        "The fair is in full swing.",
        "Stalls line both sides of the green, bright with bunting and hand-painted signs. The smell of hot sugar and something fried drifts across the cobblestones. Somewhere a fiddle is playing — or was. You can't hear it now.",
        "People move through it all with the unhurried ease of a perfect summer afternoon.",
        "The sign on the oak tree still reads: FINCHWICK FAIR — TOMORROW.",
        "Nobody has taken it down. Nobody is looking at it.",
        "Nico walks at your heel. His white toes click on the cobblestones. He does not look at the people.",
      ],
      mid: [
        "The fair is lovely. Bunting, stalls, the smell of something sugary on the warm air.",
        "People mill around, unhurried, content.",
        "The oak tree sign still says TOMORROW, which is a bit odd — but someone probably just forgot to change it.",
        "Nico stays close.",
      ],
      low: [
        "What a perfect fair. Everything exactly as it should be.",
        "Nico trots alongside you.",
      ],
    },
    choices: [
      { id: "ch2_stalls", type: "progress", next: "fair_hub", label: "Head into the fair", thread: 0 },
    ],
  },

  // ── FAIR HUB ─────────────────────────────────────────────
  // Dynamic choices — Bailey option injected by React based on stallsVisited
  fair_hub: {
    nico: "ignore",
    isFairHub: true,
    prose: {
      high: [
        "The fair surrounds you — noise and colour and the particular busyness of people who are not quite doing anything.",
        "A villager drifts past your shoulder.",
        "— Lovely day for it, they say, to no one.",
        "Nico doesn't look up.",
      ],
      mid: [
        "The fair hums around you. Stalls, smells, people.",
        "Someone nearby says something about it being a lovely day.",
        "Nico is uninterested in everyone.",
      ],
      low: [
        "Wonderful. Everything wonderful.",
        "Nico is beside you.",
      ],
    },
    choices: [
      { id: "visit_preserves", type: "fairvisit", next: "stall_preserves", label: "Rose & Fred's Preserves", thread: 0, stallKey: "preserves" },
      { id: "visit_sweets", type: "fairvisit", next: "stall_sweets", label: "Hindley's Sweet Stall", thread: 0, stallKey: "sweets" },
      { id: "visit_keyes", type: "fairvisit", next: "stall_keyes", label: "Keyes & Sons — General Repairs", thread: 0, stallKey: "keyes" },
      { id: "visit_green", type: "fairvisit", next: "the_green", label: "Wander over to the green", thread: 0, stallKey: "green" },
      { id: "visit_backlane", type: "fairvisit", next: "back_lane", label: "Explore the back lane", thread: 0, stallKey: "backlane" },
      // Bailey option injected dynamically in render
    ],
  },

  // ── STALL: ROSE & FRED'S PRESERVES ───────────────────────
  stall_preserves: {
    nico: "cower",
    isFairStall: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "The stall is immaculate. Rows of jars — jams, chutneys, pickles — arranged with the precision of someone who takes genuine pride in the work.",
        "Rose is behind the counter. Perhaps forty-five, soft-faced, pleasant.",
        "— Everything here is made from scratch, she says, without looking up. We don't believe in waste. Everything has a use. Everything leaves something behind.",
        "At the far end of the stall, half-hidden behind a curtain: more jars. No labels. A darker colour.",
        "Fred appears from the back. He doesn't speak. He looks at you the way you'd look at a cut of meat you were considering.",
        "Nico has pressed himself against the backs of your knees and will not move forward.",
      ],
      mid: [
        "A lovely preserves stall. Very well arranged.",
        "Rose is friendly, talks about making everything from scratch, not wasting anything.",
        "Fred appears briefly. He doesn't say anything.",
        "Nico is leaning against your legs.",
      ],
      low: [
        "What beautiful jars. Rose is so warm.",
        "Nico seems a bit reluctant to approach. Probably the smell.",
      ],
    },
    choices: [
      { id: "examine_jars", type: "examine", next: "examine_dark_jars", label: "Look at the unlabelled jars", thread: T.GAIN_MD },
      { id: "ask_rose_waste", type: "examine", next: "rose_waste", label: "\"What do you mean, everything leaves something behind?\"", thread: T.GAIN_MD },
      { id: "preserves_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: T.DRAIN_SM },
    ],
  },

  examine_dark_jars: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "You lean past the curtain.",
        "The jars are darker than the others — the contents a deep, irregular brown that doesn't look like any preserve you've seen. One has something pale suspended in it. You can't tell what.",
        "— Those aren't ready yet, Rose says, from directly behind you.",
        "You hadn't heard her move.",
        "— Every batch needs its time. She smiles. You can't rush these things.",
        "She watches you look at them. Something in her expression is patient. Expectant.",
      ],
      mid: [
        "You peek at the unlabelled ones.",
        "Something dark. Could be a chutney.",
        "— Those aren't ready yet, Rose says pleasantly.",
      ],
      low: [
        "Just some jars. Probably chutney.",
      ],
    },
    revealHigh: "She moved without sound. The jars have something pale inside them.",
    choices: [
      { id: "jar_game_start", type: "progress", next: "jar_minigame", label: "→ Try to match the jars — something about them won't let you look away", thread: 0, consumable: "jar_game" },
    ],
  },

  jar_minigame: {
    nico: "cower",
    isMiniGame: true,
    returnTo: "stall_preserves",
    winNext: "jar_win",
    loseNext: "jar_lose",
  },

  jar_win: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "The last pair turns. You feel something release — a pressure you hadn't noticed building.",
        "Rose is watching you from behind the counter. She hasn't moved.",
        "— There, she says softly. You see how it works now.",
        "She reaches under the curtain and sets one of the dark jars in front of you.",
        "— A gift. For someone who pays attention.",
        "It's heavier than it should be. You put it in your bag before you can think better of it.",
        "Nico takes one step away from you. Just one.",
      ],
      mid: [
        "You matched them all.",
        "Rose smiles and slides one of the dark jars toward you.",
        "— For paying attention, she says.",
        "You take it. Nico steps back slightly.",
      ],
      low: [ "You won. Rose gives you a jar. How nice." ],
    },
    revealHigh: "Nico stepped away from you. From you. Not from her.",
  },

  jar_lose: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "The last card turns. Wrong again.",
        "You step back from the jars. Something about looking at them too long makes your eyes feel wrong.",
        "Rose's expression doesn't change. If anything, she looks faintly amused.",
        "— Another time, perhaps, she says, and draws the curtain closed.",
        "Nico presses himself harder against your legs.",
      ],
      mid: [
        "You couldn't match them.",
        "Rose draws the curtain. — Another time, she says.",
        "Nico is still pressed against you.",
      ],
      low: [ "You lost. Rose closes the curtain." ],
    },
    gainHigh: "You looked away. Whatever was in those jars — you don't have it. That might be the right outcome.",
  },

  rose_waste: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "Rose considers the question as though it's perfectly reasonable.",
        "— Well. When something's been here — really been here, properly — it leaves an impression. Flavour, you might say. We just know how to collect it.",
        "She sets a jar of dark jam in front of you.",
        "— On the house. For coming back.",
        "Nico's low sound is continuous now.",
      ],
      mid: [
        "— Oh, nothing goes to waste here. Everything contributes something. She smiles warmly.",
        "She offers you a jar to take away.",
      ],
      low: [
        "— Everything has its purpose here. Rose smiles.",
        "How nice.",
      ],
    },
    revealHigh: "\"For coming back.\" She said coming back.",
    choices: [
      { id: "take_preserve", type: "toedip", next: "preserve_taken", label: "Take the jar", thread: T.DRAIN_MD, consumable: "rose_preserve" },
      { id: "decline_preserve", type: "examine", next: "preserve_declined", label: "Leave it on the counter", thread: T.GAIN_SM, consumable: "rose_preserve" },
    ],
  },

  preserve_taken: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "It's heavier than it looks. You slip it into your bag.",
        "Rose watches you with an expression of deep satisfaction.",
        "— Enjoy it, she says. It's best appreciated quietly. Alone.",
        "Nico backs away from you slightly. Just a step.",
      ],
      mid: [
        "You take it. It's heavy.",
        "Rose looks very pleased.",
        "Nico steps back.",
      ],
      low: [ "You take the jar. Rose smiles." ],
    },
    revealHigh: "Nico stepped away from you. Not from the stall. From you.",
  },

  preserve_declined: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "You leave it where it is.",
        "Rose's smile doesn't change. But something behind it does.",
        "— Another time, perhaps, she says.",
        "It doesn't sound like a pleasantry.",
      ],
      mid: [
        "You don't take it.",
        "Rose smiles. — Another time.",
      ],
      low: [ "You leave it. Rose nods." ],
    },
  },

  // ── STALL: HINDLEY'S SWEETS ──────────────────────────────
  stall_sweets: {
    nico: "snarl",
    isFairStall: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "The sweet stall is bright and cheerful — paper bags, glass jars of humbugs, a hand-lettered sign reading TREAT YOURSELF.",
        "Myra Hindley is behind the counter. Early fifties, warm smile, the easy manner of someone who is very good with people.",
        "Very good with children, specifically. You sense it the way you sense things about people sometimes, without knowing why.",
        "There are no children at this fair.",
        "She keeps glancing toward the edge of the green. Just for a moment. Then back to you, smile fully restored.",
        "— They're mostly for the little ones, she says, holding out a paper bag. But you can have one. We always have enough.",
        "Nico's snarl is very quiet. Very continuous.",
      ],
      mid: [
        "Cheerful sweet stall. Myra is warm, friendly — great with kids, you'd imagine.",
        "No children at the fair, now that you think about it.",
        "She offers you something from a paper bag.",
        "Nico is making a sound.",
      ],
      low: [
        "What a lovely stall. Myra is so friendly.",
        "She offers you a sweet. How kind.",
      ],
    },
    choices: [
      { id: "ask_children", type: "examine", next: "hindley_children", label: "\"Where are all the children?\"", thread: T.GAIN_MD },
      { id: "ask_edge", type: "examine", next: "hindley_edge", label: "\"What are you looking at?\"", thread: T.GAIN_MD },
      { id: "take_sweet", type: "toedip", next: "hindley_sweet_taken", label: "Take a sweet", thread: T.DRAIN_SM, consumable: "hindley_sweet" },
      { id: "sweets_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: T.DRAIN_SM },
    ],
  },

  hindley_children: {
    nico: "snarl",
    isExamine: true,
    returnTo: "stall_sweets",
    prose: {
      high: [
        "Myra tilts her head. The smile doesn't change.",
        "— Oh, they'll be along. They always come, eventually. We're very patient.",
        "She begins arranging the paper bags with great attention.",
        "— Children find their way here in the end, she says. One way or another.",
        "The subject is closed. She's already looking toward the edge of the green again.",
      ],
      mid: [
        "— Oh they'll be along. She smiles. They always come eventually.",
        "She goes back to tidying the stall.",
      ],
      low: [
        "— Soon enough, she says pleasantly.",
      ],
    },
    revealHigh: "\"One way or another.\" She said it like a fact, not a hope.",
  },

  hindley_edge: {
    nico: "snarl",
    isExamine: true,
    returnTo: "stall_sweets",
    prose: {
      high: [
        "She blinks. Looks at you with something that might be surprise, or might be recalibration.",
        "— Nothing, dear. Just keeping an eye on things.",
        "You look toward the edge of the green. The tree line begins there — dark, even in the morning sun. The fair doesn't extend that far.",
        "There is nothing there.",
        "Nico is not looking at the tree line. Nico is looking at Myra.",
      ],
      mid: [
        "— Just keeping an eye on things. She smiles.",
        "You glance toward the trees. Nothing there.",
      ],
      low: [
        "— Oh, nothing. She waves a hand.",
      ],
    },
    revealHigh: "Nico wasn't watching the tree line. He was watching her watch it.",
  },

  hindley_sweet_taken: {
    nico: "snarl",
    isExamine: true,
    returnTo: "stall_sweets",
    prose: {
      high: [
        "It's very good. Sweet and sharp and a little strange — a flavour you can't quite name.",
        "Myra watches you eat it with an expression of complete satisfaction.",
        "— There. She says it the same way Hobson did. There.",
        "The similarity lands somewhere unpleasant.",
      ],
      mid: [
        "Tastes fine. A bit odd, but nice.",
        "Myra looks very pleased with herself.",
      ],
      low: [ "Delicious. Myra smiles warmly." ],
    },
    revealHigh: "She said *there* the same way Hobson did. Exactly the same way.",
  },

  // ── STALL: KEYES & SONS ──────────────────────────────────
  stall_keyes: {
    nico: "cower",
    isFairStall: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "The stall is sparse. A few tools laid out on a cloth. A handwritten list of services — sharpening, mending, adjustments. Keyes & Sons, though you see no sons.",
        "Israel Keyes is behind the counter. Lean, methodical, with the stillness of someone who is always waiting for information.",
        "— You're the guest at Hobson's, he says. It isn't a question.",
        "He produces a small notebook. Clicks a pen.",
        "— How long are you planning to stay? Do you have family expecting you? Are you travelling alone?",
        "He asks the last one while already writing. As though he knows.",
        "Nico is pressed flat against the cobblestones behind your heels.",
      ],
      mid: [
        "Keyes is precise, efficient. He already seems to know who you are.",
        "He asks how long you're staying. Whether anyone is expecting you.",
        "He's writing things down.",
        "Nico is as low to the ground as a greyhound can get.",
      ],
      low: [
        "Keyes is helpful and thorough. He asks a few questions. Very organised.",
        "Nico doesn't like him much.",
      ],
    },
    choices: [
      { id: "keyes_answer", type: "toedip", next: "keyes_answered", label: "Answer his questions", thread: T.DRAIN_MD, consumable: "keyes_questions" },
      { id: "keyes_deflect", type: "examine", next: "keyes_deflected", label: "\"I'm not sure — why do you ask?\"", thread: T.GAIN_MD, hideIfConsumed: "keyes_questions" },
      { id: "keyes_challenge", type: "examine", next: "keyes_challenged", label: "\"Wait — what are you going to do with all that?\"", thread: T.GAIN_SM, requiresConsumed: "keyes_questions" },
      { id: "keyes_keys", type: "examine", next: "keyes_keyring", label: "Notice the keyring on his belt", thread: T.GAIN_MD },
      { id: "keyes_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: T.DRAIN_SM },
    ],
  },

  keyes_answered: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "You answer. You're not sure why — the questions arrive with the weight of forms that need to be filled in.",
        "Keyes writes everything down. Nods once.",
        "— Good. He clicks the pen closed. We like to know who's with us.",
        "He already knew. You realise that as soon as the words are out of his mouth.",
        "He was checking whether you'd tell the truth.",
      ],
      mid: [
        "You answer. He nods, writes it all down.",
        "— Good. He says. We like to know.",
        "Something about the way he says it.",
      ],
      low: [ "You answer. He nods. Very organised, this man." ],
    },
    revealHigh: "He already knew the answers. He was checking if you'd lie.",
  },

  keyes_deflected: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "Keyes pauses. Something recalibrates behind his eyes — very slightly.",
        "— Just keeping track of our visitors. He smiles. We like everyone to feel accounted for.",
        "He does not write anything in the notebook.",
        "He puts the pen away.",
        "The way he says *accounted for* sits wrong in your chest.",
      ],
      mid: [
        "— Just keeping track. He smiles and puts the notebook away.",
        "That phrase — accounted for — lingers.",
      ],
      low: [ "— Just being thorough. He smiles." ],
    },
    revealHigh: "\"Accounted for.\" He closed the notebook. You gave him nothing and he accepted that. For now.",
  },

  keyes_challenged: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "Keyes looks up from the notebook. Fully, for the first time.",
        "— Record keeping, he says. This is a community. We look after one another. It helps to know who's among us.",
        "He holds your gaze for a moment longer than is comfortable.",
        "— You'd be surprised how often people are grateful someone kept track.",
        "He clicks the pen closed and slides the notebook under the counter.",
        "You don't feel grateful.",
      ],
      mid: [
        "— Record keeping. He meets your eyes. We look after each other here.",
        "He puts the notebook away.",
        "Something about *we look after each other* doesn't sit right.",
      ],
      low: [ "— Just keeping records. He smiles." ],
    },
    revealHigh: "\"You'd be surprised how often people are grateful.\" He said it like a warning dressed as a comfort.",
  },

  keyes_keyring: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "It's substantial. A heavy iron ring with perhaps forty keys on it — old ones, modern ones, padlock keys, cabinet keys, at least three that look like they belong to something large.",
        "He notices you looking.",
        "— I like to be prepared, he says.",
        "He turns slightly so the keyring is behind him.",
        "Forty keys. You file that away.",
      ],
      mid: [
        "A very large keyring. Lots of keys.",
        "He turns slightly when he catches you looking.",
        "— Prepared, he says.",
      ],
      low: [ "He has a lot of keys. Very organised." ],
    },
    gainHigh: "Forty keys. Bailey said she took one he wouldn't miss.",
    gainHighPre: "Forty keys. You file that away.",
    threadHigh: 0,
  },

  // ── THE GREEN ────────────────────────────────────────────
  the_green: {
    nico: "ignore",
    isFairStall: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "The centre of the green is dominated by the great oak. Must be three hundred years old — the bark deeply furrowed, the canopy wide enough to shade a dozen people.",
        "A group of villagers stand near its base. Facing inward. They haven't moved since you arrived.",
        "A man drifts past, cup of tea in hand.",
        "— The fair's on tomorrow, he says cheerfully, to no one in particular.",
        "You look around at the bunting, the stalls, the crowds.",
        "_Tomorrow?_",
        "Nico sniffs at the man's shoe.",
        "He raises his leg and marks his territory as if the man's leg were a wooden post.",
        "The man does not move. Does not flinch. Does not look down.",
        "He continues talking to nobody, not breaking stride.",
        "— Lovely day for it.",
      ],
      mid: [
        "A lovely old oak at the centre of the green.",
        "Some people standing near it, not doing much.",
        "A man walks past. — The fair's on tomorrow! he says.",
        "You look around at the ongoing fair.",
        "Tomorrow.",
        "Nico is completely uninterested in everyone here.",
      ],
      low: [
        "Beautiful old tree. The fair hums around you.",
        "Nico is behaving himself.",
      ],
    },
    choices: [
      { id: "examine_oak", type: "examine", next: "oak_carvings", label: "Look more closely at the oak tree", thread: T.GAIN_MD },
      { id: "examine_hollow_group", type: "examine", next: "hollow_circle", label: "Approach the group near the tree", thread: 0 },
      { id: "green_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: 0 },
    ],
  },

  oak_carvings: {
    nico: "alert",
    isExamine: true,
    returnTo: "the_green",
    prose: {
      high: [
        "The bark is covered in carvings. Names — dozens of them, some old and weathered into the wood, some newer. Initials. Full names. Dates beside some of them.",
        "You scan them the way you'd scan a memorial.",
        "And then you stop.",
        "Third from the bottom. Fresh enough that the wood is still pale inside the cut.",
        "SARAH.",
        "No surname. No date. Just Sarah, and below it, two small marks you can't interpret.",
        "Nico puts his paw on your foot.",
      ],
      mid: [
        "Names carved into the bark. Lots of them, going back years.",
        "One near the bottom looks recent.",
        "Sarah. Your name.",
        "Could be anyone.",
        "...Could be anyone.",
      ],
      low: [
        "Lots of old carvings. Lovely old tree.",
      ],
    },
    gainHigh: "Your name is on this tree. You don't remember carving it.",
    threadHigh: T.GAIN_LG,
  },

  hollow_circle: {
    nico: "ignore",
    isExamine: true,
    returnTo: "the_green",
    prose: {
      high: [
        "You approach.",
        "There are six of them, standing in a rough circle facing inward. None of them speaking. None of them looking at each other.",
        "One turns toward you as you get close.",
        "— We're so glad you came, they say.",
        "It turns back inward.",
        "Nico sits down beside you and begins cleaning his paw.",
      ],
      mid: [
        "Six people in a rough circle, not really doing anything.",
        "One of them tells you they're glad you came.",
        "Nico sits down and ignores them completely.",
      ],
      low: [
        "A friendly little group. So glad you came.",
      ],
    },
    choices: [
      { id: "circle_speak", type: "examine", next: "circle_speak_to", label: "Try to speak to one of them", thread: 0 },
      { id: "circle_wave", type: "examine", next: "circle_wave_at", label: "Wave at the nearest one", thread: 0 },
      { id: "circle_closing", type: "examine", next: "circle_ask_closing", label: "\"What's the closing?\"", thread: T.GAIN_MD },
      { id: "circle_nico", type: "examine", next: "circle_nico_shoe", label: "Watch what Nico does", thread: 0 },
    ],
  },

  circle_speak_to: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "— Excuse me, you say.",
        "The nearest one turns.",
        "— Have you tried the preserves? they say.",
        "It turns back.",
        "You wait.",
        "Nothing more comes.",
      ],
      mid: [
        "You try talking to one.",
        "— Have you tried the preserves? they say.",
        "That's apparently it.",
      ],
      low: [ "— Have you tried the preserves?" ],
    },
  },

  circle_wave_at: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "You wave.",
        "One of them turns and looks directly at your hand.",
        "— Lovely day for it, they say.",
        "It turns back.",
        "You lower your hand.",
      ],
      mid: [
        "You wave. One looks at you.",
        "— Lovely day for it.",
        "Back to facing inward.",
      ],
      low: [ "— Lovely day for it." ],
    },
  },

  circle_ask_closing: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "— What's the closing? you ask. What does that mean?",
        "The one nearest you turns.",
        "— You'll want to stay for the closing, they say.",
        "It turns back.",
        "You stare at the back of its head.",
      ],
      mid: [
        "You ask about the closing.",
        "— You'll want to stay for the closing, one of them says.",
        "Not helpful.",
      ],
      low: [ "— You'll want to stay for the closing." ],
    },
    revealHigh: "You asked directly. They just repeated the line. Like they only have the one.",
  },

  circle_nico_shoe: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "Nico stands, stretches, and wanders toward the nearest figure with the air of a dog with absolutely no agenda.",
        "He sniffs at its shoe.",
        "He raises his leg and marks his territory as if the figure's leg were a wooden post.",
        "The figure does not move. Does not flinch. Does not look down.",
        "— We're so glad you came, they say, to the middle distance.",
        "A single tear runs down its cheek.",
        "Its smile does not change.",
        "Nico trots back to you and sits on your foot.",
      ],
      mid: [
        "Nico wanders over to the nearest one.",
        "He sniffs at its shoe. Then raises his leg — deliberate, unhurried — and marks it.",
        "They say they're glad you came.",
        "A tear runs down its face.",
        "It keeps smiling.",
        "Nico comes back and sits on your foot.",
      ],
      low: [
        "Nico does something a bit rude.",
        "The person doesn't seem to notice.",
        "Odd.",
      ],
    },
    revealHigh: "It cried. Just the one tear, just the one time, while it smiled and said nothing real. Something is still in there.",
  },

  // ── BACK LANE ────────────────────────────────────────────
  back_lane: {
    nico: "alert",
    isFairStall: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "A narrow lane runs behind the stall row — cobblestones, brick walls, discarded crates. The sounds of the fair are muffled here.",
        "Quieter. More real, somehow, than the green.",
        "At the far end: a door set into the wall. Heavy oak, iron fittings, no sign. It looks like it belongs to something older than the buildings around it.",
        "Nico's ears are fully forward. He's interested in the door, but not distressed. Like he's filing it away.",
      ],
      mid: [
        "A quiet little back lane. Crates, brick walls.",
        "There's a door at the far end. Looks old.",
        "Nico sniffs toward it.",
      ],
      low: [
        "A quiet lane. A door. Probably just storage.",
      ],
    },
    choices: [
      { id: "examine_door", type: "examine", next: "examine_storeroom_door", label: "Look at the door", thread: 0 },
      { id: "backlane_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: 0 },
    ],
  },

  examine_storeroom_door: {
    nico: "alert",
    isExamine: true,
    returnTo: "back_lane",
    prose: {
      high: [
        "Old oak, iron fittings, a keyhole that looks like it's been used recently — the metal around it worn bright.",
        "No handle on this side. Just the keyhole.",
        "You try pushing it. It doesn't move.",
        "Nico sits down in front of it, perfectly still, and looks at you.",
      ],
      mid: [
        "Solid door. Locked.",
        "Nico sits in front of it and looks up at you.",
        "No obvious way in.",
      ],
      low: [ "Locked. Nothing to be done." ],
    },
  },

  // This scene replaces examine_storeroom_door after Bailey gives the key
  examine_storeroom_door_keyed: {
    nico: "alert",
    isExamine: true,
    returnTo: "back_lane",
    prose: {
      high: [
        "The door. The keyhole worn bright.",
        "You have Bailey's key.",
        "Nico stands up from where he was sitting and presses his nose to the gap at the bottom of the door.",
        "His tail moves. Once.",
      ],
      mid: [
        "The door. You have Bailey's key now.",
        "Nico sniffs the gap at the bottom.",
      ],
      low: [ "The door. The key. Worth a try." ],
    },
    choices: [
      { id: "use_baileys_key", type: "progress", next: "storeroom_enter", label: "→ Try Bailey's key", thread: T.GAIN_MD },
      { id: "keyed_door_back", type: "progress", next: "back_lane", label: "← Not yet", thread: 0 },
    ],
  },

  storeroom_enter: {
    nico: "alert",
    prose: {
      high: [
        "The key turns.",
        "A sound like something exhaling — pressure releasing — and the door swings inward on a darkness that smells of cold stone and something older.",
        "Stone steps lead down.",
        "Nico doesn't wait. He steps through first, his white chest patch disappearing into the dark.",
        "You stand at the threshold.",
      ],
      mid: [
        "The key works.",
        "The door opens onto stone steps going down.",
        "Nico goes first.",
        "You stand at the top of the steps.",
      ],
      low: [ "It opens. Steps going down. Nico is already ahead." ],
    },
    choices: [
      { id: "ch3_confirm_back", type: "progress", next: "fair_hub", label: "← Wait. I'm not finished up here.", thread: 0 },
      { id: "ch3_begin", type: "progress", next: "ch2_end", label: "→ Follow Nico down. There's nothing left for you up here.", thread: 0 },
    ],
  },

  // ── BAILEY SARIAN ────────────────────────────────────────
  bailey_first: {
    nico: "wag",
    prose: {
      high: [
        "She's sitting on an upturned crate at the mouth of the back lane, eating an apple and watching the fair with the relaxed attention of someone at a theatre.",
        "She clocks you from twenty feet away. Doesn't look surprised.",
        "— You've got the look, she says, by way of greeting.",
        "She's perhaps thirty, dark-haired, layers of mismatched jewellery, a coat that's too heavy for the weather and covered in pockets. She gestures at the stalls with her apple.",
        "— The look of someone who knows something's wrong even when everything looks fine. I've been waiting for someone with that look.",
        "Nico walks directly up to her and pushes his long nose into her hand.",
        "He's never done that to anyone here.",
        "— Hello, lovely, she says to him, completely unfazed. Good dog. Very smart dog.",
        "She looks back up at you.",
        "— Sit down. We should talk.",
      ],
      mid: [
        "A woman at the edge of the back lane. Didn't notice her before.",
        "She's watching the fair like it's something to be studied.",
        "— You've got the look, she says. You know something's off.",
        "Nico goes straight to her. He seems to like her.",
        "— Sit down, she says. We should talk.",
      ],
      low: [
        "A woman near the back lane. Friendly enough.",
        "Nico likes her.",
        "— Sit down, she says.",
      ],
    },
    choices: [
      { id: "bailey_wrong", type: "examine", next: "bailey_this_place", label: "\"What do you mean, something's wrong?\"", thread: T.GAIN_MD },
      { id: "bailey_who", type: "examine", next: "bailey_who_are_you", label: "\"Who are you?\"", thread: 0 },
      { id: "bailey_travels", type: "examine", next: "bailey_how_here", label: "\"How did you get here?\"", thread: T.GAIN_MD },
      { id: "bailey_key", type: "progress", next: "bailey_gives_key", label: "→ Listen to what she has to say", thread: T.GAIN_LG },
    ],
  },

  bailey_this_place: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_first",
    prose: {
      high: [
        "— This place, she says, gesturing at everything, feeds on something. I don't know exactly what — I've seen things like it before, different shapes — but people go *thin* here. Like something is eating the most important parts of them.",
        "She takes a bite of her apple.",
        "— Those people at the fair? The ones who just stand around saying lovely day for it?",
        "She draws a finger across her temple.",
        "— Gone. Whatever made them *them* — it's been eaten. They're just the leftover.",
        "She looks at you steadily.",
        "— You're not gone yet. You should probably keep it that way.",
      ],
      mid: [
        "— This place feeds on people. Not their bodies — something else. Whatever makes them *them*.",
        "She nods at the people milling around the stalls.",
        "— Those ones are already empty.",
        "— You're not. Yet.",
      ],
      low: [ "— Something's not right here. She seems very sure about that." ],
    },
    revealHigh: "The people at the fair aren't strange visitors. They're what's left after the feeding.",
  },

  bailey_who_are_you: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_first",
    prose: {
      high: [
        "— Bailey. She says it like it's the end of the sentence.",
        "— I travel. She pauses, choosing words. Between places. I find things, borrow things, move on before things get complicated.",
        "She examines her apple.",
        "— This place got complicated faster than usual.",
      ],
      mid: [
        "— Bailey. I travel.",
        "She's not exactly forthcoming with the details.",
        "— This place got complicated, she adds.",
      ],
      low: [ "— Bailey. Just passing through." ],
    },
  },

  bailey_how_here: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_first",
    prose: {
      high: [
        "She gives you a long look.",
        "— The same way you did, probably. The same way you always do.",
        "— I don't know how I got here, you say.",
        "— I know. She stands up, brushes apple core off her coat. That's the thing about this place — it finds you when you're in the dark. When you're fading. When the edges of you have gone soft.",
        "She looks at you with something careful in her expression.",
        "— You've been here before. I can tell. You've got the residue of it.",
        "She says it matter-of-factly, without cruelty.",
        "— More than once, I'd guess.",
      ],
      mid: [
        "— Same way you did, she says.",
        "— This place finds you when you're fading. When the edges go soft.",
        "— You've been here before, she adds. I can tell.",
      ],
      low: [ "— Hard to explain, she says. You've probably been here before though." ],
    },
    revealHigh: "She can see the residue of previous visits. She said more than once.",
  },

  bailey_gives_key: {
    nico: "wag",
    isChapterKey: true,
    prose: {
      high: [
        "She reaches into one of her coat's many pockets and produces a key. Old iron, heavy, the bow worn smooth.",
        "— Borrowed it off the repair man. Keyes. He's got about forty keys on him — very suspicious if you ask me, which you should, ask me things — he won't notice one missing.",
        "She holds it out.",
        "— There's a door in the back lane. That key opens it. I tried it myself, didn't go in alone. I steal things, I don't have a death wish.",
        "You take the key. It's heavier than it looks.",
        "— The dog, she says, nodding at Nico. Keep him close. I mean it. He knows exactly where he is and he knows exactly what matters. When it counts — follow him.",
        "She stands, pockets her hands.",
        "— I don't know how to get out of this place. But I think you might be able to work it out. You've been here before. Somewhere in there — she taps her temple gently — you already know the answer.",
        "She gives you one last look. Appraising, warm, a little sad.",
        "— Don't eat anything else.",
      ],
      mid: [
        "She produces a key. Took it from Keyes — he won't notice, apparently.",
        "There's a door in the back lane. This opens it.",
        "She didn't go in alone and isn't about to start.",
        "— Keep the dog close, she says. He knows what he's doing.",
        "She thinks you've been here before. She thinks you might know how to get out, even if you don't know it yet.",
        "— Don't eat anything else, she adds.",
      ],
      low: [
        "She gives you a key. Door in the back lane.",
        "Keep the dog close. Don't eat anything else.",
      ],
    },
    choices: [
      { id: "bailey_nico_q", type: "examine", next: "bailey_nico_answer", label: "\"What do you mean, follow him?\"", thread: T.GAIN_MD },
      { id: "bailey_before_q", type: "examine", next: "bailey_been_before", label: "\"You said I've been here before.\"", thread: T.GAIN_LG },
      { id: "bailey_leave", type: "progress", next: "fair_hub", label: "→ Thank her and head back to the fair", thread: 0 },
    ],
  },

  bailey_nico_answer: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_gives_key",
    prose: {
      high: [
        "— Dogs like him — she considers it — they don't get confused by places like this. They can't be fooled because they don't use the parts of their brain this place messes with.",
        "She looks at Nico.",
        "— He can't tell you what's real with words. But he can show you. He's been showing you the whole time.",
        "Nico looks up at her. His tail moves slowly.",
        "— When he goes somewhere, go there. When he won't move, don't move. When he makes that sound in his throat — she mimics Nico's low snarl, uncannily accurate — take note.",
      ],
      mid: [
        "— He can't be fooled by this place. He's been trying to show you things the whole time.",
        "— When he makes that sound, take note. She does a decent impression of his snarl.",
        "Nico seems almost smug.",
      ],
      low: [ "— He just knows. Trust him." ],
    },
  },

  bailey_been_before: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_gives_key",
    prose: {
      high: [
        "She sits back down on the crate.",
        "— I can see it. There's a — texture to people who've been cycled through a place like this. Like a book that's been opened and closed so many times the spine starts to go.",
        "— What happened to me? you ask.",
        "— I don't know the specifics. But this place finds you in the dark. When you're fading. Whatever was happening to you — it opened a door, and this place was waiting on the other side.",
        "She says it gently.",
        "— The things that brought you here — they're in you somewhere. This place tried to eat them. It didn't finish the job. That's why you can still feel that something's wrong.",
        "She nods at Nico.",
        "— That's why he still knows you.",
      ],
      mid: [
        "— There's a texture to people who've been through a place like this more than once.",
        "— This place finds you in the dark. When you're fading. Something happened to you. More than once, she thinks.",
        "— It tried to eat what you are. It didn't finish.",
        "— That's why he still knows you, she says, nodding at Nico.",
      ],
      low: [ "— You've been here before. That's all she's sure of." ],
    },
    gainHigh: "Something brought you here before. More than once. The things that happened are still in you somewhere.",
    threadHigh: T.GAIN_LG,
  },

  // ── CHAPTER 2 END ────────────────────────────────────────
  ch2_end: {
    nico: "alert",
    isChapterEnd: true,
    chapterEndText: "Chapter Three — The Storeroom",
    prose: {
      high: [
        "The door swings shut behind you.",
        "The sounds of the fair — the voices, the bunting snapping in an unfelt breeze — cut off completely.",
        "Just the dark. The cold stone smell.",
        "Nico's nails on the steps ahead. Soft, unhurried, certain.",
        "You follow the sound.",
      ],
      mid: [
        "The door closes. The fair goes quiet.",
        "Darkness. The sound of Nico somewhere below.",
        "You follow.",
      ],
      low: [
        "Dark. Nico ahead.",
        "You follow.",
      ],
    },
  },

  // ════════════════════════════════════════════════════════
  // CHAPTER THREE — THE STOREROOM
  // ════════════════════════════════════════════════════════

  ch3_opening: {
    nico: "alert",
    prose: {
      high: [
        "The steps end in a low room.",
        "Stone floor, stone walls, a ceiling close enough to press on you. The air is cold and absolutely still — the kind that means nothing has moved here in a long time.",
        "Five things occupy the space: a stack of wooden crates against the left wall, a set of metal shelves along the right, two heavy sacks slumped in the far right corner, a cluster of jars on the floor in the near left corner, and a narrow chest of drawers set against the back wall.",
        "Centred in the back wall: a heavy iron bar across a door. Three recesses set into it, each housing a symbol.",
        "Nico moves straight to the crates and sits. He looks at you over his shoulder.",
      ],
      mid: [
        "A low stone room. Five distinct areas to look at.",
        "An iron bar across the back door — three symbols set into it.",
        "Nico has gone straight to the crates.",
      ],
      low: [
        "Stone room. Things to look at. A locked door.",
        "Nico is by the crates.",
      ],
    },
    choices: [
      { id: "ch3_look_lock", type: "progress", next: "examine_lock", label: "Examine the barred door", thread: T.GAIN_MD },
      { id: "ch3_look_crates", type: "examine", next: "examine_crates", label: "Go to the crates — where Nico is sitting", thread: 0 },
      { id: "ch3_look_shelves", type: "examine", next: "examine_shelves", label: "Look along the shelves", thread: 0 },
      { id: "ch3_look_sacks", type: "examine", next: "examine_sacks", label: "Check the sacks in the corner", thread: 0 },
      { id: "ch3_look_jars", type: "examine", next: "examine_floor_jars", label: "Look at the jars on the floor", thread: 0 },
      { id: "ch3_look_drawers", type: "examine", next: "examine_drawers", label: "Open the chest of drawers", thread: T.GAIN_MD },
    ],
  },

  examine_lock: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Three recesses shaped into the iron bar, each one a different form.",
        "One fits something cylindrical. One something narrow-waisted. One something with weight and presence, carved rather than cast.",
        "There are no levers. No numbers. Whatever goes in, goes in — and either fits or doesn't.",
        "The order of the three recesses is fixed. Left to right.",
        "The order you fill them is the combination.",
      ],
      mid: [
        "Three shaped recesses in the iron. Something goes in each one.",
        "Left to right. The order is the combination.",
      ],
      low: [ "Three recesses. Something goes in each one." ],
    },
    revealHigh: "Whatever belongs in here — you'll know it when you find it.",
    choices: [
      { id: "ch3_try_lock", type: "progress", next: "lock_minigame", label: "→ Try slotting something in", thread: 0 },
    ],
  },

  lock_minigame: {
    nico: "alert",
    isLockGame: true,
    returnTo: "ch3_hub",
    winNext: "ch3_end",
  },

  examine_crates: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Nico stands as you approach. He noses the side of the nearest crate and steps back.",
        "You shift it.",
        "On the wall behind: two curved claw marks, scratched into the stone at nose height. Deliberate. His.",
        "Resting in the gap between crate and wall, as if set there deliberately: a small brass hourglass. Old, tarnished. The sand inside doesn't move.",
        "Nico sits back down and looks at you.",
      ],
      mid: [
        "Nico nudges the crate. Behind it: two claw marks, and a small brass hourglass.",
        "The sand doesn't move.",
      ],
      low: [ "Behind the crate: a brass hourglass. Nico seems satisfied." ],
    },
    revealHigh: "Two claw marks. He's been here before. He left things behind.",
    choices: [
      { id: "take_hourglass", type: "examine", next: "hourglass_taken", label: "Take the hourglass", thread: 0, consumable: "hourglass", hideIfConsumed: "hourglass" },
    ],
  },

  hourglass_taken: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You pick it up. Lighter than it looks.",
        "You tilt it. The sand doesn't shift at all.",
        "Like it's been frozen mid-fall.",
        "You put it in your bag.",
      ],
      mid: [
        "You take it. The sand inside doesn't move when you tilt it.",
        "Into the bag.",
      ],
      low: [ "You take the hourglass." ],
    },
  },

  examine_shelves: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Metal shelves, old but solid. Coils of rope, rusted tools, a folded cloth that smells wrong.",
        "On the middle shelf, between two corroded tins: three claw marks scratched into the metal.",
        "Beside the marks, resting on a fold of cloth as though displayed: an infinity symbol carved from solid marble, palm-sized. White with gold veins. The carving is deep and deliberate — not etched, but formed, as though the shape was always inside the stone waiting to be released.",
        "The symbol is deep and clean, filled with something dark.",
        "It has absolutely no business being here.",
      ],
      mid: [
        "Tools, rope, old cloth. Three claw marks on the shelf.",
        "Beside them: a marble infinity symbol. White, gold-veined. The carving deep and clean.",
        "It doesn't belong here.",
      ],
      low: [ "A marble infinity symbol on the shelf. Beautiful. Wrong." ],
    },
    revealHigh: "Polished marble and gold veins, down here with the rust and the rot. Someone put this here on purpose.",
    choices: [
      { id: "take_marble", type: "examine", next: "marble_taken", label: "Take the marble infinity symbol", thread: 0, consumable: "marble", hideIfConsumed: "marble" },
    ],
  },

  marble_taken: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "It's cold and smooth, heavier than marble has any right to be.",
        "The gold veins catch even the dim light of this room.",
        "You turn it over. The back is plain.",
        "You keep it.",
      ],
      mid: [
        "Heavy, cold, beautiful.",
        "Into your bag.",
      ],
      low: [ "You take it." ],
    },
  },

  examine_sacks: {
    nico: "neutral",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Hessian sacks, heavy, slumped against each other.",
        "You loosen the nearest one.",
        "Bird skulls. Dozens of them, small and dry, packed without ceremony.",
        "Nico doesn't come near.",
      ],
      mid: [
        "Bird skulls. Dozens of them.",
        "Nico stays back.",
      ],
      low: [ "Bird skulls in a sack." ],
    },
    choices: [
      { id: "take_skull", type: "examine", next: "skull_taken", label: "Take one of the skulls", thread: 0, consumable: "skull", hideIfConsumed: "skull" },
    ],
  },

  skull_taken: {
    nico: "neutral",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You pick one up. Light as paper. Hollow.",
        "The beak is still intact.",
        "Nico glances at it and looks away.",
        "You put it in your bag.",
      ],
      mid: [
        "Light. Hollow. You take it.",
        "Nico isn't interested.",
      ],
      low: [ "You take a bird skull." ],
    },
  },

  examine_floor_jars: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Four jars clustered in the corner, dark contents, no labels.",
        "Older than Rose's — the glass clouded, the wax seals cracked.",
        "On the floor beside them: one single claw mark, scratched into the stone.",
        "Just the one.",
      ],
      mid: [
        "Old jars in the corner.",
        "One claw mark on the floor beside them.",
      ],
      low: [ "Jars on the floor." ],
    },
    revealHigh: "One claw mark. Of all the marks in this room, this is the first.",
    choices: [
      { id: "take_floor_jar", type: "examine", next: "floor_jar_taken", label: "Take one of the jars", thread: 0, consumable: "storeroom_jar", hideIfConsumed: "storeroom_jar" },
    ],
  },

  floor_jar_taken: {
    nico: "neutral",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You take the nearest one. Cold. The seal is cracked but holds.",
        "You don't open it.",
        "Nico watches. Doesn't step back.",
      ],
      mid: [
        "Cold, heavy, sealed.",
        "Nico doesn't react.",
      ],
      low: [ "You take a jar." ],
    },
  },

  examine_drawers: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Three narrow drawers. The top two are empty.",
        "The bottom one sticks, then gives.",
        "Inside: a single piece of paper, folded once.",
        "You open it.",
        "In careful, small handwriting:",
        "_Preserved. In time. Forever._",
        "Three words.",
        "Someone left this for you. Or left it for themselves, and you found it instead.",
      ],
      mid: [
        "Bottom drawer. A folded note.",
        "_Preserved. In time. Forever._",
      ],
      low: [ "A note. Three words." ],
    },
    revealHigh: "Preserved. In time. Forever. Three words. Three recesses.",
    choices: [
      { id: "take_note", type: "examine", next: "note_taken", label: "Take the note", thread: T.GAIN_MD, consumable: "note", hideIfConsumed: "note" },
    ],
  },

  note_taken: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You fold it back along its crease and put it in your bag.",
        "The handwriting was careful. Unhurried.",
        "Whoever wrote this had time.",
      ],
      mid: [
        "You take the note.",
        "The handwriting was careful. They had time.",
      ],
      low: [ "You take the note." ],
    },
  },

  ch3_hub: {
    nico: "alert",
    isCh3Hub: true,
    prose: {
      high: [
        "The room waits.",
        "Nico has settled near the barred door. Patient.",
        "You have things in your bag. The lock has three recesses.",
      ],
      mid: [
        "Nico near the door. The lock waiting.",
        "You have things to try.",
      ],
      low: [ "The lock. Nico by the door." ],
    },
  },

  ch3_end: {
    nico: "alert",
    isChapterEnd: true,
    chapterEndText: "Chapter Four — The Crypt",
    prose: {
      high: [
        "The door swings shut behind you.",
        "The storeroom is gone.",
        "Ahead: steps cut deeper into the earth, older than the village above, older than anything you've seen today.",
        "The walls here are not stone. They are *rock* — raw, unfinished, the kind that has never seen light.",
        "Nico moves down without hesitation.",
        "You follow the sound of his nails.",
      ],
      mid: [
        "Deeper steps. Older walls.",
        "Nico below you in the dark.",
        "You follow.",
      ],
      low: [ "Down. Older. Darker. Nico ahead." ],
    },
  },
};
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&display=swap');`;

// ============================================================
// THREAD BAR COLOUR — based on last action delta
// ============================================================
function threadBarColor(delta) {
  if (delta === null || delta === undefined) return "#3a6a50"; // neutral — dark green-grey
  if (delta >= T.GAIN_LG) return "#4caf7a";   // major pos — bright green
  if (delta > 0)           return "#a8d8a0";   // minor pos — light green
  if (delta === 0)         return "#7ab8c8";   // no change — pale blue
  if (delta >= T.DRAIN_MD) return "#d4884a";   // minor neg — orange
  return "#c0404a";                            // major neg — red
}

// ============================================================
// JAR MINI-GAME
// ============================================================
const JAR_SVGS = {
  diamond: (
    <svg viewBox="0 0 60 60" width="36" height="36">
      <polygon points="30,6 54,30 30,54 6,30" fill="#8a1a1a" stroke="#c04040" strokeWidth="1.5"/>
      <polygon points="30,14 46,30 30,46 14,30" fill="#c04040" opacity="0.4"/>
      <line x1="30" y1="6" x2="30" y2="54" stroke="#e06060" strokeWidth="0.5" opacity="0.5"/>
      <line x1="6" y1="30" x2="54" y2="30" stroke="#e06060" strokeWidth="0.5" opacity="0.5"/>
    </svg>
  ),
  dog: (
    <svg viewBox="0 0 60 60" width="36" height="36">
      {/* Body */}
      <ellipse cx="30" cy="36" rx="16" ry="12" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1"/>
      {/* Head */}
      <circle cx="30" cy="20" r="10" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1"/>
      {/* Ears */}
      <ellipse cx="22" cy="13" rx="5" ry="7" fill="#0d0d0d" transform="rotate(-15,22,13)"/>
      <ellipse cx="38" cy="13" rx="5" ry="7" fill="#0d0d0d" transform="rotate(15,38,13)"/>
      {/* White chest patch */}
      <ellipse cx="30" cy="34" rx="6" ry="5" fill="#e8e0d0" opacity="0.9"/>
      {/* Eyes */}
      <circle cx="26" cy="19" r="2" fill="#c8b090"/>
      <circle cx="34" cy="19" r="2" fill="#c8b090"/>
      <circle cx="26.5" cy="18.5" r="1" fill="#0d0d0d"/>
      <circle cx="34.5" cy="18.5" r="1" fill="#0d0d0d"/>
      {/* White toes */}
      <ellipse cx="20" cy="47" rx="3" ry="2" fill="#e8e0d0"/>
      <ellipse cx="40" cy="47" rx="3" ry="2" fill="#e8e0d0"/>
      {/* Tail */}
      <path d="M46,32 Q54,24 50,18" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  skull: (
    <svg viewBox="0 0 60 60" width="36" height="36">
      {/* Cranium */}
      <ellipse cx="30" cy="24" rx="18" ry="16" fill="#d4c9b0" stroke="#a09070" strokeWidth="1"/>
      {/* Jaw */}
      <rect x="18" y="36" width="24" height="12" rx="3" fill="#d4c9b0" stroke="#a09070" strokeWidth="1"/>
      {/* Eye sockets */}
      <ellipse cx="22" cy="24" rx="6" ry="6" fill="#0d2318"/>
      <ellipse cx="38" cy="24" rx="6" ry="6" fill="#0d2318"/>
      {/* Nose */}
      <path d="M27,33 L30,29 L33,33 Z" fill="#0d2318"/>
      {/* Teeth */}
      <rect x="20" y="38" width="5" height="7" rx="1" fill="#0d2318"/>
      <rect x="27" y="38" width="5" height="7" rx="1" fill="#0d2318"/>
      <rect x="34" y="38" width="5" height="7" rx="1" fill="#0d2318"/>
    </svg>
  ),
  bailey: (
    <svg viewBox="0 0 60 60" width="36" height="36">
      {/* Neck */}
      <rect x="25" y="42" width="10" height="10" fill="#c8a882"/>
      {/* Face */}
      <ellipse cx="30" cy="32" rx="14" ry="16" fill="#c8a882" stroke="#b09070" strokeWidth="0.5"/>
      {/* Hair — dark curly afro */}
      <ellipse cx="30" cy="18" rx="17" ry="14" fill="#1a1008"/>
      <circle cx="14" cy="22" r="6" fill="#1a1008"/>
      <circle cx="46" cy="22" r="6" fill="#1a1008"/>
      <circle cx="18" cy="16" r="5" fill="#1a1008"/>
      <circle cx="42" cy="16" r="5" fill="#1a1008"/>
      <circle cx="30" cy="12" r="6" fill="#1a1008"/>
      {/* Eyes */}
      <ellipse cx="24" cy="31" rx="3.5" ry="3" fill="#f0e8d8"/>
      <ellipse cx="36" cy="31" rx="3.5" ry="3" fill="#f0e8d8"/>
      <circle cx="24.5" cy="31.5" r="2" fill="#3a2808"/>
      <circle cx="36.5" cy="31.5" r="2" fill="#3a2808"/>
      <circle cx="25" cy="31" r="0.8" fill="#f0e8d8"/>
      <circle cx="37" cy="31" r="0.8" fill="#f0e8d8"/>
      {/* Nose */}
      <ellipse cx="30" cy="37" rx="2.5" ry="1.5" fill="#b08860" opacity="0.6"/>
      {/* Mouth — slight smile */}
      <path d="M25,41 Q30,44 35,41" stroke="#8a6040" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

const CARD_BACK = (
  <svg viewBox="0 0 60 60" width="36" height="36">
    <rect x="4" y="4" width="52" height="52" rx="3" fill="#0a1f12" stroke="#1a3820" strokeWidth="1.5"/>
    <circle cx="30" cy="30" r="14" fill="none" stroke="#8a6e2a" strokeWidth="1" opacity="0.6"/>
    <circle cx="30" cy="30" r="8" fill="none" stroke="#8a6e2a" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="30" cy="30" r="3" fill="#8a6e2a" opacity="0.5"/>
    <line x1="30" y1="16" x2="30" y2="44" stroke="#8a6e2a" strokeWidth="0.5" opacity="0.3"/>
    <line x1="16" y1="30" x2="44" y2="30" stroke="#8a6e2a" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

function JarMiniGame({ onWin, onLose }) {
  const PAIRS = ["diamond", "dog", "skull", "bailey"];
  const initialCards = () => {
    const deck = [...PAIRS, ...PAIRS].map((type, i) => ({ id: i, type, flipped: false, matched: false }));
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const [cards, setCards] = useState(initialCards);
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState("playing");
  const [result, setResult] = useState(null); // win | lose

  const MAX_ATTEMPTS = 8;

  const handleCardClick = (card) => {
    if (locked || card.flipped || card.matched || phase !== "playing") return;
    if (selected.length === 1 && selected[0].id === card.id) return;

    const newSelected = [...selected, card];
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      const [a, b] = newSelected;
      const isMatch = a.type === b.type;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        if (isMatch) {
          setCards(prev => prev.map(c =>
            c.type === a.type ? { ...c, matched: true, flipped: true } : c
          ));
          setSelected([]);
          setLocked(false);
          // Check win
          setCards(prev => {
            const allMatched = prev.every(c => c.type === a.type ? true : c.matched);
            const updatedAll = prev.map(c => c.type === a.type ? { ...c, matched: true } : c);
            const won = updatedAll.every(c => c.matched);
            if (won) {
              setTimeout(() => { setPhase("result"); setResult("win"); }, 400);
            }
            return updatedAll;
          });
        } else {
          setCards(prev => prev.map(c =>
            (c.id === a.id || c.id === b.id) && !c.matched ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLocked(false);
          if (newAttempts >= MAX_ATTEMPTS) {
            setTimeout(() => { setPhase("result"); setResult("lose"); }, 300);
          }
        }
      }, 900);
    }
  };

  if (phase === "result") {
    return (
      <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "4px", color: result === "win" ? "#8a6e2a" : "#6a2a1a", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>
          {result === "win" ? "You see it now" : "Look away"}
        </div>
        <div style={{ width: "40px", height: "1px", background: result === "win" ? "#1a3820" : "#3a1010" }} />
        <p style={{ fontSize: "0.88rem", color: "#9a8a70", lineHeight: 1.8, textAlign: "center", fontStyle: "italic", margin: 0 }}>
          {result === "win"
            ? "All four pairs. Rose is smiling."
            : "Too many wrong turns. Rose draws the curtain."}
        </p>
        <button
          onClick={() => result === "win" ? onWin() : onLose()}
          style={{
            marginTop: "8px", padding: "11px 32px", background: "transparent",
            border: `1px solid ${result === "win" ? "#8a6e2a" : "#6a2a1a"}`, borderRadius: "2px",
            color: result === "win" ? "#c9a84c" : "#c04a3a", fontFamily: "'Cinzel', serif",
            fontSize: "0.7rem", letterSpacing: "3px",
            textTransform: "uppercase", cursor: "pointer",
          }}>
          Continue
        </button>
      </div>
    );
  }

  // playing
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#8a6e2a", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>
          Rose's Jars
        </div>
        <div style={{ fontSize: "0.72rem", color: attemptsLeft <= 2 ? "#c04a3a" : "#4a6a50", fontStyle: "italic" }}>
          {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            style={{
              aspectRatio: "1",
              background: card.matched ? "#0a2a14" : card.flipped ? "#0f1e10" : "#081a10",
              border: `1px solid ${card.matched ? "#2a5a30" : card.flipped ? "#1a3a20" : "#0f2e1c"}`,
              borderRadius: "4px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: (!card.flipped && !card.matched && phase === "playing") ? "pointer" : "default",
              transition: "background 0.2s ease, border 0.2s ease",
              opacity: card.matched ? 0.5 : 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {card.matched && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(10,42,20,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#2a5a30", fontSize: "1.2rem" }}>✓</span>
              </div>
            )}
            {(card.flipped || card.matched)
              ? JAR_SVGS[card.type]
              : CARD_BACK
            }
          </div>
        ))}
      </div>

      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "6px" }}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i < attempts
              ? (cards.some(c => c.matched) ? "#2a5a30" : "#6a2a1a")
              : "#0f2e1c",
            transition: "background 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LOCK MINI-GAME
// ============================================================
const LOCK_ITEMS = {
  jar:       { label: "Jar",           emoji: "🫙", slot: 0 },
  rosejar:   { label: "Rose's jar",    emoji: "🫙", slot: 0 },
  hourglass: { label: "Hourglass",     emoji: "⏳", slot: 1 },
  marble:    { label: "Marble infinity symbol", emoji: "∞", slot: 2 },
  skull:     { label: "Bird skull",    emoji: "💀", slot: -1 }, // wrong
  note:      { label: "Folded note",   emoji: "📄", slot: -2 }, // can't slot
};

function LockMiniGame({ onWin, onLeave, inventory }) {
  const [slots, setSlots] = useState([null, null, null]);
  const [shake, setShake] = useState(null); // slot index shaking
  const [message, setMessage] = useState(null);
  const [solved, setSolved] = useState(false);

  // Build tray from inventory
  const tray = Object.entries(inventory).filter(([,has]) => has).map(([id]) => id);

  const triggerShake = (slotIdx, msg) => {
    setShake(slotIdx);
    setMessage(msg);
    setTimeout(() => setShake(null), 500);
    setTimeout(() => setMessage(null), 2200);
  };

  const handleSlot = (itemId, slotIdx) => {
    const item = LOCK_ITEMS[itemId];
    if (!item) return;

    if (item.slot === -2) {
      // Note — can't slot at all
      triggerShake(slotIdx, "The paper crumples at the edge of the recess. It doesn't belong here.");
      return;
    }
    if (item.slot === -1) {
      // Wrong item — shakes
      triggerShake(slotIdx, "The skull doesn't fit. The recess doesn't want it.");
      return;
    }
    if (item.slot !== slotIdx) {
      // Right item, wrong slot
      triggerShake(slotIdx, "It almost fits. But not here. Not in this position.");
      return;
    }
    // Must fill in order — slot 0 before slot 1 before slot 2
    if (slotIdx > 0 && !slots[slotIdx - 1]) {
      triggerShake(slotIdx, "Something resists. The order matters.");
      return;
    }
    // Correct
    const newSlots = [...slots];
    newSlots[slotIdx] = itemId;
    setSlots(newSlots);
    if (newSlots[0] && newSlots[1] && newSlots[2]) {
      setSolved(true);
    }
  };

  const slotLabels = inventory.note
    ? ["Preserved", "In time", "Forever"]
    : ["", "", ""];

  return (
    <div style={{ padding: "20px 16px", fontFamily: "'Crimson Pro', Georgia, serif" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "4px", color: "#8a6e2a", fontFamily: "'Cinzel', serif", textTransform: "uppercase", textAlign: "center", marginBottom: "16px" }}>
        The Lock
      </div>

      {/* Three slots */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {slots.map((filled, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ fontSize: "0.6rem", color: "#3a5a40", letterSpacing: "2px", textTransform: "uppercase" }}>
              {slotLabels[i]}
            </div>
            <div
              style={{
                width: "100%", aspectRatio: "1",
                background: filled ? "#0a2a14" : "#081a10",
                border: `1px solid ${filled ? "#3a7a40" : "#143020"}`,
                borderRadius: "4px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem",
                transition: "all 0.2s ease",
                animation: shake === i ? "lockShake 0.5s ease" : "none",
              }}
            >
              {filled ? LOCK_ITEMS[filled]?.emoji : (
                <span style={{ fontSize: "0.55rem", opacity: 0.2, letterSpacing: "2px", fontFamily: "'Cinzel', serif", color: "#4a7a50" }}>· · ·</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message */}
      <div style={{
        minHeight: "36px", marginBottom: "16px",
        fontSize: "0.8rem", color: "#8a6050", fontStyle: "italic",
        textAlign: "center", lineHeight: 1.6,
        transition: "opacity 0.3s ease",
        opacity: message ? 1 : 0,
      }}>
        {message || " "}
      </div>

      {/* Tray */}
      {!solved && (
        <>
          <div style={{ fontSize: "0.6rem", color: "#2a4a30", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", textAlign: "center" }}>
            Your items — tap to place in each slot
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            {tray.map(itemId => {
              const item = LOCK_ITEMS[itemId];
              if (!item) return null;
              const alreadyPlaced = slots.includes(itemId);
              return (
                <div key={itemId} style={{ display: "flex", gap: "6px" }}>
                  <div style={{
                    flex: "0 0 40px", height: "40px",
                    background: "#081a10", border: "1px solid #143020",
                    borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", opacity: alreadyPlaced ? 0.3 : 1,
                  }}>
                    {item.emoji}
                  </div>
                  <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                    {[0,1,2].map(slotIdx => (
                      <button
                        key={slotIdx}
                        onClick={() => !alreadyPlaced && !slots[slotIdx] && handleSlot(itemId, slotIdx)}
                        disabled={alreadyPlaced || !!slots[slotIdx]}
                        style={{
                          flex: 1, padding: "6px 2px",
                          background: "transparent",
                          border: `1px solid ${alreadyPlaced || slots[slotIdx] ? "#0f2e1c" : "#1a4028"}`,
                          borderRadius: "3px",
                          color: alreadyPlaced || slots[slotIdx] ? "#1a3020" : "#4a7a50",
                          fontSize: "0.65rem", fontFamily: "'Crimson Pro', Georgia, serif",
                          cursor: alreadyPlaced || slots[slotIdx] ? "default" : "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {slotIdx === 0 ? "1st" : slotIdx === 1 ? "2nd" : "3rd"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", paddingTop: "8px" }}>
            <button onClick={onLeave} style={{
              background: "transparent", border: "1px solid #143020",
              borderRadius: "3px", color: "#4a7a50",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "0.85rem", cursor: "pointer", fontStyle: "italic",
              padding: "9px 18px", width: "100%",
            }}>← Return to the storeroom</button>
          </div>
        </>
      )}

      {/* Solved state */}
      {solved && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "0.88rem", color: "#9a8a70", fontStyle: "italic", textAlign: "center", lineHeight: 1.8 }}>
            A sound — deep, mechanical, older than the room itself.<br/>
            The bar lifts.
          </div>
          <button
            onClick={onWin}
            style={{
              padding: "11px 32px", background: "transparent",
              border: "1px solid #8a6e2a", borderRadius: "2px",
              color: "#c9a84c", fontFamily: "'Cinzel', serif",
              fontSize: "0.7rem", letterSpacing: "3px",
              textTransform: "uppercase", cursor: "pointer",
            }}>
            Follow Nico Through →
          </button>
        </div>
      )}

      <style>{`
        @keyframes lockShake {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-5px); }
          40%  { transform: translateX(5px); }
          60%  { transform: translateX(-4px); }
          80%  { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
function Tealby() {
  const [started, setStarted] = useState(false);
  const [thread, setThread] = useState(MAX_THREAD);
  const [sceneId, setSceneId] = useState("opening");
  const [lastChoice, setLastChoice] = useState(null);
  const [revealNote, setRevealNote] = useState(null);
  const [gainNote, setGainNote] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showChapterEnd, setShowChapterEnd] = useState(false);
  const [examinedIds, setExaminedIds] = useState(new Set());
  const [consumedIds, setConsumedIds] = useState(new Set());
  const [lastThreadDelta, setLastThreadDelta] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [stallsVisited, setStallsVisited] = useState(new Set());
  const [hasBaileyKey, setHasBaileyKey] = useState(false);
  const [hasRosePreserve, setHasRosePreserve] = useState(false);
  const [sym1Solved, setSym1Solved] = useState(false); // jar
  const [sym2Solved, setSym2Solved] = useState(false); // hourglass
  const [sym3Solved, setSym3Solved] = useState(false); // infinity
  const [hasHourglass, setHasHourglass] = useState(false);
  const [hasMarble, setHasMarble] = useState(false);
  const [hasBirdSkull, setHasBirdSkull] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1); // "chapter" | "game"
  const scrollRef = useRef(null);

  const scene = SCENES[sceneId];
  const tone = threadTone(thread);
  const prose = scene?.prose?.[tone] || scene?.prose?.high || [];
  const nicoDesc = scene?.nico ? NICO[scene.nico] : "";
  const threadPct = (thread / MAX_THREAD) * 100;
  const threadColor = threadBarColor(lastThreadDelta);

  // Chapter header label
  const chapterLabel = currentChapter === 1 ? "Chapter One · The Waking"
    : currentChapter === 2 ? "Chapter Two · The Fair"
    : currentChapter === 3 ? "Chapter Three · The Storeroom"
    : "Chapter Four · The Crypt";

  // Dynamic fair hub choices — inject Bailey once 2 stalls visited, swap door if key held
  const getChoices = () => {
    if (!scene?.choices && !scene?.isCh3Hub) return [];
    let choices = scene.choices || [];

    if (scene.isFairHub) {
      const baileyUnlocked = stallsVisited.size >= 2 && !examinedIds.has("bailey_leave");
      const baileyDone = examinedIds.has("bailey_leave") || hasBaileyKey;
      if (baileyUnlocked && !baileyDone) {
        choices = [
          ...choices,
          {
            id: "visit_bailey", type: "fairvisit", next: "bailey_first",
            label: "Approach the strange woman near the back lane",
            thread: 0, stallKey: "bailey",
          },
        ];
      }
    }

    if (scene.isCh3Hub) {
      choices = [
        { id: "ch3hub_lock", type: "progress", next: "examine_lock", label: "Try the lock", thread: 0 },
        { id: "ch3hub_crates", type: "examine", next: "examine_crates", label: "Go to the crates", thread: 0, hideIfConsumed: "hourglass" },
        { id: "ch3hub_shelves", type: "examine", next: "examine_shelves", label: "Check the shelves", thread: 0, hideIfConsumed: "marble" },
        { id: "ch3hub_sacks", type: "examine", next: "examine_sacks", label: "Look at the sacks", thread: 0, hideIfConsumed: "skull" },
        { id: "ch3hub_jars", type: "examine", next: "examine_floor_jars", label: "Look at the floor jars", thread: 0, hideIfConsumed: "storeroom_jar" },
        { id: "ch3hub_drawers", type: "examine", next: "examine_drawers", label: "Open the chest of drawers", thread: 0, hideIfConsumed: "note" },
      ].filter(c =>
        !(c.consumable && consumedIds.has(c.consumable)) &&
        !(c.hideIfConsumed && consumedIds.has(c.hideIfConsumed)) &&
        !(c.requiresConsumed && !consumedIds.has(c.requiresConsumed))
      );
    }

    // Swap door examine if we have the key
    if (sceneId === "back_lane" && hasBaileyKey) {
      choices = choices.map(c =>
        c.id === "examine_door"
          ? { ...c, next: "examine_storeroom_door_keyed", label: "Look at the door — you have Bailey's key" }
          : c
      );
    }

    return choices
      .filter(c =>
        !(c.consumable && consumedIds.has(c.consumable)) &&
        !(c.hideIfConsumed && consumedIds.has(c.hideIfConsumed)) &&
        !(c.requiresConsumed && !consumedIds.has(c.requiresConsumed))
      );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [sceneId]);

  const applyThread = (delta) => {
    if (!delta) return;
    setThread(t => Math.max(0, Math.min(MAX_THREAD, t + delta)));
  };

  const goToScene = (nextId, choiceLabel, threadDelta, reveal, gain) => {
    setAnimating(true);
    setLastChoice(choiceLabel);
    setRevealNote(null);
    setGainNote(null);
    setLastThreadDelta(threadDelta ?? 0);
    applyThread(threadDelta);

    setTimeout(() => {
      const nextScene = SCENES[nextId];
      setSceneId(nextId);

      // Apply scene-level thread/gain on high tone
      if (tone === "high") {
        if (nextScene?.threadHigh) applyThread(nextScene.threadHigh);
        if (reveal) setRevealNote(reveal);
        if (gain || nextScene?.gainHigh) setGainNote(gain || nextScene.gainHigh);
      }

      if (nextScene?.isChapterEnd) {
        // 8:14 callback — only on Ch1 end, only if player noticed the hallway clock
        if (currentChapter === 1 && examinedIds.has("examine_clock")) {
          applyThread(T.GAIN_MD);
          setLastThreadDelta(T.GAIN_MD);
          setRevealNote("Eight fourteen. The same as the clock in the hallway. You file it away carefully.");
        }
        // Ch3 end — Nico led you here
        if (currentChapter === 3) {
          setRevealNote("He didn't hesitate. He knew the way.");
        }
        setTimeout(() => setShowChapterEnd(true), 1400);
      }
      setAnimating(false);
    }, 280);
  };

  const handleChoice = (choice) => {
    if (animating) return;
    const isLoop = choice.type === "examine" || choice.type === "toedip";
    if (isLoop) setExaminedIds(prev => new Set([...prev, choice.id]));
    if (choice.consumable) setConsumedIds(prev => new Set([...prev, choice.consumable]));
    // Track stall visits for Bailey gate
    if (choice.stallKey) setStallsVisited(prev => new Set([...prev, choice.stallKey]));
    // Bailey key acquired
    const target = SCENES[choice.next];
    if (target?.isChapterKey) setHasBaileyKey(true);
    if (choice.id === "take_preserve") setHasRosePreserve(true);
    if (choice.id === "take_hourglass") setHasHourglass(true);
    if (choice.id === "take_marble") setHasMarble(true);
    if (choice.id === "take_skull") setHasBirdSkull(true);
    if (choice.id === "take_note") setHasNote(true);
    // Chapter transition
    if (choice.next === "ch2_opening") setCurrentChapter(2);
    if (choice.next === "ch3_opening") {
      setCurrentChapter(3);
      if (hasRosePreserve) setSym1Solved(true);
    }
    goToScene(
      choice.next,
      choice.label,
      choice.thread || 0,
      target?.revealHigh || null,
      target?.gainHigh
        ? (target.gainHighPre && !hasBaileyKey ? target.gainHighPre : target.gainHigh)
        : null,
    );
  };

  const handleReturn = () => {
    if (animating || !scene?.returnTo) return;
    setAnimating(true);
    setRevealNote(null);
    setGainNote(null);
    setLastChoice(null);
    // Do NOT reset lastThreadDelta — bar holds its colour on Back
    setTimeout(() => {
      setSceneId(scene.returnTo);
      setAnimating(false);
    }, 280);
  };

  const handleMiniGameWin = () => {
    setHasRosePreserve(true);
    setConsumedIds(prev => new Set([...prev, "rose_preserve"]));
    const next = scene?.winNext || "stall_preserves";
    const target = SCENES[next];
    goToScene(next, "You matched all four pairs.", T.DRAIN_SM, target?.revealHigh || null, null);
  };

  const handleLockWin = () => {
    const next = scene?.winNext || "ch3_end";
    goToScene(next, "The bar lifts. The door opens.", T.GAIN_LG, null, null);
  };

  const handleLockLeave = () => {
    goToScene("ch3_hub", "You gather your things and step back.", 0, null, null);
  };

  const jumpToScene = (sceneId, chapter, withItems = {}) => {
    setSceneId(sceneId);
    setCurrentChapter(chapter);
    setLastChoice(null);
    setRevealNote(null);
    setGainNote(null);
    setShowChapterEnd(false);
    setLastThreadDelta(null);
    setAnimating(false);
    setDevMenuOpen(false);
    setStarted(true);
    // Optional item grants for testing Ch3
    if (withItems.hourglass) setHasHourglass(true);
    if (withItems.marble) setHasMarble(true);
    if (withItems.rosePreserve) setHasRosePreserve(true);
    if (withItems.baileyKey) setHasBaileyKey(true);
    if (withItems.skull) setHasBirdSkull(true);
  };

  const handleMiniGameLose = () => {
    const next = scene?.loseNext || "stall_preserves";
    const target = SCENES[next];
    goToScene(next, "You couldn't match them in time.", T.GAIN_SM, null, target?.gainHigh || null);
  };

  const handleRestartChapter = () => {
    setThread(MAX_THREAD);
    setSceneId("opening");
    setLastChoice(null);
    setRevealNote(null);
    setGainNote(null);
    setShowChapterEnd(false);
    setExaminedIds(new Set());
    setConsumedIds(new Set());
    setLastThreadDelta(null);
    setMenuOpen(false);
    setConfirmAction(null);
    setInventoryOpen(false);
    setStallsVisited(new Set());
    setHasBaileyKey(false);
    setHasRosePreserve(false);
    setSym1Solved(false);
    setSym2Solved(false);
    setSym3Solved(false);
    setHasHourglass(false);
    setHasMarble(false);
    setHasBirdSkull(false);
    setHasNote(false);
    setCurrentChapter(1);
  };

  const handleRestartGame = () => {
    setStarted(false);
    setThread(MAX_THREAD);
    setSceneId("opening");
    setLastChoice(null);
    setRevealNote(null);
    setGainNote(null);
    setShowChapterEnd(false);
    setExaminedIds(new Set());
    setConsumedIds(new Set());
    setLastThreadDelta(null);
    setMenuOpen(false);
    setConfirmAction(null);
    setInventoryOpen(false);
    setStallsVisited(new Set());
    setHasBaileyKey(false);
    setHasRosePreserve(false);
    setSym1Solved(false);
    setSym2Solved(false);
    setSym3Solved(false);
    setHasHourglass(false);
    setHasMarble(false);
    setHasBirdSkull(false);
    setHasNote(false);
    setCurrentChapter(1);
  };

  // Inventory items — always present baseline plus acquired items
  const inventoryItems = [
    { id: "phone",   label: "Phone",         desc: "No signal. Camera still works." },
    { id: "charger", label: "Charger",        desc: "Tangled in the bottom of the bag. Useless without a socket." },
    { id: "headphones", label: "Headphones", desc: "Earbuds. One slightly louder than the other." },
    { id: "lanyard", label: "Work lanyard",  desc: "Still clipped to the inside pocket. A name badge for somewhere that feels very far away." },
    ...(hasBaileyKey ? [{ id: "baileykey", label: "Bailey's key", desc: "Old iron. Heavy. Worn smooth at the bow. Borrowed from the repair man — he won't notice one missing, apparently." }] : []),
    ...(hasRosePreserve ? [{ id: "rosejar", label: "Dark preserve", desc: "One of Rose's unlabelled jars. Heavier than it should be. You haven't opened it." }] : []),
    ...(consumedIds.has("storeroom_jar") && !hasRosePreserve ? [{ id: "storeroomjar", label: "Storeroom jar", desc: "Found in the corner. Cold and heavy. No label, no markings except a single claw mark scratched nearby." }] : []),
    ...(hasHourglass ? [{ id: "hourglass", label: "Brass hourglass", desc: "Small and tarnished. The sand inside doesn't move when you tilt it. Frozen mid-fall." }] : []),
    ...(hasMarble ? [{ id: "marble", label: "Marble infinity symbol", desc: "Carved from solid white marble with gold veins. The infinity symbol runs deep — not etched on, but formed as part of the stone. The grooves are filled with something dark. Too beautiful for where you found it." }] : []),
    ...(hasBirdSkull ? [{ id: "birdskull", label: "Bird skull", desc: "Light as paper. Hollow. The beak still intact." }] : []),
    ...(consumedIds.has("note") ? [{ id: "note", label: "Folded note", desc: "In careful handwriting: Preserved. In time. Forever." }] : []),
  ];

  if (!started) {
    return (
      <>
        <style>{FONTS}</style>
        <div style={{
          minHeight: "100dvh", background: "#0d2318",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 28px", fontFamily: "'Crimson Pro', Georgia, serif",
          textAlign: "center", position: "relative",
        }}>
          <div style={{
            fontSize: "0.65rem", letterSpacing: "5px", color: "#8a6e2a",
            textTransform: "uppercase", marginBottom: "32px",
            fontFamily: "'Cinzel', serif",
          }}>A Story For Sarah</div>

          <div style={{
            fontSize: "3rem", color: "#c9a84c", marginBottom: "6px",
            fontFamily: "'Cinzel', serif", fontWeight: "600", lineHeight: 1.1,
          }}>The Tale of Tealby</div>

          <div style={{
            fontSize: "0.95rem", color: "#7a6820", marginBottom: "56px",
            fontStyle: "italic", letterSpacing: "2px",
          }}>Where the path leads</div>

          <div style={{
            width: "1px", height: "56px",
            background: "linear-gradient(to bottom, transparent, #8a6e2a, transparent)",
            marginBottom: "56px",
          }} />

          <div style={{
            fontSize: "0.95rem", color: "#7a6a58", lineHeight: 2,
            maxWidth: "280px", marginBottom: "56px",
          }}>
            A mystery in five chapters.<br /><br />
            There is no better guide than Nico, your faithful companion
          </div>

          <button onClick={() => setStarted(true)} style={{
            padding: "14px 40px", background: "transparent",
            border: "1px solid #8a6e2a", borderRadius: "2px",
            color: "#c9a84c", fontFamily: "'Cinzel', serif",
            fontSize: "0.75rem", letterSpacing: "4px",
            textTransform: "uppercase", cursor: "pointer",
          }}>
            Begin
          </button>

          <div style={{
            position: "absolute", bottom: "28px",
            fontSize: "0.58rem", color: "#1a3a24",
            letterSpacing: "3px", textTransform: "uppercase",
            fontFamily: "'Cinzel', serif",
          }}>Cult of the Heavenly Children</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONTS}{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .para { animation: fadeIn 0.45s ease forwards; opacity: 0; }
        .btn:active { opacity: 0.65; transform: scale(0.99); }
      `}</style>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}>
          <div style={{
            background: "#0d2318", border: "1px solid #2a4a30",
            borderRadius: "4px", padding: "32px 28px", minWidth: "260px",
            textAlign: "center",
          }}>
            {!confirmAction ? (
              <>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: "0.7rem",
                  color: "#8a6e2a", letterSpacing: "3px",
                  textTransform: "uppercase", marginBottom: "24px",
                }}>Menu</div>
                <button onClick={() => setConfirmAction("chapter")} style={{
                  display: "block", width: "100%", padding: "11px 14px",
                  marginBottom: "10px", background: "transparent",
                  border: "1px solid #2a4a30", borderRadius: "3px",
                  color: "#a0c0a0", fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.9rem", cursor: "pointer", textAlign: "left",
                }}>↺ Restart Chapter</button>
                <button onClick={() => setConfirmAction("game")} style={{
                  display: "block", width: "100%", padding: "11px 14px",
                  marginBottom: "24px", background: "transparent",
                  border: "1px solid #2a4a30", borderRadius: "3px",
                  color: "#a0c0a0", fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.9rem", cursor: "pointer", textAlign: "left",
                }}>↺ Restart Game</button>
                <button onClick={() => setMenuOpen(false)} style={{
                  background: "transparent", border: "none",
                  color: "#3a5a40", fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.8rem", cursor: "pointer", fontStyle: "italic",
                }}>← Back</button>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: "0.9rem", color: "#c0b09a", marginBottom: "8px",
                  lineHeight: 1.6,
                }}>
                  {confirmAction === "chapter"
                    ? "Restart from the beginning of this chapter?"
                    : "Return to the title screen? All progress will be lost."}
                </div>
                <div style={{
                  fontSize: "0.78rem", color: "#4a6a50", fontStyle: "italic",
                  marginBottom: "24px",
                }}>This cannot be undone.</div>
                <button
                  onClick={confirmAction === "chapter" ? handleRestartChapter : handleRestartGame}
                  style={{
                    display: "block", width: "100%", padding: "11px 14px",
                    marginBottom: "10px", background: "#160e08",
                    border: "1px solid #6a2a1a", borderRadius: "3px",
                    color: "#c0604a", fontFamily: "'Crimson Pro', Georgia, serif",
                    fontSize: "0.9rem", cursor: "pointer", textAlign: "center",
                  }}>Yes, restart</button>
                <button onClick={() => setConfirmAction(null)} style={{
                  background: "transparent", border: "none",
                  color: "#3a5a40", fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.8rem", cursor: "pointer", fontStyle: "italic",
                }}>← Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY OVERLAY */}
      {inventoryOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}>
          <div style={{
            background: "#0d2318", border: "1px solid #2a4a30",
            borderRadius: "4px", width: "90%", maxWidth: "340px",
            maxHeight: "80dvh", display: "flex", flexDirection: "column",
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: "0.7rem",
              color: "#8a6e2a", letterSpacing: "3px",
              textTransform: "uppercase", textAlign: "center",
              padding: "24px 24px 16px", flexShrink: 0,
              borderBottom: "1px solid #0f2e1c",
            }}>Your Belongings</div>

            <div style={{
              overflowY: "auto", padding: "16px 24px",
              display: "flex", flexDirection: "column", gap: "12px",
              WebkitOverflowScrolling: "touch",
            }}>
              {inventoryItems.map(item => (
                <div key={item.id} style={{
                  padding: "10px 14px",
                  background: "#081a10", border: "1px solid #143020",
                  borderRadius: "3px",
                }}>
                  <div style={{
                    fontSize: "0.82rem", color: "#c9a84c",
                    fontFamily: "'Cinzel', serif", letterSpacing: "1px",
                    marginBottom: "4px",
                  }}>{item.label}</div>
                  <div style={{
                    fontSize: "0.78rem", color: "#6a7a60",
                    fontStyle: "italic", lineHeight: 1.6,
                  }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{
              textAlign: "center", padding: "16px 24px",
              borderTop: "1px solid #0f2e1c", flexShrink: 0,
            }}>
              <button onClick={() => setInventoryOpen(false)} style={{
                background: "transparent", border: "none",
                color: "#3a5a40", fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "0.8rem", cursor: "pointer", fontStyle: "italic",
              }}>← Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DEV MENU */}
      {devMenuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}>
          <div style={{
            background: "#0a1a0a", border: "1px solid #2a5a2a",
            borderRadius: "4px", width: "90%", maxWidth: "340px",
            maxHeight: "85dvh", display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "16px 20px 12px", borderBottom: "1px solid #1a3a1a",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#4a9a4a", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>
                Dev — Scene Jump
              </div>
              <button onClick={() => setDevMenuOpen(false)} style={{
                background: "transparent", border: "none", color: "#3a6a3a",
                cursor: "pointer", fontSize: "0.8rem", fontStyle: "italic",
                fontFamily: "'Crimson Pro', Georgia, serif",
              }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Ch1 — Opening", fn: () => jumpToScene("opening", 1) },
                { label: "Ch1 — Downstairs / Hobson", fn: () => jumpToScene("downstairs", 1) },
                { label: "Ch1 — Breakfast", fn: () => jumpToScene("breakfast", 1) },
                { label: "Ch1 — End", fn: () => jumpToScene("ch1_end", 1) },
                { label: "Ch2 — Fair Opening", fn: () => jumpToScene("ch2_opening", 2) },
                { label: "Ch2 — Fair Hub", fn: () => jumpToScene("fair_hub", 2) },
                { label: "Ch2 — Rose's Stall", fn: () => jumpToScene("stall_preserves", 2) },
                { label: "Ch2 — Jar Mini-game", fn: () => jumpToScene("jar_minigame", 2) },
                { label: "Ch2 — Keyes' Stall", fn: () => jumpToScene("stall_keyes", 2) },
                { label: "Ch2 — The Green", fn: () => jumpToScene("the_green", 2) },
                { label: "Ch2 — Back Lane", fn: () => jumpToScene("back_lane", 2) },
                { label: "Ch2 — Bailey (key)", fn: () => { jumpToScene("bailey_gives_key", 2); setHasBaileyKey(true); } },
                { label: "Ch2 — End", fn: () => jumpToScene("ch2_end", 2) },
                { label: "Ch3 — Storeroom", fn: () => jumpToScene("ch3_opening", 3) },
                { label: "Ch3 — Storeroom (all items)", fn: () => jumpToScene("ch3_hub", 3, { hourglass: true, marble: true, rosePreserve: true, skull: true }) },
                { label: "Ch3 — Lock game", fn: () => jumpToScene("lock_minigame", 3, { hourglass: true, marble: true, rosePreserve: true, skull: true }) },
                { label: "Ch3 — End", fn: () => jumpToScene("ch3_end", 3) },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn} style={{
                  width: "100%", padding: "9px 12px", textAlign: "left",
                  background: "transparent", border: "1px solid #1a3a1a",
                  borderRadius: "3px", color: "#5a9a5a",
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.85rem", cursor: "pointer",
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        minHeight: "100dvh", background: "#0d2318",
        display: "flex", flexDirection: "column",
        fontFamily: "'Crimson Pro', Georgia, serif",
        maxWidth: "430px", margin: "0 auto",
      }}>

        {/* HEADER */}
        <div style={{
          padding: "12px 20px 10px",
          borderBottom: "1px solid #0f2e1c",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => { setMenuOpen(true); setConfirmAction(null); }}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "4px 6px 4px 0", display: "flex", flexDirection: "column",
              gap: "4px", alignItems: "flex-start",
            }}
            aria-label="Menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: "block", width: i === 1 ? "14px" : "18px",
                height: "1.5px", background: "#4a6a50",
              }} />
            ))}
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: "0.85rem",
              color: "#c9a84c", letterSpacing: "2px",
            }}>THE TALE OF TEALBY</div>
            <div style={{
              fontSize: "0.6rem", color: "#1a4028",
              letterSpacing: "1px", textTransform: "uppercase", marginTop: "1px",
            }}>{chapterLabel}</div>
          </div>

          {/* Right side — inventory + thread */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setDevMenuOpen(true)}
                aria-label="Dev menu"
                style={{
                  background: "transparent", border: "1px solid #1a3a1a", cursor: "pointer",
                  padding: "2px 5px", lineHeight: 1, fontSize: "0.55rem",
                  color: "#2a5a2a", borderRadius: "2px", letterSpacing: "1px",
                  fontFamily: "'Cinzel', serif",
                }}
              >DEV</button>
              <button
                onClick={() => setInventoryOpen(true)}
                aria-label="Inventory"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "0", lineHeight: 1, fontSize: "1rem",
                  opacity: 0.6,
                }}
              >🎒</button>
            </div>
            <div style={{
              width: "52px", height: "3px",
              background: "#0f2e1c", borderRadius: "2px", overflow: "hidden",
            }}>
              <div style={{
                width: `${threadPct}%`, height: "100%", background: threadColor,
                transition: "width 1s ease, background 0.6s ease",
              }} />
            </div>
          </div>
        </div>

        {/* SCROLL AREA */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto",
          padding: "24px 22px 12px",
          WebkitOverflowScrolling: "touch",
        }}>
          {/* Nico */}
          {nicoDesc && (
            <div style={{
              marginBottom: "18px", padding: "10px 14px",
              background: "#0a1f12", border: "1px solid #143020",
              borderRadius: "3px", animation: "fadeIn 0.5s ease forwards",
            }}>
              <span style={{ fontSize: "1rem", marginRight: "8px" }}>🐕</span>
              <span style={{ fontSize: "0.82rem", color: "#7a6050", fontStyle: "italic" }}>
                {nicoDesc}
              </span>
              {scene?.nicoNote && (
                <div style={{
                  fontSize: "0.72rem", color: "#1a4028",
                  marginTop: "5px", fontStyle: "italic",
                }}>
                  {scene.nicoNote}
                </div>
              )}
            </div>
          )}

          {/* Last choice echo */}
          {lastChoice && (
            <div style={{
              marginBottom: "20px",
              fontSize: "0.78rem", color: "#1a3a24",
              fontStyle: "italic", letterSpacing: "0.3px",
              animation: "fadeIn 0.4s ease forwards",
            }}>
              ❧ {lastChoice}
            </div>
          )}

          {/* Mini-game */}
          {scene?.isMiniGame && (
            <JarMiniGame onWin={handleMiniGameWin} onLose={handleMiniGameLose} />
          )}

          {/* Lock game */}
          {scene?.isLockGame && (
            <LockMiniGame
              onWin={handleLockWin}
              onLeave={handleLockLeave}
              inventory={{
                jar: consumedIds.has("storeroom_jar") && !hasRosePreserve,
                rosejar: hasRosePreserve,
                hourglass: hasHourglass,
                marble: hasMarble,
                skull: hasBirdSkull,
                note: consumedIds.has("note"),
              }}
            />
          )}

          {/* Scene image */}
          {scene?.image && (
            <div style={{ marginBottom: "18px", borderRadius: "6px", overflow: "hidden", border: "1px solid #1a3020" }}>
              <img
                src={scene.image}
                alt=""
                style={{ width: "100%", display: "block", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Prose */}
          {!scene?.isMiniGame && !scene?.isLockGame && prose.map((p, i) => {
            const isSpeech = p.startsWith("—");
            const isItalic = p.startsWith("_");
            const text = isItalic ? p.slice(1) : p;
            // Render *word* as inline italic spans
            const parts = text.split(/(\*[^*]+\*)/g);
            return (
              <p key={`${sceneId}-${i}`} className="para" style={{
                animationDelay: `${i * 0.07}s`,
                fontSize: "1.05rem", lineHeight: 1.9,
                color: isSpeech ? "#a08060" : "#c0b09a",
                margin: "0 0 14px",
                fontStyle: (isSpeech || isItalic) ? "italic" : "normal",
              }}>
                {parts.map((part, j) =>
                  part.startsWith("*") && part.endsWith("*")
                    ? <em key={j} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</em>
                    : part
                )}
              </p>
            );
          })}

          {/* Reveal note */}
          {!scene?.isMiniGame && !scene?.isLockGame && revealNote && (
            <div style={{
              margin: "16px 0", padding: "10px 14px",
              background: "#081a10", border: "1px solid #1a3820",
              borderLeft: "3px solid #4a7a3a", borderRadius: "3px",
              fontSize: "0.8rem", color: "#8a7050", fontStyle: "italic",
              animation: "fadeIn 0.6s ease forwards",
            }}>{revealNote}</div>
          )}

          {/* Gain note */}
          {!scene?.isMiniGame && !scene?.isLockGame && gainNote && (
            <div style={{
              margin: "16px 0", padding: "10px 14px",
              background: "#0c1410", border: "1px solid #1e2e1e",
              borderLeft: "3px solid #3a6040", borderRadius: "3px",
              fontSize: "0.8rem", color: "#6a9070", fontStyle: "italic",
              animation: "fadeIn 0.6s ease forwards",
            }}>{gainNote}</div>
          )}

          <div style={{ height: "12px" }} />
        </div>

        {/* CHOICES */}
        {!showChapterEnd && !scene?.isMiniGame && !scene?.isLockGame && (
          <div style={{
            padding: "10px 18px 32px",
            borderTop: "1px solid #0f2e1c",
            flexShrink: 0,
          }}>
            {scene?.isExamine && (
              <button className="btn" onClick={handleReturn} disabled={animating} style={{
                width: "100%", padding: "9px 14px", marginBottom: "6px",
                background: "transparent", border: "1px solid #143020",
                borderRadius: "3px", color: "#1a4028",
                fontSize: "0.78rem", fontFamily: "'Crimson Pro', Georgia, serif",
                textAlign: "left", cursor: "pointer", fontStyle: "italic",
              }}>← Back</button>
            )}

            {getChoices().map((choice) => {
              const examined = examinedIds.has(choice.id);
              const isProgress = choice.type === "progress";
              const isToedip = choice.type === "toedip";
              return (
                <button
                  key={choice.id}
                  className="btn"
                  onClick={() => handleChoice(choice)}
                  disabled={animating}
                  style={{
                    width: "100%", padding: "11px 14px", marginBottom: "7px",
                    background: isProgress ? "#081a10" : "#0d2318",
                    border: `1px solid ${isProgress ? "#1a3820" : "#143020"}`,
                    borderRadius: "3px",
                    color: isProgress ? "#c9a84c" : examined ? "#1a4028" : "#7a9a78",
                    fontSize: isProgress ? "0.92rem" : "0.85rem",
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    textAlign: "left", cursor: "pointer",
                    lineHeight: 1.4,
                    fontStyle: isToedip ? "italic" : "normal",
                    opacity: animating ? 0.5 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {isProgress ? "→ " : isToedip ? "◦ " : examined ? "✓ " : "· "}
                  {choice.label}
                </button>
              );
            })}
          </div>
        )}

        {/* CHAPTER END */}
        {showChapterEnd && (
          <div style={{
            padding: "28px 24px 44px",
            borderTop: "1px solid #0f2e1c",
            textAlign: "center", flexShrink: 0,
            animation: "fadeIn 1s ease forwards",
          }}>
            <div style={{
              width: "1px", height: "36px",
              background: "linear-gradient(to bottom, transparent, #1a4028)",
              margin: "0 auto 24px",
            }} />
            <div style={{
              fontSize: "0.6rem", color: "#1a4028",
              letterSpacing: "4px", textTransform: "uppercase",
              fontFamily: "'Cinzel', serif", marginBottom: "10px",
            }}>End of {currentChapter === 1 ? "Chapter One" : currentChapter === 2 ? "Chapter Two" : "Chapter Three"}</div>
            <div style={{
              fontSize: "1rem", color: "#7a6a58",
              fontStyle: "italic", marginBottom: "32px",
            }}>{scene?.chapterEndText}</div>
            {currentChapter === 1 ? (
              <button onClick={() => {
                setShowChapterEnd(false);
                setCurrentChapter(2);
                setSceneId("ch2_opening");
                setLastChoice(null);
                setRevealNote(null);
                setGainNote(null);
              }} style={{
                padding: "12px 32px", background: "transparent",
                border: "1px solid #8a6e2a", borderRadius: "2px",
                color: "#c9a84c", fontFamily: "'Cinzel', serif",
                fontSize: "0.75rem", letterSpacing: "3px",
                textTransform: "uppercase", cursor: "pointer",
              }}>Continue →</button>
            ) : currentChapter === 2 ? (
              <button onClick={() => {
                setShowChapterEnd(false);
                setCurrentChapter(3);
                setSceneId("ch3_opening");
                setLastChoice(null);
                setRevealNote(null);
                setGainNote(null);
              }} style={{
                padding: "12px 32px", background: "transparent",
                border: "1px solid #8a6e2a", borderRadius: "2px",
                color: "#c9a84c", fontFamily: "'Cinzel', serif",
                fontSize: "0.75rem", letterSpacing: "3px",
                textTransform: "uppercase", cursor: "pointer",
              }}>Continue →</button>
            ) : (
              <div style={{ fontSize: "0.7rem", color: "#0f2e1c", fontStyle: "italic" }}>
                Coming soon
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Tealby />);
