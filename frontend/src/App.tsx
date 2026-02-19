import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LabsPage from './pages/LabsPage'
import LabRoute from './pages/LabRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './context/AuthContext'
import { ProgressProvider } from './context/ProgressContext'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ProgressProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/labs" element={<LabsPage />} />
                        <Route path="/lab/:slug" element={<LabRoute />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </ProgressProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
