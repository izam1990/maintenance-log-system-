import { Toaster } from '@/components/ui/sonner';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import PasswordReset from '@/pages/PasswordReset';
import InstallPrompt from '@/components/InstallPrompt';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      <InstallPrompt />
    </div>
  );
}

export default App;