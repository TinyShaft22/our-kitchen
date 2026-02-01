import { useEffect, useCallback, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { useOpenFoodFacts } from '../../hooks/useOpenFoodFacts';
import { contributeProduct } from '../../services/openFoodFacts';
import { ProductLookupResult } from './ProductLookupResult';
import { ManualProductEntry } from './ManualProductEntry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Supported barcode formats
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
];

type ModalView = 'scanning' | 'result' | 'manual';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelected: (product: {
    name: string;
    brand?: string;
    barcode: string;
    imageUrl?: string;
  }) => void;
  householdCode: string | null;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onProductSelected,
  householdCode,
}: BarcodeScannerModalProps) {
  const [view, setView] = useState<ModalView>('scanning');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const {
    state: scannerState,
    error: scannerError,
    startScanning,
    stopScanning,
    captureAndScan,
  } = useBarcodeScanner();

  const [isCapturing, setIsCapturing] = useState(false);
  const [photoScanError, setPhotoScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle photo taken with native camera (iOS fallback)
  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    setPhotoScanError(null);

    try {
      // Create an image from the file
      const imageBitmap = await createImageBitmap(file);

      // Try native BarcodeDetector first (better support on iOS Safari)
      if ('BarcodeDetector' in window) {
        try {
          // @ts-expect-error - BarcodeDetector is not in TypeScript types yet
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });
          const barcodes = await barcodeDetector.detect(imageBitmap);

          if (barcodes.length > 0) {
            // Found barcode with native API
            await handleScan(barcodes[0].rawValue);
            return;
          }
        } catch (err) {
          console.log('Native BarcodeDetector failed, trying html5-qrcode:', err);
        }
      }

      // Fallback to html5-qrcode library
      const tempDiv = document.createElement('div');
      tempDiv.id = 'photo-scanner-temp';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const scanner = new Html5Qrcode('photo-scanner-temp', {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });

      try {
        const result = await scanner.scanFile(file, true);
        // Found barcode - process it
        await handleScan(result);
      } catch {
        // No barcode found in photo
        setPhotoScanError('No barcode found in photo. Make sure the barcode is clearly visible and in focus.');
      } finally {
        document.body.removeChild(tempDiv);
      }
    } catch (err) {
      console.error('Error scanning photo:', err);
      setPhotoScanError('Failed to scan photo. Please try again.');
    } finally {
      setIsCapturing(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const {
    state: lookupState,
    result: lookupResult,
    error: lookupError,
    lookup,
    cacheProduct,
    clearResult,
  } = useOpenFoodFacts(householdCode);

  // Use ref to store the scan handler so effect doesn't depend on it
  const handleScanRef = useRef<((barcode: string) => Promise<void>) | undefined>(undefined);

  // Handle barcode scan
  const handleScan = useCallback(
    async (barcode: string) => {
      setScannedBarcode(barcode);
      await stopScanning();

      // Look up the barcode
      const result = await lookup(barcode);

      if (result.found) {
        setView('result');
      } else {
        setView('manual');
      }
    },
    [stopScanning, lookup]
  );

  // Keep ref in sync with latest callback
  handleScanRef.current = handleScan;

  // Start scanner when modal opens
  useEffect(() => {
    if (isOpen && view === 'scanning') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanning('barcode-scanner-container', (barcode) => {
          handleScanRef.current?.(barcode);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, view, startScanning]); // Removed handleScan - using ref instead

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setView('scanning');
      setScannedBarcode(null);
      setPhotoScanError(null);
      clearResult();
    }
  }, [isOpen, stopScanning, clearResult]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleUseProduct = () => {
    if (lookupResult && lookupResult.found) {
      onProductSelected({
        name: lookupResult.name || 'Unknown Product',
        brand: lookupResult.brand,
        barcode: lookupResult.barcode,
        imageUrl: lookupResult.imageUrl,
      });
      handleClose();
    }
  };

  const handleManualSubmit = async (data: {
    name: string;
    brand?: string;
    imageUrl?: string;
    barcode: string;
    shareWithOFF: boolean;
  }) => {
    // Use barcode from data (provided synchronously by ManualProductEntry)
    const barcode = data.barcode;
    if (!barcode) return;

    // Cache the manually entered product
    await cacheProduct({
      barcode,
      name: data.name,
      brand: data.brand,
      imageUrl: data.imageUrl,
      source: 'manual',
    });

    // Fire-and-forget contribution to Open Food Facts
    if (data.shareWithOFF) {
      contributeProduct(barcode, data.name, data.brand).catch(() => {});
    }

    onProductSelected({
      name: data.name,
      brand: data.brand,
      barcode,
      imageUrl: data.imageUrl,
    });

    handleClose();
  };

  const handleTryAgain = () => {
    setView('scanning');
    setScannedBarcode(null);
    setPhotoScanError(null);
    clearResult();
    // Restart scanning - use ref wrapper for stable callback
    setTimeout(() => {
      startScanning('barcode-scanner-container', (barcode) => {
        handleScanRef.current?.(barcode);
      });
    }, 100);
  };

  const handleManualEntry = () => {
    setView('manual');
  };

  // Manual capture button handler
  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const result = await captureAndScan();
      if (!result) {
        // No barcode found - show brief feedback
        // The UI will show "No barcode found" temporarily
        setTimeout(() => setIsCapturing(false), 1500);
      }
      // If barcode found, handleScan will be called via the callback
    } catch {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-cream rounded-softer max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex flex-row items-center justify-between z-10 space-y-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal p-0"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">
            {view === 'scanning' && 'Scan Barcode'}
            {view === 'result' && 'Product Found'}
            {view === 'manual' && 'Enter Product'}
          </DialogTitle>
          <div className="w-11" /> {/* Spacer for centering */}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'scanning' && (
            <div className="space-y-4">
              {/* Scanner Container */}
              <div
                id="barcode-scanner-container"
                className="w-full aspect-video bg-charcoal/10 rounded-soft overflow-hidden relative"
              >
                {scannerState === 'starting' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-charcoal/60">Starting camera...</div>
                  </div>
                )}
                {scannerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-3xl mb-2">📷</span>
                    <p className="text-red-600 text-sm">{scannerError}</p>
                    <Button
                      onClick={handleTryAgain}
                      className="mt-4 h-10 px-4 rounded-soft bg-terracotta text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-charcoal/60 text-sm">
                <p>Point your camera at a barcode</p>
                <p className="text-xs mt-1">
                  {isIOS ? 'Tap "Take Photo" to capture and scan' : 'Tap the capture button if auto-detect doesn\'t work'}
                </p>
              </div>

              {/* Hidden file input for native camera capture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              {/* Take Photo Button - Primary method for iOS */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCapturing}
                className="w-full h-14 rounded-soft bg-terracotta text-white text-lg font-semibold"
              >
                {isCapturing ? (
                  'Scanning photo...'
                ) : (
                  <>
                    <span className="text-2xl mr-2">📷</span>
                    Take Photo & Scan
                  </>
                )}
              </Button>

              {/* Capture from video button - Secondary for non-iOS */}
              {!isIOS && scannerState === 'scanning' && (
                <Button
                  variant="outline"
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="w-full h-11 rounded-soft border-charcoal/20 text-charcoal"
                >
                  Capture from Video
                </Button>
              )}

              {/* Photo scan error */}
              {photoScanError && (
                <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-soft">
                  {photoScanError}
                </div>
              )}

              {/* Feedback when capturing */}
              {isCapturing && (
                <div className="text-center text-amber-600 text-sm animate-pulse">
                  Scanning for barcode...
                </div>
              )}

              {/* Lookup Status */}
              {lookupState === 'checking-cache' && (
                <div className="text-center text-charcoal/60 text-sm">
                  Checking local cache...
                </div>
              )}
              {lookupState === 'fetching' && (
                <div className="text-center text-charcoal/60 text-sm">
                  Looking up product...
                </div>
              )}

              {/* Manual Entry Button */}
              <Button
                variant="outline"
                onClick={handleManualEntry}
                className="w-full h-11 rounded-soft border-charcoal/20 text-charcoal"
              >
                Enter barcode manually
              </Button>
            </div>
          )}

          {view === 'result' && lookupResult && (
            <ProductLookupResult
              result={lookupResult}
              onUse={handleUseProduct}
              onTryAgain={handleTryAgain}
              onManualEntry={handleManualEntry}
            />
          )}

          {view === 'manual' && (
            <ManualProductEntry
              barcode={scannedBarcode || ''}
              onSubmit={handleManualSubmit}
              onCancel={handleTryAgain}
              onBarcodeChange={setScannedBarcode}
            />
          )}

          {/* Error Display */}
          {lookupError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm mt-4">
              {lookupError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
