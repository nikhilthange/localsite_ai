import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" className="rounded-xl" onClick={() => window.history.back()}>Go Back</Button>
          <Link to="/">
            <Button variant="outline" className="rounded-xl">Home Page</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
