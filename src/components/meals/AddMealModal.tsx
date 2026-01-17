import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<Meal, 'id' | 'householdCode'>) => Promise<void>;
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

export function AddMealModal({ isOpen, onClose, onSave, householdCode, existingSubcategories = [], existingBakingPaths = [] }: AddMealModalProps) {
  const [name, setName] = useState('');
  const [servings, setServings] = useState(4);
  const [isBaking, setIsBaking] = useState(false);
  const [subcategory, setSubcategory] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      setImageFile(file);
      // Revoke previous preview URL if exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setServings(4);
    setIsBaking(false);
    setSubcategory('');
    setInstructions('');
    setIngredients([]);
    setError(null);
    // Clear image state and revoke object URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
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
      let imageUrl: string | undefined;

      // Upload image if selected
      if (imageFile) {
        const mealId = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const filename = `${Date.now()}.jpg`;
        const storagePath = `meals/${householdCode}/${mealId}/${filename}`;

        const compressedBlob = await compressImage(imageFile);
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);
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
      setError(err instanceof Error ? err.message : 'Failed to save meal');
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
          <DialogTitle className="text-lg font-semibold text-charcoal">Add Meal</DialogTitle>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50 p-0"
            aria-label="Save meal"
          >
            {saving ? (
              <span className="text-sm">...</span>
            ) : (
              <span className="text-lg font-bold">&#10003;</span>
            )}
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
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spaghetti Bolognese"
            />
          </div>

          {/* Servings/Quantity */}
          <div className="space-y-1">
            <Label htmlFor="servings">
              {isBaking ? 'Quantity' : 'Servings'}
              <span className="font-normal text-xs text-charcoal/50 ml-1">
                ({isBaking ? 'how many this recipe makes' : 'how many people this recipe serves'})
              </span>
            </Label>
            <Input
              id="servings"
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
            <Label htmlFor="is-baking">Baking Recipe</Label>
            <Switch
              id="is-baking"
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
          <div className="space-y-1">
            <Label>Photo (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="meal-photo"
            />
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
                onClick={handleAddIngredient}
                className="h-11 px-4 rounded-soft bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 active:bg-terracotta/80"
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
