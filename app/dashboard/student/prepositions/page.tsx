'use client';

import { StatGrid, StatItem } from '@/components/ui/StatGrid';
import { useState } from 'react';

interface Preposition {
  german: string;
  english: string;
  case: 'Akkusativ' | 'Dativ' | 'Both' | 'Genitiv';
  example?: string;
}

const prepositions: Preposition[] = [
  // Akkusativ
  { german: 'für', english: 'for', case: 'Akkusativ', example: 'Das Geschenk ist für dich.' },
  { german: 'um', english: 'around, at (time)', case: 'Akkusativ', example: 'Wir gehen um den Park.' },
  { german: 'durch', english: 'through', case: 'Akkusativ', example: 'Wir laufen durch den Wald.' },
  { german: 'gegen', english: 'against', case: 'Akkusativ', example: 'Er ist gegen den Plan.' },
  { german: 'entlang', english: 'along', case: 'Akkusativ', example: 'Wir gehen den Fluss entlang.' },
  { german: 'bis', english: 'until, by', case: 'Akkusativ', example: 'Ich bleibe bis nächsten Montag.' },
  { german: 'ohne', english: 'without', case: 'Akkusativ', example: 'Ich gehe ohne dich.' },
  { german: 'wider', english: 'against, contrary to', case: 'Akkusativ', example: 'Das ist wider die Natur.' },

  // Dativ
  { german: 'von', english: 'from, of', case: 'Dativ', example: 'Ich komme von der Schule.' },
  { german: 'aus', english: 'out of, from', case: 'Dativ', example: 'Er kommt aus dem Haus.' },
  { german: 'zu', english: 'to', case: 'Dativ', example: 'Ich gehe zu meiner Oma.' },
  { german: 'mit', english: 'with', case: 'Dativ', example: 'Ich fahre mit dem Bus.' },
  { german: 'nach', english: 'after, to (cities/countries)', case: 'Dativ', example: 'Nach dem Essen gehe ich schlafen.' },
  { german: 'bei', english: 'at, near, with', case: 'Dativ', example: 'Ich wohne bei meinen Eltern.' },
  { german: 'seit', english: 'since, for (time)', case: 'Dativ', example: 'Ich lerne seit einem Jahr Deutsch.' },
  { german: 'außer', english: 'except, besides', case: 'Dativ', example: 'Alle außer mir sind da.' },
  { german: 'gegenüber', english: 'across from, opposite', case: 'Dativ', example: 'Das Café ist gegenüber dem Park.' },

  // Both (Wechselpräpositionen)
  { german: 'an', english: 'at, on', case: 'Both', example: 'Wohin? → Ich gehe ans Fenster. / Wo? → Ich bin am Fenster.' },
  { german: 'auf', english: 'on, onto', case: 'Both', example: 'Wohin? → Ich lege es auf den Tisch. / Wo? → Es liegt auf dem Tisch.' },
  { german: 'hinter', english: 'behind', case: 'Both', example: 'Wohin? → Ich gehe hinter das Haus. / Wo? → Ich bin hinter dem Haus.' },
  { german: 'in', english: 'in, into', case: 'Both', example: 'Wohin? → Ich gehe in die Schule. / Wo? → Ich bin in der Schule.' },
  { german: 'neben', english: 'next to, beside', case: 'Both', example: 'Wohin? → Ich setze mich neben dich. / Wo? → Ich sitze neben dir.' },
  { german: 'über', english: 'over, above, about', case: 'Both', example: 'Wohin? → Die Brücke geht über den Fluss. / Wo? → Die Lampe hängt über dem Tisch.' },
  { german: 'unter', english: 'under, below, among', case: 'Both', example: 'Wohin? → Die Katze geht unter den Tisch. / Wo? → Die Katze ist unter dem Tisch.' },
  { german: 'vor', english: 'in front of, before, ago', case: 'Both', example: 'Wohin? → Ich stelle mich vor die Tür. / Wo? → Ich stehe vor der Tür.' },
  { german: 'zwischen', english: 'between', case: 'Both', example: 'Wohin? → Ich gehe zwischen die Bäume. / Wo? → Ich bin zwischen den Bäumen.' },

  // Genitiv
  { german: 'während', english: 'during', case: 'Genitiv', example: 'Während des Unterrichts bin ich still.' },
  { german: 'wegen', english: 'because of', case: 'Genitiv', example: 'Wegen des Regens bleibe ich zu Hause.' },
  { german: 'trotz', english: 'despite, in spite of', case: 'Genitiv', example: 'Trotz des Wetters gehen wir spazieren.' },
  { german: 'statt', english: 'instead of', case: 'Genitiv', example: 'Statt des Autos nehme ich das Fahrrad.' },
  { german: 'außerhalb', english: 'outside of', case: 'Genitiv', example: 'Außerhalb der Stadt ist es ruhiger.' },
  { german: 'innerhalb', english: 'within, inside of', case: 'Genitiv', example: 'Innerhalb einer Woche muss ich antworten.' },
];

