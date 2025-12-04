/**
 * A2 Level Redemittel - Elementary phrases
 */

import { Redemittel } from './types';

export const a2Redemittel: Redemittel[] = [
  // ============================================
  // Opinion
  // ============================================
  {
    id: 'a2-opinion-1',
    german: 'Ich finde, dass...',
    english: 'I think that...',
    context: 'opinion',
    level: 'A2',
    example: 'Ich finde, dass es wichtig ist.',
    exampleTranslation: 'I think that it is important.',
    tags: ['opinion'],
  },
  {
    id: 'a2-opinion-2',
    german: 'Ich denke, dass...',
    english: 'I think that...',
    context: 'opinion',
    level: 'A2',
    example: 'Ich denke, dass wir gehen sollten.',
    exampleTranslation: 'I think that we should go.',
    tags: ['opinion'],
  },
  {
    id: 'a2-opinion-3',
    german: 'Ich glaube, dass...',
    english: 'I believe that...',
    context: 'opinion',
    level: 'A2',
    example: 'Ich glaube, dass das richtig ist.',
    exampleTranslation: 'I believe that is correct.',
    tags: ['opinion', 'belief'],
  },
  {
    id: 'a2-opinion-4',
    german: 'Für mich ist... wichtig',
    english: 'For me... is important',
    context: 'opinion',
    level: 'A2',
    example: 'Für mich ist Familie wichtig.',
    exampleTranslation: 'For me family is important.',
    tags: ['opinion', 'personal'],
  },

  // ============================================
  // Agreement
  // ============================================
  {
    id: 'a2-agree-1',
    german: 'Ich bin einverstanden.',
    english: 'I agree.',
    context: 'agreement',
    level: 'A2',
    tags: ['discussion'],
  },
  {
    id: 'a2-agree-2',
    german: 'Das ist eine gute Idee.',
    english: 'That is a good idea.',
    context: 'agreement',
    level: 'A2',
    tags: ['discussion', 'affirmation'],
  },
  {
    id: 'a2-agree-3',
    german: 'Da hast du recht.',
    english: "You're right.",
    context: 'agreement',
    level: 'A2',
    tags: ['discussion', 'informal'],
  },
  {
    id: 'a2-agree-4',
    german: 'Genau!',
    english: 'Exactly!',
    context: 'agreement',
    level: 'A2',
    tags: ['discussion', 'affirmation'],
  },

  // ============================================
  // Disagreement
  // ============================================
  {
    id: 'a2-disagree-1',
    german: 'Ich bin nicht sicher.',
    english: "I'm not sure.",
    context: 'disagreement',
    level: 'A2',
    tags: ['discussion', 'polite'],
  },
  {
    id: 'a2-disagree-2',
    german: 'Ich bin anderer Meinung.',
    english: 'I have a different opinion.',
    context: 'disagreement',
    level: 'A2',
    tags: ['discussion', 'polite'],
  },
  {
    id: 'a2-disagree-3',
    german: 'Das sehe ich anders.',
    english: 'I see that differently.',
    context: 'disagreement',
    level: 'A2',
    tags: ['discussion', 'polite'],
  },

  // ============================================
  // Explaining
  // ============================================
  {
    id: 'a2-explain-1',
    german: 'Das bedeutet...',
    english: 'That means...',
    context: 'explaining',
    level: 'A2',
    example: 'Das bedeutet, wir müssen warten.',
    exampleTranslation: 'That means we have to wait.',
    tags: ['clarification'],
  },
  {
    id: 'a2-explain-2',
    german: 'Das heißt...',
    english: 'That is to say...',
    context: 'explaining',
    level: 'A2',
    example: 'Das heißt, wir treffen uns um 5 Uhr.',
    exampleTranslation: 'That is to say, we meet at 5 o\'clock.',
    tags: ['clarification'],
  },
  {
    id: 'a2-explain-3',
    german: 'Weil...',
    english: 'Because...',
    context: 'explaining',
    level: 'A2',
    example: 'Ich bin müde, weil ich viel gearbeitet habe.',
    exampleTranslation: 'I am tired because I worked a lot.',
    tags: ['reason', 'subordinate'],
  },
  {
    id: 'a2-explain-4',
    german: 'Deshalb...',
    english: 'Therefore...',
    context: 'explaining',
    level: 'A2',
    example: 'Es regnet. Deshalb bleibe ich zu Hause.',
    exampleTranslation: 'It\'s raining. Therefore I\'m staying home.',
    tags: ['consequence'],
  },

  // ============================================
  // Suggesting
  // ============================================
  {
    id: 'a2-suggest-1',
    german: 'Wir können...',
    english: 'We can...',
    context: 'suggesting',
    level: 'A2',
    example: 'Wir können ins Kino gehen.',
    exampleTranslation: 'We can go to the cinema.',
    tags: ['suggestion'],
  },
  {
    id: 'a2-suggest-2',
    german: 'Wie wäre es mit...?',
    english: 'How about...?',
    context: 'suggesting',
    level: 'A2',
    example: 'Wie wäre es mit einem Spaziergang?',
    exampleTranslation: 'How about a walk?',
    tags: ['suggestion', 'question'],
  },
  {
    id: 'a2-suggest-3',
    german: 'Lass uns...',
    english: "Let's...",
    context: 'suggesting',
    level: 'A2',
    example: 'Lass uns Pizza essen.',
    exampleTranslation: "Let's eat pizza.",
    tags: ['suggestion', 'informal'],
  },
  {
    id: 'a2-suggest-4',
    german: 'Vielleicht können wir...',
    english: 'Maybe we can...',
    context: 'suggesting',
    level: 'A2',
    example: 'Vielleicht können wir morgen treffen.',
    exampleTranslation: 'Maybe we can meet tomorrow.',
    tags: ['suggestion', 'tentative'],
  },

  // ============================================
  // Describing
  // ============================================
  {
    id: 'a2-describe-1',
    german: 'Es ist...',
    english: 'It is...',
    context: 'describing',
    level: 'A2',
    example: 'Es ist sehr schön.',
    exampleTranslation: 'It is very beautiful.',
    tags: ['description'],
  },
  {
    id: 'a2-describe-2',
    german: 'Es sieht... aus',
    english: 'It looks...',
    context: 'describing',
    level: 'A2',
    example: 'Es sieht interessant aus.',
    exampleTranslation: 'It looks interesting.',
    tags: ['description', 'appearance'],
  },
  {
    id: 'a2-describe-3',
    german: 'Es gibt viele...',
    english: 'There are many...',
    context: 'describing',
    level: 'A2',
    example: 'Es gibt viele Möglichkeiten.',
    exampleTranslation: 'There are many possibilities.',
    tags: ['description', 'quantity'],
  },

  // ============================================
  // Asking
  // ============================================
  {
    id: 'a2-ask-1',
    german: 'Könnten Sie...?',
    english: 'Could you...?',
    context: 'asking',
    level: 'A2',
    example: 'Könnten Sie das wiederholen?',
    exampleTranslation: 'Could you repeat that?',
    tags: ['polite', 'request'],
  },
  {
    id: 'a2-ask-2',
    german: 'Darf ich...?',
    english: 'May I...?',
    context: 'asking',
    level: 'A2',
    example: 'Darf ich eine Frage stellen?',
    exampleTranslation: 'May I ask a question?',
    tags: ['polite', 'permission'],
  },
  {
    id: 'a2-ask-3',
    german: 'Warum...?',
    english: 'Why...?',
    context: 'asking',
    level: 'A2',
    example: 'Warum bist du so spät?',
    exampleTranslation: 'Why are you so late?',
    tags: ['question', 'reason'],
  },

  // ============================================
  // Narrating
  // ============================================
  {
    id: 'a2-narrate-1',
    german: 'Zuerst...',
    english: 'First...',
    context: 'narrating',
    level: 'A2',
    example: 'Zuerst habe ich gefrühstückt.',
    exampleTranslation: 'First I had breakfast.',
    tags: ['sequence', 'story'],
  },
  {
    id: 'a2-narrate-2',
    german: 'Dann...',
    english: 'Then...',
    context: 'narrating',
    level: 'A2',
    example: 'Dann bin ich zur Arbeit gefahren.',
    exampleTranslation: 'Then I drove to work.',
    tags: ['sequence', 'story'],
  },
  {
    id: 'a2-narrate-3',
    german: 'Danach...',
    english: 'After that...',
    context: 'narrating',
    level: 'A2',
    example: 'Danach habe ich eingekauft.',
    exampleTranslation: 'After that I went shopping.',
    tags: ['sequence', 'story'],
  },
  {
    id: 'a2-narrate-4',
    german: 'Am Ende...',
    english: 'In the end...',
    context: 'narrating',
    level: 'A2',
    example: 'Am Ende waren wir alle müde.',
    exampleTranslation: 'In the end we were all tired.',
    tags: ['sequence', 'story', 'conclusion'],
  },

  // ============================================
  // Comparing
  // ============================================
  {
    id: 'a2-compare-1',
    german: '... ist besser als...',
    english: '... is better than...',
    context: 'comparing',
    level: 'A2',
    example: 'Der Film ist besser als das Buch.',
    exampleTranslation: 'The film is better than the book.',
    tags: ['comparison'],
  },
  {
    id: 'a2-compare-2',
    german: '... ist größer als...',
    english: '... is bigger than...',
    context: 'comparing',
    level: 'A2',
    example: 'Berlin ist größer als München.',
    exampleTranslation: 'Berlin is bigger than Munich.',
    tags: ['comparison', 'size'],
  },
  {
    id: 'a2-compare-3',
    german: 'Beide sind...',
    english: 'Both are...',
    context: 'comparing',
    level: 'A2',
    example: 'Beide sind sehr gut.',
    exampleTranslation: 'Both are very good.',
    tags: ['comparison', 'similarity'],
  },
  {
    id: 'a2-compare-4',
    german: 'So... wie...',
    english: 'As... as...',
    context: 'comparing',
    level: 'A2',
    example: 'Das ist so teuer wie das andere.',
    exampleTranslation: 'That is as expensive as the other one.',
    tags: ['comparison', 'equality'],
  },

  // ============================================
  // Requesting
  // ============================================
  {
    id: 'a2-request-1',
    german: 'Würden Sie bitte...?',
    english: 'Would you please...?',
    context: 'requesting',
    level: 'A2',
    example: 'Würden Sie bitte das Fenster schließen?',
    exampleTranslation: 'Would you please close the window?',
    tags: ['polite', 'formal', 'request'],
  },
  {
    id: 'a2-request-2',
    german: 'Kannst du mir... geben?',
    english: 'Can you give me...?',
    context: 'requesting',
    level: 'A2',
    example: 'Kannst du mir das Salz geben?',
    exampleTranslation: 'Can you give me the salt?',
    tags: ['request', 'informal'],
  },
  {
    id: 'a2-request-3',
    german: 'Ich brauche...',
    english: 'I need...',
    context: 'requesting',
    level: 'A2',
    example: 'Ich brauche Hilfe.',
    exampleTranslation: 'I need help.',
    tags: ['request', 'need'],
  },
  {
    id: 'a2-request-4',
    german: 'Ich hätte gern...',
    english: 'I would like...',
    context: 'requesting',
    level: 'A2',
    example: 'Ich hätte gern die Rechnung.',
    exampleTranslation: 'I would like the bill.',
    tags: ['request', 'polite', 'ordering'],
  },

  // ============================================
  // Thanking
  // ============================================
  {
    id: 'a2-thank-1',
    german: 'Vielen Dank für...',
    english: 'Thank you very much for...',
    context: 'thanking',
    level: 'A2',
    example: 'Vielen Dank für deine Hilfe.',
    exampleTranslation: 'Thank you very much for your help.',
    tags: ['polite', 'gratitude'],
  },
  {
    id: 'a2-thank-2',
    german: 'Das ist sehr nett von dir/Ihnen.',
    english: 'That is very kind of you.',
    context: 'thanking',
    level: 'A2',
    tags: ['polite', 'gratitude'],
  },
  {
    id: 'a2-thank-3',
    german: 'Ich danke dir/Ihnen.',
    english: 'I thank you.',
    context: 'thanking',
    level: 'A2',
    tags: ['polite', 'gratitude'],
  },

  // ============================================
  // Apologizing
  // ============================================
  {
    id: 'a2-apology-1',
    german: 'Es tut mir sehr leid.',
    english: "I'm very sorry.",
    context: 'apologizing',
    level: 'A2',
    tags: ['polite', 'apology'],
  },
  {
    id: 'a2-apology-2',
    german: 'Verzeihung!',
    english: 'Pardon!',
    context: 'apologizing',
    level: 'A2',
    tags: ['polite', 'apology'],
  },
  {
    id: 'a2-apology-3',
    german: 'Das wollte ich nicht.',
    english: "I didn't mean to.",
    context: 'apologizing',
    level: 'A2',
    tags: ['apology', 'explanation'],
  },

  // ============================================
  // Complaining
  // ============================================
  {
    id: 'a2-complain-1',
    german: 'Das ist nicht in Ordnung.',
    english: 'That is not okay.',
    context: 'complaining',
    level: 'A2',
    tags: ['complaint', 'dissatisfaction'],
  },
  {
    id: 'a2-complain-2',
    german: 'Das gefällt mir nicht.',
    english: "I don't like that.",
    context: 'complaining',
    level: 'A2',
    tags: ['complaint', 'dissatisfaction'],
  },
  {
    id: 'a2-complain-3',
    german: 'Es gibt ein Problem.',
    english: 'There is a problem.',
    context: 'complaining',
    level: 'A2',
    tags: ['complaint', 'problem'],
  },

  // ============================================
  // Clarifying
  // ============================================
  {
    id: 'a2-clarify-1',
    german: 'Was meinst du damit?',
    english: 'What do you mean by that?',
    context: 'clarifying',
    level: 'A2',
    tags: ['clarification', 'question'],
  },
  {
    id: 'a2-clarify-2',
    german: 'Kannst du das erklären?',
    english: 'Can you explain that?',
    context: 'clarifying',
    level: 'A2',
    tags: ['clarification', 'request'],
  },
  {
    id: 'a2-clarify-3',
    german: 'Ich verstehe nicht.',
    english: "I don't understand.",
    context: 'clarifying',
    level: 'A2',
    tags: ['clarification', 'confusion'],
  },
  {
    id: 'a2-clarify-4',
    german: 'Wie bitte?',
    english: 'Pardon? / What?',
    context: 'clarifying',
    level: 'A2',
    tags: ['clarification', 'request', 'polite'],
  },

  // ============================================
  // Introduction (additional)
  // ============================================
  {
    id: 'a2-intro-1',
    german: 'Ich interessiere mich für...',
    english: 'I am interested in...',
    context: 'introduction',
    level: 'A2',
    example: 'Ich interessiere mich für Musik.',
    exampleTranslation: 'I am interested in music.',
    tags: ['personal', 'interests'],
  },
  {
    id: 'a2-intro-2',
    german: 'Mein Hobby ist...',
    english: 'My hobby is...',
    context: 'introduction',
    level: 'A2',
    example: 'Mein Hobby ist Fotografieren.',
    exampleTranslation: 'My hobby is photography.',
    tags: ['personal', 'hobbies'],
  },
  {
    id: 'a2-intro-3',
    german: 'Ich lerne Deutsch seit...',
    english: 'I have been learning German for...',
    context: 'introduction',
    level: 'A2',
    example: 'Ich lerne Deutsch seit zwei Jahren.',
    exampleTranslation: 'I have been learning German for two years.',
    tags: ['personal', 'learning'],
  },

  // ============================================
  // Transitioning (basic)
  // ============================================
  {
    id: 'a2-transition-1',
    german: 'Aber...',
    english: 'But...',
    context: 'transitioning',
    level: 'A2',
    example: 'Das ist gut, aber es ist teuer.',
    exampleTranslation: 'That is good, but it is expensive.',
    tags: ['transition', 'contrast'],
  },
  {
    id: 'a2-transition-2',
    german: 'Auch...',
    english: 'Also...',
    context: 'transitioning',
    level: 'A2',
    example: 'Ich mag Kaffee. Auch Tee trinke ich gern.',
    exampleTranslation: 'I like coffee. I also like to drink tea.',
    tags: ['transition', 'addition'],
  },
  {
    id: 'a2-transition-3',
    german: 'Noch etwas...',
    english: 'One more thing...',
    context: 'transitioning',
    level: 'A2',
    example: 'Noch etwas: Wir treffen uns um 7 Uhr.',
    exampleTranslation: 'One more thing: We meet at 7 o\'clock.',
    tags: ['transition', 'addition'],
  },
];
