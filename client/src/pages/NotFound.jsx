import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/index.jsx';
import { Logo } from '../components/layout/Logo.jsx';

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50 px-4 dark:bg-ink-950">
      <div className="w-full max-w-md text-center">
        <Logo className="justify-center" size={44} showWordmark={false} />
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="mt-2 font-display text-3xl font-bold">This page isn't on the campus map</h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
          The page you're looking for may have moved, or you may not have access to it.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/app">
            <Button icon={Compass}>Back to dashboard</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
