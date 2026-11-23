import { useQuery } from '@tanstack/react-query';

import { getUser, getUserRepositories } from '../../api/github';
import { queryKeys } from '../../api/queryKeys';

export function useUser(login: string) {
  return useQuery({
    queryKey: queryKeys.user(login),
    queryFn: ({ signal }) => getUser(login, signal),
  });
}

export function useUserRepositories(login: string) {
  return useQuery({
    queryKey: queryKeys.userRepositories(login),
    queryFn: ({ signal }) => getUserRepositories(login, signal),
  });
}
