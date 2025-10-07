import { failure, respond } from '@/backend/http/response';
import { getSupabase, type AppContext } from '@/backend/hono/context';

export const operatorGuard = () => {
  return async (c: AppContext, next: () => Promise<void>) => {
    const supabase = getSupabase(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(c, failure(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return respond(
        c,
        failure(500, 'FETCH_ERROR', 'Failed to fetch user data')
      );
    }

    if (userData.role !== 'operator') {
      return respond(
        c,
        failure(403, 'FORBIDDEN', 'Operator role required')
      );
    }

    await next();
  };
};
