import React from 'react';
import logo from './logo.svg';
import './App.css';

import Header from './Components/Header/Header'
import Create from './Components/Post/Create'

function App() {
  return (
    <div className="App">
      <Header />
      <Create />
    </div>
  );
}

export default App;
