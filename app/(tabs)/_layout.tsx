import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../src/constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    '홈': '🏠',
    '관심매물': '❤️',
    '지도': '📍',
    '커뮤니티': '💬',
    '내정보': '👤',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>
      {icons[name] || '•'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="홈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: '관심매물',
          tabBarIcon: ({ focused }) => <TabIcon name="관심매물" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '지도',
          tabBarIcon: ({ focused }) => <TabIcon name="지도" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => <TabIcon name="커뮤니티" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '내정보',
          tabBarIcon: ({ focused }) => <TabIcon name="내정보" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
