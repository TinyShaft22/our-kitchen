import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
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

  const handleAddItem = async () => {
    const itemName = isSupported ? transcript.trim() : textInput.trim();

    if (!itemName) return;

    setSaving(true);
    try {
      await onAddItem({
        name: itemName,
        qty: 1,
        unit: 'item',
        category: 'pantry',
        store: 'safeway',
        status: 'need',
        source: 'quick-add',
      });
      handleClose();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentValue = isSupported ? transcript : textInput;
  const canAdd = currentValue.trim().length > 0;

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
          {isSupported ? 'Say an item' : 'Type an item'}
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
            <p className="text-white/60 text-sm">
              {isListening ? 'Listening...' : 'Tap to speak'}
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
                placeholder="e.g., Milk, Eggs, Bread"
                className="w-full h-12 px-4 rounded-soft border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdd) {
                    handleAddItem();
                  }
                }}
              />
            </div>
            <p className="text-white/60 text-sm text-center">
              Voice input not supported in this browser.
              <br />
              Type your item instead.
            </p>
          </>
        )}

        {/* Add Item button */}
        {canAdd && (
          <button
            onClick={handleAddItem}
            disabled={saving}
            className="w-full bg-terracotta text-white py-3 rounded-soft font-semibold hover:bg-terracotta/90 active:bg-terracotta/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Adding...' : `Add "${currentValue.trim()}"`}
          </button>
        )}
      </div>
    </div>
  );
}
