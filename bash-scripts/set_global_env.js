import { readFileSync, writeFileSync } from 'fs';

// eslint-disable-next-line no-undef
const args = process.argv.slice(2);
let CLI_CEB_DEV = 'false';
let CLI_CEB_FIREFOX = 'false';
const cliValues = [];

args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key === 'CLI_CEB_DEV') CLI_CEB_DEV = value;
  else if (key === 'CLI_CEB_FIREFOX') CLI_CEB_FIREFOX = value;
  else cliValues.push(`${key}=${value}`);
});

const envContent = readFileSync('.env', 'utf-8');
const cebLines = envContent.split('\n').filter(line => line.startsWith('CEB_'));

const newContent = [
  '# THOSE VALUES ARE EDITABLE ONLY VIA CLI',
  `CLI_CEB_DEV=${CLI_CEB_DEV}`,
  `CLI_CEB_FIREFOX=${CLI_CEB_FIREFOX}`,
  ...cliValues,
  '',
  '# THOSE VALUES ARE EDITABLE',
  ...cebLines,
].join('\n');

writeFileSync('.env', newContent);
