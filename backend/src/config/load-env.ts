import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import dotenv from 'dotenv';

function findEnvFile(startDir: string) {
  let directory = startDir;

  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(directory, '.env');

    if (existsSync(candidate)) {
      return candidate;
    }

    const parentDirectory = resolve(directory, '..');

    if (parentDirectory === directory) {
      break;
    }

    directory = parentDirectory;
  }

  return null;
}

const envFile =
  findEnvFile(process.cwd()) ??
  findEnvFile(__dirname) ??
  resolve(process.cwd(), 'backend', '.env');

dotenv.config({
  path: envFile,
  override: true,
});
