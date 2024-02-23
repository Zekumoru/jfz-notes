// I'm deliberately not using promises so it's just a simple program... I hope.
import fs from 'fs';

const inFilename = 'input.temp.txt';
const outFilename = 'output.temp.txt';

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

lines.forEach((line) => {
  // Input syntax: <english> <progressive> <kana> <kanji>
  const [english, romaji, kana, kanji] = line.split(/\s/);

  // Output syntax:
  // | 何       |      |
  // | ------- | ---- |
  // | Kana    | なに   |
  // | Progressive | nani |
  // | English | what |

  // get first column length
  let firstColLength = 'Progressive'.length;
  if (kanji.length > firstColLength) firstColLength = kanji.length;

  // get second column length
  let secondColLength = english.length;
  if (romaji.length > secondColLength) secondColLength = romaji.length;
  if (kana.length > secondColLength) secondColLength = kana.length;

  // write first row (header)
  writeToFile(
    `| ${kanji.padEnd(firstColLength)} | ${' '.repeat(secondColLength)} |`
  );

  // write divider
  writeToFile(
    `| ${'-'.repeat(firstColLength)} | ${'-'.repeat(secondColLength)} |`
  );

  // write out content
  [
    ['Kana', kana],
    ['Progressive', romaji],
    ['English', english],
  ].forEach(([label, token]) =>
    writeToFile(
      `| ${label.padEnd(firstColLength)} | ${token.padEnd(secondColLength)} |`
    )
  );

  // newline
  writeToFile('');
});

console.log('Conversion complete!');
