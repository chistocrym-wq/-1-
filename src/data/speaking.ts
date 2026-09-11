export type SpeakingPart = 1 | 2 | 3;

export interface SpeakingTeil2Card {
  id: string;
  theme: string;
  themeRu: string;
  keyword: string;
  sampleQuestion: string;
  sampleAnswer: string;
}

export interface SpeakingTeil3Card {
  id: string;
  visual: SpeakingVisual;
  alt: string;
  sampleRequest: string;
  sampleReaction: string;
}

export type SpeakingVisual =
  | 'water'
  | 'pen'
  | 'window'
  | 'door'
  | 'salt'
  | 'menu'
  | 'phone'
  | 'key'
  | 'bag'
  | 'ticket'
  | 'map'
  | 'umbrella'
  | 'bread'
  | 'bottle'
  | 'chair'
  | 'light'
  | 'photo'
  | 'suitcase';

export const speakingTeil1 = {
  title: 'Teil 1 · Sich vorstellen',
  instruction: 'Stellen Sie sich vor. Sprechen Sie kurz über sich.',
  instructionRu: 'Представьтесь и коротко расскажите о себе по опорным словам.',
  keywords: ['Name?', 'Alter?', 'Land?', 'Wohnort?', 'Sprachen?', 'Beruf?', 'Hobby?'],
  checkPoints: ['Name', 'Alter', 'Land', 'Wohnort', 'Sprachen', 'Beruf', 'Hobby'],
  sampleAnswer:
    'Guten Tag. Ich heiße Anna Petrova. Ich bin 34 Jahre alt. Ich komme aus Russland und wohne jetzt in Hamburg. Ich spreche Russisch, Englisch und ein bisschen Deutsch. Ich bin Verkäuferin. Mein Hobby ist Sport.',
  followUps: [
    'Können Sie bitte Ihren Namen buchstabieren?',
    'Wie ist bitte Ihre Telefonnummer?',
    'Wie ist Ihre Hausnummer?',
  ],
};

