import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/ui/Header';
import SearchBar from '../src/components/ui/SearchBar';
import Button from '../src/components/ui/Button';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { apiRequest } from '../src/services/api';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

type OpenSite = {
  _id: string;
  title: string;
  address: string;
  scheduledDate: string;
  surveyStatus: string;
  propertyType: string;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function OpenScheduleScreen() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [sites, setSites] = useState<OpenSite[]>([]);
  const [keyword, setKeyword] = useState('');

  // 상세 모달
  const [selectedSite, setSelectedSite] = useState<OpenSite | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year: String(year), month: String(month) });
      if (keyword) params.append('keyword', keyword);
      const res = await apiRequest(`/open-sites?${params.toString()}`);
      setSites(res.data || []);
    } catch {}
  }, [year, month, keyword]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const getSitesForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sites.filter((s) => s.scheduledDate.startsWith(dateStr));
  };

  const changeSurveyStatus = async (siteId: string, status: string) => {
    try {
      await apiRequest(`/open-sites/${siteId}/survey`, {
        method: 'PATCH',
        body: { surveyStatus: status },
      });
      fetchSites();
      setSelectedSite(null);
    } catch {}
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();

  // 캘린더 그리드 구성
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const SURVEY_COLORS: Record<string, string> = {
    none: COLORS.gray400,
    planned: COLORS.warning,
    completed: COLORS.safe,
  };

  const SURVEY_LABELS: Record<string, string> = {
    none: '미답사',
    planned: '답사예정',
    completed: '답사완료',
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="오픈현장" showBack />

      {/* 월 네비게이션 */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons name="chevron-back" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{year}년 {month}월</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
      </View>

      {/* 검색 */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm }}>
        <SearchBar placeholder="현장명, 지역명 검색" onSearch={setKeyword} />
      </View>

      <ScrollView style={styles.scroll}>
        {/* 요일 헤더 */}
        <View style={styles.weekHeader}>
          {DAYS.map((d, i) => (
            <View key={d} style={styles.weekCell}>
              <Text style={[styles.weekText, i === 0 && styles.sunday, i === 6 && styles.saturday]}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        <View style={styles.calendarGrid}>
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={styles.dateCell} />;
            }

            const daySites = getSitesForDate(day);
            const dayOfWeek = idx % 7;

            return (
              <View key={day} style={[styles.dateCell, isToday(day) && styles.todayCell]}>
                <View style={styles.dateCellHeader}>
                  <Text style={[
                    styles.dateText,
                    dayOfWeek === 0 && styles.sunday,
                    dayOfWeek === 6 && styles.saturday,
                    isToday(day) && styles.todayText,
                  ]}>
                    {day}
                  </Text>
                  {daySites.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{daySites.length}건</Text>
                    </View>
                  )}
                </View>

                {daySites.slice(0, 2).map((site) => (
                  <TouchableOpacity
                    key={site._id}
                    style={styles.siteTag}
                    onPress={() => setSelectedSite(site)}
                  >
                    <View style={[styles.siteDot, { backgroundColor: SURVEY_COLORS[site.surveyStatus] }]} />
                    <Text style={styles.siteTitle} numberOfLines={1}>{site.title}</Text>
                  </TouchableOpacity>
                ))}
                {daySites.length > 2 && (
                  <Text style={styles.moreText}>+{daySites.length - 2}건</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/property/open-site-register')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* 현장 상세 모달 */}
      <Modal visible={!!selectedSite} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSite && (
              <>
                <Text style={styles.modalTitle}>{selectedSite.title}</Text>
                <Text style={styles.modalAddress}>{selectedSite.address}</Text>
                <View style={styles.surveyRow}>
                  <Text style={styles.surveyLabel}>답사 상태:</Text>
                  <Text style={[styles.surveyStatus, { color: SURVEY_COLORS[selectedSite.surveyStatus] }]}>
                    {SURVEY_LABELS[selectedSite.surveyStatus]}
                  </Text>
                </View>
                <View style={styles.surveyButtons}>
                  {(['none', 'planned', 'completed'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.surveyBtn,
                        selectedSite.surveyStatus === status && { backgroundColor: SURVEY_COLORS[status] + '20', borderColor: SURVEY_COLORS[status] },
                      ]}
                      onPress={() => changeSurveyStatus(selectedSite._id, status)}
                    >
                      <Text style={[
                        styles.surveyBtnText,
                        selectedSite.surveyStatus === status && { color: SURVEY_COLORS[status] },
                      ]}>
                        {SURVEY_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title="닫기" variant="ghost" onPress={() => setSelectedSite(null)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  monthTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { flex: 1 },
  weekHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  weekText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray600 },
  sunday: { color: COLORS.danger },
  saturday: { color: COLORS.primary },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: {
    width: `${100 / 7}%`,
    minHeight: 90,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: COLORS.border,
    padding: 4,
  },
  todayCell: { backgroundColor: COLORS.primaryBg },
  dateCellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.textPrimary },
  todayText: { color: COLORS.primary, fontWeight: '700' },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countText: { fontSize: 9, color: COLORS.white, fontWeight: '600' },
  siteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  siteDot: { width: 6, height: 6, borderRadius: 3 },
  siteTitle: { fontSize: 10, color: COLORS.gray700, flex: 1 },
  moreText: { fontSize: 9, color: COLORS.primary, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  modalAddress: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  surveyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  surveyLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray600 },
  surveyStatus: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  surveyButtons: { flexDirection: 'row', gap: SPACING.sm },
  surveyBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  surveyBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.gray600 },
});
