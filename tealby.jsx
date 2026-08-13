const { useState, useEffect, useRef } = React;

// ============================================================
// THREAD SYSTEM
// 20 = fully herself. 0 = lost to Tealby.
// Never shown as a number. Prose shifts. Bar shifts colour.
// Gains are scarce — only earned by noticing something genuinely wrong.
// ============================================================
const MAX_THREAD = 20;
const T = {
  // Anchored to the 20-point bar and the tone thresholds below.
  // A toe-dip (DRAIN_MD) takes a full player straight to mid; consuming
  // outright (DRAIN_LG) takes them straight to low. Gains are large enough
  // that paying attention can genuinely pull her back out.
  GAIN_LG: 6, GAIN_MD: 3, GAIN_SM: 0,
  DRAIN_LG: -14, DRAIN_MD: -7, DRAIN_SM: -2,
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
        "The light comes through thin curtains, warm and yellow, the way it does on a summer morning when you have slept later than you meant to.",
        "There is a weight across your legs, solid and warm and breathing slowly, and you know before you open your eyes that it is Nico.",
        "The ceiling is low and beamed, with cream plaster between the timbers. There is a small window, curtains printed with flowers, and a bedside table holding a glass of water you do not remember pouring.",
        "You sit up. It is a pretty room, old-fashioned in the way of a good country bed and breakfast: a wardrobe, a small mirror, your bag set carefully on the chair in the corner.",
        "Nico lifts his head and looks at you, and his white chest rises and falls.",
        "You have no memory of arriving here.",
      ],
      mid: [
        "The light comes through thin curtains, warm and yellow, and there is a weight across your legs, which is Nico, lying exactly where he always lies.",
        "The ceiling is low and beamed, with cream plaster between the timbers. There is a small window with flowered curtains, and a bedside table with a glass of water on it, which you suppose you poured last night and have forgotten.",
        "You sit up. It is a pretty room, the sort of room people photograph: a wardrobe, a small mirror, your bag set neatly on the chair in the corner.",
        "Nico lifts his head and watches you without getting up.",
        "You cannot remember arriving. You have never been much good at the ends of long journeys, and it does not seem like the kind of thing to worry about on a morning like this.",
      ],
      low: [
        "The light comes through the thin curtains, warm and yellow, and Nico is a weight across your legs where he belongs.",
        "You lie still for a while and look at the beams in the ceiling, and the flowers printed on the curtains, and the glass of water somebody thought to leave out for you.",
        "You sit up. It is a lovely room. The wardrobe, the little mirror, your bag on the chair in the corner where you put it.",
        "Nico lifts his head and watches you, and you tell him good morning.",
        "You cannot remember arriving, and you decide this is because you were tired, and that being tired is nothing to make a fuss about, and that you are very glad to be here.",
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
        thread: T.DRAIN_MD,
        consumable: "water",
      },
      {
        id: "drink_water", type: "progress", next: "drank_water",
        label: "Drink the water",
        thread: T.DRAIN_LG,
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
        "You put your hand on his flank. He is warm, and his ribs move under your palm.",
        "He does not melt into your hand the way he does at home. He stays sitting upright, with his white toes tucked underneath him and his tail quite still, and he watches the door.",
        "He is not frightened. You have seen him frightened, at fireworks and at the vacuum cleaner, and this is not that.",
        "This is the thing he does on a walk when he has seen something in a field a long way off and has not finished deciding about it.",
      ],
      mid: [
        "You put your hand on his flank. He is warm, and he presses his long nose briefly against your wrist.",
        "He does not lean into your hand the way he usually does, but stays sitting upright with his toes tucked under him, watching the door.",
        "Lurchers are like that. They are all dignity one minute and nonsense the next, and there is no telling which you will get.",
        "His white chest catches the light from the window.",
      ],
      low: [
        "You put your hand on his flank and he is warm, and you tell him he is a good boy, because he is.",
        "He does not lean into your hand this morning, and he keeps his eyes on the door, but he has always been a serious dog and you love him for it.",
        "You scratch the silky black place behind his ears and he allows it.",
        "He is here, and you are here, and that is the whole of it.",
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
        "The room is small and very tidy. Everything has been put where it ought to go, and then put there again, the way a stage is set before anyone comes on.",
        "Your bag has your own things in it. The charger, the headphones, the work lanyard still clipped inside the pocket. Either somebody packed for you, or you packed and cannot remember doing it.",
        "Your phone has no signal at all. Not one bar, or a weak bar. The space where the bars belong is empty.",
        "There is a notecard propped against the mirror on the dresser, cream paper, written in a careful sloping hand.",
        "It says: Lovely to have you back, Sarah. Breakfast is at eight. We are so glad you have come home.",
        "You have never been here before in your life.",
      ],
      mid: [
        "The room is small and very tidy, everything put exactly where it ought to go, which is more than you can say for your own house.",
        "Your bag has your own things in it. The charger, the headphones, the work lanyard still clipped inside the pocket. You must have packed in a hurry.",
        "Your phone has no signal. Villages like this are always dreadful for it, and you have half a mind to enjoy that.",
        "There is a notecard propped against the mirror, cream paper, written in a careful sloping hand. Lovely to have you back, Sarah. Breakfast is at eight.",
        "Back is a strange word for it. You turn it over once and then put it down, because the tea will be going cold somewhere and it is that sort of morning.",
      ],
      low: [
        "The room is small and very tidy and everything is exactly where it ought to be, which is one of the nicest things about being somewhere well kept.",
        "Your bag has your own things in it, the charger and the headphones and your work lanyard, and you think how organised you must have been.",
        "Your phone has no signal, and you find you are pleased about it.",
        "There is a notecard propped against the mirror. Lovely to have you back, Sarah. Breakfast is at eight. We are so glad you have come home.",
        "Back, it says, and home, and you read both words twice because they are kind ones, and because they are true, and because it is nice to be somewhere that knows you.",
      ],
    },
    gainHigh: "You fold the notecard in half and put it in your pocket, without deciding why.",
    threadHigh: T.GAIN_MD,
  },

  // ── EXAMINE: WATER ───────────────────────────────────────
  examine_water: {
    nico: "neutral",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "You pick the glass up and hold it against the window. The water is clear, with nothing settled at the bottom and no colour in it.",
        "You bring it to your nose.",
        "It smells of nothing. Not faintly of the tap, or of the glass, or of the room. There is simply nothing there.",
        "A name arrives in your head, quietly, without your having gone looking for it.",
        "_Aqua Tofana.",
        "You are not sure whether you heard that or thought it.",
        "You put the glass back on the bedside table. Nico watches you do it and his tail does not move.",
      ],
      mid: [
        "You pick the glass up and hold it against the window. The water is clear and there is nothing settled at the bottom of it.",
        "You bring it to your nose, the way you always do, without really meaning to.",
        "There is no smell at all, which you suppose is the point of clean water, though you cannot remember it ever being quite so complete about it.",
        "You put the glass back on the bedside table.",
        "Nico watches you do it. You tell him you are not thirsty, which is true, and he settles back down.",
      ],
      low: [
        "You pick the glass up and hold it against the window and the water is beautifully clear, the way water is when it comes from somewhere with proper springs.",
        "You bring it to your nose out of habit.",
        "There is no smell at all, and you think what a lovely thing that is, and how the water at home always tastes of the pipes.",
        "You put the glass back down on the bedside table without drinking any, and you could not say why.",
        "Nico watches you do it. He is a serious dog and this is a serious morning and everything is quite as it should be.",
      ],
    },
    revealHigh: "You have smelled tap water your whole life without ever noticing it. You notice it now, because there is nothing there to smell.",
  },

  // ── TOE DIP: WATER ───────────────────────────────────────
  toedip_water: {
    nico: "neutral",
    isExamine: true,
    returnTo: "opening",
    prose: {
      high: [
        "You take one mouthful, to see.",
        "It tastes of nothing. Not clean, which is a taste, and not cold, which is a feeling. There is water in your mouth and no information in it at all.",
        "You hold it a moment before you swallow.",
        "Nico's head comes up off the bed. He makes a small sound at the back of his throat that you have not heard him make before, and he does not take his eyes off your mouth until you have finished.",
        "You put the glass back on the bedside table.",
      ],
      mid: [
        "You take one mouthful, to see.",
        "It is cold and clean and there is nothing wrong with it, though it does not taste of very much, and you think perhaps that is what people mean by soft water.",
        "Nico's head comes up off the bed while you swallow, and he watches you until you have finished.",
        "You put the glass down and tell him not to be silly.",
        "He lies back down, but he does it slowly.",
      ],
      low: [
        "You take one mouthful, and then another, because it is very good.",
        "It is cold and clean and it does not taste of anything at all, which is exactly how water ought to be, and you cannot think why anybody bothers with the bottled sort.",
        "Nico's head comes up off the bed while you drink.",
        "You tell him he is being silly, and you mean it kindly, and he lies back down.",
        "You could quite happily finish the glass.",
      ],
    },
    revealHigh: "Water tastes of the pipe and the glass and the place it came from. That tasted of none of those things.",
  },

  // ── DRANK WATER (PROGRESS) ───────────────────────────────
  drank_water: {
    nico: "neutral",
    prose: {
      high: [
        "You drink it down in four long swallows. Halfway through, Nico gets off the bed.",
        "It tastes of nothing at all. It is cold and it is wet and when it is gone you are no less thirsty than you were.",
        "You set the empty glass on the table.",
        "Nico is standing on the rug looking up at you, very still, his white chest rising and falling.",
        "You do not feel well. There is a thickness behind your eyes, and the sharp clear edge you woke up with has gone off somewhere while you were drinking.",
      ],
      mid: [
        "You drink it down in four long swallows, and Nico gets off the bed while you are doing it.",
        "It is cold and clean and exactly what you wanted, and you feel better for it almost at once, more settled, more here.",
        "You set the empty glass on the table.",
        "Nico is standing on the rug looking up at you. You pat the bed and he does not come.",
        "What a lovely little room this is.",
      ],
      low: [
        "You drink it down in four long swallows and it is the best water you have ever tasted.",
        "Nico gets off the bed while you are drinking and stands on the rug and looks up at you, and you pat the covers, and he stays where he is.",
        "You set the empty glass down and think you might have another later.",
        "Everything is soft this morning. The light and the bed and the sound of the village starting up outside.",
        "You could stay here. You think you probably will.",
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
      flinchLow: "For a moment you are looking at an empty glass in your hand and you cannot think why you drank it. Your heart goes hard and quick. Then it passes, and the glass is only a glass.",
  },

  // ── WINDOW ───────────────────────────────────────────────
  window: {
    nico: "alert",
    prose: {
      high: [
        "You pull back the curtain.",
        "Below you there is a village: cobbled streets, honey-coloured stone, window boxes full of late summer flowers. There is a green in the middle with a great oak on it, and bunting in red and gold strung between the lampposts.",
        "People are setting up stalls, carrying crates, laying things out on trestle tables, and they are all working at it with the same unhurried attention.",
        "It is one of the most beautiful places you have ever seen.",
        "It is also completely silent. You can see mouths moving and a child running and a woman laughing with her head back, and through the glass none of it makes any sound.",
        "Morning air comes up through the gap at the sill. It smells of cut grass.",
        "It smells wonderful.",
        "You stand quite still, because you hate that smell, and have hated it for as long as you can remember.",
        "Nico puts his front paws up on the sill beside you with his ears forward. On the green, a sign reads FINCHWICK FAIR, TOMORROW.",
      ],
      mid: [
        "You pull back the curtain.",
        "Below you there is a village: cobbled streets, honey-coloured stone, window boxes, bunting in red and gold strung between the lampposts. It is the sort of place that turns up on a calendar and you assume has been touched up.",
        "People are setting up stalls and carrying crates and laying things out on trestle tables for the fair.",
        "You watch them for a while before you notice you cannot hear any of it, and then you decide the glass must be very good, because these old houses often surprise you.",
        "Morning air comes up through the gap at the sill and it smells green and fresh and lovely.",
        "Nico puts his front paws on the sill beside you and his tail swings once.",
        "On the green there is a sign: FINCHWICK FAIR, TOMORROW. You find you are looking forward to it, which is not like you at all.",
      ],
      low: [
        "You pull back the curtain, and the village underneath is so pretty that you keep hold of the fabric for a moment longer than you need to.",
        "Cobbled streets and honey stone and window boxes, and bunting in red and gold going up between the lampposts for the fair tomorrow.",
        "People are carrying crates and setting out trestle tables, and it is all quite silent, and the silence is restful, and you are glad of it.",
        "The morning air comes up through the sill and smells of cut grass, and it is the loveliest smell in the world.",
        "Nico puts his paws on the sill beside you and looks down at the street.",
        "FINCHWICK FAIR, TOMORROW, says the sign on the green. You had almost forgotten. You are so pleased you will still be here for it.",
      ],
    },
    choices: [
      {
        id: "examine_grass", type: "examine", next: "examine_grass",
        label: "Stay with the smell of cut grass",
        thread: T.GAIN_MD,
      },
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
        "You stand at the window and breathe in properly.",
        "It is cut grass. Fresh, green, the particular sweetness of a lawn that has been mown that morning.",
        "You have hated that smell since you were seven years old. It has always turned your stomach, not badly, but reliably, every summer of your life, and you have never been able to explain it to anybody.",
        "You like it this morning. You like it very much.",
        "Nico's ears do not move.",
        "You stand there a while longer and wonder what else about you has been decided while you were asleep.",
      ],
      mid: [
        "You stand at the window and breathe in properly.",
        "It is cut grass, fresh and green and sweet, and it is one of those smells that makes a person feel about nine years old.",
        "There is something at the back of your mind that says you do not like it, that you have never liked it, and the thought will not come any further forward than that.",
        "You breathe in again to check, and it is lovely, so the thought was probably nothing.",
        "Nico's ears do not move.",
        "You stay at the window a little while, feeling perfectly calm, and you could not tell anybody why you are still standing there.",
      ],
      low: [
        "You stand at the window and breathe in properly, and it is cut grass, and it is wonderful.",
        "Somebody has been out early with a mower, which is exactly the sort of thing they would do here, and you think how lucky you are to have woken up to it.",
        "There is a small thought at the back of your head about hating this smell once, a long time ago, when you were a child and did not know any better.",
        "Children hate all sorts of things for no reason. You grew out of it, evidently.",
        "Nico's ears do not move.",
        "You breathe in again, and again, until the thought has gone quite away, and then you feel much better.",
      ],
    },
    revealHigh: "You have hated the smell of cut grass since you were seven years old. This morning you like it.",
  },

  // ── MEMORY ATTEMPT ───────────────────────────────────────
  memory_attempt: {
    nico: "neutral",
    isExamine: true,
    returnTo: "window",
    prose: {
      high: [
        "You sit on the edge of the bed and shut your eyes.",
        "Yesterday. You want yesterday.",
        "You were at home, and that part comes easily. The purple light on. Brad Mondo on the telly. Nico asleep with his paws going, making those small woofs he makes.",
        "And then.",
        "There is nothing there. Not a blur, or a muddle, or the feeling of having dozed through something. There is home, and there is this room, and between them the page has been taken out cleanly.",
        "Your chest goes tight.",
        "Nico leans his whole weight against your side and stays there.",
      ],
      mid: [
        "You sit on the edge of the bed and shut your eyes and try to get yesterday back.",
        "You were at home. The purple light on, Brad Mondo on the telly, Nico asleep with his paws going.",
        "And then you were here, and the middle of it will not come, though you are certain it will if you leave it alone for an hour.",
        "It is like a name you cannot reach. Pushing at it never works.",
        "Nico leans against your side and you put your hand on his back.",
        "The village is very pretty and it is difficult to feel properly frightened in a room this nice.",
      ],
      low: [
        "You sit on the edge of the bed and shut your eyes and try to remember yesterday, and nothing comes.",
        "You were at home with the purple light on and the telly going, and then you were here, and there is no join between the two.",
        "You think about it for a moment and then you stop, because it is a beautiful morning and there is breakfast to go down to.",
        "People forget journeys all the time. Nobody remembers a motorway.",
        "Nico leans his whole weight against your side.",
        "You tell him you are perfectly all right, and you stand up, and you find that you are.",
      ],
    },
  },

  // ── DOWNSTAIRS ───────────────────────────────────────────
  downstairs: {
    nico: "snarl",
    nicoNote: "The sound is very low. Mrs. Hobson does not react to it.",
    prose: {
      high: [
        "The stairs creak comfortably underfoot. The hallway is papered with small roses faded to blush, and a grandfather clock ticks in the corner.",
        "The front door stands open. Morning air comes in with the smell of baking on it, and underneath that, faintly, cut grass.",
        "It still smells pleasant to you. You take note of that.",
        "A woman comes out of the kitchen drying her hands on her apron. She is perhaps sixty, round-faced, with bright eyes and a smile that arrives a little before it is needed.",
        "— Sarah! she says, as though she has been waiting all morning and is not going to make a fuss about it. You look wonderful. Did you sleep well? You always sleep so well here.",
        "You have never met this woman in your life.",
        "Her name is embroidered on the apron in yellow thread. Hobson.",
      ],
      mid: [
        "The stairs creak comfortably underfoot. The hallway is papered with small faded roses and there is a grandfather clock ticking in the corner.",
        "The front door stands open and the morning comes in smelling of baking and of cut grass.",
        "A woman comes out of the kitchen drying her hands on her apron, perhaps sixty, round-faced, with a smile that gets there very quickly.",
        "— Sarah! she says. You look wonderful. Did you sleep well? You always sleep so well here.",
        "You do not think you have met her, but she has one of those faces, and she is so pleased to see you that it would be unkind to say so.",
        "Her name is embroidered on the apron in yellow thread. Hobson.",
      ],
      low: [
        "The stairs creak comfortably underfoot and the hallway smells of baking and the grandfather clock is ticking in the corner where it always ticks.",
        "The front door is open to the morning.",
        "Mrs Hobson comes out of the kitchen drying her hands on her apron, and her name is stitched on it in yellow, and she is always here in the mornings.",
        "— Sarah! You look wonderful. Did you sleep well? You always sleep so well here.",
        "You tell her you did, because you did, and because she likes to hear it.",
        "It is very nice to be somewhere where they know how you sleep.",
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
        "Eight fourteen. The second hand is going round and the clock is ticking.",
        "You look away, down the hall and out at the open door, and then you look back.",
        "Eight fourteen.",
        "The second hand is still going round. The clock is still ticking.",
      ],
      mid: [
        "Eight fourteen. A handsome old clock, and it is ticking away quite happily.",
        "You look away and then you look back, and it still says eight fourteen.",
        "These old movements stick. Your grandmother had one that lost an hour a week and nobody ever did anything about it.",
        "It is a shame, because it is a lovely piece.",
      ],
      low: [
        "Eight fourteen. Time for breakfast, then.",
        "You look away and back and it says eight fourteen, which is right, because breakfast is at eight and you are a little late.",
        "The clock ticks on behind you as you go down the hall.",
        "It is a comfortable sound, a clock in a hallway. Your grandmother had one.",
      ],
    },
    revealHigh: "The clock is ticking. The hands have not moved.",
  },

  // ── EXAMINE: PHOTOS ──────────────────────────────────────
  hallway_photos: {
    nico: "alert",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "The wall going up the stairs is hung with framed photographs of the village: the fair, the green, groups of people standing in the sun. There are decades of them.",
        "You look along the row, and then you stop.",
        "Near the bottom, in a smaller frame than the rest and yellower than the rest, a woman is standing at the edge of a crowd. Brown hair going lighter at the ends. About your height.",
        "The photograph is faded and she is half turned away and you could not swear to it.",
        "The dog beside her is black with a white patch on his chest, and he is looking straight into the camera.",
        "You look down at Nico. Nico looks up at you.",
        "— Sarah? Hobson calls from the kitchen. Eggs are ready, dear.",
      ],
      mid: [
        "The wall going up the stairs is hung with photographs of the village, the fair and the green and groups of people in the sun, going back years.",
        "One near the bottom catches your eye. A woman at the edge of a crowd with brown hair going lighter at the ends, and a black dog beside her.",
        "You look at it for longer than you meant to.",
        "It could be anybody. Half the country has brown hair and a black dog, and the picture is faded, and she is turned away.",
        "— Sarah? Hobson calls from the kitchen. Eggs are ready, dear.",
        "You go through, and you do not look at it again on the way past.",
      ],
      low: [
        "The wall going up the stairs is hung with photographs of the village and they are all lovely, the fair and the green and the people in the sun.",
        "There is one near the bottom of a woman at the edge of a crowd with a black dog beside her, and you like it best of all of them.",
        "She looks happy. The dog is looking right down the lens, the way dogs do when somebody has said his name.",
        "You think how nice it is that the same families stay in a place like this, year after year, and end up on the wall.",
        "— Sarah? Hobson calls. Eggs are ready, dear.",
        "— Coming, you call back.",
      ],
    },
    gainHigh: "You photograph the photograph. There is no signal, but the camera works.",
    threadHigh: T.GAIN_MD,
  },

  // ── HOBSON: WHERE ────────────────────────────────────────
  hobson_where: {
    nico: "snarl",
    isExamine: true,
    returnTo: "downstairs",
    prose: {
      high: [
        "Something crosses Hobson's face and is gone before you can put a name to it. Then the smile comes back at full strength.",
        "— Why, Tealby, dear.",
        "She says it the way you would tell somebody the colour of the sky.",
        "— Same as always. You really did sleep deeply, didn't you.",
        "She says the name the way other people say home, warmly, and as though it belongs to her.",
        "— Come and have some breakfast. Everything makes more sense after breakfast.",
      ],
      mid: [
        "Hobson looks at you for a moment and then laughs.",
        "— Why, Tealby, dear. Same as always. You really did sleep deeply, didn't you.",
        "You turn the phrase over. Same as always is a great deal to be getting on with.",
        "— Come and have some breakfast, she says. Everything makes more sense after breakfast.",
        "She is already going back to the kitchen, and she is probably right about the breakfast.",
      ],
      low: [
        "— Why, Tealby, dear, says Hobson, and laughs at you, kindly. Same as always.",
        "Tealby. Of course it is.",
        "You laugh too, because it is a silly thing to have asked, and because you like the sound of the name.",
        "— Come and have some breakfast. Everything makes more sense after breakfast.",
        "It always does. You follow her through.",
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
        "Hobson puts her head on one side. The smile does not move at all.",
        "— Well, you have always been a wonderful sleeper here, dear. Since your very first visit.",
        "— My first visit, you say.",
        "— Mm.",
        "She turns back to the kitchen.",
        "— Come on then. The eggs will not stay warm.",
        "She says it with such finality that you are halfway across the hall before you notice she has not answered anything at all.",
      ],
      mid: [
        "Hobson puts her head on one side.",
        "— Oh, you know. You have always settled in so well here. Since your first visit.",
        "You open your mouth to ask which visit she means.",
        "— Come on then, she says. The eggs will not stay warm.",
        "She goes back to the kitchen at exactly the right moment, the way people do when they have a stove on, and the question goes out of your head somewhere between the hall and the table.",
      ],
      low: [
        "— Oh, you know, says Hobson, laughing. You have always settled in so well here.",
        "That is true, and it is a nice thing to have said about you.",
        "— Come on then. The eggs will not stay warm.",
        "You follow her through to the kitchen.",
        "You do like it here. You have always liked it here.",
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
        "You smile, and you say nothing.",
        "Hobson waits. She waits a beat longer than anybody needs to, watching your mouth.",
        "When nothing comes, the smile adjusts. Very slightly, in the way a picture is straightened.",
        "— Come and have some breakfast, dear. You look like you need it.",
        "You have watched a great deal of true crime with your feet up on the sofa, and you know what it looks like when the warmth stops at somebody's eyes.",
      ],
      mid: [
        "You smile, and you say nothing.",
        "Hobson waits, and the wait goes on a little longer than it should, and you have the odd feeling of having missed a cue.",
        "Then she carries on as though nothing has happened.",
        "— Breakfast, then. Come on.",
        "You follow her in. Probably she is a bit deaf, and too polite to say.",
      ],
      low: [
        "You smile, and she smiles, and neither of you says anything, and it is perfectly comfortable.",
        "That is the nice thing about people who have known you a long time. You do not have to fill it.",
        "— Breakfast, then, she says. Come on.",
        "You follow her in.",
        "It is going to be a lovely day.",
      ],
    },
    revealHigh: "She waited. You have been waited at like that in interviews, by people who already had the answer written down in front of them.",
  },

  // ── BREAKFAST ────────────────────────────────────────────
  breakfast: {
    nico: "neutral",
    prose: {
      high: [
        "The kitchen is warm and smells of toast, and under the toast of something richer, herbs, or whatever herbs are before they are herbs.",
        "There is a small table by the window laid for one. Scrambled eggs, toast and butter, a pot of tea, and a glass of orange juice so orange it looks as though it has been painted.",
        "Hobson moves about the kitchen the way somebody does who has done it several thousand times. She talks while she works and she does not look round at you.",
        "— The fair is tomorrow, of course. Mr Keyes has been up since dawn with the setting out. You know how particular he is.",
        "She says it as though you do know.",
        "Under the table Nico lies across your feet, pressed hard against your ankles, and he does not settle.",
      ],
      mid: [
        "The kitchen is warm and smells of toast and of something richer underneath it.",
        "There is a small table by the window laid for one: scrambled eggs, toast and butter, a pot of tea, and a glass of orange juice a very good colour.",
        "Hobson moves about the kitchen talking, and you find yourself letting it wash over you, which is not something you usually allow.",
        "— The fair is tomorrow, of course. Mr Keyes has been up since dawn. You know how particular he is.",
        "You do not know how particular he is, and you mean to say so, and then the tea is poured and the moment has gone.",
        "Under the table Nico lies across your feet.",
      ],
      low: [
        "The kitchen is warm and smells of toast and it is the nicest room in the house.",
        "There is a small table by the window laid for one: scrambled eggs, toast and butter, a pot of tea, and a glass of orange juice the colour of a summer evening.",
        "Hobson talks while she works and her voice goes over you like warm water, about the fair tomorrow and Mr Keyes being up since dawn and how particular he is.",
        "He is very particular. Everybody says so.",
        "You sit down and put your napkin across your lap.",
        "Under the table Nico lies across your feet and will not settle, and you tell him to behave.",
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
        thread: T.DRAIN_MD,
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
        "Soft, properly set, with something green through them. Chives, you think.",
        "They smell exactly as scrambled eggs ought to smell.",
        "Nico's nose comes up at your knee under the table. He sniffs once towards the plate.",
        "Then he takes his head away and lies back down.",
        "Nico has eaten a week-old carton of pesto pasta out of a bin bag on the pavement outside a Co-op. Nico is not a dog with standards.",
        "A moment later his nose comes back, further along, pointing at the toast rack instead, and his tail moves once against the floor.",
      ],
      mid: [
        "Soft, properly set, with something green through them, and they smell exactly as they ought to.",
        "Nico's nose comes up at your knee. He sniffs once towards the plate and then takes his head away.",
        "That is not like him. He begs shamelessly and always has, and you have never once eaten a meal in peace.",
        "Then his nose comes back, pointing at the toast instead, and his tail goes against the floor.",
        "So he is hungry after all, and simply being particular, which is a new one.",
      ],
      low: [
        "Soft, properly set, with chives through them, and they smell wonderful.",
        "Nico's nose comes up at your knee and sniffs towards the plate and then goes away again.",
        "He wants the toast. He has always preferred toast, and he is not getting any, because it is bad for him and he knows it.",
        "You tell him so, under the table, and he puts his chin on your foot.",
        "You pick up your fork.",
      ],
    },
    revealHigh: "Nico once ate a week-old carton of pesto pasta out of a bin bag. He sniffed the eggs and lay back down.",
  },

  // ── EXAMINE: JUICE ───────────────────────────────────────
  examine_juice: {
    nico: "neutral",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "You pick up the glass.",
        "The colour is extraordinary, deeper and more saturated than any juice you have ever poured, like a photograph with the contrast pushed too far.",
        "You tilt it, and it moves thickly against the side.",
        "Across the kitchen there is a woman at a small side table. She has been sitting there since you came in, and she has not said a word.",
        "Her glass of orange juice is the same as yours.",
        "The level in it is exactly where it was when you sat down.",
      ],
      mid: [
        "You pick up the glass. The colour is remarkable, much deeper than the stuff from a carton, so it must be properly squeezed.",
        "You tilt it and it moves thickly against the side.",
        "There is a woman at a small side table across the kitchen. You had not noticed her come in, though she must have, and she has the same juice in front of her.",
        "She has not touched it.",
        "Some people are funny about breakfast. You put your own glass down without drinking any, which is not the same thing at all.",
      ],
      low: [
        "You pick up the glass and hold it to the light, because it is such a lovely colour, like something out of an advertisement.",
        "It moves thickly when you tilt it, which is how you know it is the good sort.",
        "There is a woman at a small side table across the kitchen with the same juice in front of her.",
        "She has not touched hers, and you think she is probably saving it, and that she looks very peaceful sitting there.",
        "It is nice, a house where people can just sit.",
      ],
    },
    revealHigh: "The woman at the side table has been there since you sat down. The level in her glass is exactly where it was.",
  },

  // ── EXAMINE: KITCHEN ─────────────────────────────────────
  examine_kitchen: {
    nico: "alert",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "A well-kept kitchen. Copper pans, herbs drying from a beam, a calendar on the wall with the same date ringed in red over and over again.",
        "On the shelf above the range there is a row of small bottles in dark glass, and none of them are labelled.",
        "There is a recipe book open on the counter with the spine gone soft from use.",
        "From where you are sitting you can just read the name written inside the front cover.",
        "Giulia.",
        "Only the one name. Nobody has written a surname after it.",
      ],
      mid: [
        "A well-kept kitchen. Copper pans, herbs drying from a beam, a calendar on the wall with a date ringed in red.",
        "On the shelf above the range there is a row of small dark bottles with no labels on them, which will be vanilla and almond and the rest, because nobody labels those.",
        "There is a recipe book open on the counter, the spine gone soft, with a name written inside the cover that you cannot quite read from here.",
        "You could get up and look.",
        "You do not, because Hobson is right there, and it would be rude.",
      ],
      low: [
        "A well-kept kitchen, and you love a well-kept kitchen. Copper pans and herbs drying from the beam and a calendar with a date ringed on it.",
        "There is a row of little dark bottles above the range and a recipe book on the counter worn soft at the spine.",
        "Somebody has cooked in this room for a very long time.",
        "There is a name written inside the cover of the book. You cannot read it from here and it does not matter.",
        "You sit and let the warmth of the range get into your shoulders.",
      ],
    },
    gainHigh: "Giulia. You say it twice in your head so that you will still have it later.",
    threadHigh: T.GAIN_MD,
  },

  // ── TOE DIP: EGGS ────────────────────────────────────────
  toedip_eggs: {
    nico: "alert",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "One forkful, to see.",
        "The eggs are extraordinary. They are rich and warm and more than eggs, and the taste does not so much arrive as fill something you did not know was empty.",
        "You put the fork down.",
        "Under the table Nico is whining and putting his paws on your knee.",
        "You push the plate an inch away from you.",
        "Hobson has her back turned and does not see any of it.",
      ],
      mid: [
        "One forkful, to see.",
        "They are extraordinary. Rich and warm and better than eggs have any business being, and you sit for a second with your eyes shut.",
        "Under the table Nico whines and puts his paws on your knee, which he has not done since he was a puppy.",
        "Nico will eat anything. He has never in his life objected to a plate.",
        "You have another forkful anyway, and tell yourself you will look into it later.",
      ],
      low: [
        "One forkful, and then another, because they are the best eggs you have ever eaten.",
        "They are rich and warm and more than eggs, and you eat the lot without stopping.",
        "Under the table Nico whines and puts his paws on your knee and you push him down.",
        "He is being ridiculous this morning. He has been ridiculous since you woke up.",
        "You scrape the plate and you are still hungry.",
      ],
    },
    revealHigh: "Nico has never in his life let food get to your mouth without trying for it. He did not try. He watched your hand come back down and then put his head on your knee and left it there.",
      flinchLow: "Your dog has his paws on your knee and you are still eating. You have never once ignored him. You put the fork down, and pick it up again, and you could not say what happened in between.",
  },

  // ── HOBSON ON KEYES ──────────────────────────────────────
  hobson_keyes: {
    nico: "snarl",
    nicoNote: "Nico's ears go flat at the name.",
    isExamine: true,
    returnTo: "breakfast",
    prose: {
      high: [
        "Hobson stops at the counter. Only for a moment.",
        "— Mr Keyes.",
        "She says it carefully, the way you carry something you have been told is valuable.",
        "— He helps keep things running smoothly. Very dedicated. Very thorough.",
        "— He will be glad you are here, she says. He always makes a point of meeting our guests.",
        "She goes back to wiping the counter, and the subject is closed.",
        "Under the table, Nico has not stopped making his sound.",
        "Very dedicated. Very thorough. You turn the words over. They are not warm words, said in a warm voice.",
      ],
      mid: [
        "Hobson stops at the counter for a moment.",
        "— Mr Keyes. He helps keep things running smoothly. Very dedicated. Very thorough.",
        "— He will be glad you are here, she says. He always makes a point of meeting our guests.",
        "Then she goes back to the counter and starts on the washing up, and you understand that you have finished talking about Mr Keyes.",
        "Under the table Nico shifts against your feet and makes a small sound, and you press your heel down on him until he stops.",
      ],
      low: [
        "— Mr Keyes, says Hobson. Very helpful. You will meet him soon enough.",
        "— He always makes a point of meeting our guests.",
        "That is kind of him, and you say so, and Hobson looks pleased.",
        "You go back to your breakfast.",
        "Under the table, Nico makes a small sound against your ankle, and you press your foot down on him until he stops.",
      ],
    },
      flinchLow: "You look down. Your foot is on your dog. He has gone quiet and he will not look at you. Something in you turns right over and you take your foot away and you cannot think of one reason you did that. Then Hobson says your name and you look up and it is gone.",
  },

  // ── ATE EVERYTHING ───────────────────────────────────────
  ate_everything: {
    nico: "neutral",
    prose: {
      high: [
        "You eat all of it and drink the juice down, and you had not known you were hungry, and in fact you would have said you were not, and once you start you cannot stop.",
        "Afterwards the sharpness of waking in a room you did not know has gone soft at the edges. The village out of the window looks less strange and more lovely. The notecard in your pocket does not feel like very much.",
        "Hobson takes the plate with a pleased look.",
        "— There. That is better, isn't it.",
        "It is not a question.",
      ],
      mid: [
        "You eat all of it and drink the juice down, and you had not realised how hungry you were.",
        "Afterwards you feel steadier. The room is warm and the light is good and whatever it was that had you standing so still at the window has stopped mattering.",
        "Hobson takes the plate with a pleased look.",
        "— There. That is better, isn't it.",
        "It really is, and you say so.",
      ],
      low: [
        "You eat all of it and drink the juice down and you would happily eat it again.",
        "Everything is soft and warm and easy. Whatever you were fretting about upstairs has gone, and good riddance to it, because it was spoiling a lovely morning.",
        "Hobson takes the plate with a pleased look.",
        "— There. That is better, isn't it.",
        "Yes. Much better. You tell her it was the best breakfast you have had in years, and she pats your shoulder on her way past.",
      ],
    },
    choices: [
      {
        id: "progress_outside", type: "progress", next: "ch1_end",
        label: "Head outside into the village",
        thread: 0,
      },
    ],
      flinchLow: "You are holding a clean plate and you do not remember most of the meal. For a second you are frightened of yourself, properly frightened, the way you would be of a stranger in your kitchen. Hobson takes the plate out of your hands. You let her.",
  },

  // ── ATE TOAST ────────────────────────────────────────────
  ate_toast: {
    nico: "neutral",
    prose: {
      high: [
        "The toast is toast. The tea is good and hot and tastes of tea.",
        "You eat, and you watch Hobson move about her kitchen, and you try to hold on to the shape of things.",
        "The notecard. The photograph on the stairs. The way she talks about you as though she keeps a file.",
        "You need to get outside and find somebody who will tell you something true.",
      ],
      mid: [
        "The toast is good and the tea is hot, and you eat slowly and watch Hobson move about the kitchen.",
        "In the warm and the smell of it, this morning is beginning to look like a thing you have made too much of.",
        "She has been nothing but kind. The village is lovely. The tea is exactly how you like it, though you do not remember saying.",
        "You should get outside and see the place properly.",
      ],
      low: [
        "The toast is lovely and the tea is exactly how you like it, and you cannot think how they knew.",
        "You eat slowly and watch Hobson going about her kitchen and it is the most peaceful half hour you have had in a long time.",
        "There is a fair tomorrow. There is a whole village out there in the sun.",
        "You will go out and enjoy the morning, and you will not think about anything at all.",
      ],
    },
    choices: [
      {
        id: "progress_outside_toast", type: "progress", next: "ch1_end",
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
        "You step out of the front door into the morning.",
        "Tealby is all round you: golden stone, cobbles, something sweet cooking at a stall down the street.",
        "And cut grass. Still sweet. You keep hold of the fact that it should not be.",
        "Nico walks at your heel, closer than he usually bothers to, his white toes clicking on the stones.",
        "The bunting moves in a breeze you cannot feel on your face.",
        "Behind you a bell starts ringing, and you turn to look at the tower at the far end of the square.",
        "The clock on it says eight fourteen.",
      ],
      mid: [
        "You step out of the front door into the morning, and it is the prettiest village morning you have ever stood in.",
        "Golden stone, cobbles, something sweet cooking at a stall down the street, and cut grass over the top of all of it.",
        "Nico walks at your heel, closer than usual, his white toes clicking on the stones.",
        "The bunting moves above you, though you cannot feel any wind.",
        "Behind you a bell starts ringing. You turn and look at the tower at the far end of the square.",
        "Eight fourteen, says the clock. You must have been longer over breakfast than you thought.",
      ],
      low: [
        "You step out of the front door into the morning and stand a moment on the step because it is so lovely.",
        "Golden stone and cobbles and something sweet cooking down the street, and cut grass over everything.",
        "Nico walks at your heel with his toes clicking on the stones, keeping very close.",
        "The bunting moves above you. There is no wind on your face, but it is a warm day, and you do not think about it for long.",
        "A bell starts ringing behind you and you turn and look up at the tower at the far end of the square.",
        "Eight fourteen. Breakfast time. You have the whole day in front of you.",
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
        "Stalls run down both sides of the green, bright with bunting and hand-painted signs, and the air over the cobbles smells of hot sugar and of something frying. Somewhere a fiddle is playing, or was playing a moment ago, and you cannot hear it now.",
        "People move through all of it with the unhurried ease of a perfect summer afternoon.",
        "The sign on the oak still reads FINCHWICK FAIR, TOMORROW.",
        "Nobody has taken it down. Nobody is looking at it.",
        "Nico walks at your heel with his white toes going on the stones, and he does not look at any of them.",
      ],
      mid: [
        "The fair is in full swing, bunting and stalls the whole length of the green, and the air smells of hot sugar and frying.",
        "Somewhere a fiddle is playing, or was, and you cannot hear it now over the crowd.",
        "The sign on the oak still says FINCHWICK FAIR, TOMORROW, which somebody has plainly forgotten to change, and you decide not to be the person who points it out.",
        "People move about with the unhurried ease of a perfect summer afternoon.",
        "Nico walks at your heel and does not look at any of them, which is only sense in a crowd this size.",
      ],
      low: [
        "The fair is in full swing and it is exactly as lovely as you knew it would be.",
        "Bunting the whole length of the green, hot sugar and frying on the air, a fiddle going somewhere behind the stalls.",
        "The sign on the oak still says TOMORROW, and you smile at it, because whoever put it up has better things to do today than take it down.",
        "Everyone is unhurried. Nobody is anywhere they do not want to be.",
        "Nico walks at your heel and keeps his eyes down, and you tell him there is nothing here to worry about.",
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
        "The fair goes on around you: noise and colour and the particular busyness of people who are not actually doing anything.",
        "A villager drifts past your shoulder.",
        "— Lovely day for it, they say, to nobody.",
        "Nico does not look up.",
      ],
      mid: [
        "The fair goes on around you, noise and colour and people moving about between the stalls.",
        "A villager drifts past your shoulder and says it is a lovely day for it, and is past you before you can answer, which is how it goes at these things.",
        "Nico does not look up.",
        "You stand a moment and decide where to start.",
      ],
      low: [
        "The fair goes on around you and you could stand in the middle of it all afternoon.",
        "A villager drifts past your shoulder and tells you it is a lovely day for it, and it is, and you say so, though they have gone by then.",
        "Nico does not look up. He has been sulking since the bedroom.",
        "There is so much to see. You do not know where to start.",
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
    prose: {
      high: [
        "The stall is immaculate. Rows of jars, jams and chutneys and pickles, set out with the precision of somebody who takes real pride in it.",
        "Rose is behind the counter, perhaps forty-five, soft-faced and pleasant.",
        "— Everything here is made from scratch, she says, without looking up. We do not believe in waste. Everything has a use. Everything leaves something behind.",
        "At the far end of the stall, half behind a curtain, there are more jars. No labels on those, and a darker colour.",
        "Fred comes out from the back. He does not speak. He looks at you the way you would look at a cut of meat you were deciding about.",
        "Nico has pressed himself against the backs of your knees and will not come any further forward.",
      ],
      mid: [
        "The stall is immaculate, rows of jams and chutneys and pickles set out with real pride.",
        "Rose is behind the counter, soft-faced, pleasant, and she talks while she works without looking up. Everything made from scratch. Nothing wasted. Everything leaves something behind.",
        "There are more jars at the far end behind a curtain, unlabelled and darker, which will be the batches she has not got round to.",
        "Fred comes out from the back and looks at you and does not say anything, and some men are like that.",
        "Nico has pressed himself against the backs of your knees. It will be the vinegar.",
      ],
      low: [
        "The stall is immaculate and you tell Rose so, and she is pleased, and you talk about jam for a while.",
        "Everything made from scratch. Nothing wasted. Everything leaves something behind, she says, and it is a nice way of putting it.",
        "There are unlabelled jars at the far end behind a curtain and you would love to know what is in them.",
        "Fred comes out from the back and looks at you and says nothing at all, and you decide he is shy.",
        "Nico has pressed himself against the backs of your knees and will not come forward, and you have to reach back and pull him along by the collar.",
      ],
    },
    choices: [
      { id: "examine_jars", type: "examine", next: "examine_dark_jars", label: "Look at the unlabelled jars", thread: T.GAIN_MD },
      { id: "ask_rose_waste", type: "examine", next: "rose_waste", label: "\"What do you mean, everything leaves something behind?\"", thread: T.GAIN_MD },
      { id: "preserves_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: 0 },
    ],
  },

  examine_dark_jars: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "You lean past the curtain.",
        "These jars are darker than the others. What is inside them is a deep uneven brown that is not like any preserve you have seen, and one of them has something pale suspended in the middle of it that you cannot make out.",
        "— Those are not ready yet, Rose says, from directly behind you.",
        "You did not hear her move.",
        "— Every batch needs its time. You cannot rush these things.",
        "She stands there and watches you look at them, and she is in no hurry at all.",
      ],
      mid: [
        "You lean past the curtain.",
        "These are darker than the others, a deep uneven brown, and there is something pale suspended in one of them that you cannot make out from here.",
        "— Those are not ready yet, Rose says, from directly behind you, and you did not hear her come over, though you were not listening for her either.",
        "— Every batch needs its time. You cannot rush these things.",
        "She waits while you look, which is polite of her, and you step back and say they look lovely.",
      ],
      low: [
        "You lean past the curtain, because you cannot help yourself, and they are beautiful.",
        "Darker than the others, a deep uneven brown, and one of them has something pale down in the middle of it that catches the light when you tilt your head.",
        "— Those are not ready yet, Rose says, from directly behind you, and you laugh and tell her she caught you.",
        "— Every batch needs its time. You cannot rush these things.",
        "You could look at them all day. You ask when they will be ready and she says soon.",
      ],
    },
    revealHigh: "She moved without sound. The jars have something pale inside them.",
    choices: [
      { id: "jar_game_start", type: "progress", next: "jar_minigame", label: "→ Try to match the jars — something about them won't let you look away", thread: T.DRAIN_SM, consumable: "jar_game" },
    ],
  },

  jar_minigame: {
    nico: "cower",
    isMiniGame: true,
    winNext: "jar_win",
    loseNext: "jar_lose",
  },

  jar_win: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "The last pair turns over, and something lets go in you that you had not noticed tightening.",
        "Rose is watching you from behind the counter. She has not moved at all.",
        "— There, she says. You see how it works now.",
        "She reaches under the curtain and stands one of the dark jars on the counter in front of you.",
        "— A gift. For somebody who pays attention.",
        "It is heavier than it ought to be, and it is in your bag before you have decided anything.",
        "Nico takes one step away from you.",
      ],
      mid: [
        "The last pair turns over and something lets go in you that you had not noticed tightening.",
        "Rose is watching from behind the counter, and she has not moved the whole time.",
        "— There. You see how it works now. A gift, for somebody who pays attention.",
        "She stands one of the dark jars on the counter and it is heavier than it ought to be, and you put it in your bag and thank her properly, because you were brought up to.",
        "Nico takes one step away from you, and you tell him to pack it in.",
      ],
      low: [
        "The last pair turns over and you are so pleased with yourself you laugh out loud.",
        "Rose has been watching the whole time without moving, and she is smiling now.",
        "— There. You see how it works now. A gift, for somebody who pays attention.",
        "She stands one of the dark jars on the counter and you take it in both hands, and it is lovely and heavy, and nobody has given you anything in a long time.",
        "Nico takes one step away from you and you do not look round at him.",
      ],
    },
    revealHigh: "Nico stepped away from you. From you. Not from her.",
  },

  jar_lose: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "The last card turns over. Wrong again.",
        "You step back from the jars. Looking at them for that long has left your eyes feeling wrong in your head.",
        "Rose's face does not change. If anything she looks faintly amused.",
        "— Another time, perhaps, she says, and draws the curtain across.",
        "Nico presses harder against your legs.",
      ],
      mid: [
        "The last card turns over, wrong again, and you step back from the jars with your eyes aching.",
        "You had not realised how long you had been standing there.",
        "Rose's face does not change.",
        "— Another time, perhaps, she says, and draws the curtain across.",
        "You are almost relieved, and you could not tell anybody why.",
        "Nico presses harder against your legs.",
      ],
      low: [
        "The last card turns over, wrong again, and you are genuinely disappointed.",
        "Your eyes ache from staring and you would start again this minute if she let you.",
        "Rose draws the curtain across.",
        "— Another time, perhaps.",
        "You say you will hold her to that.",
        "Nico presses harder against your legs and you step away from him to look at the chutneys.",
      ],
    },
    gainHigh: "You looked away. Whatever was in those jars — you don't have it. That might be the right outcome.",
  },

  rose_waste: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "Rose considers the question as though it were an entirely reasonable one.",
        "— Well. When something has been here, really been here, properly, it leaves an impression. Flavour, you might call it. We just know how to collect it.",
        "She sets a jar of dark jam on the counter in front of you.",
        "— On the house. For coming back.",
        "The low sound in Nico's throat has not stopped since you walked up.",
      ],
      mid: [
        "Rose considers the question as though it were an entirely reasonable one, which is generous of her, because you are not sure it was.",
        "— When something has been here properly, it leaves an impression. Flavour, you might call it. We just know how to collect it.",
        "It is the sort of thing people say about their own cooking.",
        "She sets a jar of dark jam on the counter.",
        "— On the house. For coming back.",
        "Nico has been making a low sound in his throat since you walked up and it has not stopped.",
      ],
      low: [
        "Rose considers the question as though it were the most interesting thing anybody has asked her all day.",
        "— When something has been here properly, it leaves an impression. Flavour, you might call it. We just know how to collect it.",
        "You think that is rather beautiful, and you tell her so.",
        "She sets a jar of dark jam on the counter.",
        "— On the house. For coming back.",
        "Nico is making a low sound in his throat and has been for a while, and you put your hand down and hold his muzzle shut until he stops.",
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
        "You take it and it is heavier than it looks, and Rose watches you put it away with an expression of deep satisfaction.",
      ],
      mid: [
        "You take it. It is heavier than it looks.",
        "Rose watches you put it in your bag with an expression of deep satisfaction.",
        "— Enjoy it. It is best appreciated quietly. On your own.",
        "That is an odd way to recommend a jam, and you are already thanking her before you have finished thinking it.",
        "Nico backs away from you. Only a step, but he does it while looking at you, not at her.",
      ],
      low: [
        "You take it, and it is lovely and heavy, and you hold it a moment before you put it away.",
        "Rose watches you do it and looks very pleased.",
        "— Enjoy it. It is best appreciated quietly. On your own.",
        "You will. You can think of nothing nicer than sitting somewhere quiet with it.",
        "Nico backs away from you, one step, looking at you the whole time, and you tell him not to be so silly.",
      ],
    },
    revealHigh: "Nico stepped away from you. Not from the stall. From you.",
  },

  preserve_declined: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_preserves",
    prose: {
      high: [
        "You leave it where it is on the counter.",
        "Rose's smile does not change. Something behind it does.",
        "— Another time, perhaps, she says.",
        "It does not sound like a pleasantry.",
      ],
      mid: [
        "You leave it where it is on the counter and say you could not possibly.",
        "Rose's smile does not change, though something behind it does, and you have refused enough food from enough people to know when you have offended somebody.",
        "— Another time, perhaps, she says.",
        "You say yes, another time, and you mean it as a kindness.",
      ],
      low: [
        "You leave it where it is, though you very nearly do not, and you feel rude about it for the rest of the afternoon.",
        "Rose's smile does not change.",
        "— Another time, perhaps.",
        "You promise her another time.",
        "It seems a shame. It was a gift and you have hurt her feelings over nothing.",
      ],
    },
  },

  // ── STALL: HINDLEY'S SWEETS ──────────────────────────────
  stall_sweets: {
    nico: "snarl",
    isFairStall: true,
    prose: {
      high: [
        "The sweet stall is bright and cheerful: paper bags, glass jars of humbugs, a sign lettered by hand that reads TREAT YOURSELF.",
        "Myra Hindley is behind the counter. Early fifties, warm smile, the easy manner of somebody who is very good with people.",
        "Very good with children, specifically. You know it the way you sometimes know things about people, without being able to say how.",
        "There are no children at this fair.",
        "She keeps glancing towards the edge of the green, only for a moment each time, and then back to you with the smile fully restored.",
        "— They are mostly for the little ones, she says, holding out a paper bag. But you can have one. We always have enough.",
        "Nico's snarl is very quiet and does not stop.",
      ],
      mid: [
        "The sweet stall is bright and cheerful, paper bags and glass jars of humbugs and a hand-lettered sign reading TREAT YOURSELF.",
        "Myra Hindley is behind the counter, early fifties, warm, easy with people in the way that cannot be learned.",
        "Good with children, you think, and then you notice there are no children at the fair, and then you think they will all be at school, and then you remember it is the summer.",
        "She keeps glancing towards the edge of the green and back again.",
        "— They are mostly for the little ones. But you can have one. We always have enough.",
        "Nico is snarling very quietly and will not stop.",
      ],
      low: [
        "The sweet stall is the nicest one on the green. Paper bags, glass jars of humbugs, TREAT YOURSELF in careful hand-lettering.",
        "Myra Hindley is behind the counter and you take to her at once, the way you do with about one person a year.",
        "She would be marvellous with children. There are no children here today, which is a shame, because they would love this.",
        "She keeps looking off towards the edge of the green while she talks, and you look too, and there is nothing there, and you both laugh about it.",
        "— They are mostly for the little ones. But you can have one. We always have enough.",
        "Nico is snarling very quietly and you shorten the lead until he stops.",
      ],
    },
    choices: [
      { id: "ask_children", type: "examine", next: "hindley_children", label: "\"Where are all the children?\"", thread: T.GAIN_MD },
      { id: "ask_edge", type: "examine", next: "hindley_edge", label: "\"What are you looking at?\"", thread: T.GAIN_MD },
      { id: "take_sweet", type: "toedip", next: "hindley_sweet_taken", label: "Take a sweet", thread: T.DRAIN_MD, consumable: "hindley_sweet" },
      { id: "sweets_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: 0 },
    ],
  },

  hindley_children: {
    nico: "snarl",
    isExamine: true,
    returnTo: "stall_sweets",
    prose: {
      high: [
        "Myra puts her head on one side. The smile does not change.",
        "— Oh, they will be along. They always come, eventually. We are very patient.",
        "She starts arranging the paper bags, giving it a great deal of attention.",
        "— Children find their way here in the end, she says. One way or another.",
        "The subject is closed. She is already looking towards the edge of the green again.",
      ],
      mid: [
        "Myra puts her head on one side and the smile does not change.",
        "— Oh, they will be along. They always come, eventually. We are very patient.",
        "She starts arranging the paper bags, and gives it more attention than paper bags need.",
        "— Children find their way here in the end. One way or another.",
        "You wait for her to say something else and she does not, and you look at the humbugs instead.",
      ],
      low: [
        "Myra puts her head on one side, and she has a lovely way of listening.",
        "— Oh, they will be along. They always come, eventually. We are very patient.",
        "— Children find their way here in the end. One way or another.",
        "That is true of every village. They all come back sooner or later, however far they go.",
        "She goes back to arranging her paper bags and you watch her do it, and it is very restful.",
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
        "She blinks. She looks at you with something that might be surprise and might be a correction being made.",
        "— Nothing, dear. Just keeping an eye on things.",
        "You look towards the edge of the green. The tree line starts there, dark even in the morning sun, and the fair does not go that far.",
        "There is nothing there.",
        "Nico is not looking at the tree line. Nico is looking at Myra.",
      ],
      mid: [
        "She blinks, and there is a small pause before the answer comes.",
        "— Nothing, dear. Just keeping an eye on things.",
        "You look where she has been looking. The tree line starts at the edge of the green, dark even in this sun, and the stalls do not go that far.",
        "There is nothing there, and you feel a bit foolish for asking.",
        "Nico is not looking at the trees. Nico is looking at Myra.",
      ],
      low: [
        "She blinks and then laughs at herself.",
        "— Nothing, dear. Just keeping an eye on things.",
        "You look where she has been looking and there is only the tree line at the edge of the green, dark the way trees are.",
        "People who run stalls are always watching for something. Weather, mostly.",
        "You say you hope it stays fine and she says it always does.",
        "Nico is not looking at the trees. Nico is looking at Myra, and you turn his head away with your hand.",
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
        "It is very good and a little strange, and you have it swallowed before you have finished tasting it.",
      ],
      mid: [
        "It is very good. Sweet and sharp and a bit strange underneath, a flavour you cannot put a name to.",
        "Myra watches you eat it with an expression of complete satisfaction.",
        "— There, she says.",
        "She says it exactly the way Hobson said it over the breakfast plate, the same word with the same weight on it, and the noticing lands somewhere unpleasant and stays there.",
        "You thank her and move on, and the taste stays in your mouth for a long while.",
      ],
      low: [
        "It is wonderful. Sweet and sharp and something else underneath that you cannot name and would like more of.",
        "Myra watches you eat it and looks delighted with you.",
        "— There, she says.",
        "Somebody else said that recently, in that same warm way, and you cannot think who, and it does not matter.",
        "You ask if you might have another and she gives you two.",
      ],
    },
    revealHigh: "She said *there* the same way Hobson did. Exactly the same way.",
  },

  // ── STALL: KEYES & SONS ──────────────────────────────────
  stall_keyes: {
    nico: "cower",
    isFairStall: true,
    prose: {
      high: [
        "The stall is bare. A few tools laid out on a cloth and a list of services written by hand: sharpening, mending, adjustments. Keyes & Sons, though there are no sons here.",
        "Israel Keyes is behind the counter. Lean, methodical, with the stillness of a man who is always waiting for information.",
        "— You are the guest at Hobson's, he says. It is not a question.",
        "He takes out a small notebook and clicks a pen.",
        "— How long are you planning to stay? Is there family expecting you? Are you travelling alone?",
        "He asks the last one while he is already writing.",
        "Nico is flat on the cobbles behind your heels.",
      ],
      mid: [
        "The stall is bare. A few tools on a cloth, a hand-written list of services, Keyes & Sons with no sons anywhere about.",
        "Israel Keyes is behind the counter, lean and methodical and very still.",
        "— You are the guest at Hobson's, he says, and it is not a question, though in a village this size it would not need to be.",
        "He takes out a notebook and clicks a pen. How long are you staying. Is anyone expecting you. Are you travelling alone.",
        "He asks the last one while he is already writing, and you notice that, and you do not do anything about it.",
        "Nico is flat on the cobbles behind your heels.",
      ],
      low: [
        "The stall is bare and businesslike, a few tools on a cloth and a list of services in a good clear hand. Keyes & Sons.",
        "Israel Keyes is behind the counter, lean and methodical, and you like him immediately because he is not wasting anybody's time.",
        "— You are the guest at Hobson's. Everyone knows everyone here, which is one of the nicest things about it.",
        "He takes out a notebook and clicks a pen and asks how long you are staying, and whether anyone is expecting you, and whether you are travelling alone.",
        "It is good of him to take an interest.",
        "Nico is flat on the cobbles behind your heels and refuses to get up.",
      ],
    },
    choices: [
      { id: "keyes_answer", type: "toedip", next: "keyes_answered", label: "Answer his questions", thread: T.DRAIN_MD, consumable: "keyes_questions" },
      { id: "keyes_deflect", type: "examine", next: "keyes_deflected", label: "\"I'm not sure — why do you ask?\"", thread: T.GAIN_MD, hideIfConsumed: "keyes_questions" },
      { id: "keyes_challenge", type: "examine", next: "keyes_challenged", label: "\"Wait — what are you going to do with all that?\"", thread: T.GAIN_MD, requiresConsumed: "keyes_questions" },
      { id: "keyes_keys", type: "examine", next: "keyes_keyring", label: "Notice the keyring on his belt", thread: T.GAIN_MD },
      { id: "keyes_back", type: "progress", next: "fair_hub", label: "← Back to the fair", thread: 0 },
    ],
  },

  keyes_answered: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "You answer all three before you have decided to, and he writes it down, and thanks you.",
      ],
      mid: [
        "You answer. You are not entirely sure why, except that the questions arrive with the weight of forms that have to be filled in, and you have always filled in forms.",
        "Keyes writes it all down and nods once.",
        "— Good. He clicks the pen shut. We like to know who is with us.",
        "He knew already. You understand that the moment the words are out of your own mouth, and by then he has put the notebook away.",
        "He was not asking. He was checking.",
      ],
      low: [
        "You answer all three, and it is a relief to be asked properly for once.",
        "Keyes writes it all down and nods once.",
        "— Good. We like to know who is with us.",
        "That is exactly it. That is what has been so nice about this place from the first morning.",
        "You tell him a bit more than he asked for, because he is easy to talk to, and he writes that down as well.",
        "Nobody at home has ever wanted to know.",
      ],
    },
    revealHigh: "He already knew the answers. He was checking if you'd lie.",
  },

  keyes_deflected: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "Keyes pauses. Something is adjusted behind his eyes, very slightly.",
        "— Just keeping track of our visitors. He smiles. We like everyone to feel accounted for.",
        "He does not write anything in the notebook.",
        "He puts the pen away.",
        "Accounted for. The phrase sits wrong in your chest and stays there.",
      ],
      mid: [
        "Keyes pauses, and something is adjusted behind his eyes.",
        "— Just keeping track of our visitors. We like everyone to feel accounted for.",
        "He does not write anything down. He puts the pen away, which he did not do while you were answering.",
        "Accounted for is not the phrase you would have chosen.",
        "You say you should get on, and he does not stop you.",
      ],
      low: [
        "Keyes pauses.",
        "— Just keeping track of our visitors. We like everyone to feel accounted for.",
        "He puts the pen away without writing anything, and you are sorry to have been difficult.",
        "Accounted for. That is a kind way of putting it. Somewhere there is a list with your name on it and somebody would notice if you were not on it.",
        "Nobody at home keeps a list.",
        "You tell him you will come back when you have more time.",
      ],
    },
    revealHigh: "\"Accounted for.\" He closed the notebook. You gave him nothing and he accepted that. For now.",
  },

  keyes_challenged: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "Keyes looks up from the notebook. Properly, for the first time.",
        "— Record keeping, he says. This is a community. We look after one another. It helps to know who is among us.",
        "He holds your eye for a beat longer than is comfortable.",
        "— You would be surprised how often people are grateful somebody kept track.",
        "He clicks the pen shut and slides the notebook under the counter.",
        "You are not grateful.",
      ],
      mid: [
        "Keyes looks up from the notebook, properly, for the first time.",
        "— Record keeping. This is a community. We look after one another. It helps to know who is among us.",
        "He holds your eye a beat longer than he needs to.",
        "— You would be surprised how often people are grateful somebody kept track.",
        "He slides the notebook under the counter. You did not see what was already written in it.",
      ],
      low: [
        "Keyes looks up from the notebook, properly, for the first time, and answers you straight.",
        "— Record keeping. This is a community. We look after one another. It helps to know who is among us.",
        "— You would be surprised how often people are grateful somebody kept track.",
        "You can imagine. You have been in enough places where nobody kept track of anything.",
        "You apologise for the tone of the question and he waves it away, and you part on good terms.",
      ],
    },
    revealHigh: "\"You'd be surprised how often people are grateful.\" He said it like a warning dressed as a comfort.",
  },

  keyes_keyring: {
    nico: "cower",
    isExamine: true,
    returnTo: "stall_keyes",
    prose: {
      high: [
        "It is a substantial thing. A heavy iron ring with perhaps forty keys on it, old ones and modern ones, padlock keys, cabinet keys, three at least that belong to something large.",
        "He notices you looking.",
        "— I like to be prepared, he says.",
        "He turns a little, so that the keyring is behind him.",
        "Forty keys. You put it away where you can find it again.",
      ],
      mid: [
        "A heavy iron ring on his belt with perhaps forty keys on it. Old ones, modern ones, padlock keys, cabinet keys, three at least for something large.",
        "He notices you looking.",
        "— I like to be prepared.",
        "Then he turns a little, so the keyring is behind him, and goes on talking.",
        "A man who mends things would have keys. That is most of what mending is.",
        "Forty of them, though.",
      ],
      low: [
        "There is a heavy iron ring on his belt with a great many keys on it, and you say he must be trusted with half the village.",
        "— I like to be prepared, he says, and turns a little so it is behind him.",
        "That is exactly the sort of man you want in a place like this. Somebody who can get into anything if there is a reason to.",
        "You have never been organised enough to keep more than three keys.",
        "You tell him so and he laughs, and it is the first time you have heard him do it.",
      ],
    },
    gainHigh: "Forty keys. Bailey said she took one he wouldn't miss.",
    gainHighPre: "Forty keys. You file that away.",
    threadHigh: T.GAIN_MD,
  },

  // ── THE GREEN ────────────────────────────────────────────
  the_green: {
    nico: "ignore",
    isFairStall: true,
    prose: {
      high: [
        "The middle of the green is taken up by the great oak. Three hundred years old at least, the bark deeply furrowed, the canopy wide enough to shade a dozen people.",
        "A group of villagers are standing at the base of it, facing inward. They have not moved since you arrived.",
        "A man goes past with a cup of tea in his hand.",
        "— The fair is on tomorrow, he says cheerfully, to nobody in particular.",
        "You look at the bunting, and the stalls, and the crowd.",
        "_Tomorrow.",
        "Nico sniffs at the man's shoe, then lifts his leg and marks him as though he were a fence post.",
        "The man does not move, or flinch, or look down. He carries on talking to nobody without breaking stride.",
        "— Lovely day for it.",
      ],
      mid: [
        "The middle of the green is taken up by the great oak, three hundred years old at least, the canopy wide enough for a dozen people.",
        "A group of villagers stand at the base of it facing inward, and they have not moved since you arrived, and you decide it is some sort of club.",
        "A man goes past with a cup of tea.",
        "— The fair is on tomorrow, he says, to nobody in particular.",
        "You look at the bunting and the stalls and the crowd, and you nearly say something.",
        "Nico sniffs at the man's shoe and then lifts his leg and marks him like a fence post, and the man does not move or look down or stop talking.",
        "You apologise to his back and pull Nico away, mortified.",
      ],
      low: [
        "The great oak takes up the middle of the green, three hundred years old and beautiful, wide enough to shade a dozen people.",
        "A group of villagers are standing at the base of it facing inward. They have been there since you arrived. You would like to know what they are looking at.",
        "A man goes past with a cup of tea and tells you the fair is on tomorrow, and you say you cannot wait.",
        "Nico sniffs at the man's shoe and lifts his leg and marks him like a fence post.",
        "The man does not move or look down or stop talking, which is very good of him.",
        "You do not apologise, because he has not noticed, and you take Nico away by the collar.",
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
        "The bark is covered in carvings. Names, dozens of them, some weathered right into the wood and some newer. Initials. Full names. Dates beside a few.",
        "You go along them the way you would go along a memorial.",
        "Then you stop.",
        "Third from the bottom, cut recently enough that the wood inside the cut is still pale.",
        "SARAH.",
        "No surname and no date. Only Sarah, and under it two small marks you cannot read.",
        "Nico puts his paw on your foot.",
      ],
      mid: [
        "The bark is covered in carvings. Names, dozens of them, some weathered into the wood and some newer, with dates beside a few.",
        "You go along them the way you would go along a memorial, and then you stop.",
        "Third from the bottom, cut recently enough that the wood inside it is still pale.",
        "SARAH. No surname, no date, and two small marks underneath that you cannot read.",
        "It is not an unusual name. There must be four in this village alone, and you know two at home.",
        "Nico puts his paw on your foot.",
      ],
      low: [
        "The bark is covered in carvings and you could stand here reading them for an hour. Names going back decades, initials, dates.",
        "It is a lovely thing, a tree people put themselves on.",
        "Third from the bottom, cut recently enough that the wood is still pale inside it: SARAH.",
        "You put your fingers in it and smile. Somebody with your name has stood exactly where you are standing.",
        "There are two small marks underneath that you cannot read, and you decide they are hers too.",
        "Nico puts his paw on your foot and you step off it.",
      ],
    },
    gainHigh: "Your name is on this tree. You don't remember carving it.",
    threadHigh: T.GAIN_LG,
      choices: [
      { id: "carve_name", type: "toedip", next: "oak_name_carved", label: "Add yours", thread: T.DRAIN_LG, consumable: "carved" },
    ],
  },

  hollow_circle: {
    nico: "ignore",
    isExamine: true,
    returnTo: "the_green",
    prose: {
      high: [
        "You go over.",
        "There are six of them standing in a rough circle facing inward. None of them speaking. None of them looking at each other.",
        "One turns towards you as you come up.",
        "— We are so glad you came, it says.",
        "It turns back.",
        "Nico sits down beside you and starts cleaning his paw.",
      ],
      mid: [
        "You go over. There are six of them in a rough circle facing inward, not speaking, not looking at one another.",
        "One turns towards you as you come up.",
        "— We are so glad you came.",
        "Then it turns back, and that is the whole of it.",
        "You stand at the edge of them waiting to be included and you are not, and after a while it stops being uncomfortable.",
        "Nico sits down beside you and starts cleaning his paw.",
      ],
      low: [
        "You go over, because they look like they are in the middle of something and you would like to be in the middle of something too.",
        "Six of them in a rough circle facing inward. Nobody speaking. Nobody looking at anybody.",
        "One turns towards you as you come up.",
        "— We are so glad you came.",
        "That is a lovely thing to say to somebody you have never met, and you say so, and it turns back.",
        "You stand at the edge of them for a while and it is very peaceful.",
        "Nico sits down beside you and starts cleaning his paw.",
      ],
    },
    choices: [
      { id: "circle_join", type: "toedip", next: "circle_joined", label: "Step into the gap and turn inward", thread: T.DRAIN_MD, consumable: "joined_circle" },
      { id: "circle_speak", type: "examine", next: "circle_speak_to", label: "Try to speak to one of them", thread: 0 },
      { id: "circle_wave", type: "examine", next: "circle_wave_at", label: "Wave at the nearest one", thread: 0 },
      { id: "circle_closing", type: "examine", next: "circle_ask_closing", label: "\"What's the closing?\"", thread: T.GAIN_MD },
      { id: "circle_nico", type: "examine", next: "circle_nico_shoe", label: "Watch what Nico does", thread: T.GAIN_MD },
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
        "— Have you tried the preserves? it says.",
        "It turns back.",
        "You wait. Nothing else comes.",
      ],
      mid: [
        "— Excuse me, you say.",
        "The nearest one turns.",
        "— Have you tried the preserves?",
        "Then it turns back, and you wait, and nothing else comes.",
        "Some people are hard work at a party. You have been that person yourself on a bad evening.",
        "You try once more and get the same sentence, word for word, at the same speed.",
      ],
      low: [
        "— Excuse me, you say.",
        "The nearest one turns.",
        "— Have you tried the preserves?",
        "You say that you have, and that they were wonderful, and that Rose is a marvel.",
        "It turns back before you have finished.",
        "You do not mind. It is a fair and everyone has somewhere to be, and it was nice of them to recommend something.",
      ],
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
        "— Lovely day for it, it says.",
        "It turns back.",
        "You lower your hand.",
      ],
      mid: [
        "You wave.",
        "One of them turns and looks at your hand rather than at your face, which is an odd thing to do, and says it is a lovely day for it.",
        "Then it turns back.",
        "You lower your hand and feel about nine years old.",
        "Nobody at the fair has looked at your face all morning, now you think of it.",
      ],
      low: [
        "You wave, and one of them turns and looks straight at your hand and says it is a lovely day for it.",
        "It is a lovely day for it. Everyone keeps saying so and everyone is right.",
        "It turns back before you can answer.",
        "You lower your hand and stand with them a while longer.",
        "There is no need to talk. That is rather the point of a day like this.",
      ],
    },
  },

  circle_ask_closing: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "— What is the closing? you ask. What does that mean?",
        "The one nearest you turns.",
        "— You will want to stay for the closing, it says.",
        "It turns back.",
        "You stand there looking at the back of its head.",
      ],
      mid: [
        "— What is the closing? you ask. What does that mean?",
        "The one nearest you turns.",
        "— You will want to stay for the closing.",
        "Then it turns back, and you ask again, and you get the same sentence in the same voice.",
        "You are being told something. You are not being told what.",
        "You stand there looking at the back of its head.",
      ],
      low: [
        "— What is the closing? you ask.",
        "The one nearest you turns.",
        "— You will want to stay for the closing.",
        "Whatever it is, everyone is clearly looking forward to it, and you would hate to be the only one who missed it.",
        "You ask again and get the same answer, and you laugh, because they are all in on something and will not spoil it.",
        "You will find out this evening.",
      ],
    },
    revealHigh: "You asked directly. They just repeated the line. Like they only have the one.",
      choices: [
      { id: "agree_closing", type: "toedip", next: "closing_agreed", label: "Tell them you will stay for it", thread: T.DRAIN_MD, consumable: "agreed_closing" },
    ],
  },

  circle_nico_shoe: {
    nico: "ignore",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "Nico stands up, stretches, and wanders over to the nearest figure with the air of a dog who has no plans at all.",
        "He sniffs at its shoe.",
        "Then he lifts his leg and marks it as though it were a fence post.",
        "The figure does not move, or flinch, or look down.",
        "— We are so glad you came, it says, to the middle distance.",
        "A single tear runs down its cheek.",
        "Its smile does not change.",
        "Nico trots back and sits on your foot.",
      ],
      mid: [
        "Nico stands up, stretches, and wanders over to the nearest figure like a dog with no plans at all.",
        "He sniffs at its shoe, and then he lifts his leg and marks it, unhurried, the way he would a fence post.",
        "The figure does not move or flinch or look down.",
        "— We are so glad you came, it says, to the middle distance.",
        "One tear goes down its cheek while it is saying it, and the smile does not change at all.",
        "Nico trots back and sits on your foot, and you do not tell him off.",
      ],
      low: [
        "Nico wanders over to the nearest one and does something extremely rude against its leg, and you are so embarrassed you could put your hands over your face.",
        "The figure does not move or flinch or look down.",
        "— We are so glad you came, it says, to nobody in particular.",
        "One tear goes down its cheek while it says it, and the smile does not change.",
        "Hay fever, probably. Half the county has it this time of year.",
        "Nico trots back and sits on your foot and you push him off.",
      ],
    },
    revealHigh: "It cried. Just the one tear, just the one time, while it smiled and said nothing real. Something is still in there.",
  },

  // ── BACK LANE ────────────────────────────────────────────
  back_lane: {
    nico: "alert",
    isFairStall: true,
    prose: {
      high: [
        "A narrow lane runs along behind the row of stalls. Cobbles, brick walls, crates left where they were put down. The sound of the fair is muffled back here.",
        "It is quieter. It is more real than the green, and you could not say why.",
        "At the far end there is a door set into the wall. Heavy oak, iron fittings, no sign on it. It looks as though it belongs to something older than the buildings on either side of it.",
        "Nico's ears are right forward. He is interested in the door and he is not frightened of it, and he is putting it away for later.",
      ],
      mid: [
        "A narrow lane runs behind the row of stalls. Cobbles, brick walls, crates left where somebody put them down.",
        "The fair sounds a long way off back here, and you find you are breathing more easily than you were on the green.",
        "At the far end there is a door set into the wall, heavy oak with iron fittings and no sign on it, and it looks older than the buildings either side of it.",
        "Nico's ears are right forward and he is watching it steadily, and he is not frightened.",
      ],
      low: [
        "A narrow lane behind the stalls, cobbles and brick and a few crates. You are not really supposed to be down here.",
        "The fair sounds a long way off, and after all that noise the quiet is lovely.",
        "There is a door at the far end, heavy oak with iron fittings, older than the buildings either side of it. Storage, most likely.",
        "Nico's ears are right forward and he will not take his eyes off it, and you tell him there is nothing in there but crates.",
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
        "Old oak, iron fittings, and a keyhole with the metal worn bright around it from use.",
        "There is no handle on this side. Only the keyhole.",
        "You push it. It does not move.",
        "Nico sits down in front of it, perfectly still, and looks at you.",
      ],
      mid: [
        "Old oak and iron fittings, and a keyhole with the metal worn bright around it, which means somebody uses it often.",
        "There is no handle on this side at all. Only the keyhole.",
        "You push it and it does not give, and you had not really expected it to.",
        "Nico sits down in front of it, perfectly still, and looks at you until you look back.",
      ],
      low: [
        "Old oak and iron fittings and a keyhole worn bright with use. Somebody is in and out of here all the time.",
        "No handle on this side. You push it anyway and it does not move.",
        "It will be where they keep the trestle tables.",
        "Nico sits down in front of it and will not come away, and you have to pull him.",
        "There is a whole fair back there and he wants to sit in a lane and look at a door.",
      ],
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
        "You have Bailey's key in your hand.",
        "Nico gets up from where he has been sitting and puts his nose to the gap along the bottom of the door.",
        "His tail moves. Once.",
      ],
      mid: [
        "The door, and the keyhole worn bright, and Bailey's key in your hand.",
        "Nico gets up from where he has been sitting and puts his nose to the gap along the bottom of the door.",
        "His tail moves once, which it has not done since the bedroom.",
        "You stand with the key in your fingers and do not put it in yet.",
      ],
      low: [
        "The door, and the key that woman gave you, which you are still not sure you should have taken.",
        "Nico gets up and puts his nose to the gap along the bottom and his tail moves once.",
        "It is somebody's storeroom. You would not want a stranger going through yours.",
        "Still. He wants to. And there is nothing else down this lane.",
        "You turn the key over in your fingers.",
      ],
    },
    choices: [
      { id: "use_baileys_key", type: "progress", next: "storeroom_enter", label: "→ Try Bailey's key", thread: T.GAIN_MD },
    ],
  },

  storeroom_enter: {
    nico: "alert",
    prose: {
      high: [
        "The key turns.",
        "There is a sound like something letting a breath out, and the door swings inward on a darkness that smells of cold stone and of something older than that.",
        "Stone steps go down.",
        "Nico does not wait. He goes through first and his white chest goes out of sight into the dark.",
        "You stand on the threshold.",
      ],
      mid: [
        "The key turns, and there is a sound like something letting a breath out, and the door swings inward.",
        "Cold stone, and under it something older, and stone steps going down out of the light.",
        "Nico does not wait for you. He goes through first and his white chest disappears into it.",
        "You stand on the threshold with your hand still on the key.",
        "It is a cellar. Every old building has one.",
      ],
      low: [
        "The key turns and the door lets out a breath and swings inward on stone steps going down.",
        "It smells of cold stone and of something underneath that.",
        "Nico does not wait. He is through and gone before you can get hold of his collar.",
        "You stand on the threshold and call him and he does not come back.",
        "You have never known him do that. You will have to go down after him.",
      ],
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
        "She is sitting on an upturned crate at the mouth of the back lane, eating an apple and watching the fair with the relaxed attention of somebody at the theatre.",
        "She clocks you from twenty feet off and does not look surprised.",
        "— You have got the look, she says, instead of hello.",
        "She is perhaps thirty, dark-haired, wearing layers of mismatched jewellery and a coat far too heavy for the weather with a great many pockets in it. She waves the apple at the stalls.",
        "— The look of somebody who knows something is wrong even when everything looks fine. I have been waiting for one of those.",
        "Nico walks straight up to her and pushes his long nose into her hand.",
        "He has not done that to anybody here.",
        "— Hello, lovely, she says to him. Good dog. Very smart dog.",
        "She looks back up at you.",
        "— Sit down. We should talk.",
      ],
      mid: [
        "She is sitting on an upturned crate at the mouth of the back lane, eating an apple, watching the fair like somebody at the theatre.",
        "She clocks you from twenty feet off and does not look surprised.",
        "— You have got the look, she says, instead of hello. Like somebody who knows something is wrong even when everything looks fine.",
        "She is perhaps thirty, dark-haired, in a great deal of mismatched jewellery and a coat much too heavy for the weather.",
        "Nico walks straight up to her and pushes his nose into her hand, which he has not done to anybody else all day.",
        "— Sit down, she says. We should talk.",
      ],
      low: [
        "There is a woman on an upturned crate at the mouth of the back lane, eating an apple and watching everybody.",
        "She is about thirty, dark-haired, wearing far too many necklaces and a coat much too heavy for the day.",
        "— You have got the look, she says, instead of hello.",
        "You do not know what she means and you are not sure you like the way she says it, sitting there judging a fair that has done nothing to her.",
        "Nico goes straight to her and puts his nose in her hand, the traitor.",
        "— Sit down, she says. We should talk.",
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
        "— This place, she says, and waves the apple at all of it, feeds on something. I do not know exactly what. I have seen things like it before in different shapes. But people go *thin* here. Like something is eating the parts of them that matter.",
        "She takes a bite.",
        "— Those ones out there. The ones who stand about saying lovely day for it.",
        "She draws a finger across her temple.",
        "— Gone. Whatever made them themselves has been eaten. What is walking round out there is the packaging.",
        "She looks at you steadily.",
        "— You are not gone yet. I would keep it that way.",
      ],
      mid: [
        "— This place feeds on something, she says. Not bodies. I have seen things like it before in different shapes. People go *thin* here.",
        "She waves the apple at the villagers moving between the stalls.",
        "— Those ones are already empty. Whatever made them themselves has been eaten.",
        "It is a horrible thing to say about people who have been nothing but pleasant to you all morning, and you say so.",
        "— You are not gone yet, she says, as though that settles it. I would keep it that way.",
      ],
      low: [
        "— This place feeds on something, she says. People go thin here.",
        "She waves her apple at the villagers, who are having a perfectly nice afternoon and have done nothing to deserve it.",
        "— Those ones are already empty.",
        "You tell her that is a dreadful thing to say. Rose has been kind to you. Myra has been kind to you. Mrs Hobson made you breakfast.",
        "She looks at you for a long moment and does not argue, which is somehow worse.",
      ],
    },
    revealHigh: "The people at the fair aren't strange visitors. They're what's left after the feeding.",
  },

  bailey_who_are_you: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_first",
    prose: {
      high: [
        "— Bailey. She says it as though it finishes the sentence.",
        "— I travel. She stops and picks the words. Between places. I find things, borrow things, and move on before it gets complicated.",
        "She turns the apple over, looking for somewhere to start again.",
        "— This one got complicated quicker than usual.",
      ],
      mid: [
        "— Bailey. She says it as though it finishes the sentence, and it does not.",
        "— I travel. Between places. I find things, borrow things, move on before it gets complicated.",
        "You wait for the rest of it and there is no rest of it.",
        "— This one got complicated quicker than usual, she says, and starts on the other side of the apple.",
      ],
      low: [
        "— Bailey. I travel. I find things, borrow things, move on before it gets complicated.",
        "Borrow. You notice the word she has chosen and what it is standing in for.",
        "She is a woman with no fixed address going through other people's villages, telling the people who live there that they are empty.",
        "— This one got complicated quicker than usual, she says.",
        "You would like to get back to the fair.",
      ],
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
        "— I do not know how I got here, you say.",
        "— I know.",
        "She stands up and brushes the apple core off her coat.",
        "— That is the thing about this place. It finds you when you are in the dark. When you are fading. When the edges of you have gone soft.",
        "She looks at you carefully.",
        "— You have been here before. I can tell. You have got the residue of it on you.",
        "She says it plainly, without any cruelty in it.",
        "— More than once, I would say.",
      ],
      mid: [
        "She gives you a long look.",
        "— The same way you did, probably. The same way you always do.",
        "— I do not know how I got here, you say.",
        "— I know.",
        "She stands and brushes the apple off her coat.",
        "— It finds you when you are in the dark. When you are fading. When the edges of you have gone soft.",
        "— You have been here before. I can tell. More than once, I would say.",
        "You want to ask what she means by fading and you do not, because you already know, and because the fair is very loud behind her.",
      ],
      low: [
        "— The same way you did, probably. The same way you always do.",
        "— I do not know how I got here, you say.",
        "— I know. It finds you when you are in the dark. When you are fading. When the edges of you have gone soft.",
        "Then she tells you that you have been here before, more than once, which she cannot possibly know.",
        "It is the sort of thing people say when they want you to think they can see into you.",
        "You stand up and tell her you are going back to the fair.",
      ],
    },
    revealHigh: "She can see the residue of previous visits. She said more than once.",
  },

  bailey_gives_key: {
    nico: "wag",
    isChapterKey: true,
    prose: {
      high: [
        "She goes into one of the many pockets and comes out with a key. Old iron, heavy, the bow worn smooth.",
        "— Borrowed it off the repair man. Keyes. He has got about forty on him, which I think is very suspicious, and you should ask me things. He will not miss one.",
        "She holds it out.",
        "— There is a door in the back lane. That opens it. I tried it myself and did not go in on my own. I steal things. I do not have a death wish.",
        "You take it. It is heavier than it looks.",
        "— The dog, she says, nodding at Nico. Keep him close. I mean it. He knows exactly where he is and he knows exactly what matters. When it counts, go where he goes.",
        "She stands and puts her hands in her pockets.",
        "— I do not know how to get out of this place. I think you might. You have been here before. Somewhere in there, she says, and taps her own temple gently, you already have the answer.",
        "She gives you one last look, weighing you up, warm, and a little sad.",
        "— Do not eat anything else.",
      ],
      mid: [
        "She goes into one of the many pockets and produces a key. Old iron, heavy, the bow worn smooth.",
        "— Borrowed it off the repair man. He has got forty on him. He will not miss one.",
        "— There is a door in the back lane. That opens it. I tried it myself and did not go in alone, because I steal things, I do not have a death wish.",
        "You take it and it is heavier than it looks.",
        "— Keep the dog close. He knows exactly where he is and what matters. When it counts, go where he goes.",
        "— I do not know how to get out of here. I think you might. And do not eat anything else.",
      ],
      low: [
        "She produces a key out of one of her pockets. Old iron, heavy, worn smooth at the bow.",
        "— Borrowed it off the repair man. He has got forty on him. He will not miss one.",
        "Borrowed. She has stolen a man's key and is handing it to you in an alley and telling you to let yourself into somewhere that is not yours.",
        "You take it, because it would be awkward not to, and it is heavier than it looks.",
        "— Keep the dog close. Go where he goes. And do not eat anything else.",
        "You will not be doing any of that. You have had a lovely day and this woman has been the only unpleasant part of it.",
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
        "— Dogs like him, she says, and thinks about it. They do not get confused by places like this. They cannot be fooled, because they are not using the parts of the brain this place gets into.",
        "She looks at Nico.",
        "— He cannot tell you what is real in words. He can show you. He has been showing you the whole time.",
        "Nico looks up at her and his tail goes slowly.",
        "— When he goes somewhere, go there. When he will not move, do not move. And when he makes that noise in his throat, she says, and does the noise back at him with uncanny accuracy, take note.",
      ],
      mid: [
        "— Dogs like him do not get confused by places like this. They cannot be fooled, because they are not using the part of the brain it gets into.",
        "— He cannot tell you what is real in words. He can show you. He has been showing you the whole time.",
        "— When he goes somewhere, go there. When he will not move, do not move. And when he makes that noise, she says, and does it back at him, take note.",
        "Nico looks extremely pleased with himself, which is fair, and you tell him not to let it go to his head.",
      ],
      low: [
        "— He just knows, she says. Trust him.",
      ],
    },
  },

  bailey_been_before: {
    nico: "wag",
    isExamine: true,
    returnTo: "bailey_gives_key",
    prose: {
      high: [
        "She sits back down on the crate.",
        "— I can see it. There is a texture to people who have been cycled through a place like this. Like a book that has been opened and shut so many times the spine has started to go.",
        "— What happened to me? you ask.",
        "— I do not know the specifics. But it finds you in the dark. When you are fading. Whatever was happening to you opened a door, and this was waiting on the other side of it.",
        "She says it gently.",
        "— The things that brought you here are still in you somewhere. This place tried to eat them and did not finish. That is why you can still feel that something is wrong.",
        "She nods at Nico.",
        "— And that is why he still knows you.",
      ],
      mid: [
        "She sits back down on the crate.",
        "— There is a texture to people who have been through a place like this more than once. Like a book opened and shut so often the spine has gone.",
        "— It finds you in the dark. When you are fading. Something was happening to you, and it opened a door, and this was on the other side.",
        "— It tried to eat what you are and it did not finish. That is why you can still tell something is wrong.",
        "She nods at Nico.",
        "— And that is why he still knows you.",
      ],
      low: [
        "— You have been here before, she says. That is all she seems sure of.",
      ],
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
        "The fair goes out like a light. The voices, the bunting snapping in a breeze nobody could feel, all of it, gone at once.",
        "There is only the dark, and the cold stone smell.",
        "Nico's nails on the steps below you. Soft, unhurried, certain.",
        "You go down after the sound.",
      ],
      mid: [
        "The door swings shut behind you and the fair goes out like a light.",
        "The voices and the bunting and the whole warm noise of it, gone between one moment and the next.",
        "There is the dark, and the cold stone smell, and Nico's nails going down the steps below you.",
        "You put your hand on the wall and follow the sound.",
      ],
      low: [
        "The door swings shut behind you and the whole fair goes out like a light.",
        "You put your hand back to push it open again and there is no handle on this side either.",
        "There is only the dark and the cold stone smell and Nico's nails on the steps somewhere below.",
        "You will go down and get him and come straight back up.",
        "You follow the sound.",
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
        "Stone floor, stone walls, a ceiling close enough to press down on you. The air is cold and completely still, in the way that means nothing has moved through it for a long time.",
        "Five things are in the room: a stack of wooden crates against the left-hand wall, metal shelves along the right, two heavy sacks slumped together in the far corner, a cluster of jars on the floor near you, and a narrow chest of drawers against the back wall.",
        "Set into the back wall is a heavy iron bar across a door, with three recesses cut into it.",
        "Nico goes straight to the crates and sits down. He looks at you over his shoulder.",
      ],
      mid: [
        "The steps end in a low stone room with a ceiling close enough to press down on you, and the air in it is cold and completely still.",
        "There are crates against one wall and metal shelving along the other, two heavy sacks slumped in the far corner, jars on the floor near you, and a narrow chest of drawers at the back.",
        "Across the back wall there is a door with a heavy iron bar over it, and three recesses cut into the bar.",
        "It is somebody's storeroom, and it is a very odd storeroom.",
        "Nico goes straight to the crates and sits down and looks at you over his shoulder.",
      ],
      low: [
        "The steps end in a low stone room, cold and very still, with a ceiling you could touch.",
        "Crates along one wall, metal shelves along the other, sacks in the corner, jars on the floor, a chest of drawers at the back.",
        "There is a door in the back wall with an iron bar across it and three recesses cut into the bar.",
        "You should go back up. You came down for the dog and you have got the dog.",
        "Nico has gone straight to the crates and sat down and will not look away from you, and you find you are not going back up.",
      ],
    },
    choices: [
      { id: "ch3_enter_room", type: "progress", next: "ch3_hub", label: "→ Look around the storeroom", thread: 0 },
    ],
  },

  examine_lock: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Three recesses cut into the iron bar, each one a different shape.",
        "One takes something cylindrical. One takes something narrow at the waist. One takes something with weight to it, carved rather than cast.",
        "There are no levers and no numbers. Whatever goes in either fits or it does not.",
        "The recesses run left to right and their order is fixed.",
        "The order you fill them is the combination.",
      ],
      mid: [
        "Three recesses cut into the iron bar, each a different shape.",
        "One for something cylindrical, one for something narrow at the waist, one for something with weight to it that has been carved rather than cast.",
        "No levers, no numbers, no dial. Whatever goes in fits or it does not.",
        "They run left to right and the order is fixed, and the order you fill them is the combination.",
        "Somebody built this for a person who would already know.",
      ],
      low: [
        "Three recesses cut into the iron, each a different shape, and no levers or numbers anywhere on it.",
        "One cylindrical, one narrow at the waist, one for something heavy and carved.",
        "Left to right, and the order you fill them is the combination.",
        "It is a beautiful piece of ironwork. Somebody took a great deal of trouble over it.",
        "You put your hand flat on the bar and it is not as cold as the walls.",
      ],
    },
    revealHigh: "Whatever belongs in here — you'll know it when you find it.",
    choices: [
      { id: "ch3_try_lock", type: "progress", next: "lock_minigame", label: "→ Try slotting something in", thread: 0 },
    ],
  },

  lock_minigame: {
    nico: "alert",
    isLockGame: true,
    winNext: "ch3_end",
  },

  examine_crates: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Nico gets up as you come over. He noses the side of the nearest crate and steps back out of the way.",
        "You move it.",
        "On the wall behind there are two curved claw marks scratched into the stone at nose height. They are deliberate. They are his.",
        "In the gap between the crate and the wall, set there as though somebody meant it to be found, is a small brass hourglass. Old and tarnished. The sand in it does not move.",
        "Nico sits back down and looks at you.",
      ],
      mid: [
        "Nico gets up as you come over, noses the side of the nearest crate and steps back out of the way, which is not a thing dogs do.",
        "You move it.",
        "There are two curved claw marks scratched into the stone behind it at nose height.",
        "In the gap between crate and wall, set there as though it were meant to be found, is a small brass hourglass, old and tarnished, and the sand in it does not move when you pick it up.",
        "Nico sits back down and looks at you until you look back.",
      ],
      low: [
        "Nico noses the nearest crate and steps back, and you move it because it is easier than arguing with him.",
        "There are two curved marks scratched into the stone behind it, low down, the sort of thing a cellar collects over a few hundred years.",
        "In the gap between the crate and the wall there is a small brass hourglass, old and tarnished, sitting there as neat as anything.",
        "Somebody has lost that and been sorry about it.",
        "Nico sits back down and watches you pick it up.",
      ],
    },
    revealHigh: "Two claw marks. He's been here before. He left things behind.",
    choices: [
      { id: "crate_claw_marks", type: "examine", next: "crate_claw_marks", label: "Put your fingers into the claw marks", thread: T.GAIN_MD },
      { id: "take_hourglass", type: "examine", next: "hourglass_taken", label: "Take the hourglass", thread: 0, consumable: "hourglass", hideIfConsumed: "hourglass" },
    ],
  },

  hourglass_taken: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You pick it up. It is lighter than it looks.",
        "You tilt it, and the sand does not shift at all. It is stopped, mid-fall.",
        "You put it in your bag.",
      ],
      mid: [
        "You pick it up and it is lighter than it looks, and when you tilt it the sand does not move.",
        "You turn it right over and hold it there and count to ten, and nothing happens at all.",
        "The glass is not cracked. The sand is not damp. It simply does not fall.",
        "You put it in your bag.",
      ],
      low: [
        "You pick it up and it is lighter than it looks, and the sand does not move when you tilt it.",
        "It will have gone hard. Old sand does, in damp, and everything down here is damp.",
        "It is a lovely little thing. Brass, properly made, the sort you would put on a windowsill.",
        "You put it in your bag and you do not think of it as taking.",
      ],
    },
  },

  examine_shelves: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Metal shelves, old but solid. Coils of rope, rusted tools, a folded cloth that smells wrong.",
        "On the middle shelf, between two corroded tins, there are three claw marks scratched into the metal.",
        "Beside them, resting on a fold of cloth as though it has been put on display, is an infinity symbol carved out of solid marble, the size of your palm. White, with gold running through it. The carving is deep and deliberate, not scratched on but shaped, as though the form had been inside the stone waiting.",
        "The channels of it are clean and filled with something dark.",
        "It has no business whatever being down here.",
      ],
      mid: [
        "Metal shelves, old but solid. Coils of rope, rusted tools, a folded cloth that you do not want to touch.",
        "There are three claw marks scratched into the metal of the middle shelf, between two corroded tins.",
        "Beside them, on a fold of cloth as though somebody had set it out, is an infinity symbol carved from solid marble, palm-sized, white with gold running through it.",
        "The carving is deep and clean and the channels are filled with something dark.",
        "Everything else on these shelves has rusted or rotted. That has not.",
      ],
      low: [
        "Metal shelves with rope and old tools on them, and a folded cloth, and a smell you cannot place.",
        "There are three marks scratched into the middle shelf, which will be where they have dragged something heavy across it.",
        "Beside them, sitting on a fold of cloth like something in a shop window, is a marble infinity symbol about the size of your palm. White, with gold in it.",
        "It is the loveliest thing you have seen since you got here, and it is down here in the dark with the rust.",
        "Somebody ought to have it out where it can be looked at.",
      ],
    },
    revealHigh: "Polished marble and gold veins, down here with the rust and the rot. Someone put this here on purpose.",
    choices: [
      { id: "shelf_cloth", type: "toedip", next: "shelf_cloth", label: "Unfold the cloth that smells wrong", thread: T.DRAIN_MD, consumable: "cloth" },
      { id: "take_marble", type: "examine", next: "marble_taken", label: "Take the marble infinity symbol", thread: 0, consumable: "marble", hideIfConsumed: "marble" },
    ],
  },

  marble_taken: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "It is cold and smooth and heavier than marble has any right to be.",
        "The gold catches what little light there is down here.",
        "You turn it over. The back is plain.",
        "You keep it.",
      ],
      mid: [
        "It is cold and smooth and a good deal heavier than a thing that size should be.",
        "The gold catches what light there is, which is almost none.",
        "You turn it over and the back is plain, with no maker's mark and no initials, which is unusual for something made this carefully.",
        "You put it in your bag and you are aware of the weight of it there.",
      ],
      low: [
        "It is cold and smooth and heavier than you expect, and the gold catches the light beautifully.",
        "You turn it over twice and then a third time.",
        "You put it in your bag and then you take it out again to look at it, and then you put it back.",
        "You would like to keep this one. Not use it. Keep it.",
      ],
    },
      choices: [
      { id: "marble_grooves", type: "examine", next: "marble_grooves", label: "Look at what is down in the grooves", thread: T.GAIN_MD },
    ],
  },

  examine_sacks: {
    nico: "neutral",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Hessian sacks, heavy, slumped against one another.",
        "You loosen the neck of the nearest.",
        "Bird skulls. Dozens of them, small and dry, packed in without any ceremony at all.",
        "Nico does not come over.",
      ],
      mid: [
        "Hessian sacks, heavy, slumped against one another, and the nearest one gives when you push it.",
        "You loosen the neck of it and put your hand in before you have thought about it.",
        "Bird skulls. Dozens of them, small and dry, packed in loose like grain.",
        "You take your hand out and wipe it on your jeans.",
        "Nico does not come over.",
      ],
      low: [
        "Hessian sacks slumped against one another, heavy, and the nearest one gives when you push it.",
        "You loosen the neck and look in, and it is full of small dry bird skulls, dozens of them, packed in loose.",
        "Farms are like this. There is always a shed with something horrible in it that nobody thinks anything of.",
        "You put your hand in and move them about and they are very light.",
        "Nico does not come over.",
      ],
    },
    choices: [
      { id: "count_skulls", type: "examine", next: "skulls_counted", label: "Count them", thread: T.GAIN_LG },
      { id: "take_skull", type: "examine", next: "skull_taken", label: "Take one of the skulls", thread: T.DRAIN_SM, consumable: "skull", hideIfConsumed: "skull" },
    ],
  },

  skull_taken: {
    nico: "neutral",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You pick one up. Light as paper. Hollow.",
        "The beak is still whole.",
        "Nico glances at it and looks away.",
        "You put it in your bag.",
      ],
      mid: [
        "You pick one up and it weighs nothing at all, and the beak is still whole.",
        "You are not sure why you want it. You would not pick up a dead bird in a lane.",
        "Nico glances at it once and then looks away and keeps looking away.",
        "You put it in your bag.",
      ],
      low: [
        "You pick one up and it weighs nothing, and the beak is perfectly whole.",
        "It is rather beautiful when you look at it properly. People pay money for these.",
        "Nico glances at it and looks away and will not look back.",
        "You put it in your bag and choose a second one, and then put the second one back, because that would be greedy.",
      ],
    },
  },

  examine_floor_jars: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Four jars together in the corner, dark inside, no labels on any of them. Older than Rose's. The glass has clouded and the wax seals have cracked.",
        "On the floor beside them there is one clean scratch in the stone, about the length of your hand.",
        "Nico comes as far as the edge of them and stops there.",
      ],
      mid: [
        "Four jars together in the corner, dark inside and unlabelled, older than the ones on Rose's stall. The glass has gone cloudy and the wax seals are cracked.",
        "There is a single clean scratch in the stone on the floor beside them, about the length of your hand.",
        "You crouch down and look at them for longer than you mean to.",
        "Nico comes as far as the edge of them and stops.",
      ],
      low: [
        "Four jars in the corner, dark and unlabelled, the glass gone cloudy and the wax seals cracked with age.",
        "Rose would know what these are. Rose would probably want them back.",
        "There is a clean scratch in the stone floor beside them, about the length of your hand.",
        "You crouch down and stay there a while.",
        "Nico comes as far as the edge of them and will come no further.",
      ],
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
        "You take the nearest. It is cold.",
        "The seal is cracked but it is holding.",
        "You do not open it.",
        "Nico watches. He does not step back.",
      ],
      mid: [
        "You take the nearest one and it is cold all the way through, colder than the floor it was standing on.",
        "The wax seal is cracked but holding, and you could get a thumbnail under it without any trouble at all.",
        "You do not.",
        "Nico watches you the whole time and does not step back, which he did at Rose's stall.",
      ],
      low: [
        "You take the nearest one, and it is cold right through, colder than the floor it was standing on.",
        "The seal is cracked and it would come away under a thumbnail without any effort.",
        "You hold it a moment with your thumb against the wax.",
        "Then you put it in your bag, for now.",
        "Nico watches you do it and does not step back.",
      ],
    },
      choices: [
      { id: "open_floor_jar", type: "progress", next: "jar_opened", label: "Break the seal and open it", thread: T.DRAIN_LG, consumable: "jar_opened" },
    ],
  },

  examine_drawers: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "Three narrow drawers. The top two are empty. The bottom one sticks, and then gives.",
        "Inside there is one piece of paper, folded once.",
        "You open it. In careful, unhurried handwriting: Preserved. In time. Forever.",
      ],
      mid: [
        "Three narrow drawers. The top two are empty and have been for a long time by the smell of them. The bottom one sticks and then gives.",
        "Inside there is a single piece of paper, folded once, and nothing else at all.",
        "You open it. In careful, unhurried handwriting: Preserved. In time. Forever.",
        "Three things, in order, and there are three recesses in the bar across the door.",
      ],
      low: [
        "Three narrow drawers, the top two empty, the bottom one sticking and then giving all at once.",
        "There is one piece of paper in it, folded once.",
        "Preserved. In time. Forever, in careful handwriting, with a good pen.",
        "It is a lovely sentiment. Somebody wrote that for somebody.",
        "You read it twice before it occurs to you that there are three recesses in the bar across the door.",
      ],
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
        "You fold it back along its own crease and put it in your bag.",
        "The handwriting was careful. It was not hurried.",
        "Whoever wrote this had time.",
      ],
      mid: [
        "You fold it back along its own crease and put it in your bag.",
        "The handwriting is careful and not hurried anywhere, not even at the end, where handwriting usually goes.",
        "Whoever wrote it was not in any difficulty when they wrote it.",
        "They had time, and they knew somebody would come and read it.",
      ],
      low: [
        "You fold it back along its own crease and put it away carefully so as not to spoil it.",
        "Such lovely handwriting. Nobody writes like that any more.",
        "It is not hurried anywhere, not even at the end.",
        "Whoever wrote it had all the time in the world.",
      ],
    },
      choices: [
      { id: "note_handwriting", type: "examine", next: "note_handwriting", label: "Look at the handwriting again", thread: T.GAIN_MD, requiresExamined: "examine_room" },
    ],
  },

  ch3_hub: {
    nico: "alert",
    isCh3Hub: true,
    prose: {
      high: [
        "The room waits.",
        "Nico has settled by the barred door. He is being patient with you.",
        "You have things in your bag. The lock has three recesses.",
      ],
      mid: [
        "The room waits, and the air in it has not moved since you came down.",
        "Nico has settled by the barred door and is being patient with you, which he is not usually.",
        "You have things in your bag. The lock has three recesses.",
        "There is no reason this should be the only way out, and it is.",
      ],
      low: [
        "The room waits. It is not unpleasant down here once you are used to it.",
        "Nico has settled by the barred door and will not come away from it.",
        "There are three recesses in the lock and there are things in your bag.",
        "You cannot now remember how long you have been down here, and it does not worry you as much as it should.",
      ],
    },
  },

  ch3_end: {
    nico: "alert",
    isChapterEnd: true,
    chapterEndText: "Chapter Four — The Crypt",
    prose: {
      high: [
        "The door swings shut behind you and the storeroom is gone.",
        "Ahead of you there are steps cut deeper into the earth, older than the village above, older than anything you have stood on.",
        "The air coming up is colder and it is moving.",
        "Nico goes down first. He did not stop to be asked.",
        "You follow him.",
      ],
      mid: [
        "The door swings shut behind you and the storeroom is gone.",
        "Ahead there are more steps, cut deeper into the earth, older than the village above them.",
        "The air coming up from below is colder than the room you have left, and it is moving, which means it comes from somewhere.",
        "Nico goes down first without stopping to be asked.",
        "You follow him.",
      ],
      low: [
        "The door swings shut behind you and the storeroom is gone, and you do not turn round to look at it.",
        "There are more steps going down, older than the village, cut into the earth itself.",
        "The air coming up is cold and moving.",
        "Nico goes down first without waiting for you.",
        "You follow, because he is going, and because there is nothing behind you now.",
      ],
    },
  },

  // ── CH3: THE CLAW MARKS ──────────────────────────────────
  crate_claw_marks: {
    nico: "cower",
    isExamine: true,
    returnTo: "examine_crates",
    prose: {
      high: [
        "You crouch down and put your fingers into the marks.",
        "There are two of them, curved, deep into the stone. They have not been scratched into it. They have gone in, the way a thumb goes into clay.",
        "They are at the height of your shoulder.",
        "Whatever made them was standing where you are standing now, and it was about your size, and it had hands.",
        "Nico will not come over and look.",
      ],
      mid: [
        "You crouch down and put your fingers into the marks.",
        "Two of them, curved, cut deep into the stone at about the height of your shoulder.",
        "Old buildings take a lot of damage over the years, and cellars take the most of it, and you have no idea what sort of tool would leave a mark like that.",
        "You take your hand away and wipe it on your jeans.",
        "Nico stays where he is by the door.",
      ],
      low: [
        "You crouch down and put your fingers into the marks, and they fit rather well.",
        "Two curves cut into the stone at shoulder height, worn smooth at the edges the way old things go.",
        "Somebody must have moved something heavy through here once, years ago, and caught the wall doing it.",
        "It is nice to think of all the people who have worked in this room before you.",
        "Nico will not come over, and you leave him to it.",
      ],
    },
    revealHigh: "The marks are at your shoulder height. Whatever made them stood where you are standing.",
  },

  // ── CH3: THE CLOTH ───────────────────────────────────────
  shelf_cloth: {
    nico: "snarl",
    isExamine: true,
    returnTo: "examine_shelves",
    prose: {
      high: [
        "You take it down and unfold it. Linen, or something close to it, gone stiff along the creases.",
        "There is a shape worn into the middle of it, the way a cloth wears when it has been laid over the same object for a very long time.",
        "You put it to your face, because you want to know what the smell is.",
        "It is cut grass. It is the smell that came up through the window on your first morning, and it is down here in a cellar, in a folded cloth, with no grass within thirty feet of it.",
        "You hold it there a moment longer than you need to.",
      ],
      mid: [
        "You take it down and unfold it. Stiff along the creases, with a shape worn into the middle of it.",
        "You put it to your face without really deciding to.",
        "Cut grass. Which is a strange thing to find in a cellar, though linen holds a smell for years and this cloth has clearly been somewhere pleasant.",
        "You fold it back along its own creases and put it where it was.",
        "Nico makes a low sound behind you and you tell him you are coming.",
      ],
      low: [
        "You take it down and unfold it, and it is stiff along the creases, and it smells wonderful.",
        "Cut grass, of all things, down here. You put your face into it properly.",
        "It is the same as the morning of your first day, and standing here with it you feel about as happy as you have felt since you arrived.",
        "You fold it up again very carefully and put it back exactly where it was, because it is somebody's, and you would not want them to know.",
        "Nico makes a low sound behind you and you ignore him.",
      ],
    },
  },

  // ── CH3: COUNTING ────────────────────────────────────────
  skulls_counted: {
    nico: "alert",
    isExamine: true,
    returnTo: "examine_sacks",
    prose: {
      high: [
        "You start counting them, because it seems the least you can do.",
        "You get to forty before you stop, and you stop because they are not all the same bird. Some have long beaks. Some are small enough to sit inside your ear.",
        "Somebody caught each of these separately. Somebody took the time over every one.",
        "Forty-one. Forty-two.",
        "You put the sack down, and your hands are steadier than they were when you picked it up, because a number is a fact, and facts belong to you.",
      ],
      mid: [
        "You start counting them, and you get to about forty before you lose your place.",
        "They are not all the same bird, which you had not expected. Some have long beaks and some are very small indeed.",
        "Somebody collected all of these. That is a great deal of collecting.",
        "You count a few more and then you stop, because there is a lock to get through and this is not helping.",
        "You put the sack down where you found it.",
      ],
      low: [
        "You start counting them and you get to about forty and lose your place, and you laugh at yourself for trying.",
        "They are not all the same bird. Somebody has been at this for years, patiently, one at a time.",
        "There is something rather lovely about that. A person with a proper hobby.",
        "You put the sack down and pat it flat.",
        "You will ask about them later, when there is somebody to ask.",
      ],
    },
    gainHigh: "Forty-two, and not all the same bird. Somebody took the time over every one.",
  },

  // ── CH3: THE GROOVES ─────────────────────────────────────
  marble_grooves: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You hold it up and turn it until the light gets down into the channels.",
        "The dark in them is not dirt and it is not shadow. It went in as a liquid and dried there, and it has done that more than once. You can see the layers, the way wax builds down the side of a candlestick.",
        "Somebody has been filling these grooves for years.",
        "You wipe your thumb on your jeans without thinking about it.",
        "Then you look at your thumb.",
      ],
      mid: [
        "You hold it up and turn it until the light gets down into the channels.",
        "There is something dark down in them. It has gone in wet and dried, and there is more than one layer of it.",
        "Marble picks up everything. You have a chopping board at home that has never come properly clean.",
        "You wipe your thumb on your jeans and put the marble back in your bag.",
        "It really is a beautiful thing.",
      ],
      low: [
        "You hold it up and turn it until the light gets down into the channels, and it is even lovelier close to.",
        "There is something dark settled down in the grooves, which is only what happens to anything old and carved.",
        "Somebody has kept this well. You can tell when a thing has been looked after.",
        "You wipe your thumb on your jeans and put the marble away.",
        "You find you do not want to put it down for long.",
      ],
    },
    revealHigh: "It has been filled and refilled. There are layers in it.",
  },

  // ── CH3: THE HANDWRITING ─────────────────────────────────
  note_handwriting: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You take it out again and hold it under what light there is.",
        "The letters lean the same way. The same careful slope, the same long tail coming off the g, the same little gap before every capital.",
        "It is the hand from the card propped against the mirror in your room. Lovely to have you back, Sarah.",
        "Whoever writes the welcomes also writes this.",
        "You put the note away in a different pocket from the one it came out of, for no reason you could explain.",
      ],
      mid: [
        "You take it out again and hold it under what light there is.",
        "The writing is familiar, and it takes you a moment, and then you have it: the card in your room, propped against the mirror.",
        "The same hand wrote both.",
        "Well, somebody has to write things, and there cannot be many people down here who do.",
        "You put the note away.",
      ],
      low: [
        "You take it out again and hold it under what light there is, and it is lovely handwriting, really lovely.",
        "You have seen it before. The card in your room, the one propped against the mirror.",
        "The same person wrote both, and you find that rather touching, that somebody sat down and did this by hand.",
        "Nobody writes anything out any more.",
        "You put the note away carefully so as not to crease it.",
      ],
    },
    revealHigh: "The same hand wrote the welcome card in your room.",
  },

  // ── CH3: THE JAR ─────────────────────────────────────────
  jar_opened: {
    nico: "snarl",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "The wax comes away under your thumbnail in one piece. It is still soft.",
        "You lift the lid.",
        "What is inside is dark, and it is not still. It moves the way honey moves, slowly, catching itself up.",
        "The smell that comes out of it is the smell of the eggs on Hobson's table, and the water in the glass beside your bed, and the air that came up through the window on your first morning.",
        "It is the smell of everything here that you have liked.",
        "You have breathed it in before you have decided to.",
        "Nico is barking. You did not hear him start.",
      ],
      mid: [
        "The wax comes away under your thumbnail, still soft after all this time, and you lift the lid.",
        "What is inside is dark and moves slowly when you tilt it.",
        "The smell is wonderful. It is familiar, too, and you cannot place it, and then you can: it is breakfast, and the water by your bed, and the first morning through the window.",
        "You breathe it in properly before you put the lid back.",
        "Nico is barking somewhere behind you.",
      ],
      low: [
        "The wax comes away under your thumbnail in one piece and you lift the lid, and oh, that is glorious.",
        "It is dark and slow and it smells of every good thing that has happened to you since you got here, all of it at once, in a jar in a cellar.",
        "You put your face right over it and breathe in until your chest is full.",
        "You could stay down here with this.",
        "Nico is barking. He has been barking for a while, you think. You will see to him in a minute.",
      ],
    },
  },

  // ── CH3: SITTING DOWN ────────────────────────────────────
  storeroom_rest: {
    nico: "alert",
    isExamine: true,
    returnTo: "ch3_hub",
    prose: {
      high: [
        "You sit down with your back against the crates and put your hands flat on the floor.",
        "The stillness in this room comes up through the stone and into you. It is restful the way cold water is restful, which is to say that it takes something out of you while it is doing it.",
        "You do not know how long you sit there.",
        "It is Nico's nose against your ear that brings you back, and by then your hands have gone numb, and the light has not changed at all.",
      ],
      mid: [
        "You sit down with your back against the crates and put your hands flat on the floor.",
        "It is colder than you expected and more comfortable than it has any right to be, and you shut your eyes for a moment.",
        "When you open them again you could not say how long you have been sitting there.",
        "Nico has his nose against your ear. You tell him you are getting up, and then you sit for a little longer.",
      ],
      low: [
        "You sit down with your back against the crates and put your hands flat on the cold floor, and it is bliss.",
        "You had not realised how tired you were. The stillness of the room settles over you like a blanket somebody has put there.",
        "You shut your eyes.",
        "Nico's nose is against your ear and you push his head away, gently, without opening your eyes, because you are not finished yet.",
      ],
    },
  },

  // ── CH2: THE OAK ─────────────────────────────────────────
  // Reachable at low only: a -14 from a full bar lands on 6.
  oak_name_carved: {
    nico: "snarl",
    isExamine: true,
    returnTo: "the_green",
    prose: {
      high: [
        "You put the point of your key to the bark and then you take it away again, and your hand is shaking, and you go back to the fair without looking behind you.",
      ],
      mid: [
        "You get as far as the first letter before you stop, and you rub your thumb over the mark until you cannot see it, and you tell yourself you were only ever going to do the one.",
      ],
      low: [
        "There is a bare patch low down on the trunk, at about the height of a person sitting, and it is the only bare patch left.",
        "You take your door key out of your bag and you cut the S into the bark, and then the rest of it, and you take your time over it because it is going to be there a long while.",
        "The wood is soft. It gives like something that wants to.",
        "When you have finished you sit back on your heels and look at it among all the others, and it does not look new. It looks like it has been there as long as the rest of them.",
        "Nico is standing well back with his lip lifted, making a sound you have never heard him make, and you tell him to be quiet, and he is.",
      ],
    },
  },

  // ── CH2: THE LEAD ────────────────────────────────────────
  nico_tied: {
    nico: "cower",
    isExamine: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "You start to loop the lead around the post and then you stop, because you know exactly what you are doing, and you take him with you.",
      ],
      mid: [
        "He will not settle. He plants himself at every stall and leans back against the collar, and people are starting to look.",
        "You loop the lead twice around the post by the gate and tell him you will be five minutes.",
        "He does not pull. He does not bark. He sits down facing the way you have gone and he watches you the whole time you are away, and you can feel it between your shoulders at every stall.",
        "When you come back for him he gets up and presses himself against your leg, and you crouch down and tell him you are sorry, and you mean it.",
        "You do not think about why the post is there, or why it has a ring set into it at exactly the right height.",
      ],
      low: [
        "He will not settle. He plants himself at every stall and leans back against the collar like a much smaller dog, and it is embarrassing.",
        "You loop the lead twice around the post by the gate and tell him to behave himself.",
        "It is a great relief. You can walk properly. You can look at things for as long as you want to look at them, and nobody is pulling at your arm.",
        "You are away longer than you meant to be.",
        "When you come back he is sitting exactly where you left him, facing the way you went, and he gets up and presses against your leg, and you make him wait while you finish your conversation.",
      ],
    },
  },

  // ── CH2: THE CIRCLE ──────────────────────────────────────
  circle_joined: {
    nico: "cower",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "You take one step towards the gap and your whole body refuses it, the way it refuses the edge of a high place, and you step back.",
      ],
      mid: [
        "There is a gap between two of them, about the width of a person.",
        "You step into it, because it seems ruder not to, and you turn inward the way they are turned.",
        "There is nothing in the middle of the circle. You had assumed there would be.",
        "Nobody says anything. Nobody looks at you. After a while you stop expecting them to, and the not-expecting is very restful, and you could not say how long you stand there.",
        "It is Nico at the end of his lead, hauling, that gets you out of it.",
      ],
      low: [
        "There is a gap between two of them, about the width of a person, and it has been there the whole time.",
        "You step into it and turn inward the way they are turned, and it is the most comfortable you have been since you arrived.",
        "There is nothing in the middle. That is fine. You had thought there would be something and there is not, and it does not matter at all.",
        "Nobody speaks and nobody looks and you do not need them to. You could stand here.",
        "Nico is hauling at the end of the lead and choking himself doing it, and you wait until he stops, and then you stay a while longer.",
      ],
    },
  },

  // ── CH2: THE CLOSING ─────────────────────────────────────
  closing_agreed: {
    nico: "snarl",
    isExamine: true,
    returnTo: "hollow_circle",
    prose: {
      high: [
        "You hear yourself starting to say yes and you close your mouth on it, and you tell them you have not decided, and the one nearest you stops smiling.",
      ],
      mid: [
        "— I will, you say. I will stay for it.",
        "It is the sort of thing you say at a party, and it costs nothing, and you have said it a hundred times to people you never saw again.",
        "All six of them turn their heads towards you at the same time.",
        "Then they turn back, and the one nearest you says how lovely, and the fair goes on around you exactly as it was.",
        "You have the feeling of having signed something without reading it, which is also a thing you have done a hundred times.",
      ],
      low: [
        "— I will, you say. Of course I will. I would not miss it.",
        "All six of them turn their heads towards you at the same time, and you find you like it, being looked at by all of them at once.",
        "— How lovely, says the one nearest you.",
        "You want to ask what time it starts and you do not, because asking would make it sound as though you might not come.",
        "You will be there. You have said so now, and you are somebody who keeps their word.",
      ],
    },
  },

  // ── CH2: THE FOOD STALLS ─────────────────────────────────
  fair_food: {
    nico: "snarl",
    isExamine: true,
    returnTo: "fair_hub",
    prose: {
      high: [
        "You get as far as the queue and then you think about the eggs at Hobson's table, and you put your money away, and you are hungry for the rest of the day.",
      ],
      mid: [
        "Hot sugar and something fried, and you have not eaten since the morning.",
        "The woman hands it over in a twist of paper and will not take anything for it. Nobody at the fair will take anything for anything, you notice, and then you stop noticing it.",
        "It is very good. It is better than it has any right to be for something cooked on a green.",
        "You eat it walking, the way you would at any fair anywhere.",
        "Nico walks beside you and does not once look up at the paper in your hand, which is not like him, and you are enjoying yourself too much to make anything of it.",
      ],
      low: [
        "Hot sugar and something fried, and you realise you are starving.",
        "The woman hands it over in a twist of paper and will not take anything for it, and neither will the next one, and you go along the row of them accepting things.",
        "It is all very good. You eat standing up in the middle of the green with the bunting going over your head and you cannot remember the last time you were this happy.",
        "Nico does not beg. Nico has not begged all day.",
        "You buy him nothing, because he has not asked, and you go back for more of the fried thing instead.",
      ],
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
// SAVE
// ============================================================
const SAVE_KEY = "tealby.save.v1";
const SAVE_VERSION = 1;

function readSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== SAVE_VERSION || !SCENES[d.sceneId]) return null;
    return d;
  } catch (e) { return null; }
}

