import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiteNav from './components/SiteNav';
import SiteFooter from './components/SiteFooter';
import ScrollChrome from './components/ScrollChrome';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollChrome />
      <SiteNav />
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
      <SiteFooter />
    </BrowserRouter>
  );
}
