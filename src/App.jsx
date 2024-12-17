import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NuevoParte from './pages/NuevoParte'
import EditarParte from './pages/EditarParte'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="nuevo-parte" element={<NuevoParte />} />
          <Route path="editar-parte/:id" element={<EditarParte />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
