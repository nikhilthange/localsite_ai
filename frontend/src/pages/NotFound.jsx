import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Button from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl sm:text-9xl font-black gradient-text mb-4 leading-none">404</div>
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-4">Page Not Found</h1>
        <p className="text-[rgb(var(--color-text-secondary))] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" className="rounded-2xl" onClick={() => window.history.back()}>
            <FiArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Link to="/">
            <Button variant="outline" className="rounded-2xl">
              <FiHome className="w-4 h-4" /> Home Page
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
