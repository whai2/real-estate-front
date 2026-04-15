import { useEffect, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/lib/api-client';
import { Icon } from '@/components/ui/Icon';
import { ProfileCard } from './components/ProfileCard';
import { PointsSection } from './components/PointsSection';
import { PurchaseOptions } from './components/PurchaseOptions';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { NotificationOptions } from './components/NotificationOptions';
import { MobileMoreMenu } from './components/MobileMoreMenu';
import type { User } from '@/types/auth';

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const [mobileSheet, setMobileSheet] = useState<'purchase' | 'plans' | null>(null);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest<{ data: User }>('/auth/me');
      setAuth(token, res.data);
    } catch {
      // ignore
    }
  }, [token, setAuth]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <>
      {/* ── Mobile: More menu hub ── */}
      <MobileMoreMenu
        user={user}
        onOpenPurchase={() => setMobileSheet('purchase')}
        onOpenPlans={() => setMobileSheet('plans')}
      />

      {/* Mobile Bottom Sheet for Purchase / Plans */}
      {mobileSheet && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSheet(null)} />
          <div className="relative bg-surface-container-lowest rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-24">
            <div className="sticky top-0 z-20 bg-[#ffffff] rounded-t-3xl px-6 pt-5 pb-3 flex justify-between items-center border-b border-outline-variant/10 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface font-headline">
                {mobileSheet === 'purchase' ? '충전 / 구매' : '이용권 · 요금제'}
              </h2>
              <button onClick={() => setMobileSheet(null)} className="p-1">
                <Icon name="close" className="text-on-surface-variant" />
              </button>
            </div>
            <div className="px-6 py-6">
              {mobileSheet === 'purchase' ? (
                <PurchaseOptions onPurchased={refreshUser} />
              ) : (
                <SubscriptionPlans user={user} onPurchased={refreshUser} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: existing settings layout ── */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2 font-headline">
              내 정보
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              기관 인증 정보를 관리하고, 중개 포인트 잔액 및 서비스 등급을 확인하십시오.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              상태
            </p>
            <p className="text-on-tertiary-container font-bold text-lg">
              {user?.subscription?.plan || '무료'}
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          <ProfileCard user={user} onUpdated={refreshUser} />

          <div className="col-span-12 lg:col-span-8 space-y-8">
            <PointsSection user={user} />
            <PurchaseOptions onPurchased={refreshUser} />
            <SubscriptionPlans user={user} onPurchased={refreshUser} />
            <NotificationOptions user={user} onPurchased={refreshUser} />
          </div>
        </div>
      </div>
    </>
  );
}
