import React, { useState, useRef } from 'react';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PhotoStep({ onPhotoReady }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(result.file_url);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-primary">Étape 1/2</span>
          <span>Photo</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: '50%' }} />
        </div>
      </div>

      {/* Tip */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary max-w-xs text-center">
        📸 Prenez la photo en lumière naturelle, visage de face, sans filtre ni maquillage.
      </div>

      {/* Photo zone */}
      <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center bg-card overflow-hidden">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Camera className="w-10 h-10 mx-auto mb-2 text-primary/40" />
            <p className="text-xs">Votre photo</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => cameraRef.current?.click()}>
          <Camera className="w-4 h-4" /> Caméra
        </Button>
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => galleryRef.current?.click()}>
          <ImageIcon className="w-4 h-4" /> Galerie
        </Button>
      </div>

      {/* Continue */}
      <Button
        size="lg"
        className="rounded-full px-8 w-full max-w-xs"
        disabled={!photoUrl}
        onClick={() => onPhotoReady(photoUrl)}
      >
        {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload en cours...</> : 'Continuer'}
      </Button>
    </div>
  );
}