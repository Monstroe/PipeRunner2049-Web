import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import AboutPage from './pages/About/AboutPage';
import HomePage from './pages/Home/HomePage';
import GamePage from './pages/Game/GamePage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:clientID" element={<GamePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
