// Ejemplo de App.jsx modular para tu VS Code local
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PensumProvider } from './context/PensumContext';
import Layout from './components/layout/Layout';

// Imports de tus archivos externos
import Welcome from './pages/Welcome/Welcome';
import AuthContainer from './pages/Auth/AuthContainer';
import Onboarding from './pages/Auth/Onboarding';
import AdminPanel from './pages/Admin/AdminPanel';
import Dashboard from './pages/Dashboard/Dashboard';
import Enrollment from './pages/Enrollment/Enrollment';
import Schedule from './pages/Schedule/Schedule';
import Classroom from './pages/Classroom/Classroom';

function App() {
    return (
        <PensumProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/auth" element={<AuthContainer />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/app" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="inscripciones" element={<Enrollment />} />
                        <Route path="horario" element={<Schedule />} />
                        <Route path="aula-virtual" element={<Classroom />} />
                        <Route path="admin-panel" element={<AdminPanel />} />
                    </Route>
                </Routes>
            </Router>
        </PensumProvider>
    );
}

export default App;