const teil2Themes: Array<{
  theme: string;
  themeRu: string;
  cards: Array<[string, string, string]>;
}> = [
  {
    theme: 'Einkaufen',
    themeRu: 'Покупки',
    cards: [
      ['Preis', 'Wie viel kostet das?', 'Das kostet zwölf Euro.'],
      ['Öffnungszeiten', 'Wann ist der Supermarkt geöffnet?', 'Von acht bis zwanzig Uhr.'],
      ['Obst', 'Welches Obst kaufen Sie gern?', 'Ich kaufe gern Äpfel und Bananen.'],
      ['bezahlen', 'Wie bezahlen Sie?', 'Ich bezahle mit Karte.'],
      ['Supermarkt', 'Wo ist hier ein Supermarkt?', 'Der Supermarkt ist neben der Apotheke.'],
      ['Tasche', 'Nehmen Sie eine Tasche zum Einkaufen mit?', 'Ja, ich nehme immer eine Tasche mit.'],
    ],
  },
  {
    theme: 'Wochenende',
    themeRu: 'Выходные',
    cards: [
      ['Freunde', 'Treffen Sie am Wochenende Freunde?', 'Ja, am Samstag treffe ich meine Freunde.'],
      ['Kino', 'Gehen Sie gern ins Kino?', 'Ja, manchmal am Freitagabend.'],
      ['Sonntag', 'Was machen Sie am Sonntag?', 'Am Sonntag schlafe ich lange und gehe spazieren.'],
      ['Ausflug', 'Machen Sie am Wochenende einen Ausflug?', 'Ja, manchmal fahre ich an einen See.'],
      ['Restaurant', 'Gehen Sie am Wochenende ins Restaurant?', 'Ja, manchmal mit meiner Familie.'],
      ['schlafen', 'Wie lange schlafen Sie am Wochenende?', 'Ich schlafe ungefähr acht Stunden.'],
    ],
  },
  {
    theme: 'Familie',
    themeRu: 'Семья',
    cards: [
      ['Geschwister', 'Haben Sie Geschwister?', 'Ja, ich habe einen Bruder.'],
      ['Kinder', 'Haben Sie Kinder?', 'Ja, ich habe eine Tochter.'],
      ['Eltern', 'Wo wohnen Ihre Eltern?', 'Meine Eltern wohnen in Moskau.'],
      ['Geburtstag', 'Wann hat Ihre Mutter Geburtstag?', 'Sie hat im Mai Geburtstag.'],
      ['wohnen', 'Wohnen Sie mit Ihrer Familie zusammen?', 'Ja, wir wohnen zusammen.'],
      ['Urlaub', 'Machen Sie mit Ihrer Familie Urlaub?', 'Ja, im Sommer fahren wir ans Meer.'],
    ],
  },
  {
    theme: 'Essen und Trinken',
    themeRu: 'Еда и напитки',
    cards: [
      ['Frühstück', 'Was essen Sie zum Frühstück?', 'Ich esse Brot und Käse.'],
      ['Kaffee', 'Trinken Sie gern Kaffee?', 'Ja, morgens trinke ich gern Kaffee.'],
      ['Lieblingsessen', 'Was ist Ihr Lieblingsessen?', 'Mein Lieblingsessen ist Pizza.'],
      ['kochen', 'Kochen Sie oft zu Hause?', 'Ja, fast jeden Abend.'],
      ['Wasser', 'Wie viel Wasser trinken Sie am Tag?', 'Ungefähr zwei Liter.'],
      ['Restaurant', 'Was bestellen Sie gern im Restaurant?', 'Ich bestelle gern Suppe und Salat.'],
    ],
  },
  {
    theme: 'Wohnen',
    themeRu: 'Жильё',
    cards: [
      ['Zimmer', 'Wie viele Zimmer hat Ihre Wohnung?', 'Meine Wohnung hat drei Zimmer.'],
      ['Miete', 'Wie viel Miete zahlen Sie?', 'Ich zahle achthundert Euro.'],
      ['Balkon', 'Hat Ihre Wohnung einen Balkon?', 'Ja, wir haben einen kleinen Balkon.'],
      ['Küche', 'Ist Ihre Küche groß?', 'Nein, sie ist klein, aber schön.'],
      ['Nachbarn', 'Kennen Sie Ihre Nachbarn?', 'Ja, meine Nachbarn sind sehr nett.'],
      ['Adresse', 'Wie ist Ihre Adresse?', 'Ich wohne in der Parkstraße 12.'],
    ],
  },
  {
    theme: 'Reisen',
    themeRu: 'Путешествия',
    cards: [
      ['Bahnhof', 'Wie kommen Sie zum Bahnhof?', 'Ich fahre mit dem Bus.'],
      ['Fahrkarte', 'Wo kaufen Sie die Fahrkarte?', 'Ich kaufe sie am Automaten.'],
      ['Hotel', 'Übernachten Sie lieber im Hotel?', 'Ja, ich übernachte gern im Hotel.'],
      ['Urlaub', 'Wann machen Sie Urlaub?', 'Im August mache ich Urlaub.'],
      ['Koffer', 'Was nehmen Sie im Koffer mit?', 'Ich nehme Kleidung und Schuhe mit.'],
      ['Zug', 'Fahren Sie gern mit dem Zug?', 'Ja, der Zug ist bequem.'],
    ],
  },
  {
    theme: 'Freizeit',
    themeRu: 'Свободное время',
    cards: [
      ['Musik', 'Welche Musik hören Sie gern?', 'Ich höre gern Popmusik.'],
      ['lesen', 'Lesen Sie gern?', 'Ja, ich lese gern Krimis.'],
      ['Sport', 'Welchen Sport machen Sie?', 'Ich gehe zweimal pro Woche schwimmen.'],
      ['Freunde', 'Was machen Sie mit Freunden?', 'Wir trinken Kaffee und reden.'],
      ['Abend', 'Was machen Sie am Abend?', 'Ich sehe fern oder lese.'],
      ['Park', 'Gehen Sie gern in den Park?', 'Ja, ich gehe dort oft spazieren.'],
    ],
  },
  {
    theme: 'Gesundheit',
    themeRu: 'Здоровье',
    cards: [
      ['Arzt', 'Wann gehen Sie zum Arzt?', 'Wenn ich krank bin.'],
      ['Apotheke', 'Wo ist die nächste Apotheke?', 'Sie ist gegenüber vom Supermarkt.'],
      ['Termin', 'Wann haben Sie einen Termin beim Arzt?', 'Am Dienstag um zehn Uhr.'],
      ['Medikamente', 'Nehmen Sie Medikamente?', 'Nein, im Moment nicht.'],
      ['schlafen', 'Wie viele Stunden schlafen Sie?', 'Ungefähr sieben Stunden.'],
      ['Sport', 'Machen Sie Sport für Ihre Gesundheit?', 'Ja, ich gehe oft ins Fitnessstudio.'],
    ],
  },
];

export const speakingTeil2Cards: SpeakingTeil2Card[] = teil2Themes.flatMap((group, groupIndex) =>
  group.cards.map(([keyword, sampleQuestion, sampleAnswer], cardIndex) => ({
    id: `sprechen-t2-${groupIndex + 1}-${cardIndex + 1}`,
    theme: group.theme,
    themeRu: group.themeRu,
    keyword,
    sampleQuestion,
    sampleAnswer,
  }))
);

