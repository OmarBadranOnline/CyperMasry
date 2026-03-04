import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LabsPage from './pages/LabsPage'
import LabRoute from './pages/LabRoute'
import { ProgressProvider } from './context/ProgressContext'

export default function App() {
    return (
        <BrowserRouter>
            <ProgressProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/labs" element={<LabsPage />} />
                    <Route path="/lab/:slug" element={<LabRoute />} />
                </Routes>
            </ProgressProvider>
        </BrowserRouter>
    )
}
