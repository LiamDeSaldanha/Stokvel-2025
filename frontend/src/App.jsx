import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { CreateStokvel } from './components/CreateStokvel'
import { StokvelList } from './components/StokvelList'
import { StokvelDetail } from './components/StokvelDetail'
import Chat from './components/Chat'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stokvels" element={<StokvelList />} />
          <Route path="/stokvels/create" element={<CreateStokvel />} />
          <Route path="/stokvels/:id" element={<StokvelDetail />} />
          <Route path="/chat" element={
            <ErrorBoundary>
              <Chat />
            </ErrorBoundary>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App