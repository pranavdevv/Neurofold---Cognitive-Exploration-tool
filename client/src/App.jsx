import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CanvasPage from './pages/CanvasPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/canvas/:id" element={<CanvasPage />} />
      </Routes>
    </Router>
  );
}

export default App;
