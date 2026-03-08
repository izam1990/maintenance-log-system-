import { Toaster } from '@/components/ui/sonner';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import InstallPrompt from '@/components/InstallPrompt';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      <InstallPrompt />
    </div>
  );
}

export default App;