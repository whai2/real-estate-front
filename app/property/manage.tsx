import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/ui/Header';
import FilterTabs from '../../src/components/ui/FilterTabs';
import SearchBar from '../../src/components/ui/SearchBar';
import PropertyCard from '../../src/components/PropertyCard';
import EmptyState from '../../src/components/ui/EmptyState';
import Button from '../../src/components/ui/Button';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onOk?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
  }
};

type Property = {
  _id: string;
  title: string;
  address: string;
  propertyType: string;
  type: string;
  trades: any[];
  rooms: number;
  bathrooms: number;
  area?: number;
  score: number;
  riskLevel: string;
  status: string;
  lastRefreshedAt: string;
  groupId?: { _id: string; name: string };
  memo?: string;
  photos: { url: string }[];
  createdAt: string;
  updatedAt: string;
};

export default function PropertyManageScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [statusCounts, setStatusCounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 그룹 관리 모달
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  // 메모 모달
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');

  // 자동숨김 경고
  const [autoHideWarning, setAutoHideWarning] = useState<{ count: number } | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (activeStatus !== 'all') params.append('status', activeStatus);
      if (keyword) params.append('keyword', keyword);

      const res = await apiRequest(`/properties/my?${params.toString()}`);
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setStatusCounts(res.data.statusCounts || []);
    } catch {}
    setLoading(false);
  }, [page, activeStatus, keyword]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    checkAutoHideWarning();
    loadGroups();
  }, []);

  const checkAutoHideWarning = async () => {
    try {
      const res = await apiRequest('/dashboard/auto-hide-warning');
      if (res.data.count > 0) {
        setAutoHideWarning(res.data);
      }
    } catch {}
  };

  const loadGroups = async () => {
    try {
      const res = await apiRequest('/property-groups');
      setGroups(res.data || []);
    } catch {}
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return total;
    const found = statusCounts.find((c: any) => c._id === status);
    return found?.count || 0;
  };

  const getDaysUntilHide = (lastRefreshedAt: string) => {
    const refreshed = new Date(lastRefreshedAt);
    const hideDate = new Date(refreshed.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.ceil((hideDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // 상태 변경
  const changeStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/properties/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      fetchProperties();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  // 갱신
  const refreshProperty = async (id: string) => {
    try {
      await apiRequest(`/properties/${id}/refresh`, { method: 'PATCH' });
      fetchProperties();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  // 일괄 갱신
  const batchRefresh = async () => {
    try {
      await apiRequest('/properties/batch-refresh', { method: 'POST' });
      showAlert('완료', '모든 매물이 갱신되었습니다.');
      fetchProperties();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  // 메모 저장
  const saveMemo = async () => {
    if (!selectedPropertyId) return;
    try {
      await apiRequest(`/properties/${selectedPropertyId}/memo`, {
        method: 'PATCH',
        body: { memo: memoText },
      });
      setMemoModalVisible(false);
      fetchProperties();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  // 그룹 생성
  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await apiRequest('/property-groups', {
        method: 'POST',
        body: { name: newGroupName.trim() },
      });
      setNewGroupName('');
      loadGroups();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  // 그룹 할당
  const assignGroup = async (propertyId: string, groupId: string | null) => {
    try {
      await apiRequest(`/properties/${propertyId}/group`, {
        method: 'PATCH',
        body: { groupId },
      });
      fetchProperties();
    } catch {}
  };

  const statusTabs = [
    { key: 'all', label: '전체', count: total },
    { key: 'active', label: '오픈', count: getStatusCount('active') },
    { key: 'hidden', label: '숨김', count: getStatusCount('hidden') },
    { key: 'completed', label: '완료', count: getStatusCount('completed') },
    { key: 'deleted', label: '삭제', count: getStatusCount('deleted') },
    { key: 'autoHide', label: '자동숨김', count: getStatusCount('autoHide'), dotColor: COLORS.danger },
  ];

  const renderProperty = ({ item }: { item: Property }) => {
    const daysLeft = getDaysUntilHide(item.lastRefreshedAt);
    const isWarning = daysLeft <= 7;

    return (
      <View style={styles.propertyItem}>
        <PropertyCard
          id={item._id}
          title={item.title}
          address={item.address}
          propertyType={item.propertyType}
          trades={item.trades}
          rooms={item.rooms}
          bathrooms={item.bathrooms}
          area={item.area}
          score={item.score}
          riskLevel={item.riskLevel as any}
          thumbnail={item.photos?.[0]?.url}
          onPress={() => router.push(`/property/${item._id}`)}
          compact
        />

        {/* 갱신 카운트다운 */}
        {item.status === 'active' && (
          <View style={styles.countdownRow}>
            <Text style={[styles.countdown, isWarning && styles.countdownWarning]}>
              D-{daysLeft}
            </Text>
            <Text style={styles.groupLabel}>
              {item.groupId?.name || '미지정'}
            </Text>
          </View>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/property/${item._id}`)}
          >
            <Text style={styles.actionText}>매물 내용</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setSelectedPropertyId(item._id);
              setMemoText(item.memo || '');
              setMemoModalVisible(true);
            }}
          >
            <Text style={styles.actionText}>관리메모</Text>
          </TouchableOpacity>

          {item.status === 'active' && (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={() => refreshProperty(item._id)}>
                <Text style={[styles.actionText, { color: COLORS.primary }]}>갱신</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item._id, 'completed')}>
                <Text style={styles.actionText}>완료</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item._id, 'hidden')}>
                <Text style={styles.actionText}>숨김</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'hidden' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item._id, 'active')}>
              <Text style={[styles.actionText, { color: COLORS.safe }]}>표시</Text>
            </TouchableOpacity>
          )}

          {item.status !== 'deleted' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item._id, 'deleted')}>
              <Text style={[styles.actionText, { color: COLORS.danger }]}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="매물 관리" showBack />

      {/* 자동숨김 경고 */}
      {autoHideWarning && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            관리 중인 매물 {autoHideWarning.count}건이 7일 이내에 자동숨김 처리됩니다.
          </Text>
          <TouchableOpacity onPress={() => setAutoHideWarning(null)}>
            <Ionicons name="close" size={18} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>
      )}

      {/* 필터 탭 */}
      <FilterTabs tabs={statusTabs} activeKey={activeStatus} onTabPress={setActiveStatus} scrollable />

      {/* 검색 + 액션 바 */}
      <View style={styles.toolbar}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="매물, 주소, 내용으로 검색"
            onSearch={(text) => { setKeyword(text); setPage(1); }}
          />
        </View>
        <TouchableOpacity style={styles.refreshAllBtn} onPress={batchRefresh}>
          <Ionicons name="refresh" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.groupBtn} onPress={() => setGroupModalVisible(true)}>
          <Ionicons name="folder-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/property/general-register')}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* 매물 리스트 */}
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="매물이 없습니다"
            description="매물을 등록해보세요"
            actionLabel="매물 등록"
            onAction={() => router.push('/property/general-register')}
          />
        }
        refreshing={loading}
        onRefresh={fetchProperties}
      />

      {/* 메모 모달 */}
      <Modal visible={memoModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>관리메모</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="메모를 입력하세요"
              placeholderTextColor={COLORS.gray400}
              value={memoText}
              onChangeText={setMemoText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Button title="취소" variant="ghost" onPress={() => setMemoModalVisible(false)} />
              <Button title="저장" onPress={saveMemo} />
            </View>
          </View>
        </View>
      </Modal>

      {/* 그룹 관리 모달 */}
      <Modal visible={groupModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>그룹 관리</Text>
            <View style={styles.groupInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="새 그룹명"
                placeholderTextColor={COLORS.gray400}
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <Button title="추가" onPress={createGroup} style={{ height: 44 }} />
            </View>
            {groups.map((g) => (
              <View key={g._id} style={styles.groupItem}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupCount}>{g.propertyCount || 0}건</Text>
              </View>
            ))}
            <Button title="닫기" variant="ghost" onPress={() => setGroupModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  warningText: { flex: 1, fontSize: FONT_SIZE.sm, color: '#92400E' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  refreshAllBtn: {
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: BORDER_RADIUS.sm,
  },
  groupBtn: {
    padding: 10,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: BORDER_RADIUS.sm,
  },
  listContent: { padding: SPACING.lg, gap: SPACING.md },
  propertyItem: { gap: SPACING.sm },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  countdown: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.gray500 },
  countdownWarning: { color: COLORS.danger },
  groupLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray400 },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray100,
  },
  actionText: { fontSize: FONT_SIZE.xs, color: COLORS.gray600, fontWeight: '500' },
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm },
  memoInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONT_SIZE.base,
    minHeight: 100,
    color: COLORS.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  groupInputRow: { flexDirection: 'row', gap: SPACING.sm },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupName: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary },
  groupCount: { fontSize: FONT_SIZE.sm, color: COLORS.gray400 },
});
