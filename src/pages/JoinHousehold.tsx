import { useState } from 'react';
import { useHousehold } from '../hooks/useHousehold';

type Tab = 'create' | 'join';

export default function JoinHousehold() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [code, setCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const { loading, error, createHousehold, joinHousehold } = useHousehold();

  const handleCreate = async () => {
    try {
      // Use custom code if provided, otherwise generate random
      await createHousehold(customCode || undefined);
      // Success - householdCode will update, App will re-render
    } catch {
      // Error is already set in hook
    }
  };

  const handleCustomCodeChange = (value: string) => {
    // Only allow digits, max 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCustomCode(digits);
  };

  const handleJoin = async () => {
    try {
      await joinHousehold(code);
      // Success - householdCode will update, App will re-render
    } catch {
      // Error is already set in hook
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits, max 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-softer shadow-soft p-6 w-full max-w-sm">
        {/* Title */}
        <h1 className="text-2xl font-bold text-charcoal text-center mb-6">
          Our Kitchen
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 h-11 rounded-soft font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-terracotta text-white'
                : 'bg-gray-100 text-charcoal'
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 h-11 rounded-soft font-medium transition-colors ${
              activeTab === 'join'
                ? 'bg-terracotta text-white'
                : 'bg-gray-100 text-charcoal'
            }`}
          >
            Join Existing
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <div className="text-center">
            <p className="text-charcoal mb-4">
              Choose your own 4-digit code or leave blank for random.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={customCode}
              onChange={(e) => handleCustomCodeChange(e.target.value)}
              placeholder="1234"
              className="w-32 h-14 text-center text-2xl tracking-widest border-2 border-gray-200 rounded-soft focus:border-terracotta focus:outline-none mx-auto block mb-4"
            />
            <p className="text-sm text-warm-gray mb-4">
              {customCode.length === 4
                ? `Your code: ${customCode}`
                : 'Leave empty for random code'}
            </p>
            <button
              onClick={handleCreate}
              disabled={loading || (customCode.length > 0 && customCode.length < 4)}
              className="w-full h-11 bg-terracotta text-white rounded-soft font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Household'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-charcoal mb-4">
              Enter the 4-digit code to join an existing household.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="0000"
              className="w-32 h-14 text-center text-2xl tracking-widest border-2 border-gray-200 rounded-soft focus:border-terracotta focus:outline-none mx-auto block mb-4"
            />
            <button
              onClick={handleJoin}
              disabled={loading || code.length !== 4}
              className="w-full h-11 bg-terracotta text-white rounded-soft font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <p className="mt-4 text-red-600 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
