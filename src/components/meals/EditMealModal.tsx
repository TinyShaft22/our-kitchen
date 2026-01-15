import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Meal, Ingredient } from '../../types';
import { IngredientInput } from './IngredientInput';
import { MarkdownEditor } from './MarkdownEditor';
import { NestedFolderPicker } from './NestedFolderPicker';

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

      // Handle image changes
      if (imageFile) {
        // New image selected - upload it
        const mealId = meal.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const filename = `${Date.now()}.jpg`;
        const storagePath = `meals/${householdCode}/${mealId}/${filename}`;

        const compressedBlob = await compressImage(imageFile);
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);

        // Delete old image if it existed
        if (meal.imageUrl) {
          try {
            const oldImageRef = ref(storage, meal.imageUrl);
            await deleteObject(oldImageRef);
          } catch {
            // Ignore errors deleting old image (might not exist)
          }
        }
      } else if (removeImage) {
        // User wants to remove image
        imageUrl = undefined;

        // Delete old image from storage
        if (meal.imageUrl) {
          try {
            const oldImageRef = ref(storage, meal.imageUrl);
            await deleteObject(oldImageRef);
          } catch {
            // Ignore errors deleting old image (might not exist)
          }
        }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Edit Meal</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Update meal"
          >
            {saving ? (
              <span className="text-sm">...</span>
            ) : (
              <span className="text-lg font-bold">&#10003;</span>
            )}
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Meal Name */}
          <div>
            <label
              htmlFor="edit-meal-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Meal Name
            </label>
            <input
              id="edit-meal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spaghetti Bolognese"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Servings */}
          <div>
            <label
              htmlFor="edit-servings"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Servings
              <span className="font-normal text-xs text-charcoal/50 ml-1">
                (how many people this recipe serves)
              </span>
            </label>
            <input
              id="edit-servings"
              type="number"
              min="1"
              max="99"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Baking Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="edit-is-baking"
              className="text-sm font-medium text-charcoal"
            >
              Baking Recipe
            </label>
            <button
              id="edit-is-baking"
              role="switch"
              aria-checked={isBaking}
              onClick={() => setIsBaking(!isBaking)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                isBaking ? 'bg-terracotta' : 'bg-charcoal/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isBaking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Folder */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Folder
              <span className="font-normal text-xs text-charcoal/50 ml-1">
                (optional)
              </span>
            </label>
            <NestedFolderPicker
              value={subcategory}
              onChange={setSubcategory}
              existingPaths={isBaking ? existingBakingPaths : existingSubcategories}
              isBaking={isBaking}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Photo (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="edit-meal-photo"
            />
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="Meal preview"
                  className="max-h-48 rounded-soft object-cover"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3 rounded-soft border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="h-9 px-3 rounded-soft border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-4 rounded-soft border border-dashed border-charcoal/30 text-charcoal/60 text-sm hover:border-terracotta hover:text-terracotta transition-colors"
              >
                + Add Photo
              </button>
            )}
          </div>

          {/* Recipe */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Recipe (optional)
            </label>
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
              <button
                type="button"
                onClick={handleAddIngredient}
                className="h-11 px-4 rounded-soft bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors"
              >
                + Add Ingredient
              </button>
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
      </div>
    </div>
  );
}
