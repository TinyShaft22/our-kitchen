import { useEffect, useCallback, useState } from 'react';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { useOpenFoodFacts } from '../../hooks/useOpenFoodFacts';
import { ProductLookupResult } from './ProductLookupResult';
import { ManualProductEntry } from './ManualProductEntry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  } = useBarcodeScanner();

  const {
    state: lookupState,
    result: lookupResult,
    error: lookupError,
    lookup,
    cacheProduct,
    clearResult,
  } = useOpenFoodFacts(householdCode);

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

  // Start scanner when modal opens
  useEffect(() => {
    if (isOpen && view === 'scanning') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanning('barcode-scanner-container', handleScan);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, view, startScanning, handleScan]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setView('scanning');
      setScannedBarcode(null);
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
    clearResult();
    // Restart scanning
    setTimeout(() => {
      startScanning('barcode-scanner-container', handleScan);
    }, 100);
  };

  const handleManualEntry = () => {
    setView('manual');
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
                <p className="text-xs mt-1">The scanner will automatically detect it</p>
              </div>

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
