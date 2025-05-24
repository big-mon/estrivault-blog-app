import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // /post にアクセスしたらトップページにリダイレクト
  throw redirect(308, '/');
};
