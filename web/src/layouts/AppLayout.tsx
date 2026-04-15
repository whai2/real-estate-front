import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DesktopSidebar } from './DesktopSidebar';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';
import { Icon } from '@/components/ui/Icon';
import { useCommunityStore } from '@/stores/community.store';

const fullscreenRoutes = ['/map'];

function FAB() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isCommunity = pathname.startsWith('/community');

  // 커뮤니티: 글쓰기 FAB
  if (isCommunity) {
    return (
      <button
        onClick={() => useCommunityStore.getState().setShowWrite(true)}
        className="lg:hidden fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      >
        <Icon name="edit" className="text-2xl" />
      </button>
    );
  }

  // 기본: 매물 등록 FAB (모달)
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu */}
      {open && (
        <div className="lg:hidden fixed bottom-40 right-6 z-50 flex flex-col gap-3 items-end">
          <button
            onClick={() => { setOpen(false); navigate('/property/register'); }}
            className="flex items-center gap-3 bg-surface-container-lowest pl-4 pr-5 py-3 rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="add" className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-on-surface">신규 매물 등록</p>
              <p className="text-[11px] text-on-surface-variant">일반 매물을 등록합니다</p>
            </div>
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/property/open-site-register'); }}
            className="flex items-center gap-3 bg-surface-container-lowest pl-4 pr-5 py-3 rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-on-tertiary-container flex items-center justify-center">
              <Icon name="domain_add" className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-on-surface">오픈현장 등록</p>
              <p className="text-[11px] text-on-surface-variant">현장 매물을 등록합니다</p>
            </div>
          </button>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`lg:hidden fixed bottom-24 right-6 z-50 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all ${
          open ? 'rotate-45' : ''
        }`}
      >
        <Icon name="add" className="text-3xl" />
      </button>
    </>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const isFullscreen = fullscreenRoutes.includes(pathname);

  if (isFullscreen) {
    return (
      <div className="bg-surface text-on-surface h-screen overflow-hidden">
        <DesktopSidebar />
        <div className="lg:ml-64 h-screen flex flex-col">
          {/* Desktop only: TopNavBar (mobile uses MobileMapSearch instead) */}
          <div className="hidden lg:block">
            <TopNavBar />
          </div>
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface">
      <DesktopSidebar />
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-8">
        <TopNavBar />
        {/* Mobile: compact padding / Desktop: generous padding */}
        <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-8">
          <Outlet />
        </div>
      </main>
      <FAB />
      <BottomNavBar />
    </div>
  );
}
