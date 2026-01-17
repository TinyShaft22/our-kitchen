import { useState, useCallback, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export type ScannerState = 'idle' | 'starting' | 'scanning' | 'stopping' | 'error';

interface UseBarcodeScannnerReturn {
  state: ScannerState;
  error: string | null;
  lastScannedCode: string | null;
  startScanning: (elementId: string, onScan: (code: string) => void) => Promise<void>;
  stopScanning: () => Promise<void>;
  isScanning: boolean;
}

// Supported barcode formats for groceries
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
];

export function useBarcodeScanner(): UseBarcodeScannnerReturn {
  const [state, setState] = useState<ScannerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanCallbackRef = useRef<((code: string) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = useCallback(
    async (elementId: string, onScan: (code: string) => void): Promise<void> => {
      if (state === 'scanning' || state === 'starting') {
        return;
      }

      setState('starting');
      setError(null);
      onScanCallbackRef.current = onScan;

      try {
        // Create new scanner instance
        const scanner = new Html5Qrcode(elementId, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = scanner;

        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          throw new Error('No cameras found on this device');
        }

        // Prefer back camera for barcode scanning
        const backCamera = cameras.find(
          (c) =>
            c.label.toLowerCase().includes('back') ||
            c.label.toLowerCase().includes('rear') ||
            c.label.toLowerCase().includes('environment')
        );
        const cameraId = backCamera?.id || cameras[0].id;

        // Start scanning
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778, // 16:9
          },
          (decodedText) => {
            // Called when a barcode is successfully scanned
            setLastScannedCode(decodedText);
            if (onScanCallbackRef.current) {
              onScanCallbackRef.current(decodedText);
            }
          },
          () => {
            // Called when scanning but no barcode found (ignore)
          }
        );

        setState('scanning');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start scanner';
        console.error('Scanner error:', err);

        // Provide user-friendly error messages
        let userMessage = message;
        if (message.includes('NotAllowedError') || message.includes('Permission')) {
          userMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
        } else if (message.includes('NotFoundError') || message.includes('No cameras')) {
          userMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (message.includes('NotReadableError')) {
          userMessage = 'Camera is in use by another app. Please close other apps using the camera.';
        }

        setError(userMessage);
        setState('error');
      }
    },
    [state]
  );

  const stopScanning = useCallback(async (): Promise<void> => {
    if (!scannerRef.current || state !== 'scanning') {
      setState('idle');
      return;
    }

    setState('stopping');

    try {
      await scannerRef.current.stop();
      scannerRef.current = null;
      setState('idle');
    } catch (err) {
      console.error('Error stopping scanner:', err);
      setState('idle');
    }
  }, [state]);

  return {
    state,
    error,
    lastScannedCode,
    startScanning,
    stopScanning,
    isScanning: state === 'scanning',
  };
}
