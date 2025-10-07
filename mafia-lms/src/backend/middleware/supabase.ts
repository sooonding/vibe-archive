import { createMiddleware } from 'hono/factory';
import { createServerClient } from '@supabase/ssr';
import { getCookie, setCookie } from 'hono/cookie';
import {
  contextKeys,
  type AppEnv,
} from '@/backend/hono/context';

export const withSupabase = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const config = c.get(
      contextKeys.config,
    ) as AppEnv['Variables']['config'] | undefined;

    if (!config) {
      throw new Error('Application configuration is not available.');
    }

    const client = createServerClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        cookies: {
          getAll() {
            const cookies = getCookie(c);
            return Object.entries(cookies).map(([name, value]) => ({
              name,
              value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              setCookie(c, name, value, {
                ...options,
                sameSite: options.sameSite === true ? 'lax' : options.sameSite === false ? undefined : options.sameSite,
              });
            });
          },
        },
      },
    );

    c.set(contextKeys.supabase, client);

    await next();
  });
