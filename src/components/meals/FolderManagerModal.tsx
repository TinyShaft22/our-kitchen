import { useState, useMemo } from 'react';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPaths: string[];
  onCreateFolder: (path: string) => void;
}

interface FolderNode {
  name: string;
  fullPath: string;
  children: FolderNode[];
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
}: FolderManagerModalProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [addingToPath, setAddingToPath] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const handleSaveFolder = () => {
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
    const newPath = addingToPath ? `${addingToPath}/${trimmedName}` : trimmedName;

    // Check for duplicates
    if (existingPaths.includes(newPath)) {
      setError('A folder with this name already exists');
      return;
    }

    onCreateFolder(newPath);

    // Expand parent to show new folder
    if (addingToPath) {
      setExpandedPaths((prev) => new Set([...prev, addingToPath]));
    }

    handleCancelAdd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveFolder();
    } else if (e.key === 'Escape') {
      handleCancelAdd();
    }
  };

  if (!isOpen) return null;

  const renderFolder = (node: FolderNode, depth: number): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.fullPath);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.fullPath}>
        {/* Folder row */}
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-charcoal/5 rounded-soft"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/collapse button or spacer */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(node.fullPath)}
              className="w-6 h-6 flex items-center justify-center text-charcoal/60 hover:text-charcoal"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}

          {/* Folder icon */}
          <span className="text-lg" role="img" aria-label="folder">
            {isExpanded ? '📂' : '📁'}
          </span>

          {/* Folder name */}
          <span className="flex-1 text-charcoal font-medium">{node.name}</span>

          {/* Add subfolder button */}
          <button
            onClick={() => handleStartAdd(node.fullPath)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sage/30 text-charcoal/60 hover:text-charcoal"
            aria-label={`Add subfolder to ${node.name}`}
          >
            <span className="text-lg">+</span>
          </button>
        </div>

        {/* Inline add form (appears below this folder) */}
        {addingToPath === node.fullPath && (
          <div
            className="flex items-center gap-2 py-2 px-2 bg-sage/20 rounded-soft mx-2 mb-2"
            style={{ marginLeft: `${(depth + 1) * 16 + 8}px` }}
          >
            <span className="text-lg">📁</span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => {
                setNewFolderName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="New folder name"
              className="flex-1 h-9 px-2 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-sm"
              autoFocus
            />
            <button
              onClick={handleSaveFolder}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90"
              aria-label="Save folder"
            >
              <span className="text-sm font-bold">✓</span>
            </button>
            <button
              onClick={handleCancelAdd}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-charcoal/10 text-charcoal/60"
              aria-label="Cancel"
            >
              <span className="text-lg">&times;</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-md max-h-[85vh] overflow-hidden shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal">
            Manage Baking Folders
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 text-charcoal"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
            {error}
          </div>
        )}

        {/* Folder tree */}
        <div className="flex-1 overflow-y-auto p-4">
          {folderTree.length === 0 && addingToPath !== '' ? (
            <p className="text-charcoal/60 text-center py-4">
              No folders yet. Add a root folder to get started.
            </p>
          ) : (
            folderTree.map((node) => renderFolder(node, 0))
          )}

          {/* Inline add form for root level */}
          {addingToPath === '' && (
            <div className="flex items-center gap-2 py-2 px-2 bg-sage/20 rounded-soft mt-2">
              <span className="text-lg">📁</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="New folder name"
                className="flex-1 h-9 px-2 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveFolder}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90"
                aria-label="Save folder"
              >
                <span className="text-sm font-bold">✓</span>
              </button>
              <button
                onClick={handleCancelAdd}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-charcoal/10 text-charcoal/60"
                aria-label="Cancel"
              >
                <span className="text-lg">&times;</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer with Add Root Folder button */}
        <div className="border-t border-charcoal/10 p-4">
          <button
            onClick={() => handleStartAdd('')}
            disabled={addingToPath !== null}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-soft bg-sage hover:bg-sage/80 text-charcoal font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">+</span>
            <span>Add Root Folder</span>
          </button>
        </div>
      </div>
    </div>
  );
}
