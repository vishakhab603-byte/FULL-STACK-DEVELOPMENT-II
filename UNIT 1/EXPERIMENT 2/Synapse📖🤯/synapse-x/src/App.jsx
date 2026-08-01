import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Analytics from './pages/Analytics';
import PerformanceLab from './pages/PerformanceLab';
import Activity from './pages/Activity';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="performance" element={<PerformanceLab />} />
          <Route path="activity" element={<Activity />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
