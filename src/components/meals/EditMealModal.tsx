import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Meal, Ingredient } from '../../types';
import { IngredientInput } from './IngredientInput';
import { MarkdownEditor } from './MarkdownEditor';
import { NestedFolderPicker } from './NestedFolderPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  onSave: (updates: Omit<Meal, 'id' | 'householdCode'>) => Promise<void>;
  householdCode: string;
  existingSubcategories?: string[];
  existingBakingPaths?: string[];
}

// Default ingredient values for new ingredients
const createDefaultIngredient = (): Ingredient => ({
  name: '',
  category: 'produce',
  defaultStore: 'safeway',
});

export function EditMealModal({ isOpen, onClose, meal, onSave, householdCode, existingSubcategories = [], existingBakingPaths = [] }: EditMealModalProps) {
  const [name, setName] = useState(meal.name);
  const [servings, setServings] = useState(meal.servings);
  const [isBaking, setIsBaking] = useState(meal.isBaking);
  const [subcategory, setSubcategory] = useState(meal.subcategory || '');
  const [instructions, setInstructions] = useState(meal.instructions || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(meal.ingredients);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(meal.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [urlPreviewLoading, setUrlPreviewLoading] = useState(false);
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image before upload (max 800px width, JPEG quality 0.8)
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
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
      // Revoke previous preview URL if it's a blob URL (not a Firebase URL)
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // URL validation - checks if URL has valid format
  const validateImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlInputChange = (url: string) => {
    setImageUrlInput(url);
    setUrlPreviewError(null);
  };

  const handleUrlInputBlur = () => {
    if (!imageUrlInput.trim()) {
      setUrlPreviewError(null);
      setImagePreview(null);
      return;
    }

    if (!validateImageUrl(imageUrlInput)) {
      setUrlPreviewError('Please enter a valid URL (starting with http:// or https://)');
      setImagePreview(null);
      return;
    }

    // Try to load the image
    setUrlPreviewLoading(true);
    setUrlPreviewError(null);
    const img = new Image();
    img.onload = () => {
      setImagePreview(imageUrlInput);
      setUrlPreviewLoading(false);
      setRemoveImage(false);
    };
    img.onerror = () => {
      setUrlPreviewError('Unable to load image from URL');
      setImagePreview(null);
      setUrlPreviewLoading(false);
    };
    img.src = imageUrlInput;
  };

  const handleClearUrl = () => {
    setImageUrlInput('');
    setImagePreview(null);
    setUrlPreviewError(null);
    setUrlPreviewLoading(false);
    setRemoveImage(true);
  };

  const handleImageModeChange = (mode: 'file' | 'url') => {
    setImageInputMode(mode);
    // Clear the other mode's state when switching
    if (mode === 'url') {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setImageUrlInput('');
      setImagePreview(null);
      setUrlPreviewError(null);
      setUrlPreviewLoading(false);
    }
    setRemoveImage(false);
  };

  // Re-initialize state when meal changes
  useEffect(() => {
    setName(meal.name);
    setServings(meal.servings);
    setIsBaking(meal.isBaking);
    setSubcategory(meal.subcategory || '');
    setInstructions(meal.instructions || '');
    setIngredients(meal.ingredients);
    setError(null);
    setImagePreview(meal.imageUrl || null);
    setRemoveImage(false);
    setImageFile(null);
    setImageInputMode('file');
    setImageUrlInput('');
    setUrlPreviewLoading(false);
    setUrlPreviewError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [meal]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, createDefaultIngredient()]);
  };

  const handleUpdateIngredient = (index: number, updated: Ingredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updated;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate meal name
    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }

    // Validate at least one ingredient with a name
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      setError('At least one ingredient with a name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUrl: string | undefined = meal.imageUrl;

      // Helper to check if URL is a Firebase Storage URL
      const isFirebaseStorageUrl = (url: string | undefined): boolean => {
        return !!url && url.includes('firebasestorage.googleapis.com');
      };

      // Helper to delete old Firebase image
      const deleteOldFirebaseImage = async () => {
        if (meal.imageUrl && isFirebaseStorageUrl(meal.imageUrl)) {
          try {
            const oldImageRef = ref(storage, meal.imageUrl);
            await deleteObject(oldImageRef);
          } catch {
            // Ignore errors deleting old image (might not exist)
          }
        }
      };

      // Handle image changes based on mode
      if (imageInputMode === 'url' && imageUrlInput && imagePreview) {
        // Use pasted URL directly (no compression, no Firebase upload)
        imageUrl = imageUrlInput;

        // Delete old Firebase image if it existed
        await deleteOldFirebaseImage();
      } else if (imageInputMode === 'file' && imageFile) {
        // New image selected - upload it
        const mealId = meal.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const filename = `${Date.now()}.jpg`;
        const storagePath = `meals/${householdCode}/${mealId}/${filename}`;

        const compressedBlob = await compressImage(imageFile);
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);

        // Delete old Firebase image if it existed
        await deleteOldFirebaseImage();
      } else if (removeImage) {
        // User wants to remove image
        imageUrl = undefined;

        // Delete old Firebase image from storage
        await deleteOldFirebaseImage();
      }

      const mealData: Omit<Meal, 'id' | 'householdCode'> = {
        name: name.trim(),
        servings,
        isBaking,
        ingredients: validIngredients,
      };

      // Only include optional fields if they have values (Firestore rejects undefined)
      if (instructions.trim()) {
        mealData.instructions = instructions.trim();
      }
      if (imageUrl) {
        mealData.imageUrl = imageUrl;
      }
      // NestedFolderPicker handles folder creation, just use subcategory directly
      if (subcategory) {
        mealData.subcategory = subcategory;
      }

      await onSave(mealData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal');
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
            size="icon-lg"
            onClick={handleClose}
            className="rounded-full"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </Button>
          <DialogTitle className="text-lg font-semibold text-charcoal">Edit Meal</DialogTitle>
          <Button
            size="icon-lg"
            onClick={handleSave}
            loading={saving}
            className="rounded-full"
            aria-label="Update meal"
          >
            {!saving && <span className="text-lg font-bold">&#10003;</span>}
          </Button>
        </DialogHeader>

        {/* Form - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Meal Name */}
          <div className="space-y-1">
            <Label htmlFor="edit-meal-name">Meal Name</Label>
            <Input
              id="edit-meal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spaghetti Bolognese"
            />
          </div>

          {/* Servings/Quantity */}
          <div className="space-y-1">
            <Label htmlFor="edit-servings">
              {isBaking ? 'Quantity' : 'Servings'}
              <span className="font-normal text-xs text-charcoal/50 ml-1">
                ({isBaking ? 'how many this recipe makes' : 'how many people this recipe serves'})
              </span>
            </Label>
            <Input
              id="edit-servings"
              type="number"
              min={1}
              max={99}
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24"
            />
          </div>

          {/* Baking Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-is-baking">Baking Recipe</Label>
            <Switch
              id="edit-is-baking"
              checked={isBaking}
              onCheckedChange={setIsBaking}
            />
          </div>

          {/* Folder */}
          <div className="space-y-1">
            <Label>
              Folder
              <span className="font-normal text-xs text-charcoal/50 ml-1">
                (optional)
              </span>
            </Label>
            <NestedFolderPicker
              key={isBaking ? 'baking' : 'main'}
              value={subcategory}
              onChange={setSubcategory}
              existingPaths={isBaking ? existingBakingPaths : existingSubcategories}
              isBaking={isBaking}
            />
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label>Photo (optional)</Label>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={imageInputMode === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleImageModeChange('file')}
              >
                Upload File
              </Button>
              <Button
                type="button"
                variant={imageInputMode === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleImageModeChange('url')}
              >
                Paste URL
              </Button>
            </div>

            {/* File Input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="edit-meal-photo"
            />

            {/* File Mode UI */}
            {imageInputMode === 'file' && (
              <>
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Meal preview"
                      className="max-h-48 rounded-soft object-cover"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-dashed border-charcoal/30 text-charcoal/60 hover:border-terracotta hover:text-terracotta"
                  >
                    + Add Photo
                  </Button>
                )}
              </>
            )}

            {/* URL Mode UI */}
            {imageInputMode === 'url' && (
              <div className="space-y-2">
                <Input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  onBlur={handleUrlInputBlur}
                  placeholder="https://example.com/image.jpg"
                  className={urlPreviewError ? 'border-red-300' : ''}
                />

                {urlPreviewLoading && (
                  <div className="flex items-center gap-2 text-sm text-charcoal/60">
                    <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                    Loading preview...
                  </div>
                )}

                {urlPreviewError && (
                  <p className="text-sm text-red-600">{urlPreviewError}</p>
                )}

                {imagePreview && !urlPreviewLoading && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="URL preview"
                      className="max-h-48 rounded-soft object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearUrl}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recipe */}
          <div className="space-y-1">
            <Label>Recipe (optional)</Label>
            <MarkdownEditor
              value={instructions}
              onChange={setInstructions}
              placeholder="Add cooking steps, tips, or notes..."
              rows={4}
            />
          </div>

          {/* Ingredients Section */}
          <div className="border-t border-charcoal/10 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-charcoal">
                Ingredients ({ingredients.length})
              </h3>
              <Button
                type="button"
                size="lg"
                onClick={handleAddIngredient}
              >
                + Add Ingredient
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-4">
                No ingredients yet. Tap &quot;Add Ingredient&quot; to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <IngredientInput
                    key={index}
                    ingredient={ingredient}
                    onChange={(updated) => handleUpdateIngredient(index, updated)}
                    onRemove={() => handleRemoveIngredient(index)}
                    isBaking={isBaking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
