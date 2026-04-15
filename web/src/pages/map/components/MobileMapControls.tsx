import { Icon } from '@/components/ui/Icon';

type Props = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onMyLocation?: () => void;
};

export function MobileMapControls({ onZoomIn, onZoomOut, onMyLocation }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface active:scale-95 transition-transform"
      >
        <Icon name="add" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface active:scale-95 transition-transform"
      >
        <Icon name="remove" />
      </button>
      <button
        onClick={onMyLocation}
        className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-secondary mt-2 active:scale-95 transition-transform"
      >
        <Icon name="my_location" filled />
      </button>
    </div>
  );
}
