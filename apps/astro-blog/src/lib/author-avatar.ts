import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const avatar = readFileSync(path.join(process.cwd(), 'public', 'author-avatar.jpg'));
export const AUTHOR_AVATAR_VERSION = createHash('sha256').update(avatar).digest('hex').slice(0, 12);
export const AUTHOR_AVATAR_SRC = `/author-avatar.jpg?v=${AUTHOR_AVATAR_VERSION}`;
export const AUTHOR_AVATAR_DATA_URL = `data:image/jpeg;base64,${avatar.toString('base64')}`;
