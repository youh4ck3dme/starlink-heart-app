import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from './routes/WelcomeScreen';
import Home from './routes/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;