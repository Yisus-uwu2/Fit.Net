import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

export default function QrCodeImage({ value, size = 148 }) {
  const [hasError, setHasError] = useState(false);
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=000000&bgcolor=FFFFFF&margin=1`;

  if (hasError) {
    return (
      <div 
        style={{ width: size, height: size }}
        className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl text-slate-800 text-center border border-slate-200 shadow-sm"
      >
        <QrCode className="w-9 h-9 text-slate-800 mb-1" />
        <span className="text-[10px] font-bold text-slate-900">Enlace Móvil</span>
        <span className="text-[8px] font-mono break-all text-blue-600 font-semibold mt-1 line-clamp-2">
          {value}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={qrUrl} 
      alt="Código QR de Enlace Móvil" 
      width={size} 
      height={size} 
      onError={() => setHasError(true)}
      className="rounded-xl shadow-sm border border-slate-100 block mx-auto object-contain bg-white"
      loading="eager"
    />
  );
}
