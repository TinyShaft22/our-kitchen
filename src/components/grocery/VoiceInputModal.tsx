import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { CATEGORIES } from '../../types';
import type { GroceryItem, Category, Store } from '../../types';

interface ParsedItem {
  name: string;
  category: Category;
  store: Store;
}

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'householdCode'>) => Promise<string>;
}

// Cloud function URL
const FUNCTION_URL = 'https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net/parseGroceryTranscript';

// Call the cloud function directly via HTTP
async function parseGroceryTranscript(transcript: string): Promise<ParsedItem[]> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { transcript } }),
  });

  if (!response.ok) {
    throw new Error('Failed to process transcript');
  }

  const data = await response.json();
  return data.result?.items || [];
}

export function VoiceInputModal({ isOpen, onClose, onAddItem }: VoiceInputModalProps) {
  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [textInput, setTextInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [processError, setProcessError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setTextInput('');
      setItems([]);
      setEditingIndex(null);
      setProcessError(null);
    } else {
      stopListening();
    }
  }, [isOpen, resetTranscript, stopListening]);

  const handleClose = () => {
    stopListening();
    resetTranscript();
    setTextInput('');
    setItems([]);
    setEditingIndex(null);
    setProcessError(null);
    onClose();
  };

  // Process transcript with LLM
  const processTranscript = async (text: string) => {
    if (!text.trim()) return;

    setProcessing(true);
    setProcessError(null);

    try {
      const items = await parseGroceryTranscript(text);
      setItems(items);
    } catch (err) {
      console.error('Failed to process transcript:', err);
      setProcessError('Failed to process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
      // Process the transcript when stopping
      if (transcript.trim()) {
        await processTranscript(transcript);
      }
    } else {
      // Clear previous results when starting new recording
      setItems([]);
      setProcessError(null);
      startListening();
    }
  };

  // Handle text input submission
  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      await processTranscript(textInput);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index].name);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      setItems((prev) =>
        prev.map((item, i) =>
          i === editingIndex ? { ...item, name: trimmedValue } : item
        )
      );
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleAddNewItem = () => {
    setItems((prev) => [
      ...prev,
      { name: '', category: 'pantry', store: 'safeway' },
    ]);
    setEditingIndex(items.length);
    setEditValue('');
  };

  const handleAddItems = async () => {
    const validItems = items.filter((item) => item.name.trim().length > 0);
    if (validItems.length === 0) return;

    setSaving(true);
    try {
      for (const item of validItems) {
        await onAddItem({
          name: item.name,
          qty: 1,
          unit: 'item',
          category: item.category,
          store: item.store,
          status: 'need',
          source: 'quick-add',
        });
      }
      handleClose();
    } catch (err) {
      console.error('Failed to add items:', err);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId;
  };

  if (!isOpen) return null;

  const validItemCount = items.filter((item) => item.name.trim().length > 0).length;
  const canAdd = validItemCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/80"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Cancel button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cancel"
        >
          <span className="text-2xl">&times;</span>
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white">
          {isSupported ? 'Voice Input' : 'Quick Add'}
        </h2>

        {/* Voice input (if supported) */}
        {isSupported ? (
          <>
            {/* Microphone button */}
            <button
              onClick={handleMicClick}
              disabled={processing}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all disabled:opacity-50 ${
                isListening
                  ? 'bg-sage animate-pulse shadow-lg shadow-sage/50'
                  : 'bg-terracotta hover:bg-terracotta/90'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <span role="img" aria-hidden="true">
                {processing ? '...' : isListening ? '🔴' : '🎙️'}
              </span>
            </button>

            {/* Status text */}
            <p className="text-white/60 text-sm text-center">
              {processing ? (
                <span className="text-terracotta font-medium">Processing...</span>
              ) : isListening ? (
                <>
                  <span className="text-sage font-medium">Listening...</span>
                  <br />
                  Tap mic when done
                </>
              ) : (
                <>
                  Tap mic to start
                  <br />
                  <span className="text-xs">Say your grocery list naturally</span>
                </>
              )}
            </p>

            {/* Error messages */}
            {(error || processError) && (
              <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-soft text-sm text-center w-full">
                {error || processError}
              </div>
            )}

            {/* Transcript display */}
            {transcript && !processing && (
              <div className="bg-white/10 rounded-soft px-4 py-3 w-full">
                <p className="text-white/60 text-xs mb-1">You said:</p>
                <p className="text-white text-sm">{transcript}</p>
              </div>
            )}
          </>
        ) : (
          /* Text input fallback */
          <>
            <div className="w-full flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., eggs, milk, bread"
                className="flex-1 h-12 px-4 rounded-soft border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextSubmit();
                }}
              />
              <button
                onClick={handleTextSubmit}
                disabled={processing || !textInput.trim()}
                className="px-4 h-12 bg-terracotta text-white rounded-soft hover:bg-terracotta/90 disabled:opacity-50"
              >
                {processing ? '...' : 'Go'}
              </button>
            </div>
            <p className="text-white/60 text-sm text-center">
              <span className="text-xs">Type your grocery list naturally</span>
            </p>
            {processError && (
              <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-soft text-sm text-center w-full">
                {processError}
              </div>
            )}
          </>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <div className="w-full space-y-2 mt-2">
            <p className="text-white/60 text-xs">
              {validItemCount} item{validItemCount !== 1 ? 's' : ''} detected:
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 rounded px-3 py-2"
                >
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 h-8 px-2 rounded bg-white/20 text-white text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="w-8 h-8 flex items-center justify-center text-sage hover:bg-white/10 rounded"
                        aria-label="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:bg-white/10 rounded"
                        aria-label="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="flex-1 text-left"
                      >
                        <span className="text-white font-medium text-sm">
                          {item.name || <span className="text-white/40 italic">Empty</span>}
                        </span>
                      </button>
                      <span className="text-white/40 text-xs">
                        {getCategoryName(item.category)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add item button */}
            <button
              onClick={handleAddNewItem}
              className="w-full flex items-center justify-center gap-2 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors text-sm"
            >
              <span>+</span>
              <span>Add another item</span>
            </button>
          </div>
        )}

        {/* Add Items button */}
        {canAdd && (
          <button
            onClick={handleAddItems}
            disabled={saving}
            className="w-full bg-terracotta text-white py-3 rounded-soft font-semibold hover:bg-terracotta/90 active:bg-terracotta/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {saving
              ? 'Adding...'
              : `Add ${validItemCount} item${validItemCount !== 1 ? 's' : ''}`}
          </button>
        )}

        {/* Show add button even with no items */}
        {items.length === 0 && !transcript && !textInput && !processing && (
          <button
            onClick={handleAddNewItem}
            className="w-full flex items-center justify-center gap-2 py-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-soft transition-colors text-sm mt-4"
          >
            <span>+</span>
            <span>Add item manually</span>
          </button>
        )}
      </div>
    </div>
  );
}
