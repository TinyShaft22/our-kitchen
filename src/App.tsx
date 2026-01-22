import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import Home from './pages/Home'
import MealLibrary from './pages/MealLibrary'
import GroceryListPage from './pages/GroceryListPage'
import BakingPage from './pages/BakingPage'
import HouseholdItemsPage from './pages/HouseholdItemsPage'
import SettingsPage from './pages/SettingsPage'
import JoinHousehold from './pages/JoinHousehold'
import { useHousehold } from './hooks/useHousehold'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-charcoal text-lg">Loading...</p>
    </div>
  )
}

function App() {
  const { householdCode, loading } = useHousehold()

  // Show loading while checking localStorage
  if (loading) {
    return <LoadingScreen />
  }

  // Gate: require household code to access app
  if (!householdCode) {
    return <JoinHousehold />
  }

  // Main app with navigation
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream flex flex-col">
        <main className="flex-1 overflow-auto" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meals" element={<MealLibrary />} />
            <Route path="/grocery" element={<GroceryListPage />} />
            <Route path="/baking" element={<BakingPage />} />
            <Route path="/household" element={<HouseholdItemsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
