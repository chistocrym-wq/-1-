export type SpeakingPart = 1 | 2 | 3;

export interface SpeakingTeil2Card {
  id: string;
  theme: string;
  themeRu: string;
  keyword: string;
  keywordRu: string;
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
  | 'water' | 'pen' | 'window' | 'door' | 'salt' | 'menu' | 'phone' | 'key' | 'bag' | 'ticket'
  | 'map' | 'umbrella' | 'bread' | 'bottle' | 'chair' | 'light' | 'photo' | 'suitcase' | 'taxi' | 'post'
  | 'stamp' | 'shoes' | 'coins' | 'timetable' | 'station' | 'book' | 'newspaper' | 'car' | 'idcard' | 'plate'
  | 'fork' | 'spoon' | 'coffee' | 'cup' | 'sandwich' | 'fruit' | 'medicine' | 'towel' | 'glasses' | 'charger'
  | 'wifi' | 'clock' | 'bus' | 'bicycle' | 'jacket' | 'roomkey' | 'blanket' | 'soap' | 'toilet' | 'receipt';

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
  cards: Array<[string, string, string, string]>;
}> = [
  { theme: 'Einkaufen', themeRu: 'Покупки', cards: [
    ['Preis', 'Цена', 'Wie viel kostet das?', 'Das kostet zwölf Euro.'],
    ['Öffnungszeiten', 'Часы работы', 'Wann ist der Supermarkt geöffnet?', 'Von acht bis zwanzig Uhr.'],
    ['Obst', 'Фрукты', 'Welches Obst kaufen Sie gern?', 'Ich kaufe gern Äpfel und Bananen.'],
    ['bezahlen', 'платить', 'Wie bezahlen Sie?', 'Ich bezahle mit Karte.'],
    ['Supermarkt', 'Супермаркет', 'Wo ist hier ein Supermarkt?', 'Der Supermarkt ist neben der Apotheke.'],
    ['Tasche', 'Сумка', 'Nehmen Sie eine Tasche zum Einkaufen mit?', 'Ja, ich nehme immer eine Tasche mit.'],
  ]},
  { theme: 'Wochenende', themeRu: 'Выходные', cards: [
    ['Freunde', 'Друзья', 'Treffen Sie am Wochenende Freunde?', 'Ja, am Samstag treffe ich meine Freunde.'],
    ['Kino', 'Кино', 'Gehen Sie gern ins Kino?', 'Ja, manchmal am Freitagabend.'],
    ['Sonntag', 'Воскресенье', 'Was machen Sie am Sonntag?', 'Am Sonntag schlafe ich lange und gehe spazieren.'],
    ['Ausflug', 'Поездка / прогулка', 'Machen Sie am Wochenende einen Ausflug?', 'Ja, manchmal fahre ich an einen See.'],
    ['Restaurant', 'Ресторан', 'Gehen Sie am Wochenende ins Restaurant?', 'Ja, manchmal mit meiner Familie.'],
    ['schlafen', 'спать', 'Wie lange schlafen Sie am Wochenende?', 'Ich schlafe ungefähr acht Stunden.'],
  ]},
  { theme: 'Familie', themeRu: 'Семья', cards: [
    ['Geschwister', 'Братья и сёстры', 'Haben Sie Geschwister?', 'Ja, ich habe einen Bruder.'],
    ['Kinder', 'Дети', 'Haben Sie Kinder?', 'Ja, ich habe eine Tochter.'],
    ['Eltern', 'Родители', 'Wo wohnen Ihre Eltern?', 'Meine Eltern wohnen in Moskau.'],
    ['Geburtstag', 'День рождения', 'Wann hat Ihre Mutter Geburtstag?', 'Sie hat im Mai Geburtstag.'],
    ['wohnen', 'жить', 'Wohnen Sie mit Ihrer Familie zusammen?', 'Ja, wir wohnen zusammen.'],
    ['Urlaub', 'Отпуск', 'Machen Sie mit Ihrer Familie Urlaub?', 'Ja, im Sommer fahren wir ans Meer.'],
  ]},
  { theme: 'Essen und Trinken', themeRu: 'Еда и напитки', cards: [
    ['Frühstück', 'Завтрак', 'Was essen Sie zum Frühstück?', 'Ich esse Brot und Käse.'],
    ['Kaffee', 'Кофе', 'Trinken Sie gern Kaffee?', 'Ja, morgens trinke ich gern Kaffee.'],
    ['Lieblingsessen', 'Любимая еда', 'Was ist Ihr Lieblingsessen?', 'Mein Lieblingsessen ist Pizza.'],
    ['kochen', 'готовить', 'Kochen Sie oft zu Hause?', 'Ja, fast jeden Abend.'],
    ['Wasser', 'Вода', 'Wie viel Wasser trinken Sie am Tag?', 'Ungefähr zwei Liter.'],
    ['Restaurant', 'Ресторан', 'Was bestellen Sie gern im Restaurant?', 'Ich bestelle gern Suppe und Salat.'],
  ]},
  { theme: 'Wohnen', themeRu: 'Жильё', cards: [
    ['Zimmer', 'Комната', 'Wie viele Zimmer hat Ihre Wohnung?', 'Meine Wohnung hat drei Zimmer.'],
    ['Miete', 'Арендная плата', 'Wie viel Miete zahlen Sie?', 'Ich zahle achthundert Euro.'],
    ['Balkon', 'Балкон', 'Hat Ihre Wohnung einen Balkon?', 'Ja, wir haben einen kleinen Balkon.'],
    ['Küche', 'Кухня', 'Ist Ihre Küche groß?', 'Nein, sie ist klein, aber schön.'],
    ['Nachbarn', 'Соседи', 'Kennen Sie Ihre Nachbarn?', 'Ja, meine Nachbarn sind sehr nett.'],
    ['Adresse', 'Адрес', 'Wie ist Ihre Adresse?', 'Ich wohne in der Parkstraße 12.'],
  ]},
  { theme: 'Reisen', themeRu: 'Путешествия', cards: [
    ['Bahnhof', 'Вокзал', 'Wie kommen Sie zum Bahnhof?', 'Ich fahre mit dem Bus.'],
    ['Fahrkarte', 'Билет', 'Wo kaufen Sie die Fahrkarte?', 'Ich kaufe sie am Automaten.'],
    ['Hotel', 'Отель', 'Übernachten Sie lieber im Hotel?', 'Ja, ich übernachte gern im Hotel.'],
    ['Urlaub', 'Отпуск', 'Wann machen Sie Urlaub?', 'Im August mache ich Urlaub.'],
    ['Koffer', 'Чемодан', 'Was nehmen Sie im Koffer mit?', 'Ich nehme Kleidung und Schuhe mit.'],
    ['Zug', 'Поезд', 'Fahren Sie gern mit dem Zug?', 'Ja, der Zug ist bequem.'],
  ]},
  { theme: 'Freizeit', themeRu: 'Свободное время', cards: [
    ['Musik', 'Музыка', 'Welche Musik hören Sie gern?', 'Ich höre gern Popmusik.'],
    ['lesen', 'читать', 'Lesen Sie gern?', 'Ja, ich lese gern Krimis.'],
    ['Sport', 'Спорт', 'Welchen Sport machen Sie?', 'Ich gehe zweimal pro Woche schwimmen.'],
    ['Freunde', 'Друзья', 'Was machen Sie mit Freunden?', 'Wir trinken Kaffee und reden.'],
    ['Abend', 'Вечер', 'Was machen Sie am Abend?', 'Ich sehe fern oder lese.'],
    ['Park', 'Парк', 'Gehen Sie gern in den Park?', 'Ja, ich gehe dort oft spazieren.'],
  ]},
  { theme: 'Gesundheit', themeRu: 'Здоровье', cards: [
    ['Arzt', 'Врач', 'Wann gehen Sie zum Arzt?', 'Wenn ich krank bin.'],
    ['Apotheke', 'Аптека', 'Wo ist die nächste Apotheke?', 'Sie ist gegenüber vom Supermarkt.'],
    ['Termin', 'Запись / встреча', 'Wann haben Sie einen Termin beim Arzt?', 'Am Dienstag um zehn Uhr.'],
    ['Medikamente', 'Лекарства', 'Nehmen Sie Medikamente?', 'Nein, im Moment nicht.'],
    ['schlafen', 'спать', 'Wie viele Stunden schlafen Sie?', 'Ungefähr sieben Stunden.'],
    ['Sport', 'Спорт', 'Machen Sie Sport für Ihre Gesundheit?', 'Ja, ich gehe oft ins Fitnessstudio.'],
  ]},
  { theme: 'Arbeit und Beruf', themeRu: 'Работа и профессия', cards: [
    ['Arbeitszeit', 'Рабочее время', 'Wann beginnt Ihre Arbeit?', 'Meine Arbeit beginnt um acht Uhr.'],
    ['Kollegen', 'Коллеги', 'Arbeiten Sie gern mit Ihren Kollegen?', 'Ja, meine Kollegen sind nett.'],
  ]},
];

