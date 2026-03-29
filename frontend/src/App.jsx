import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import TaxWizard from './pages/TaxWizard';
import HealthScore from './pages/HealthScore';
import FirePlanner from './pages/FirePlanner';
import CouplesPlanner from './pages/CouplesPlanner';
import './App.css';
import './pages/PageLayout.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app" id="app-root">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/tax-wizard" element={<TaxWizard />} />
            <Route path="/health-score" element={<HealthScore />} />
            <Route path="/fire-planner" element={<FirePlanner />} />
            <Route path="/couples-planner" element={<CouplesPlanner />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
