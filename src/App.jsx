import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import Home from '@/pages/Home.jsx';
import PagesLayout from './components/PagesLayout';

// Lazy load pages not needed on initial load
const Blog = lazy(() => import('@/pages/Blog.jsx'));
const BlogPost = lazy(() => import('@/pages/BlogPost.jsx'));
const TeacherCommunity = lazy(() => import('@/pages/TeacherCommunity.jsx'));
const AdminPage = lazy(() => import('@/pages/AdminPage.jsx'));
const SiteEditor = lazy(() => import('@/pages/SiteEditor.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<PagesLayout />}>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Route>
          <Route path="/community" element={<TeacherCommunity />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/editor" element={<SiteEditor />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
