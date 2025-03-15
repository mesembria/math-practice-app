// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Exercise from './components/Exercise/Exercise';
import ReviewPage from './components/SessionReview/ReviewPage';
import SessionDetail from './components/SessionReview/SessionDetail';

function App() {
  // Get the base URL from the environment or default to empty string
  // This allows the app to work when deployed at /math
  const getBasename = () => {
    // Check if we're running in production mode
    if (import.meta.env.PROD) {
      // In production, check if we're running at a subpath
      const pathArray = window.location.pathname.split('/');
      if (pathArray[1] === 'math') {
        return '/math';
      }
    }
    return '';
  };

  return (
    <BrowserRouter basename={getBasename()}>
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