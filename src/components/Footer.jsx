import React from 'react';
import DermaLogo from './DermaLogo';

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border bg-card/50">
      <div className="max-w-md mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-0">
          <DermaLogo size={40} />
          <span className="font-heading font-bold text-base">
            <span className="text-foreground">Derma</span>
            <span className="text-primary">CI</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Made with ❤️ in Côte d'Ivoire</p>
      </div>
    </footer>
  );
}