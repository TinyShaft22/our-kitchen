import { useState, useEffect, useMemo } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { parseGroceryItems } from '../../utils/parseGroceryItems';
import { CATEGORIES } from '../../types';
import type { GroceryItem } from '../../types';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'householdCode'>) => Promise<string>;
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

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setTextInput('');
    } else {
      stopListening();
    }
  }, [isOpen, resetTranscript, stopListening]);

  const handleClose = () => {
    stopListening();
    resetTranscript();
    setTextInput('');
    onClose();
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Parse the current input into items
  const currentValue = isSupported ? transcript : textInput;
  const parsedItems = useMemo(() => {
    if (!currentValue.trim()) return [];
    return parseGroceryItems(currentValue);
  }, [currentValue]);

  const canAdd = parsedItems.length > 0;

  const handleAddItems = async () => {
    if (parsedItems.length === 0) return;

    setSaving(true);
    try {
      // Add all parsed items
      for (const item of parsedItems) {
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

  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/80"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-12 w-full max-w-sm">
        {/* Cancel button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cancel"
        >
          <span className="text-2xl">&times;</span>
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white">
          {isSupported ? 'Say items' : 'Type items'}
        </h2>

        {/* Voice input (if supported) */}
        {isSupported ? (
          <>
            {/* Microphone button */}
            <button
              onClick={handleMicClick}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
                isListening
                  ? 'bg-sage animate-pulse shadow-lg shadow-sage/50'
                  : 'bg-terracotta hover:bg-terracotta/90'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <span role="img" aria-hidden="true">
                {isListening ? '...' : '🎙️'}
              </span>
            </button>

            {/* Status text */}
            <p className="text-white/60 text-sm text-center">
              {isListening ? 'Listening...' : 'Tap to speak'}
              <br />
              <span className="text-xs">Say multiple items: "eggs and milk"</span>
            </p>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-soft text-sm text-center max-w-full">
                {error}
              </div>
            )}

            {/* Transcript display */}
            {transcript && (
              <div className="bg-white/10 rounded-soft px-4 py-3 w-full">
                <p className="text-white/60 text-xs mb-1">You said:</p>
                <p className="text-white text-lg text-center">{transcript}</p>
              </div>
            )}
          </>
        ) : (
          /* Text input fallback */
          <>
            <div className="w-full">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., eggs and milk, bread"
                className="w-full h-12 px-4 rounded-soft border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdd) {
                    handleAddItems();
                  }
                }}
              />
            </div>
            <p className="text-white/60 text-sm text-center">
              Voice input not supported.
              <br />
              <span className="text-xs">Separate items with "and" or commas</span>
            </p>
          </>
        )}

        {/* Parsed items preview */}
        {parsedItems.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-white/60 text-xs">
              {parsedItems.length} item{parsedItems.length !== 1 ? 's' : ''} detected:
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {parsedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/10 rounded px-3 py-2"
                >
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-white/50 text-xs">{getCategoryName(item.category)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Items button */}
        {canAdd && (
          <button
            onClick={handleAddItems}
            disabled={saving}
            className="w-full bg-terracotta text-white py-3 rounded-soft font-semibold hover:bg-terracotta/90 active:bg-terracotta/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving
              ? 'Adding...'
              : `Add ${parsedItems.length} item${parsedItems.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );
}
