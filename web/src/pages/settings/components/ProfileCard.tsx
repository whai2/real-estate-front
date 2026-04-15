import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import type { User, UserType } from '@/types/auth';

const userTypeOptions: { key: UserType; label: string }[] = [
  { key: 'broker', label: '공인중개사' },
  { key: 'assistant', label: '중개보조원' },
  { key: 'fieldManager', label: '현장 담당자' },
  { key: 'consultant', label: '분양 컨설턴트' },
  { key: 'owner', label: '건축주(시행·소유)' },
];

type ProfileCardProps = {
  user: User | null;
  onUpdated: () => void;
};

function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [agencyName, setAgencyName] = useState(user.agencyName);
  const [licenseNo, setLicenseNo] = useState(user.licenseNo ?? '');
  const [userType, setUserType] = useState<UserType | ''>(user.userType ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: { name, agencyName, licenseNo: licenseNo || undefined, userType: userType || undefined },
      });
      onSaved();
      onClose();
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary font-headline">
            프로필 수정
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container-low rounded-lg"
          >
            <Icon name="close" className="text-on-surface-variant" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              이름
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              소속
            </label>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              면허 번호
            </label>
            <input
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              placeholder="선택사항"
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              사용자 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {userTypeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setUserType(opt.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    userType === opt.key
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-40"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getUserTypeLabel(type?: UserType): string {
  return userTypeOptions.find((o) => o.key === type)?.label ?? '미설정';
}

export function ProfileCard({ user, onUpdated }: ProfileCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await apiRequest('/auth/account', { method: 'DELETE' });
      logout();
      navigate('/login');
    } catch {
      // error
    } finally {
      setDeleting(false);
    }
  }

  const daysLeft = user.subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(user.subscription.expiresAt).getTime() - Date.now()) / 86400000))
    : 0;
  const totalDays = 365;
  const progress = Math.min((daysLeft / totalDays) * 100, 100);

  return (
    <div className="col-span-12 lg:col-span-4 space-y-8">
      {/* User Profile */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_40px_rgba(7,27,59,0.06)]">
        <div className="flex justify-between items-start mb-6">
          <div className="h-20 w-20 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <Icon name="person" className="text-3xl text-on-surface-variant" />
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <Icon name="edit" className="text-outline" />
          </button>
        </div>
        <h3 className="text-xl font-bold text-primary mb-1">{user.name}</h3>
        <p className="text-on-surface-variant text-sm mb-1">{user.agencyName}</p>
        <span className="inline-block bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
          {getUserTypeLabel(user.userType)}
        </span>
        <div className="space-y-4 pt-6 border-t border-outline-variant/10">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
              연락처
            </label>
            <p className="text-sm font-semibold text-primary">{user.phone}</p>
          </div>
          {user.licenseNo && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                면허 번호
              </label>
              <p className="text-sm font-semibold text-primary">{user.licenseNo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="bg-primary-container text-white rounded-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-white/10 rounded-lg">
            <Icon name="auto_awesome" className="text-white" filled />
          </div>
          <span className="font-bold tracking-tight">구독 분석</span>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-200">남은 기간</span>
              <span className="font-bold">{daysLeft}일</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="pt-4">
            <p className="text-xs text-blue-200 leading-snug">
              갱신일:
              <br />
              <span className="text-white font-semibold">
                {user.subscription?.expiresAt
                  ? new Date(user.subscription.expiresAt).toLocaleDateString('ko-KR')
                  : '미설정'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-error/10">
        <h4 className="text-sm font-bold text-error mb-2">회원 탈퇴</h4>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/20 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                <Icon name="warning" className="text-error text-xl" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">정말 탈퇴하시겠습니까?</h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              탈퇴 후에는 모든 매물, 포인트, 구독 정보가 삭제되며 복구가 불가능합니다.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-5 py-2.5 bg-error text-white text-sm font-bold rounded-lg disabled:opacity-50"
              >
                {deleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={onUpdated}
        />
      )}
    </div>
  );
}
