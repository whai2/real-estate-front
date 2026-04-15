import { useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

type PhotoUploadSectionProps = {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
};

export function PhotoUploadSection({ photos, onPhotosChange }: PhotoUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList).slice(0, 30 - photos.length);
    onPhotosChange([...photos, ...newFiles]);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          03
        </span>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          매물 시각 자료
        </h2>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-outline-variant/30 rounded-xl p-12 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container transition-colors cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
          <Icon name="cloud_upload" className="text-secondary text-3xl" />
        </div>
        <h3 className="text-lg font-bold text-primary mb-1">
          파일을 드래그하여 업로드하세요
        </h3>
        <p className="text-sm text-on-surface-variant">
          고해상도 JPG, PNG 또는 MP4 (최대 50MB)
        </p>
        <button
          type="button"
          className="mt-6 px-6 py-2 bg-primary text-white text-sm font-bold rounded-md"
        >
          내 PC에서 찾기
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {photos.map((file, i) => (
            <div
              key={i}
              className="w-20 h-20 rounded-lg bg-surface-container-low overflow-hidden relative"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  onPhotosChange(photos.filter((_, idx) => idx !== i))
                }
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center"
              >
                <Icon name="close" className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
