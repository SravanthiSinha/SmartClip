import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { VideoPage } from './pages/VideoPage';
import { VideosListPage } from './pages/VideosListPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/videos" element={<VideosListPage />} />
          <Route path="/video/:videoId" element={<VideoPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
