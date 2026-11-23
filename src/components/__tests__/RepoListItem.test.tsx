import { fireEvent, render, screen } from '@testing-library/react-native';

import { toRepoSummary } from '../../api/types';
import { makeRepo } from '../../../test/utils';
import { RepoListItem } from '../RepoListItem';

const repo = toRepoSummary(
  makeRepo({
    id: 10,
    name: 'awesome-app',
    description: 'Does awesome things',
    stargazers_count: 12_345,
  }),
);

describe('RepoListItem', () => {
  it('renders the repository summary', async () => {
    await render(<RepoListItem repo={repo} onPress={jest.fn()} />);

    expect(screen.getByText('octocat/awesome-app')).toBeOnTheScreen();
    expect(screen.getByText('Does awesome things')).toBeOnTheScreen();
    expect(screen.getByText('12.3k')).toBeOnTheScreen();
    expect(screen.getByText('TypeScript')).toBeOnTheScreen();
  });

  it('calls onPress with the repository', async () => {
    const onPress = jest.fn();
    await render(<RepoListItem repo={repo} onPress={onPress} />);

    await fireEvent.press(screen.getByTestId('repo-item-10'));

    expect(onPress).toHaveBeenCalledWith(repo);
  });

  it('toggles favorite without opening the repository', async () => {
    const onPress = jest.fn();
    const onToggleFavorite = jest.fn();
    await render(
      <RepoListItem repo={repo} onPress={onPress} onToggleFavorite={onToggleFavorite} />,
    );

    await fireEvent.press(screen.getByLabelText('Add to favorites'));

    expect(onToggleFavorite).toHaveBeenCalledWith(repo);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('reflects favorite state', async () => {
    await render(
      <RepoListItem repo={repo} onPress={jest.fn()} isFavorite onToggleFavorite={jest.fn()} />,
    );

    expect(screen.getByLabelText('Remove from favorites')).toBeOnTheScreen();
  });

  it('hides the favorite button when no handler is given', async () => {
    await render(<RepoListItem repo={repo} onPress={jest.fn()} />);

    expect(screen.queryByLabelText('Add to favorites')).toBeNull();
  });
});
