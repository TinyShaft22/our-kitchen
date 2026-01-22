import { NavLink, useLocation } from 'react-router-dom'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useEffect, useState } from 'react'

const tabs = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/meals', label: 'Meals', icon: '🍽️' },
  { path: '/grocery', label: 'Grocery', icon: '🛒' },
  { path: '/baking', label: 'Baking', icon: '🧁' },
  { path: '/household', label: 'Household', icon: '📦' },
]

function Navigation() {
  const isOnline = useOnlineStatus()
  const location = useLocation()
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: string; width: string }>({ left: '0%', width: '20%' })

  // Calculate active tab index for indicator position
  const activeIndex = tabs.findIndex(tab =>
    tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
  )

  useEffect(() => {
    // Update indicator position based on active tab
    const tabWidth = 100 / tabs.length
    const left = activeIndex * tabWidth
    setIndicatorStyle({
      left: `${left}%`,
      width: `${tabWidth}%`,
    })
  }, [activeIndex])

  return (
    <>
      {/* Offline indicator banner */}
      {!isOnline && (
        <div className="fixed left-0 right-0 bg-amber-100 border-t border-amber-300 px-4 py-2 text-center z-40" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
          <span className="text-amber-800 text-sm font-medium">
            📡 You're offline — changes will sync when reconnected
          </span>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-soft border-t border-charcoal/10 z-50 pb-[env(safe-area-inset-bottom)]">
        {/* Sliding indicator - only spans the tabs area */}
        <div
          className="absolute top-0 h-0.5 bg-terracotta transition-all duration-300"
          style={{
            left: `calc(${indicatorStyle.left} * 0.88)`, // Account for settings button space
            width: `calc(${indicatorStyle.width} * 0.88)`,
            transitionTimingFunction: 'var(--ease-spring)',
          }}
        />
        <div className="flex items-center px-2 pt-2 pb-3">
          {/* Main tabs */}
          <div className="flex-1 flex justify-around items-center">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-h-[56px] min-w-[48px] px-2 py-2 transition-all duration-200 ${
                    isActive
                      ? 'text-terracotta scale-105'
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`
                }
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                <span
                  className={`text-2xl mb-1 transition-transform duration-200 ${
                    index === activeIndex ? 'scale-110' : ''
                  }`}
                  style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                >
                  {tab.icon}
                </span>
                <span className="text-xs font-medium">{tab.label}</span>
              </NavLink>
            ))}
          </div>
          {/* Settings button */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[56px] w-12 py-2 transition-all duration-200 ${
                isActive
                  ? 'text-terracotta'
                  : 'text-charcoal/40 hover:text-charcoal/60'
              }`
            }
          >
            <span className="text-xl">⚙️</span>
          </NavLink>
        </div>
      </nav>
    </>
  )
}

export default Navigation
