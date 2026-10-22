import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { BuildCatalogPage } from './pages/BuildCatalogPage';
import { BuildDetailPage } from './pages/BuildDetailPage';
import { BuildGeneratorPage } from './pages/BuildGeneratorPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#0D0F0D] text-[#F3F5EF]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/builds" element={<BuildCatalogPage />} />
            <Route path="/builds/:slug" element={<BuildDetailPage />} />
            <Route path="/generate/:slug" element={<BuildGeneratorPage />} />
            <Route path="/admin" element={<AdminPortalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
