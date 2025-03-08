import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Exercise from './components/Exercise/Exercise';
import ReviewPage from './components/SessionReview/ReviewPage';
import SessionDetail from './components/SessionReview/SessionDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exercise/:sessionId" element={<Exercise />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/session/:sessionId" element={<SessionDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