export default function PrepositionsGuidePage() {
  const [selectedCase, setSelectedCase] = useState<'All' | 'Akkusativ' | 'Dativ' | 'Both' | 'Genitiv'>('All');

  const filteredPrepositions = prepositions.filter((prep) => {
    return selectedCase === 'All' || prep.case === selectedCase;
  });

  const totalPrepositions = prepositions.length;
  const akkusativCount = prepositions.filter((p) => p.case === 'Akkusativ').length;
  const dativCount = prepositions.filter((p) => p.case === 'Dativ').length;
  const bothCount = prepositions.filter((p) => p.case === 'Both').length;
  const genitivCount = prepositions.filter((p) => p.case === 'Genitiv').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            German Prepositions Guide
          </h1>
          <p className="text-lg text-gray-600">
            Master German prepositions and their required cases
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <StatGrid>
            <StatItem label="Total Prepositions" value={totalPrepositions} />
            <StatItem label="Akkusativ Only" value={akkusativCount} />
            <StatItem label="Dativ Only" value={dativCount} />
            <StatItem label="Two-Way" value={bothCount} />
          </StatGrid>
        </div>

        {/* Mnemonics Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Akkusativ Mnemonic */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔵</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-1">Akkusativ</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Für</strong> my trip <strong>um</strong> the world, I walked <strong>durch</strong> forests, ran <strong>gegen</strong> the wind <strong>entlang</strong> beaches <strong>bis</strong> sunset, all <strong>ohne</strong> help—<strong>wider</strong> all odds!
                </p>
              </div>
            </div>
          </div>

          {/* Dativ Mnemonic */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟢</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-green-900 mb-1">Dativ</h3>
                <p className="text-xs text-green-700 leading-relaxed">
                  <strong>Von</strong> the house, I came <strong>aus</strong>, went <strong>zu</strong> the park <strong>mit</strong> friends, <strong>nach</strong> lunch <strong>bei</strong> the café—I've been doing this <strong>seit</strong> years, everyone <strong>außer</strong> me sits <strong>gegenüber</strong> the fountain.
                </p>
              </div>
            </div>
          </div>

          {/* Two-Way (Wechselpräpositionen) */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟣</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-purple-900 mb-1">Two-Way (Akk = motion, Dat = location)</h3>
                <p className="text-xs text-purple-700 leading-relaxed">
                  I hang the picture <strong>an</strong> the wall, place the book <strong>auf</strong> the table, hide <strong>hinter</strong> the door, step <strong>in</strong> the room, sit <strong>neben</strong> you, fly <strong>über</strong> the city, crawl <strong>unter</strong> the bridge, stand <strong>vor</strong> the mirror, squeeze <strong>zwischen</strong> the cars.
                </p>
              </div>
            </div>
          </div>

          {/* Genitiv Mnemonic */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟠</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-orange-900 mb-1">Genitiv (Formal/Written)</h3>
                <p className="text-xs text-orange-700 leading-relaxed">
                  <strong>Während</strong> the meeting, I stayed <strong>wegen</strong> important business, and <strong>trotz</strong> the rain, I chose walking <strong>statt</strong> driving—I live <strong>außerhalb</strong> the city but must respond <strong>innerhalb</strong> 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Case
          </label>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Akkusativ', 'Dativ', 'Both', 'Genitiv'] as const).map((caseType) => (
              <button
                key={caseType}
                onClick={() => setSelectedCase(caseType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCase === caseType
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {caseType}
              </button>
            ))}
          </div>
        </div>

        {/* Prepositions List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredPrepositions.length} Preposition{filteredPrepositions.length !== 1 ? 's' : ''} Found
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredPrepositions.map((prep, index) => (
              <div
                key={index}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">
                      {prep.german}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        prep.case === 'Akkusativ'
                          ? 'bg-blue-100 text-blue-700'
                          : prep.case === 'Dativ'
                          ? 'bg-green-100 text-green-700'
                          : prep.case === 'Both'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {prep.case}
                    </span>
                    <span className="text-gray-600">
                      {prep.english}
                    </span>
                  </div>
                  {prep.example && (
                    <div className="pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-600 italic">{prep.example}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Learning Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">•</span>
              <span>
                Use the mnemonics above to memorize which prepositions take which case
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600 mt-0.5">•</span>
              <span>
                <strong>Two-way prepositions</strong> use Akkusativ for movement (Wohin? = where to?) and Dativ for location (Wo? = where?)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-600 mt-0.5">•</span>
              <span>
                <strong>Dativ prepositions</strong> are very common in everyday German - memorize these first!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600 mt-0.5">•</span>
              <span>
                <strong>Genitiv prepositions</strong> are mostly used in formal/written German. In spoken German, many people use Dativ instead.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
