import { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";

export default function useImagePreview() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const openImage = useCallback((src) => {
    if (!src) return;
    setImageSrc(src);
    setIsVisible(true);
  }, []);

  const closeImage = useCallback(() => {
    setIsVisible(false);
    setImageSrc(null);
  }, []);

  const ImagePreviewModal = useMemo(() => {
    return function ImagePreviewModalInner() {
      if (!isVisible) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          {/* Close button */}
          <button
            onClick={closeImage}
            className="absolute top-6 right-6 text-white hover:opacity-80 cursor-pointer"
          >
            <X size={28} />
          </button>

          {/* Image */}
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Preview"
              className="max-w-[90%] max-h-[90%] object-contain"
            />
          )}
        </div>
      );
    };
  }, [isVisible, imageSrc, closeImage]);

  return {
    openImage,
    closeImage,
    ImagePreviewModal,
  };
}
