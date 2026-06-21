import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scan, Loader2 } from 'lucide-react';

export default function FormStep({ onSubmit, isLoading }) {
  const [age, setAge] = useState('');
  const [genre, setGenre] = useState('');
  const [temps, setTemps] = useState('');

  const canSubmit = age && genre && temps && !isLoading;

  return (
    <div className="flex flex-col items-center gap-6 max-w-xs mx-auto w-full">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-primary">Étape 2/2</span>
          <span>Informations</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
        </div>
      </div>

      {/* Age */}
      <div className="w-full space-y-2">
        <Label className="text-sm font-medium">Votre âge</Label>
        <Input
          type="number"
          placeholder="Ex: 25"
          value={age}
          onChange={e => setAge(e.target.value)}
          className="rounded-xl h-12 text-center text-lg"
          min={12}
          max={80}
        />
      </div>

      {/* Genre */}
      <div className="w-full space-y-2">
        <Label className="text-sm font-medium">Genre</Label>
        <div className="grid grid-cols-2 gap-3">
          {['homme', 'femme'].map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`h-12 rounded-xl border-2 font-medium text-sm transition-all ${
                genre === g
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30'
              }`}
            >
              {g === 'homme' ? '👨 Homme' : '👩 Femme'}
            </button>
          ))}
        </div>
      </div>

      {/* Temps */}
      <div className="w-full space-y-2">
        <Label className="text-sm font-medium">Temps pour vos soins</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'peu', label: '5 min', emoji: '⚡' },
            { value: 'modéré', label: '15 min', emoji: '⏱️' },
            { value: 'beaucoup', label: '30 min', emoji: '🧖' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTemps(t.value)}
              className={`h-16 rounded-xl border-2 font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                temps === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className="rounded-full px-8 w-full"
        disabled={!canSubmit}
        onClick={() => onSubmit({ age: parseInt(age), genre, temps_soins: temps })}
      >
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyse en cours...</> : <><Scan className="w-5 h-5 mr-2" /> Analyser ma peau</>}
      </Button>
    </div>
  );
}