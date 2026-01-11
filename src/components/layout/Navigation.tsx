import { NavLink } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/meals', label: 'Meals', icon: '🍽️' },
  { path: '/grocery', label: 'Grocery', icon: '🛒' },
  { path: '/baking', label: 'Baking', icon: '🧁' },
]

function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-soft border-t border-charcoal/10">
      <div className="flex justify-around items-center px-2 pb-safe">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 transition-colors ${
                isActive
                  ? 'text-terracotta'
                  : 'text-charcoal/60 hover:text-charcoal'
              }`
            }
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
