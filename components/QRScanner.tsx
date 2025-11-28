import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from './Button';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onCancel: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onCancel }) => {
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
        try {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                },
                false
            );
        
            scanner.render(
                (decodedText) => {
                    scanner.clear().then(() => {
                         onScanSuccess(decodedText);
                    });
                },
                (errorMessage) => {
                    // Ignored primarily to avoid console spam on every frame fail
                }
            );
            scannerRef.current = scanner;
        } catch (e) {
            console.error("Failed to initialize scanner", e);
            setError("Gagal mengakses kamera. Pastikan izin diberikan.");
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) {
                console.error("Error clearing scanner", e);
            }
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden relative">
        <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-semibold text-lg">Pindai Kode QR</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
            </button>
        </div>
        
        <div className="p-4 bg-gray-900 min-h-[350px] flex items-center justify-center">
            {error ? (
                <div className="text-white text-center p-4">
                    <p>{error}</p>
                    <Button variant="secondary" onClick={onCancel} className="mt-4">Tutup</Button>
                </div>
            ) : (
                <div id="reader" className="w-full h-full overflow-hidden rounded-lg"></div>
            )}
        </div>
        
        <div className="p-4 text-center text-sm text-gray-500">
            Arahkan kamera ke Kode QR Penjual
        </div>
      </div>
    </div>
  );
};