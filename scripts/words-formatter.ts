// I'm deliberately not using promises so it's just a simple program... I hope.
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

// process all entries
lines.forEach((line, index) => {
  // skip metadata
  if (index == 0) return;

  // Input syntax: <english> <progressive> <kana> <kanji>
  const matches = line.match(/(".*"|[^\s　]*)/gi);
  if (!matches || line.trim() === '') return;
  const [english, progressive, kana, kanji] = [...matches]
    .filter(Boolean)
    .map((s) => s.replace(/"/gi, ''));

  // check if there are inputs to process
  if (
    !english ||
    !progressive ||
    (options.format === 'full' && (!kana || !kanji))
  ) {
    console.log(`Could not process line: ${line}`);
    return;
  }

  /**
   * Output syntax:
   * Full format:
   *   1. **何**
   *   - Kana: _**これ**_
   *   - Progressive: _**kore**_
   *   - English; _**this one**_
   * Progressive format:
   *   1. _**kore**_
   *   - English; **this one**
   */

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
