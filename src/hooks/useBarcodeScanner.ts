import { useState, useCallback, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export type ScannerState = 'idle' | 'starting' | 'scanning' | 'stopping' | 'error';

interface UseBarcodeScannnerReturn {
  state: ScannerState;
  error: string | null;
  lastScannedCode: string | null;
  startScanning: (elementId: string, onScan: (code: string) => void) => Promise<void>;
  stopScanning: () => Promise<void>;
  captureAndScan: () => Promise<string | null>;
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

// Detect iOS Safari
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function useBarcodeScanner(): UseBarcodeScannnerReturn {
  const [state, setState] = useState<ScannerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanCallbackRef = useRef<((code: string) => void) | null>(null);
  const stateRef = useRef<ScannerState>('idle');

  // Keep stateRef in sync with state
  stateRef.current = state;

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
      // Use ref to check current state without causing dependency issues
      if (stateRef.current === 'scanning' || stateRef.current === 'starting') {
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

        // Scan success callback
        const onScanSuccess = (decodedText: string) => {
          setLastScannedCode(decodedText);
          if (onScanCallbackRef.current) {
            onScanCallbackRef.current(decodedText);
          }
        };

        // iOS Safari works better with facingMode constraint instead of camera ID
        if (isIOS) {
          // Use facingMode directly for iOS - more reliable
          // No qrbox = scan entire frame for better detection
          await scanner.start(
            { facingMode: 'environment' },
            {
              fps: 15,
              // Scan entire video frame on iOS for better detection
              qrbox: undefined,
            },
            onScanSuccess,
            () => {} // Ignore when no barcode found
          );
        } else {
          // Non-iOS: enumerate cameras and pick back camera
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

          // Start scanning with larger scan area
          await scanner.start(
            cameraId,
            {
              fps: 15,
              qrbox: { width: 300, height: 200 },
              aspectRatio: 1.777778, // 16:9
            },
            onScanSuccess,
            () => {} // Ignore when no barcode found
          );
        }

        setState('scanning');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start scanner';
        console.error('Scanner error:', err);

        // Clean up any partial scanner state
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch {
            // Ignore stop errors during cleanup
          }
          scannerRef.current = null;
        }

        // Provide user-friendly error messages
        let userMessage = message;
        if (message.includes('NotAllowedError') || message.includes('Permission')) {
          userMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
        } else if (message.includes('NotFoundError') || message.includes('No cameras')) {
          userMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (message.includes('NotReadableError')) {
          userMessage = 'Camera is in use by another app. Please close other apps using the camera.';
        } else if (message.includes('OverconstrainedError')) {
          userMessage = 'Could not access the back camera. Please try again.';
        }

        setError(userMessage);
        setState('error');
      }
    },
    [] // No dependencies - uses refs for state checks
  );

  const stopScanning = useCallback(async (): Promise<void> => {
    // Use ref to check current state without causing dependency issues
    if (!scannerRef.current || stateRef.current !== 'scanning') {
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
  }, []); // No dependencies - uses refs for state checks

  // Manual capture - takes a snapshot and tries to decode it
  const captureAndScan = useCallback(async (): Promise<string | null> => {
    if (!scannerRef.current || stateRef.current !== 'scanning') {
      return null;
    }

    try {
      // Get the video element created by html5-qrcode
      const videoElement = document.querySelector('#barcode-scanner-container video') as HTMLVideoElement;
      if (!videoElement) {
        console.error('Video element not found');
        return null;
      }

      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0);

      // Convert to blob and scan
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) return null;

      // Create a file from the blob
      const file = new File([blob], 'capture.png', { type: 'image/png' });

      // Use html5-qrcode to scan the image
      const tempScanner = new Html5Qrcode('barcode-scanner-container-temp', {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });

      // Create a temporary hidden div for the scanner
      const tempDiv = document.createElement('div');
      tempDiv.id = 'barcode-scanner-container-temp';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        const result = await tempScanner.scanFile(file, false);
        setLastScannedCode(result);
        if (onScanCallbackRef.current) {
          onScanCallbackRef.current(result);
        }
        return result;
      } catch {
        // No barcode found in the captured image
        return null;
      } finally {
        document.body.removeChild(tempDiv);
      }
    } catch (err) {
      console.error('Error capturing and scanning:', err);
      return null;
    }
  }, []);

  return {
    state,
    error,
    lastScannedCode,
    startScanning,
    stopScanning,
    captureAndScan,
    isScanning: state === 'scanning',
  };
}
