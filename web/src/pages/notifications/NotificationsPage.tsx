import { useState } from 'react';
import { SendNotification } from './components/SendNotification';
import { NotificationHistory } from './components/NotificationHistory';
import { AutoNotifications } from './components/AutoNotifications';

const tabs = [
  { key: 'send', label: '알림 보내기' },
  { key: 'history', label: '발송 내역' },
  { key: 'auto', label: '자동 알림' },
] as const;

type Tab = (typeof tabs)[number]['key'];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('send');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
          알림 센터
        </h1>
        <p className="text-on-surface-variant">
          매물 알림을 발송하고 자동 알림 규칙을 관리합니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'send' && <SendNotification />}
      {activeTab === 'history' && <NotificationHistory />}
      {activeTab === 'auto' && <AutoNotifications />}
    </>
  );
}
