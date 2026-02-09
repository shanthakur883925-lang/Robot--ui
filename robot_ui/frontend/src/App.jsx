import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RobotSelection from './pages/RobotSelection';
import RobotControl from './pages/RobotControl';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RobotSelection />} />
        <Route path="/control/:id" element={<RobotControl />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
