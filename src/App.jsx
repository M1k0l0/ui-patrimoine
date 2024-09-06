import React from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Possessions from './ListPossession';
import Header from './Header';
import PatrimoineSite from './PatrimoinePage';

function App() {
  return (
    <div>
    <Header />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Possessions />} />
        <Route path="/patrimoine" element={<PatrimoineSite />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}


export default App;