import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import { Icon } from '../components/Icon';
import { FavoritesScreen } from '../features/favorites/FavoritesScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { RepoDetailScreen } from '../features/repo/RepoDetailScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { useTheme } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'compass' : 'compass-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'star' : 'star-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { dark, colors } = useTheme();

  const navigationTheme = useMemo<Theme>(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [dark, colors]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="RepoDetail"
          component={RepoDetailScreen}
          options={{ headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerBackButtonDisplayMode: 'minimal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
