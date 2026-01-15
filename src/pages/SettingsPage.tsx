import { useState } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

function SettingsPage() {
  const { householdCode, leaveHousehold } = useHousehold();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    leaveHousehold();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-charcoal mb-6">Settings</h1>

      {/* Household Info */}
      <div className="bg-white rounded-soft shadow-soft p-4 mb-4">
        <h2 className="text-sm font-medium text-charcoal/60 mb-2">Household Code</h2>
        <p className="text-2xl font-bold text-charcoal tracking-wider">{householdCode}</p>
        <p className="text-sm text-charcoal/60 mt-2">
          Share this code with family members so they can join your household.
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full bg-white rounded-soft shadow-soft p-4 text-left hover:bg-red-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-red-600">Leave Household</h2>
            <p className="text-sm text-charcoal/60 mt-1">
              Sign out and return to the join screen
            </p>
          </div>
          <span className="text-red-600 text-xl">→</span>
        </div>
      </button>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Leave Household"
        message="Are you sure you want to leave this household? You can rejoin anytime with the same code."
        confirmText="Leave"
        confirmVariant="danger"
      />
    </div>
  );
}

export default SettingsPage;
