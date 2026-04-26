import { Outlet } from 'react-router-dom';

export default function PagesLayout() {
  return (
    <div className="min-h-screen" style={{ background: '#f0faf5' }}>
      <Outlet />
    </div>
  );
}