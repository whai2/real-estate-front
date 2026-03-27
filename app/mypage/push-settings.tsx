import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

type Settings = {
  property: boolean;
  transaction: boolean;
  community: boolean;
  system: boolean;
};

const LABELS: Record<keyof Settings, string> = {
  property: '매물 관련 알림',
  transaction: '거래 변동 알림',
  community: '커뮤니티 알림',
  system: '시스템 공지',
};

export default function PushSettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    property: true,
    transaction: true,
    community: true,
    system: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/settings/push');
        setSettings(res.data);
      } catch {}
    })();
  }, []);

  const toggle = async (key: keyof Settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await apiRequest('/settings/push', { method: 'PUT', body: updated });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="푸시 설정" showBack />
      <View style={styles.content}>
        {(Object.keys(LABELS) as (keyof Settings)[]).map((key) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{LABELS[key]}</Text>
            <Switch value={settings[key]} onValueChange={() => toggle(key)} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.xl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary },
});
