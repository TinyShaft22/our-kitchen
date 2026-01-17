import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Snack, Store, Category } from '../../types';
import { STORES, CATEGORIES } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snack: Omit<Snack, 'id' | 'householdCode'>) => Promise<string>;
  householdCode: string;
  onScanBarcode?: () => void;
  // Pre-filled data from barcode scan
  prefillData?: {
    name?: string;
    brand?: string;
    barcode?: string;
    imageUrl?: string;
  };
}

export function AddSnackModal({
  isOpen,
  onClose,
  onSave,
  householdCode,
  onScanBarcode,
  prefillData,
}: AddSnackModalProps) {
  const [name, setName] = useState(prefillData?.name || '');
  const [brand, setBrand] = useState(prefillData?.brand || '');
  const [barcode, setBarcode] = useState(prefillData?.barcode || '');
  const [category, setCategory] = useState<Category>('snacks');
  const [defaultStore, setDefaultStore] = useState<Store>('safeway');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(prefillData?.imageUrl || null);
  const [useExternalImage, setUseExternalImage] = useState(!!prefillData?.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when prefillData changes
  useState(() => {
    if (prefillData) {
      setName(prefillData.name || '');
      setBrand(prefillData.brand || '');
      setBarcode(prefillData.barcode || '');
      if (prefillData.imageUrl) {
        setImagePreview(prefillData.imageUrl);
        setUseExternalImage(true);
      }
    }
  });

  // Compress image before upload
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to compress')),
          'image/jpeg',
          0.8
        );
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUseExternalImage(false);
      if (imagePreview && !useExternalImage) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && !useExternalImage) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setUseExternalImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setBarcode('');
    setCategory('snacks');
    setDefaultStore('safeway');
    setError(null);
    if (imagePreview && !useExternalImage) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setUseExternalImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Snack name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUrl: string | undefined;

      // If we have an external image URL from barcode scan, use it
      if (useExternalImage && imagePreview) {
        imageUrl = imagePreview;
      } else if (imageFile) {
        // Upload new image
        const snackId = `snack_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const filename = `${Date.now()}.jpg`;
        const storagePath = `snacks/${householdCode}/${snackId}/${filename}`;

        const compressedBlob = await compressImage(imageFile);
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const snackData: Omit<Snack, 'id' | 'householdCode'> = {
        name: name.trim(),
        category,
        defaultStore,
      };

      if (brand.trim()) {
        snackData.brand = brand.trim();
      }
      if (barcode.trim()) {
        snackData.barcode = barcode.trim();
      }
      if (imageUrl) {
        snackData.imageUrl = imageUrl;
      }

      await onSave(snackData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save snack');
    } finally {
      setSaving(false);
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
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">Add Snack</DialogTitle>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 p-0"
            aria-label="Save snack"
          >
            {saving ? (
              <span className="text-sm">...</span>
            ) : (
              <span className="text-lg font-bold">&#10003;</span>
            )}
          </Button>
        </DialogHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Scan Barcode Button */}
          {onScanBarcode && (
            <Button
              type="button"
              onClick={onScanBarcode}
              className="w-full h-12 rounded-soft bg-sage text-white font-medium hover:bg-sage/90 flex items-center justify-center gap-2"
            >
              <span className="text-xl">📷</span>
              <span>Scan Barcode</span>
            </Button>
          )}

          {/* Snack Name */}
          <div className="space-y-1">
            <Label htmlFor="snack-name">Snack Name *</Label>
            <Input
              id="snack-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Trail Mix"
            />
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <Label htmlFor="snack-brand">
              Brand
              <span className="font-normal text-xs text-charcoal/50 ml-1">(optional)</span>
            </Label>
            <Input
              id="snack-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Kirkland"
            />
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <Label htmlFor="snack-barcode">
              Barcode
              <span className="font-normal text-xs text-charcoal/50 ml-1">(optional)</span>
            </Label>
            <Input
              id="snack-barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g., 012345678901"
              className="font-mono"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label htmlFor="snack-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="snack-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Store */}
          <div className="space-y-1">
            <Label htmlFor="snack-store">Default Store</Label>
            <Select value={defaultStore} onValueChange={(v) => setDefaultStore(v as Store)}>
              <SelectTrigger id="snack-store">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {STORES.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo */}
          <div className="space-y-1">
            <Label>Photo (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="snack-photo"
            />
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="Snack preview"
                  className="max-h-32 rounded-soft object-cover"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3 rounded-soft border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5"
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImage}
                    className="h-9 px-3 rounded-soft border-red-300 text-red-600 text-sm hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-4 rounded-soft border-dashed border-charcoal/30 text-charcoal/60 text-sm hover:border-terracotta hover:text-terracotta"
              >
                + Add Photo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
