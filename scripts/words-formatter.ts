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
  if (!matches || line.trim() === '') return [];
  return [...matches].filter(Boolean).map((s) => s.replace(/"/gi, ''));
};

const writeHeader = (index: number, token: string) => {
  writeToFile(`${index}. **${token}**\n`);
};

const writeRow = (label: string, token: string) => {
  writeToFile(`- ${label}: _**${token}**_`);
};

const logLineError = (line: string, reason: string) => {
  console.log(`Could not process line: ${line}`);
  console.log(`Error: ${reason}`);
  return -1;
};

const handlers: {
  [key in FormatOption]: (
    index: number,
    line: string,
    tokens: string[]
  ) => number;
} = {
  full: (index, line, tokens) => {
    if (tokens.length < 4) return logLineError(line, 'Missing tokens, need 4.');
    writeHeader(index, tokens[0]);
    writeRow('Kana', tokens[1]);
    writeRow('Progressive', tokens[2]);
    writeRow('English', tokens[3]);
    return 0;
  },
  hiragana: (index, line, tokens) => {
    if (tokens.length < 3) return logLineError(line, 'Missing tokens, need 3.');
    writeHeader(index, tokens[0]);
    writeRow('Progressive', tokens[1]);
    writeRow('English', tokens[2]);
    return 0;
  },
  progressive: (index, line, tokens) => {
    if (tokens.length < 2) return logLineError(line, 'Missing tokens, need 2.');
    writeHeader(index, tokens[0]);
    writeRow('English', tokens[1]);
    return 0;
  },
  verb: (index, line, tokens) => {
    if (tokens.length < 4) return logLineError(line, 'Missing tokens, need 4.');
    writeHeader(index, tokens[1]);
    writeRow('Verb', tokens[0]);
    writeRow('English', tokens[2]);
    writeRow('Verb Type', tokens[3]);
    return 0;
  },
};

// process all entries
lines.forEach((line, index) => {
  // skip metadata
  if (index == 0) return;

  // Input syntax: <progressive> <kana> <kanji> <english>
  const tokens = processLine(line);
  if (!tokens.length) return;

  const handlerFn = handlers[options.format];

  if (handlerFn === undefined) {
    return logLineError(line, `Invalid format '${options.format}'`);
  }

  if (handlerFn(index, line, tokens)) {
    // if there's an error, return
    return;
  }

  // newline
  if (index != lines.length - 1) writeToFile('');
});

console.log('Conversion complete!');
