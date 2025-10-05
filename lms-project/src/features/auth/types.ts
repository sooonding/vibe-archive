import type { UserRole } from '@/types/user';

export type CurrentUser = {
  id: string;
  email: string | null;
  role?: UserRole;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
};

export type CurrentUserSnapshot =
  | { status: "authenticated"; user: CurrentUser }
  | { status: "unauthenticated"; user: null }
  | { status: "loading"; user: CurrentUser | null };

export type CurrentUserContextValue = CurrentUserSnapshot & {
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};
