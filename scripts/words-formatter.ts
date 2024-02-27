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
 *   - Kana: _**これ**_
 *   - Progressive: _**kore**_
 *   - English; _**this one**_
 *
 * Progressive format:
 *   1. _**kore**_
 *   - English; **this one**
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

// get metadata / options
const options: {
  format: 'progressive' | 'full';
} = {
  format: 'full',
};

lines[0].split(/,\s/).forEach((option) => {
  const [name, value] = option.split(/:\s?/).map((t) => t.trim());
  if (!name || !value) {
    console.log(`Invalid option: ${option}`);
    return;
  }

  if (name === 'format' && value === 'progressive')
    options.format = 'progressive';
});

const processLine = (line: string) => {
  const matches = line.match(/("[^"]*"|[^\s　]*)/gi);
  if (!matches || line.trim() === '') return [null, null, null, null] as const;
  const [progressive, kanaOrEnglish, kanji, english] = [...matches]
    .filter(Boolean)
    .map((s) => s.replace(/"/gi, ''));
  if (options.format === 'progressive')
    return [progressive, null, null, kanaOrEnglish] as const;
  return [progressive, kanaOrEnglish, kanji, english] as const;
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
    (options.format === 'full' && (!kana || !kanji))
  ) {
    console.log(`Could not process line: ${line}`);
    return;
  }

  // write first row (header)
  writeToFile(
    `${index}. **${options.format === 'full' ? kanji : progressive}**`
  );

  // write out content
  const content =
    options.format === 'full'
      ? [
          ['Kana', kana],
          ['Progressive', progressive],
          ['English', english],
        ]
      : [['English', english]];
  content.forEach(([label, token]) =>
    writeToFile(`- ${label}: _**${token}**_`)
  );

  // newline
  writeToFile('');
});

console.log('Conversion complete!');
