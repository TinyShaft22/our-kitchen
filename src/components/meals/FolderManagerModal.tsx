import { useState, useMemo } from 'react';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPaths: string[];
  onCreateFolder: (path: string) => Promise<void> | void;
  onDeleteFolder?: (path: string) => Promise<void> | void;
  title?: string;
}

interface FolderNode {
  name: string;
  fullPath: string;
  children: FolderNode[];
  hasRecipes?: boolean;
}

/**
 * Build a tree structure from flat paths for display
 */
function buildDisplayTree(paths: string[]): FolderNode[] {
  const root: FolderNode[] = [];

  for (const path of paths) {
    const segments = path.split('/').filter((s) => s.length > 0);
    let currentLevel = root;
    let currentPath = '';

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      let existing = currentLevel.find((n) => n.name === segment);

      if (!existing) {
        existing = {
          name: segment,
          fullPath: currentPath,
          children: [],
        };
        currentLevel.push(existing);
      }

      currentLevel = existing.children;
    }
  }

  // Sort children alphabetically at each level
  const sortNodes = (nodes: FolderNode[]): void => {
    nodes.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    for (const node of nodes) {
      sortNodes(node.children);
    }
  };

  sortNodes(root);

  return root;
}

export function FolderManagerModal({
  isOpen,
  onClose,
  existingPaths,
  onCreateFolder,
  onDeleteFolder,
  title = 'Manage Folders',
}: FolderManagerModalProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [addingToPath, setAddingToPath] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  // Build tree from paths
  const folderTree = useMemo(
    () => buildDisplayTree(existingPaths),
    [existingPaths]
  );

  const toggleExpanded = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleStartAdd = (parentPath: string) => {
    setAddingToPath(parentPath);
    setNewFolderName('');
    setError(null);
  };

  const handleCancelAdd = () => {
    setAddingToPath(null);
    setNewFolderName('');
    setError(null);
  };

  const [saving, setSaving] = useState(false);

  const handleSaveFolder = async () => {
    const trimmedName = newFolderName.trim();

    // Validate name
    if (!trimmedName) {
      setError('Folder name is required');
      return;
    }

    if (trimmedName.includes('/')) {
      setError('Folder name cannot contain "/"');
      return;
    }

    // Build the full path
    const newPath = addingToPath !== null ? (addingToPath ? `${addingToPath}/${trimmedName}` : trimmedName) : trimmedName;

    // Check for duplicates
    if (existingPaths.includes(newPath)) {
      setError('A folder with this name already exists');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onCreateFolder(newPath);

      // Expand parent to show new folder
      if (addingToPath) {
        setExpandedPaths((prev) => new Set([...prev, addingToPath]));
      }

      handleCancelAdd();
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError('Failed to create folder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveFolder();
    } else if (e.key === 'Escape') {
      handleCancelAdd();
    }
  };

  if (!isOpen) return null;

  const [deleting, setDeleting] = useState(false);

  const handleDeleteFolder = async (path: string) => {
    if (onDeleteFolder) {
      setDeleting(true);
      setError(null);
      try {
        await onDeleteFolder(path);
      } catch (err) {
        console.error('Failed to delete folder:', err);
        setError('Failed to delete folder. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
    setDeletingPath(null);
  };

  const renderFolder = (node: FolderNode, depth: number): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.fullPath);
    const hasChildren = node.children.length > 0;
    const isConfirmingDelete = deletingPath === node.fullPath;

    return (
      <div key={node.fullPath}>
        {/* Folder row */}
        <div
          className={`group flex items-center gap-3 py-3 px-3 rounded-soft transition-all duration-200 ${
            isConfirmingDelete
              ? 'bg-red-50 border border-red-200'
              : 'hover:bg-white/80 hover:shadow-soft'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Expand/collapse button or spacer */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(node.fullPath)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-charcoal/40 hover:text-charcoal hover:bg-charcoal/10 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
            </button>
          ) : (
            <div className="w-7 h-7 flex items-center justify-center">
              <span className="text-charcoal/20 text-xs">•</span>
            </div>
          )}

          {/* Folder icon */}
          <div className={`w-9 h-9 rounded-soft flex items-center justify-center ${
            isExpanded ? 'bg-honey/20' : 'bg-terracotta/10'
          }`}>
            <span className="text-lg">{isExpanded ? '📂' : '📁'}</span>
          </div>

          {/* Folder name */}
          <span className="flex-1 font-display font-medium text-charcoal">{node.name}</span>

          {/* Action buttons - show on hover */}
          {!isConfirmingDelete && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Add subfolder button */}
              <button
                onClick={() => handleStartAdd(node.fullPath)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sage/40 text-sage hover:text-charcoal transition-colors"
                aria-label={`Add subfolder to ${node.name}`}
                title="Add subfolder"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Delete button (only if onDeleteFolder is provided and no children) */}
              {onDeleteFolder && !hasChildren && (
                <button
                  onClick={() => setDeletingPath(node.fullPath)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-charcoal/40 hover:text-red-500 transition-colors"
                  aria-label={`Delete ${node.name}`}
                  title="Delete folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Delete confirmation */}
          {isConfirmingDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">{deleting ? 'Deleting...' : 'Delete?'}</span>
              <button
                onClick={() => handleDeleteFolder(node.fullPath)}
                disabled={deleting}
                className="px-3 py-1 rounded-soft bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setDeletingPath(null)}
                disabled={deleting}
                className="px-3 py-1 rounded-soft bg-charcoal/10 text-charcoal text-sm hover:bg-charcoal/20 transition-colors disabled:opacity-50"
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Inline add form (appears below this folder) */}
        {addingToPath === node.fullPath && (
          <div
            className="flex items-center gap-2 py-2 px-3 bg-sage/10 border border-sage/30 rounded-soft my-2"
            style={{ marginLeft: `${(depth + 1) * 20}px` }}
          >
            <div className="w-9 h-9 rounded-soft bg-sage/20 flex items-center justify-center">
              <span className="text-lg">📁</span>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => {
                setNewFolderName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="New folder name"
              className="flex-1 h-10 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
              autoFocus
            />
            <button
              onClick={handleSaveFolder}
              disabled={saving}
              className="w-10 h-10 flex items-center justify-center rounded-soft bg-terracotta text-white hover:bg-terracotta/90 shadow-soft transition-all disabled:opacity-50"
              aria-label="Save folder"
            >
              {saving ? (
                <span className="text-sm">...</span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={handleCancelAdd}
              className="w-10 h-10 flex items-center justify-center rounded-soft hover:bg-charcoal/10 text-charcoal/60 transition-colors"
              aria-label="Cancel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Children */}
        {isExpanded &&
          node.children.map((child) => renderFolder(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-t-2xl sm:rounded-softer w-full sm:max-w-md max-h-[85vh] overflow-hidden shadow-xl flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-honey/20 to-terracotta/10 border-b border-charcoal/10 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-charcoal">
              {title}
            </h2>
            <p className="text-sm text-charcoal/60 mt-0.5">Organize your recipes into folders</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 text-charcoal transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Folder tree */}
        <div className="flex-1 overflow-y-auto p-4">
          {folderTree.length === 0 && addingToPath === null ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-honey/20 flex items-center justify-center mb-4">
                <span className="text-3xl">📁</span>
              </div>
              <p className="text-charcoal/60 font-medium">No folders yet</p>
              <p className="text-charcoal/40 text-sm mt-1">Create your first folder to organize recipes</p>
            </div>
          ) : (
            <div className="space-y-1">
              {folderTree.map((node) => renderFolder(node, 0))}
            </div>
          )}

          {/* Inline add form for root level */}
          {addingToPath === '' && (
            <div className="flex items-center gap-2 py-2 px-3 bg-sage/10 border border-sage/30 rounded-soft mt-3">
              <div className="w-9 h-9 rounded-soft bg-sage/20 flex items-center justify-center">
                <span className="text-lg">📁</span>
              </div>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="New folder name"
                className="flex-1 h-10 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30"
                autoFocus
              />
              <button
                onClick={handleSaveFolder}
                disabled={saving}
                className="w-10 h-10 flex items-center justify-center rounded-soft bg-terracotta text-white hover:bg-terracotta/90 shadow-soft transition-all disabled:opacity-50"
                aria-label="Save folder"
              >
                {saving ? (
                  <span className="text-sm">...</span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCancelAdd}
                className="w-10 h-10 flex items-center justify-center rounded-soft hover:bg-charcoal/10 text-charcoal/60 transition-colors"
                aria-label="Cancel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Footer with Add Root Folder button */}
        <div className="border-t border-charcoal/10 p-4 bg-white/50">
          <button
            onClick={() => handleStartAdd('')}
            disabled={addingToPath !== null}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-soft bg-terracotta hover:bg-terracotta/90 text-white font-medium shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Folder</span>
          </button>
        </div>
      </div>
    </div>
  );
}
