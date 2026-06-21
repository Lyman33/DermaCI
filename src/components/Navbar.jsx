import React from 'react';
import { Link } from 'react-router-dom';
import DermaLogo from './DermaLogo';
import { History, Info } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-0">
        <DermaLogo size={48} />
        <span className="font-heading font-bold text-lg">
          <span className="text-foreground">Derma</span>
          <span className="text-primary">CI</span>
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <Link
          to="/analyses"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Mes analyses</span>
        </Link>
        <Link
          to="/#about"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">À propos</span>
        </Link>
      </div>
    </nav>
  );
}