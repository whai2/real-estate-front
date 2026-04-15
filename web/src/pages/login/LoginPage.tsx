import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/auth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleRequestCode() {
    setError('');
    try {
      await apiRequest('/auth/send-code', { method: 'POST', body: { phone } });
      setStep('code');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleVerify() {
    setError('');
    try {
      const res = await apiRequest<{ data: { token: string; user: User } }>('/auth/verify', {
        method: 'POST',
        body: { phone, code },
      });
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black font-headline tracking-tighter text-primary mb-2">
            MAID
          </h1>
          <p className="text-on-surface-variant text-sm">
            중개사 전용 매물 공유 플랫폼
          </p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full bg-surface-container-low border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <Button className="w-full" onClick={handleRequestCode}>
                인증번호 요청
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                  인증번호
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6자리 입력"
                  className="w-full bg-surface-container-low border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <Button className="w-full" onClick={handleVerify}>
                로그인
              </Button>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface"
              >
                번호 다시 입력
              </button>
            </div>
          )}

          {error && (
            <p className="text-error text-xs mt-3 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
