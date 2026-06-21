import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-black text-primary mb-4">404</h1>
        <p className="text-lg font-semibold text-foreground mb-2">Page introuvable</p>
        <p className="text-sm text-muted-foreground mb-6">Retour à l'accueil dans 3 secondes…</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#00A878,#00C896)' }}>
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
}