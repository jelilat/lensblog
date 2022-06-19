import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

import Create from './Components/Post/Create';
import App from './App';

function Lensblog() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/create" element={<Create />} />
            </Routes>
        </Router>
    )
}

export default Lensblog;