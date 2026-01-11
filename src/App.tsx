function App() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-softer shadow-soft">
        <h1 className="text-4xl font-bold text-charcoal mb-4">Our Kitchen</h1>
        <p className="text-lg text-charcoal/70">Welcome to your family recipe hub</p>
        <div className="mt-6 flex gap-4 justify-center">
          <span className="px-4 py-2 bg-terracotta text-white rounded-soft">Terracotta</span>
          <span className="px-4 py-2 bg-sage text-white rounded-soft">Sage</span>
          <span className="px-4 py-2 bg-honey text-charcoal rounded-soft">Honey</span>
        </div>
      </div>
    </div>
  )
}

export default App