function clearSave() {
  try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
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
  const [flinchNote, setFlinchNote] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showChapterEnd, setShowChapterEnd] = useState(false);
  const [examinedIds, setExaminedIds] = useState(new Set());
  const [consumedIds, setConsumedIds] = useState(new Set());
  // Thread gains are paid once. Without this, re-opening the same examine
  // scene farms its bonus indefinitely and the whole economy collapses.
  const [creditedIds, setCreditedIds] = useState(new Set());
  const [lastThreadDelta, setLastThreadDelta] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [stallsVisited, setStallsVisited] = useState(new Set());
  const [hasBaileyKey, setHasBaileyKey] = useState(false);
  const [hasRosePreserve, setHasRosePreserve] = useState(false);
  const [hasHourglass, setHasHourglass] = useState(false);
  const [hasMarble, setHasMarble] = useState(false);
  const [hasBirdSkull, setHasBirdSkull] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [hasSave, setHasSave] = useState(false);
  const scrollRef = useRef(null);
  // Snapshot of state as it stood when the current chapter began, so
  // "Restart Chapter" can restore that chapter rather than the whole game.
  const chapterStart = useRef(null);

  // DEV scene-jump is opt-in via ?dev=1 — never exposed in the published build.
  const devEnabled = useRef(
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("dev")
  ).current;

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
      choices = [
        ...choices,
        { id: "fair_food", type: "toedip", next: "fair_food", label: "Get something from one of the food stalls", thread: T.DRAIN_MD, consumable: "fair_food" },
        { id: "tie_nico", type: "toedip", next: "nico_tied", label: "Tie Nico up by the gate — he will not settle", thread: T.DRAIN_MD, consumable: "nico_tied" },
      ];
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
        { id: "ch3hub_crates", type: "examine", next: "examine_crates", label: "Go to the crates", thread: 0 },
        { id: "ch3hub_shelves", type: "examine", next: "examine_shelves", label: "Check the shelves", thread: 0 },
        { id: "ch3hub_sacks", type: "examine", next: "examine_sacks", label: "Look at the sacks", thread: 0 },
        { id: "ch3hub_jars", type: "examine", next: "examine_floor_jars", label: "Look at the floor jars", thread: 0 },
        { id: "ch3hub_drawers", type: "examine", next: "examine_drawers", label: "Open the chest of drawers", thread: 0 },
        { id: "ch3hub_rest", type: "toedip", next: "storeroom_rest", label: "Sit down for a moment", thread: T.DRAIN_MD, consumable: "rested" },
      ].filter(c =>
        !(c.consumable && consumedIds.has(c.consumable)) &&
        !(c.hideIfConsumed && consumedIds.has(c.hideIfConsumed)) &&
        !(c.requiresConsumed && !consumedIds.has(c.requiresConsumed)) &&
        !(c.requiresExamined && !examinedIds.has(c.requiresExamined))
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
        !(c.requiresConsumed && !consumedIds.has(c.requiresConsumed)) &&
        !(c.requiresExamined && !examinedIds.has(c.requiresExamined))
      );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [sceneId]);

  // ── SAVE / RESUME ──────────────────────────────────────────
  // Three chapters is a long sitting to lose to an accidental refresh.
  // Autosaves after every scene change; the title screen offers Continue.
  useEffect(() => {
    if (!started) return;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: SAVE_VERSION, sceneId, thread, currentChapter,
        examinedIds: [...examinedIds], consumedIds: [...consumedIds],
        creditedIds: [...creditedIds],
        stallsVisited: [...stallsVisited],
        hasBaileyKey, hasRosePreserve, hasHourglass, hasMarble, hasBirdSkull,
        chapterStart: chapterStart.current ? {
          ...chapterStart.current,
          examinedIds: [...chapterStart.current.examinedIds],
          consumedIds: [...chapterStart.current.consumedIds],
          creditedIds: [...chapterStart.current.creditedIds],
          stallsVisited: [...chapterStart.current.stallsVisited],
        } : null,
      }));
      setHasSave(true);
    } catch (e) { /* private browsing / quota — play on without saving */ }
  }, [started, sceneId, thread, currentChapter, examinedIds, consumedIds, creditedIds,
      stallsVisited, hasBaileyKey, hasRosePreserve, hasHourglass, hasMarble, hasBirdSkull]);

  useEffect(() => {
    setHasSave(!!readSave());
  }, []);

  const resumeSave = () => {
    const d = readSave();
    if (!d) return;
    setThread(d.thread);
    setSceneId(d.sceneId);
    setCurrentChapter(d.currentChapter);
    setExaminedIds(new Set(d.examinedIds || []));
    setConsumedIds(new Set(d.consumedIds || []));
    setCreditedIds(new Set(d.creditedIds || []));
    setStallsVisited(new Set(d.stallsVisited || []));
    setHasBaileyKey(!!d.hasBaileyKey);
    setHasRosePreserve(!!d.hasRosePreserve);
    setHasHourglass(!!d.hasHourglass);
    setHasMarble(!!d.hasMarble);
    setHasBirdSkull(!!d.hasBirdSkull);
    chapterStart.current = d.chapterStart ? {
      ...d.chapterStart,
      examinedIds: new Set(d.chapterStart.examinedIds || []),
      consumedIds: new Set(d.chapterStart.consumedIds || []),
      creditedIds: new Set(d.chapterStart.creditedIds || []),
      stallsVisited: new Set(d.chapterStart.stallsVisited || []),
    } : null;
    setStarted(true);
  };

  const applyThread = (delta) => {
    if (!delta) return;
    setThread(t => Math.max(0, Math.min(MAX_THREAD, t + delta)));
  };

  const goToScene = (nextId, choiceLabel, threadDelta, reveal, gain) => {
    setAnimating(true);
    setLastChoice(choiceLabel);
    setRevealNote(null);
    setGainNote(null);
    setFlinchNote(null);
    setLastThreadDelta(threadDelta ?? 0);
    applyThread(threadDelta);

    // Tone must be judged AFTER this choice's own delta lands, not before it.
    // Using the stale render-time `tone` skipped scene bonuses for choices that
    // lifted you into "high", and paid them out for choices that dropped you out.
    const threadAfter = Math.max(0, Math.min(MAX_THREAD, thread + (threadDelta || 0)));
    const toneAfter = threadTone(threadAfter);

    setTimeout(() => {
      const nextScene = SCENES[nextId];
      setSceneId(nextId);

      // Apply scene-level thread/gain on high tone
      if (toneAfter === "high") {
        const sceneKey = "scene:" + nextId;
        if (nextScene?.threadHigh && !creditedIds.has(sceneKey)) {
          applyThread(nextScene.threadHigh);
          setCreditedIds(prev => new Set([...prev, sceneKey]));
        }
        if (reveal) setRevealNote(reveal);
        if (gain || nextScene?.gainHigh) setGainNote(gain || nextScene.gainHigh);
      } else if (nextScene?.flinchLow) {
        // Below "high" she does things that are not like her. This is the beat
        // where she surfaces, sees herself doing it, and goes back under.
        setFlinchNote(nextScene.flinchLow);
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
    // A gain is paid the first time only; a cost is paid every time.
    const rawThread = choice.thread || 0;
    const alreadyPaid = rawThread > 0 && creditedIds.has(choice.id);
    const effectiveThread = alreadyPaid ? 0 : rawThread;
    if (rawThread > 0 && !alreadyPaid) {
      setCreditedIds(prev => new Set([...prev, choice.id]));
    }
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
    // NB: chapter transitions happen via the chapter-end overlay buttons,
    // not through a choice — see beginChapter().
    goToScene(
      choice.next,
      choice.label,
      effectiveThread,
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
    setFlinchNote(null);
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
    goToScene("ch3_hub", "You gather your things and step back.", T.DRAIN_SM, null, null);
  };

  const jumpToScene = (sceneId, chapter, withItems = {}) => {
    setSceneId(sceneId);
    setCurrentChapter(chapter);
    setLastChoice(null);
    setRevealNote(null);
    setGainNote(null);
    setFlinchNote(null);
    setShowChapterEnd(false);
    setLastThreadDelta(null);
    setAnimating(false);
    setDevMenuOpen(false);
    setStarted(true);
    chapterStart.current = { chapter, entryScene: sceneId, thread,
      examinedIds: new Set(), consumedIds: new Set(), creditedIds: new Set(), stallsVisited: new Set(),
      hasBaileyKey: !!withItems.baileyKey, hasRosePreserve: !!withItems.rosePreserve,
      hasHourglass: !!withItems.hourglass, hasMarble: !!withItems.marble,
      hasBirdSkull: !!withItems.skull };
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

  // Clear the transient bits shared by every reset path.
  const clearTransient = () => {
    setLastChoice(null);
    setRevealNote(null);
    setGainNote(null);
    setFlinchNote(null);
    setShowChapterEnd(false);
    setLastThreadDelta(null);
    setMenuOpen(false);
    setConfirmAction(null);
    setInventoryOpen(false);
    setAnimating(false);
  };

  // Record where a chapter began so it can be replayed on its own.
  const snapshotChapterStart = (chapter, entryScene) => {
    chapterStart.current = {
      chapter, entryScene, thread,
      examinedIds: new Set(examinedIds),
      consumedIds: new Set(consumedIds),
      creditedIds: new Set(creditedIds),
      stallsVisited: new Set(stallsVisited),
      hasBaileyKey, hasRosePreserve, hasHourglass, hasMarble, hasBirdSkull,
    };
  };

  const beginChapter = (chapter, entryScene) => {
    snapshotChapterStart(chapter, entryScene);
    clearTransient();
    setCurrentChapter(chapter);
    setSceneId(entryScene);
  };

  // Fresh playthrough from the title screen. State setters are async, so the
  // Chapter 1 snapshot is written explicitly rather than read back off state.
  const startNewGame = () => {
    clearSave();
    setHasSave(false);
    clearTransient();
    setThread(MAX_THREAD);
    setExaminedIds(new Set());
    setConsumedIds(new Set());
    setCreditedIds(new Set());
    setStallsVisited(new Set());
    setHasBaileyKey(false);
    setHasRosePreserve(false);
    setHasHourglass(false);
    setHasMarble(false);
    setHasBirdSkull(false);
    setCurrentChapter(1);
    setSceneId("opening");
    chapterStart.current = {
      chapter: 1, entryScene: "opening", thread: MAX_THREAD,
      examinedIds: new Set(), consumedIds: new Set(), creditedIds: new Set(), stallsVisited: new Set(),
      hasBaileyKey: false, hasRosePreserve: false,
      hasHourglass: false, hasMarble: false, hasBirdSkull: false,
    };
    setStarted(true);
  };

  // Restart the CURRENT chapter — rewind to its opening with the state the
  // player actually had when they got there. Items and discoveries earned in
  // earlier chapters are kept; only this chapter's progress is undone.
  const handleRestartChapter = () => {
    const snap = chapterStart.current;
    clearTransient();
    if (!snap) {
      handleRestartGame();
      return;
    }
    setThread(snap.thread);
    setExaminedIds(new Set(snap.examinedIds));
    setConsumedIds(new Set(snap.consumedIds));
    setCreditedIds(new Set(snap.creditedIds || []));
    setStallsVisited(new Set(snap.stallsVisited));
    setHasBaileyKey(snap.hasBaileyKey);
    setHasRosePreserve(snap.hasRosePreserve);
    setHasHourglass(snap.hasHourglass);
    setHasMarble(snap.hasMarble);
    setHasBirdSkull(snap.hasBirdSkull);
    setCurrentChapter(snap.chapter);
    setSceneId(snap.entryScene);
  };

  const handleRestartGame = () => {
    clearTransient();
    setStarted(false);
    setThread(MAX_THREAD);
    setSceneId("opening");
    setExaminedIds(new Set());
    setConsumedIds(new Set());
    setCreditedIds(new Set());
    setStallsVisited(new Set());
    setHasBaileyKey(false);
    setHasRosePreserve(false);
    setHasHourglass(false);
    setHasMarble(false);
    setHasBirdSkull(false);
    setCurrentChapter(1);
    chapterStart.current = null;
    clearSave();
    setHasSave(false);
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

          {hasSave && (
            <button onClick={resumeSave} style={{
              padding: "14px 40px", background: "transparent",
              border: "1px solid #8a6e2a", borderRadius: "2px",
              color: "#c9a84c", fontFamily: "'Cinzel', serif",
              fontSize: "0.75rem", letterSpacing: "4px",
              textTransform: "uppercase", cursor: "pointer",
              marginBottom: "14px",
            }}>
              Continue
            </button>
          )}

          <button onClick={startNewGame} style={{
            padding: "14px 40px", background: "transparent",
            border: `1px solid ${hasSave ? "#3a5a40" : "#8a6e2a"}`, borderRadius: "2px",
            color: hasSave ? "#9dbb9a" : "#c9a84c", fontFamily: "'Cinzel', serif",
            fontSize: "0.75rem", letterSpacing: "4px",
            textTransform: "uppercase", cursor: "pointer",
          }}>
            {hasSave ? "Start again" : "Begin"}
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
      {devEnabled && devMenuOpen && (
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
              fontSize: "0.6rem", color: "#7a9a78",
              letterSpacing: "1px", textTransform: "uppercase", marginTop: "1px",
            }}>{chapterLabel}</div>
          </div>

          {/* Right side — inventory + thread */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {devEnabled && <button
                onClick={() => setDevMenuOpen(true)}
                aria-label="Dev menu"
                style={{
                  background: "transparent", border: "1px solid #1a3a1a", cursor: "pointer",
                  padding: "2px 5px", lineHeight: 1, fontSize: "0.55rem",
                  color: "#2a5a2a", borderRadius: "2px", letterSpacing: "1px",
                  fontFamily: "'Cinzel', serif",
                }}
              >DEV</button>}
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

          {/* FLINCH — a moment of clarity at mid/low thread */}
          {!scene?.isMiniGame && !scene?.isLockGame && flinchNote && (
            <div style={{
              margin: "16px 0", padding: "10px 14px",
              background: "#0c1410", border: "1px solid #2e2020",
              borderLeft: "3px solid #7a4a4a", borderRadius: "3px",
              fontSize: "0.8rem", color: "#c4b0b0",
              animation: "fadeIn 0.9s ease forwards",
            }}>{flinchNote}</div>
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
                background: "transparent", border: "1px solid #2a4a34",
                borderRadius: "3px", color: "#728f78",
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
                    color: isProgress ? "#c9a84c" : examined ? "#728f78" : "#9dbb9a",
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
              fontSize: "0.6rem", color: "#7a9a78",
              letterSpacing: "4px", textTransform: "uppercase",
              fontFamily: "'Cinzel', serif", marginBottom: "10px",
            }}>End of {currentChapter === 1 ? "Chapter One" : currentChapter === 2 ? "Chapter Two" : "Chapter Three"}</div>
            <div style={{
              fontSize: "1rem", color: "#7a6a58",
              fontStyle: "italic", marginBottom: "32px",
            }}>{scene?.chapterEndText}</div>
            {currentChapter === 1 ? (
              <button onClick={() => beginChapter(2, "ch2_opening")} style={{
                padding: "12px 32px", background: "transparent",
                border: "1px solid #8a6e2a", borderRadius: "2px",
                color: "#c9a84c", fontFamily: "'Cinzel', serif",
                fontSize: "0.75rem", letterSpacing: "3px",
                textTransform: "uppercase", cursor: "pointer",
              }}>Continue →</button>
            ) : currentChapter === 2 ? (
              <button onClick={() => beginChapter(3, "ch3_opening")} style={{
                padding: "12px 32px", background: "transparent",
                border: "1px solid #8a6e2a", borderRadius: "2px",
                color: "#c9a84c", fontFamily: "'Cinzel', serif",
                fontSize: "0.75rem", letterSpacing: "3px",
                textTransform: "uppercase", cursor: "pointer",
              }}>Continue →</button>
            ) : (
              <>
                <div style={{ fontSize: "0.8rem", color: "#9a8a72", fontStyle: "italic", marginBottom: "24px" }}>
                  Chapter Four is still being written.
                </div>
                <button onClick={() => { setMenuOpen(false); handleRestartGame(); }} style={{
                  padding: "12px 32px", background: "transparent",
                  border: "1px solid #8a6e2a", borderRadius: "2px",
                  color: "#c9a84c", fontFamily: "'Cinzel', serif",
                  fontSize: "0.75rem", letterSpacing: "3px",
                  textTransform: "uppercase", cursor: "pointer",
                }}>↺ Play again</button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Tealby />);
