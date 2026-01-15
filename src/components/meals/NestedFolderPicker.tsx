import { useState } from 'react';

interface NestedFolderPickerProps {
  value: string;
  onChange: (path: string) => void;
  existingPaths: string[];
  isBaking: boolean;
}

export function NestedFolderPicker({
  value,
  onChange,
  existingPaths,
  isBaking,
}: NestedFolderPickerProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [parentPath, setParentPath] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  // For non-baking: simple text input for new subcategory
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // Build the full path preview for new folder
  const getPreviewPath = () => {
    if (!newFolderName.trim()) return '';
    return parentPath ? `${parentPath} / ${newFolderName.trim()}` : newFolderName.trim();
  };

  // Get display text with indentation for dropdown options
  const getIndentedOption = (path: string) => {
    const depth = path.split('/').length - 1;
    const indent = '\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for indentation
    const leafName = path.split('/').pop() || path;
    return `${indent}${leafName}`;
  };

  const handleCreateAndSelect = () => {
    const fullPath = parentPath
      ? `${parentPath}/${newFolderName.trim()}`
      : newFolderName.trim();
    onChange(fullPath);
    setIsCreatingNew(false);
    setParentPath('');
    setNewFolderName('');
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
    setParentPath('');
    setNewFolderName('');
    setNewSubcategoryName('');
  };

  // Non-baking mode: simple dropdown + text input for new
  if (!isBaking) {
    if (isCreatingNew) {
      return (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            placeholder="Enter folder name..."
            className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubcategoryName.trim()) {
                onChange(newSubcategoryName.trim());
                handleCancelCreate();
              } else if (e.key === 'Escape') {
                handleCancelCreate();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (newSubcategoryName.trim()) {
                onChange(newSubcategoryName.trim());
                handleCancelCreate();
              }
            }}
            disabled={!newSubcategoryName.trim()}
            className="h-11 px-3 rounded-soft bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleCancelCreate}
            className="h-11 px-3 rounded-soft border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        >
          <option value="">No folder</option>
          {existingPaths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsCreatingNew(true)}
          className="h-11 px-3 rounded-soft border border-charcoal/20 text-terracotta hover:bg-terracotta/5 whitespace-nowrap"
        >
          + New
        </button>
      </div>
    );
  }

  // Baking mode: dropdown with indentation + step-by-step folder creation
  if (isCreatingNew) {
    const previewPath = getPreviewPath();

    return (
      <div className="space-y-3 p-3 bg-cream/50 rounded-soft border border-charcoal/10">
        {/* Step 1: Select parent folder */}
        <div>
          <label className="block text-xs font-medium text-charcoal/70 mb-1">
            Step 1: Select parent folder
          </label>
          <select
            value={parentPath}
            onChange={(e) => setParentPath(e.target.value)}
            className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
          >
            <option value="">Root (top level)</option>
            {existingPaths.map((path) => (
              <option key={path} value={path}>
                {getIndentedOption(path)}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Enter folder name */}
        <div>
          <label className="block text-xs font-medium text-charcoal/70 mb-1">
            Step 2: Enter folder name
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="e.g., Cookies, Holiday, etc."
            className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFolderName.trim()) {
                handleCreateAndSelect();
              } else if (e.key === 'Escape') {
                handleCancelCreate();
              }
            }}
          />
        </div>

        {/* Preview */}
        {previewPath && (
          <div className="text-sm text-charcoal/70 bg-white px-3 py-2 rounded-soft border border-charcoal/10">
            <span className="text-xs text-charcoal/50">Will create: </span>
            <span className="font-medium">{previewPath}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancelCreate}
            className="flex-1 h-10 rounded-soft border border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateAndSelect}
            disabled={!newFolderName.trim()}
            className="flex-1 h-10 rounded-soft bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
          >
            Create & Select
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
      >
        <option value="">No folder</option>
        {existingPaths.map((path) => (
          <option key={path} value={path}>
            {getIndentedOption(path)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setIsCreatingNew(true)}
        className="h-11 px-3 rounded-soft border border-charcoal/20 text-terracotta hover:bg-terracotta/5 whitespace-nowrap"
      >
        + New Folder
      </button>
    </div>
  );
}
