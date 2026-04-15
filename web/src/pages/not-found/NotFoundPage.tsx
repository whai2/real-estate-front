import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <Icon name="explore_off" className="text-6xl text-on-surface-variant/40 mb-4" />
      <h2 className="text-2xl font-black font-headline text-primary mb-2">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-on-surface-variant text-sm mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        to="/"
        className="bg-gradient-to-br from-[#031636] to-[#1A2B4C] text-white font-bold text-sm px-6 py-2.5 rounded-md hover:brightness-110 transition-all"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
