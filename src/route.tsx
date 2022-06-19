import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

import Create from './Components/Post/Create';
import App from './App';
import Post from './Components/Post/Post';

function Lensblog() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/create" element={<Create />} />
                <Route path="/post/:publicationId" element={<Post />} />
            </Routes>
        </Router>
    )
}

export default Lensblog;