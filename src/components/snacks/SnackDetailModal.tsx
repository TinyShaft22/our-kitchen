import { useState, useRef, useEffect } from 'react';
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

interface SnackDetailModalProps {
  snack: Snack | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<Snack, 'id' | 'householdCode'>>) => Promise<void>;
  onDelete: (snack: Snack) => void;
  householdCode: string;
}

export function SnackDetailModal({
  snack,
  isOpen,
  onClose,
  onSave,
  onDelete,
  householdCode,
}: SnackDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<Category>('snacks');
  const [defaultStore, setDefaultStore] = useState<Store>('safeway');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when snack changes
  useEffect(() => {
    if (snack) {
      setName(snack.name);
      setBrand(snack.brand || '');
      setBarcode(snack.barcode || '');
      setCategory(snack.category);
      setDefaultStore(snack.defaultStore);
      setImagePreview(snack.imageUrl || null);
      setImageFile(null);
      setIsEditing(false);
      setError(null);
    }
  }, [snack]);

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
      if (imagePreview && imagePreview !== snack?.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview !== snack?.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (imagePreview && imagePreview !== snack?.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setIsEditing(false);
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!snack) return;

    if (!name.trim()) {
      setError('Snack name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUrl: string | undefined = imagePreview || undefined;

      if (imageFile) {
        const filename = `${Date.now()}.jpg`;
        const storagePath = `snacks/${householdCode}/${snack.id}/${filename}`;

        const compressedBlob = await compressImage(imageFile);
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const updates: Partial<Omit<Snack, 'id' | 'householdCode'>> = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        barcode: barcode.trim() || undefined,
        category,
        defaultStore,
        imageUrl,
      };

      await onSave(snack.id, updates);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save snack');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (snack) {
      onDelete(snack);
      handleClose();
    }
  };

  if (!snack) return null;

  const storeName = STORES.find((s) => s.id === snack.defaultStore)?.name || snack.defaultStore;
  const categoryName = CATEGORIES.find((c) => c.id === snack.category)?.name || snack.category;

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
            {isEditing ? 'Edit Snack' : snack.name}
          </DialogTitle>
          {isEditing ? (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-11 h-11 rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 p-0"
              aria-label="Save changes"
            >
              {saving ? (
                <span className="text-sm">...</span>
              ) : (
                <span className="text-lg font-bold">&#10003;</span>
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal p-0"
              aria-label="Edit snack"
            >
              <span className="text-lg">✏️</span>
            </Button>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            /* Edit Mode */
            <>
              {/* Snack Name */}
              <div className="space-y-1">
                <Label htmlFor="edit-snack-name">Snack Name *</Label>
                <Input
                  id="edit-snack-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Brand */}
              <div className="space-y-1">
                <Label htmlFor="edit-snack-brand">Brand</Label>
                <Input
                  id="edit-snack-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              {/* Barcode */}
              <div className="space-y-1">
                <Label htmlFor="edit-snack-barcode">Barcode</Label>
                <Input
                  id="edit-snack-barcode"
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label htmlFor="edit-snack-category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger id="edit-snack-category">
                    <SelectValue />
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
                <Label htmlFor="edit-snack-store">Default Store</Label>
                <Select value={defaultStore} onValueChange={(v) => setDefaultStore(v as Store)}>
                  <SelectTrigger id="edit-snack-store">
                    <SelectValue />
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
                <Label>Photo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="edit-snack-photo"
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

              {/* Delete Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="w-full h-11 rounded-soft border-red-300 text-red-600 hover:bg-red-50 mt-4"
              >
                🗑️ Delete Snack
              </Button>
            </>
          ) : (
            /* View Mode */
            <>
              {/* Image */}
              {snack.imageUrl ? (
                <img
                  src={snack.imageUrl}
                  alt={snack.name}
                  className="w-full max-h-48 rounded-soft object-cover"
                />
              ) : (
                <div className="w-full h-32 rounded-soft bg-sage/20 flex items-center justify-center">
                  <span className="text-5xl opacity-40">🍿</span>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                {snack.brand && (
                  <div className="flex justify-between items-center py-2 border-b border-charcoal/10">
                    <span className="text-charcoal/60">Brand</span>
                    <span className="font-medium text-charcoal">{snack.brand}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-charcoal/10">
                  <span className="text-charcoal/60">Category</span>
                  <span className="font-medium text-charcoal">{categoryName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-charcoal/10">
                  <span className="text-charcoal/60">Store</span>
                  <span className="font-medium text-charcoal">{storeName}</span>
                </div>
                {snack.barcode && (
                  <div className="flex justify-between items-center py-2 border-b border-charcoal/10">
                    <span className="text-charcoal/60">Barcode</span>
                    <span className="font-mono text-sm text-charcoal/70">{snack.barcode}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-11 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="h-11 px-4 rounded-soft border-red-300 text-red-600 hover:bg-red-50"
                >
                  🗑️
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
