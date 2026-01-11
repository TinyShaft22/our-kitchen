import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import Home from './pages/Home'
import MealLibrary from './pages/MealLibrary'
import GroceryListPage from './pages/GroceryListPage'
import BakingPage from './pages/BakingPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream flex flex-col">
        <main className="flex-1 overflow-auto pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meals" element={<MealLibrary />} />
            <Route path="/grocery" element={<GroceryListPage />} />
            <Route path="/baking" element={<BakingPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App
