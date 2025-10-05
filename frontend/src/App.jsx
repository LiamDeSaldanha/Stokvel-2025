import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { CreateStokvel } from './components/CreateStokvel'
import { StokvelList } from './components/StokvelList'
import { StokvelDetail } from './components/StokvelDetail'
import PaymentForm from './components/PaymentForm'
import Chat from './components/Chat'
import ErrorBoundary from './components/ErrorBoundary'
// Converted Angular components
import Home from './components/vannessa/Home'
import Login from './components/vannessa/Login'
import Register from './components/vannessa/Register'
import Upload from './components/vannessa/Upload'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/stokvels" element={<StokvelList />} />
          <Route path="/stokvels/create" element={<CreateStokvel />} />
          <Route path="/stokvels/:id" element={<StokvelDetail />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/payment/:stokvelId" element={<PaymentForm />} />
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