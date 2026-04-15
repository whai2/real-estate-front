import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
        onclose: () => void;
        width: string;
        height: string;
      }) => { embed: (el: HTMLElement) => void };
    };
  }
}

export type DaumPostcodeResult = {
  zonecode: string;
  address: string;
  addressEnglish: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  apartment: string;
  sido: string;
  sigungu: string;
  bname: string;
  addressType: string;
};

type AddressSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (result: DaumPostcodeResult) => void;
};

export function AddressSearchModal({ open, onClose, onSelect }: AddressSearchModalProps) {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !embedRef.current || !window.daum) return;

    embedRef.current.innerHTML = '';

    new window.daum.Postcode({
      oncomplete: (data) => {
        onSelect(data);
        onClose();
      },
      onclose: () => onClose(),
      width: '100%',
      height: '100%',
    }).embed(embedRef.current);
  }, [open, onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <h3 className="font-bold text-on-surface">주소 검색</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            ✕
          </button>
        </div>
        <div ref={embedRef} className="w-full" style={{ height: 470 }} />
      </div>
    </div>
  );
}
