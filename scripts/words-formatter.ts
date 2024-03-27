/**
 * Words formatter
 *
 * @note I'm deliberately not using promises so it's just a
 *       simple program... I hope.
 *
 * @options Currently, there's only one option available.
 *
 *   format: 'progressive' | 'full'
 *     This is shown on the output syntax sample below.
 *
 * Output syntax:
 * Full format:
 *   1. **何**
 *   - Kana: _**なに**_
 *   - Progressive: _**nani**_
 *   - English; _**what**_
 *
 * Progressive format:
 *   1. _**nani**_
 *   - English; **what**
 *
 * Hiragana format:
 *   1. **何**
 *   - Progressive: _**nani**_
 *   - English; _**what**_
 *
 */
import fs from 'fs';
import path from 'path';

const inFilename = path.join(__dirname, 'input.temp.txt');
const outFilename = path.join(__dirname, 'output.temp.txt');

const writeToFile = (data: string) => {
  fs.writeFileSync(outFilename, data + '\n', {
    flag: 'a',
  });
};

// empty file
fs.writeFileSync(outFilename, '');

const lines = fs
  .readFileSync(inFilename, {
    encoding: 'utf-8',
    flag: 'r',
  })
  .split('\n')
  .filter(Boolean);

type FormatOption = 'progressive' | 'full' | 'hiragana' | 'verb';
const FORMAT_OPTIONS: FormatOption[] = [
  'progressive',
  'full',
  'hiragana',
  'verb',
];

// get metadata / options
const options: {
  format: FormatOption;
} = {
  format: 'full',
};

lines[0].split(/,\s/).forEach((option) => {
  const [name, value] = option.split(/:\s?/).map((t) => t.trim());
  if (!name || !value) {
    console.log(`Invalid option: ${option}`);
    return;
  }

  if (name === 'format' && FORMAT_OPTIONS.includes(value as FormatOption)) {
    options.format = value as FormatOption;
  }
});

const processLine = (line: string) => {
  const matches = line.match(/("[^"]*"|[^\s　]*)/gi);
  if (!matches || line.trim() === '') return [null, null, null, null] as const;

  const tokens = [...matches].filter(Boolean).map((s) => s.replace(/"/gi, ''));

  if (options.format === 'progressive') {
    const [progressive, english] = tokens;
    return [progressive, null, null, english] as const;
  }
  if (options.format === 'hiragana') {
    const [progressive, kanji, english] = tokens;
    return [progressive, null, kanji, english] as const;
  }

  const [progressive, kana, kanji, english] = tokens;
  return [progressive, kana, kanji, english] as const;
};

// process all entries
lines.forEach((line, index) => {
  // skip metadata
  if (index == 0) return;

  // Input syntax: <progressive> <kana> <kanji> <english>
  const [progressive, kana, kanji, english] = processLine(line);
  if (progressive === null) return;

  // check if there are inputs to process
  if (
    !english ||
    !progressive ||
    (options.format === 'hiragana' && !kanji) ||
    (options.format === 'full' && (!kana || !kanji))
  ) {
    console.log(`Could not process line: ${line}`);
    return;
  }

  // write first row (header)
  writeToFile(
    `${index}. **${
      ['full', 'hiragana'].includes(options.format) ? kanji : progressive
    }**\n`
  );

  // write out content
  const content = (() => {
    if (options.format === 'full')
      return [
        ['Kana', kana],
        ['Progressive', progressive],
        ['English', english],
      ];
    if (options.format === 'hiragana')
      return [
        ['Progressive', progressive],
        ['English', english],
      ];
    return [['English', english]];
  })();
  content.forEach(([label, token]) =>
    writeToFile(`- ${label}: _**${token}**_`)
  );

  // newline
  if (index != lines.length - 1) writeToFile('');
});

console.log('Conversion complete!');
