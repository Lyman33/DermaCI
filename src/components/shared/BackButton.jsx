import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(fallback)}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">Retour</span>
    </button>
  );
}