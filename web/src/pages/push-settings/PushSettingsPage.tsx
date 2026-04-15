import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type PushSettings = {
  newProperty: boolean;
  priceChange: boolean;
  community: boolean;
  marketing: boolean;
};

const labels: Record<keyof PushSettings, { title: string; desc: string }> = {
  newProperty: { title: '신규 매물 알림', desc: '관심 지역에 새 매물이 등록되면 알려드립니다.' },
  priceChange: { title: '가격 변동 알림', desc: '관심 매물의 가격이 변경되면 알려드립니다.' },
  community: { title: '커뮤니티 알림', desc: '내 게시글에 댓글이 달리면 알려드립니다.' },
  marketing: { title: '마케팅 알림', desc: '이벤트 및 프로모션 정보를 받습니다.' },
};

export default function PushSettingsPage() {
  const [settings, setSettings] = useState<PushSettings>({
    newProperty: true,
    priceChange: true,
    community: true,
    marketing: false,
  });
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiRequest<{ data: { pushSettings?: PushSettings } }>('/settings')
      .then((res) => {
        if (res.data.pushSettings) setSettings(res.data.pushSettings);
      })
      .catch(() => {});
  }, []);

  async function handleToggle(key: keyof PushSettings) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: { pushSettings: updated },
      });
    } catch {
      setSettings(settings); // revert
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
          푸시 설정
        </h1>
        <p className="text-on-surface-variant">알림 수신 설정을 관리합니다.</p>
      </div>

      <div className="max-w-2xl space-y-2">
        {(Object.keys(labels) as (keyof PushSettings)[]).map((key) => (
          <div
            key={key}
            className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                <Icon
                  name={key === 'newProperty' ? 'home' : key === 'priceChange' ? 'trending_up' : key === 'community' ? 'forum' : 'campaign'}
                  className="text-primary"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{labels[key].title}</p>
                <p className="text-xs text-on-surface-variant">{labels[key].desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                settings[key] ? 'bg-secondary' : 'bg-outline-variant/30'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all ${
                  settings[key] ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