export const speakingTeil2Cards: SpeakingTeil2Card[] = teil2Themes.flatMap((group, groupIndex) =>
  group.cards.map(([keyword, keywordRu, sampleQuestion, sampleAnswer], cardIndex) => ({
    id: `sprechen-t2-${groupIndex + 1}-${cardIndex + 1}`,
    theme: group.theme,
    themeRu: group.themeRu,
    keyword,
    keywordRu,
    sampleQuestion,
    sampleAnswer,
  }))
);

const teil3: Array<[SpeakingVisual, string, string, string]> = [
  ['water', 'ein Glas Wasser', 'Ein Glas Wasser, bitte.', 'Ja, natürlich. Bitte.'],
  ['pen', 'ein Stift', 'Kann ich bitte einen Stift haben?', 'Ja, hier bitte.'],
  ['window', 'ein Fenster', 'Können Sie bitte das Fenster öffnen?', 'Ja, gern.'],
  ['door', 'eine Tür', 'Können Sie bitte die Tür schließen?', 'Ja, natürlich.'],
  ['salt', 'Salz', 'Geben Sie mir bitte das Salz?', 'Ja, bitte.'],
  ['menu', 'eine Speisekarte', 'Kann ich bitte die Speisekarte haben?', 'Ja, sofort.'],
  ['phone', 'ein Telefon', 'Kann ich bitte Ihr Telefon benutzen?', 'Ja, natürlich.'],
  ['key', 'ein Schlüssel', 'Geben Sie mir bitte den Schlüssel?', 'Ja, hier bitte.'],
  ['bag', 'eine schwere Tasche', 'Können Sie mir bitte mit der Tasche helfen?', 'Ja, gern.'],
  ['ticket', 'eine Fahrkarte', 'Eine Fahrkarte nach Köln, bitte.', 'Ja, einfach oder hin und zurück?'],
  ['map', 'ein Stadtplan', 'Können Sie mir bitte einen Stadtplan geben?', 'Ja, hier bitte.'],
  ['umbrella', 'ein Regenschirm', 'Kann ich bitte Ihren Regenschirm nehmen?', 'Ja, natürlich.'],
  ['bread', 'Brot', 'Geben Sie mir bitte das Brot?', 'Ja, bitte.'],
  ['bottle', 'eine Flasche Wasser', 'Können Sie bitte die Flasche öffnen?', 'Ja, gern.'],
  ['chair', 'ein Stuhl', 'Kann ich bitte den Stuhl nehmen?', 'Ja, natürlich.'],
  ['light', 'eine Lampe', 'Können Sie bitte das Licht anmachen?', 'Ja, gern.'],
  ['photo', 'eine Kamera', 'Können Sie bitte ein Foto von mir machen?', 'Ja, gern.'],
  ['suitcase', 'ein Koffer', 'Können Sie mir bitte mit dem Koffer helfen?', 'Ja, natürlich.'],
  ['taxi', 'ein Taxi', 'Können Sie mir bitte ein Taxi rufen?', 'Ja, gern.'],
  ['post', 'eine Post', 'Wo ist bitte die nächste Post?', 'Gleich dort an der Ecke.'],
  ['stamp', 'eine Briefmarke', 'Eine Briefmarke, bitte.', 'Ja, gern.'],
  ['shoes', 'Schuhe', 'Können Sie mir bitte die Schuhe geben?', 'Ja, hier bitte.'],
  ['coins', 'Kleingeld', 'Können Sie mir bitte Geld wechseln?', 'Ja, natürlich.'],
  ['timetable', 'ein Fahrplan', 'Können Sie mir bitte den Fahrplan zeigen?', 'Ja, gern.'],
  ['station', 'ein Bahnhof', 'Wo ist bitte der Bahnhof?', 'Geradeaus und dann links.'],
  ['book', 'ein Buch', 'Kann ich bitte das Buch haben?', 'Ja, hier bitte.'],
  ['newspaper', 'eine Zeitung', 'Kann ich bitte die Zeitung haben?', 'Ja, natürlich.'],
  ['car', 'ein Auto', 'Können Sie mich bitte mit dem Auto mitnehmen?', 'Ja, gern.'],
  ['idcard', 'ein Ausweis', 'Zeigen Sie mir bitte Ihren Ausweis.', 'Ja, hier bitte.'],
  ['plate', 'ein Teller', 'Kann ich bitte einen Teller haben?', 'Ja, sofort.'],
  ['fork', 'eine Gabel', 'Eine Gabel, bitte.', 'Ja, hier bitte.'],
  ['spoon', 'ein Löffel', 'Kann ich bitte einen Löffel haben?', 'Ja, natürlich.'],
  ['coffee', 'Kaffee', 'Einen Kaffee, bitte.', 'Ja, gern.'],
  ['cup', 'eine Tasse', 'Kann ich bitte eine Tasse haben?', 'Ja, hier bitte.'],
  ['sandwich', 'ein Sandwich', 'Ein Sandwich, bitte.', 'Ja, gern.'],
  ['fruit', 'Obst', 'Können Sie mir bitte einen Apfel geben?', 'Ja, natürlich.'],
  ['medicine', 'Medikamente', 'Können Sie mir bitte dieses Medikament geben?', 'Ja, gern.'],
  ['towel', 'ein Handtuch', 'Kann ich bitte ein Handtuch haben?', 'Ja, sofort.'],
  ['glasses', 'eine Brille', 'Können Sie mir bitte meine Brille geben?', 'Ja, hier bitte.'],
  ['charger', 'ein Ladegerät', 'Kann ich bitte Ihr Ladegerät benutzen?', 'Ja, natürlich.'],
  ['wifi', 'WLAN', 'Können Sie mir bitte das WLAN-Passwort sagen?', 'Ja, gern.'],
  ['clock', 'eine Uhr', 'Können Sie mir bitte sagen, wie spät es ist?', 'Ja, es ist zehn Uhr.'],
  ['bus', 'ein Bus', 'Können Sie mir bitte sagen, wo der Bus hält?', 'Ja, dort vorne.'],
  ['bicycle', 'ein Fahrrad', 'Kann ich bitte Ihr Fahrrad kurz nehmen?', 'Ja, natürlich.'],
  ['jacket', 'eine Jacke', 'Können Sie mir bitte die Jacke geben?', 'Ja, hier bitte.'],
  ['roomkey', 'ein Zimmerschlüssel', 'Kann ich bitte den Zimmerschlüssel haben?', 'Ja, gern.'],
  ['blanket', 'eine Decke', 'Kann ich bitte eine Decke haben?', 'Ja, natürlich.'],
  ['soap', 'Seife', 'Kann ich bitte Seife haben?', 'Ja, hier bitte.'],
  ['toilet', 'eine Toilette', 'Wo ist bitte die Toilette?', 'Dort rechts.'],
  ['receipt', 'eine Rechnung', 'Die Rechnung, bitte.', 'Ja, sofort.'],
];

export const speakingTeil3Cards: SpeakingTeil3Card[] = teil3.map(([visual, alt, sampleRequest, sampleReaction], index) => ({
  id: `sprechen-t3-${index + 1}`,
  visual,
  alt,
  sampleRequest,
  sampleReaction,
}));
