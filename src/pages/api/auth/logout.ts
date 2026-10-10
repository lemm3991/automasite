export const prerender = false;

import type { APIRoute } from 'astro';
import { destroyAdminSession } from '../../../lib/session';

const handleLogout: APIRoute = async ({ cookies, redirect }) => {
  try {
    destroyAdminSession(cookies);
  } catch (err) {
    console.error('[LOGOUT ERROR]', err);
  }

  return redirect('/login');
};

export const POST: APIRoute = handleLogout;
export const GET: APIRoute = handleLogout;