export const speakingTeil3Cards: SpeakingTeil3Card[] = [
  {
    id: 'sprechen-t3-1',
    visual: 'water',
    alt: 'ein Glas Wasser',
    sampleRequest: 'Ein Glas Wasser, bitte.',
    sampleReaction: 'Ja, natürlich. Bitte.',
  },
  {
    id: 'sprechen-t3-2',
    visual: 'pen',
    alt: 'ein Stift',
    sampleRequest: 'Kann ich bitte einen Stift haben?',
    sampleReaction: 'Ja, hier bitte.',
  },
  {
    id: 'sprechen-t3-3',
    visual: 'window',
    alt: 'ein Fenster',
    sampleRequest: 'Können Sie bitte das Fenster öffnen?',
    sampleReaction: 'Ja, gern.',
  },
  {
    id: 'sprechen-t3-4',
    visual: 'door',
    alt: 'eine Tür',
    sampleRequest: 'Können Sie bitte die Tür schließen?',
    sampleReaction: 'Ja, natürlich.',
  },
  {
    id: 'sprechen-t3-5',
    visual: 'salt',
    alt: 'Salz',
    sampleRequest: 'Geben Sie mir bitte das Salz?',
    sampleReaction: 'Ja, bitte.',
  },
  {
    id: 'sprechen-t3-6',
    visual: 'menu',
    alt: 'eine Speisekarte',
    sampleRequest: 'Kann ich bitte die Speisekarte haben?',
    sampleReaction: 'Ja, sofort.',
  },
  {
    id: 'sprechen-t3-7',
    visual: 'phone',
    alt: 'ein Telefon',
    sampleRequest: 'Kann ich bitte Ihr Telefon benutzen?',
    sampleReaction: 'Ja, natürlich.',
  },
  {
    id: 'sprechen-t3-8',
    visual: 'key',
    alt: 'ein Schlüssel',
    sampleRequest: 'Geben Sie mir bitte den Schlüssel?',
    sampleReaction: 'Ja, hier bitte.',
  },
  {
    id: 'sprechen-t3-9',
    visual: 'bag',
    alt: 'eine schwere Tasche',
    sampleRequest: 'Können Sie mir bitte mit der Tasche helfen?',
    sampleReaction: 'Ja, gern.',
  },
  {
    id: 'sprechen-t3-10',
    visual: 'ticket',
    alt: 'eine Fahrkarte',
    sampleRequest: 'Eine Fahrkarte nach Köln, bitte.',
    sampleReaction: 'Ja, einfach oder hin und zurück?',
  },
  {
    id: 'sprechen-t3-11',
    visual: 'map',
    alt: 'ein Stadtplan',
    sampleRequest: 'Können Sie mir bitte einen Stadtplan geben?',
    sampleReaction: 'Ja, hier bitte.',
  },
  {
    id: 'sprechen-t3-12',
    visual: 'umbrella',
    alt: 'ein Regenschirm',
    sampleRequest: 'Kann ich bitte Ihren Regenschirm nehmen?',
    sampleReaction: 'Ja, natürlich.',
  },
  {
    id: 'sprechen-t3-13',
    visual: 'bread',
    alt: 'Brot',
    sampleRequest: 'Geben Sie mir bitte das Brot?',
    sampleReaction: 'Ja, bitte.',
  },
  {
    id: 'sprechen-t3-14',
    visual: 'bottle',
    alt: 'eine Flasche',
    sampleRequest: 'Können Sie bitte die Flasche öffnen?',
    sampleReaction: 'Ja, gern.',
  },
  {
    id: 'sprechen-t3-15',
    visual: 'chair',
    alt: 'ein Stuhl',
    sampleRequest: 'Kann ich bitte den Stuhl nehmen?',
    sampleReaction: 'Ja, natürlich.',
  },
  {
    id: 'sprechen-t3-16',
    visual: 'light',
    alt: 'eine Lampe',
    sampleRequest: 'Können Sie bitte das Licht anmachen?',
    sampleReaction: 'Ja, gern.',
  },
  {
    id: 'sprechen-t3-17',
    visual: 'photo',
    alt: 'eine Kamera',
    sampleRequest: 'Können Sie bitte ein Foto von mir machen?',
    sampleReaction: 'Ja, gern.',
  },
  {
    id: 'sprechen-t3-18',
    visual: 'suitcase',
    alt: 'ein Koffer',
    sampleRequest: 'Können Sie mir bitte mit dem Koffer helfen?',
    sampleReaction: 'Ja, natürlich.',
  },
];
