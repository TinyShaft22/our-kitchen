import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ManualProductEntryProps {
  barcode: string;
  onSubmit: (data: {
    name: string;
    brand?: string;
    imageUrl?: string;
    barcode: string;
  }) => void;
  onCancel: () => void;
  onBarcodeChange?: (barcode: string) => void;
}

export function ManualProductEntry({
  barcode,
  onSubmit,
  onCancel,
  onBarcodeChange,
}: ManualProductEntryProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [editableBarcode, setEditableBarcode] = useState(barcode);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!editableBarcode.trim()) {
      setError('Barcode is required');
      return;
    }

    const trimmedBarcode = editableBarcode.trim();

    // Update barcode if changed
    if (onBarcodeChange && trimmedBarcode !== barcode) {
      onBarcodeChange(trimmedBarcode);
    }

    // Include barcode in submit data to ensure it's available synchronously
    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      barcode: trimmedBarcode,
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <span className="text-4xl">📝</span>
        <h3 className="text-lg font-semibold text-charcoal mt-2">Enter Product Details</h3>
        <p className="text-sm text-charcoal/60 mt-1">
          Add the product information manually
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
          {error}
        </div>
      )}

      {/* Barcode (editable if not scanned) */}
      <div className="space-y-1">
        <Label htmlFor="manual-barcode">Barcode</Label>
        <Input
          id="manual-barcode"
          type="text"
          value={editableBarcode}
          onChange={(e) => setEditableBarcode(e.target.value)}
          placeholder="Enter barcode number"
          className="font-mono"
        />
      </div>

      {/* Product Name */}
      <div className="space-y-1">
        <Label htmlFor="manual-name">Product Name *</Label>
        <Input
          id="manual-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Organic Trail Mix"
          autoFocus
        />
      </div>

      {/* Brand */}
      <div className="space-y-1">
        <Label htmlFor="manual-brand">
          Brand
          <span className="font-normal text-xs text-charcoal/50 ml-1">(optional)</span>
        </Label>
        <Input
          id="manual-brand"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g., Kirkland"
        />
      </div>

      {/* Info about contributing */}
      <div className="bg-sage/10 rounded-soft p-3 text-sm text-charcoal/70">
        <p className="font-medium text-sage mb-1">Help Others!</p>
        <p className="text-xs">
          Products you add are saved locally. In the future, you'll be able to contribute
          to Open Food Facts to help others find this product.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          className="w-full h-11 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90"
        >
          Add Product
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full h-11 rounded-soft border-charcoal/20 text-charcoal"
        >
          Scan Instead
        </Button>
      </div>
    </div>
  );
}
