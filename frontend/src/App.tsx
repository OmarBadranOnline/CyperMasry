import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LabsPage from './pages/LabsPage'
import LabRoute from './pages/LabRoute'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/labs" element={<LabsPage />} />
                {/*
                 * Single dynamic route for all labs.
                 * The :slug maps to a folder in src/labs/:slug/Page.tsx
                 * Add a new lab folder → it automatically becomes routable.
                 */}
                <Route path="/lab/:slug" element={<LabRoute />} />
            </Routes>
        </BrowserRouter>
    )
}
