"use client";

import Image from "next/image";
import { useState } from "react";

const zones = [
  {
    src: "/images/at_museum_1.jpg",
    alt: "Фотозона",
    label: "Фотозона",
    caption: "Фотозона — місце для унікальних мемних фото!",
    className: "zone-1",
  },
  {
    src: "/images/at_museum_3.jpg",
    alt: "Інтерактивна зона",
    label: "Інтерактив",
    caption: "Інтерактив — меми оживають у реальному часі!",
    className: "zone-2",
  },
  {
    src: "/images/at_museum_5.jpg",
    alt: "Зал галереї",
    label: "Галерея",
    caption: "Галерея — найкращі меми в експозиції!",
    className: "zone-3",
  },
  {
    src: "/images/at_museum_7.jpg",
    alt: "Експозиційний зал",
    label: "Експозиція",
    caption: "Експозиція — меми, що змінили історію!",
    className: "zone-4",
  },
];

function FullscreenModal({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
}) {
  return (
    <div className="fullscreen-modal active" onClick={onClose}>
      <div
        className="modal-image-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-fullscreen" onClick={onClose}>
          &times;
        </button>
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="modal-fullscreen-image"
          style={{ height: "auto", width: "auto", maxWidth: "100%" }}
        />
        <div className="modal-caption">{caption}</div>
      </div>
    </div>
  );
}

// Секція промо головної сторінки музею мемів
export default function PromoSection() {
  const [modal, setModal] = useState<null | {
    src: string;
    alt: string;
    caption: string;
  }>(null);

  return (
    <section className="section-promo bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex flex-col justify-center items-center relative">
          {/* Декор */}
          <div
            className="absolute top-[-50px] left-1/3 w-96 h-96 rounded-full -translate-x-1/2 translate-y-8"
            style={{
              background:
                "radial-gradient(circle, rgba(251,146,60,0.15) 0%, rgba(251,146,60,0.05) 50%, transparent 80%)",
              zIndex: -1,
            }}
          />
          <div
            className="absolute top-[-50px] right-1/2 w-80 h-80 rounded-full translate-x-1/2 translate-y-12"
            style={{
              background:
                "radial-gradient(circle, rgba(255,159,64,0.12) 0%, rgba(255,159,64,0.04) 55%, transparent 85%)",
              zIndex: -1,
            }}
          />

          <div className="text-sm text-orange-700 font-medium bg-orange-100 rounded-lg px-3 py-1 my-2 border border-orange-200 relative z-10">
            Ми відкриті!
          </div>
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 max-w-4xl relative z-10">
            Проведено більше ніж <span className="text-orange-600">124</span>{" "}
            виставок найкращих мемів, що передають історію світу
          </h2>

          <div className="hero-image relative">
            <Image
              src="/images/dogo_original.png"
              alt="Doge Mascot"
              width={320}
              height={320}
              className="doge-hero"
              style={{ height: "auto", width: "auto", maxWidth: 320 }}
            />
            <div className="floating-memes absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="meme-bubble meme-1">ІНТЕРАКТИВ</div>
              <div className="meme-bubble meme-2">КРЕАТИВ</div>
              <div className="meme-bubble meme-3">МИСТЕЦТВО</div>
            </div>
            <div className="floating-museum-zones absolute w-full flex justify-center gap-4 top-full mt-4">
              {zones.map((zone) => (
                <div
                  key={zone.alt}
                  className={`museum-zone ${zone.className}`}
                  onClick={() => setModal(zone)}
                  tabIndex={0}
                  role="button"
                  aria-label={zone.label}
                >
                  <Image
                    src={zone.src}
                    alt={zone.alt}
                    width={160}
                    height={100}
                    /* intrinsic size matches .museum-zone to avoid aspect warnings */
                  />
                  <div className="zone-label">{zone.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modal && (
        <FullscreenModal
          src={modal.src}
          alt={modal.alt}
          caption={modal.caption}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}
