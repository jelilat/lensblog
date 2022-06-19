import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Components/Header/Header'
import Create from './Components/Post/Create'
import View from './Components/Post/View'

function App() {

  return (
    <div className="App">
        <Header />
        <View />
    </div>
  );
}

export default App;
