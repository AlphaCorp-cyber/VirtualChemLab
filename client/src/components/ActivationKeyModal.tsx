
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Key, AlertCircle } from 'lucide-react';

interface ActivationKeyModalProps {
  isOpen: boolean;
  onActivate: (key: string) => void;
  onClose?: () => void;
  error?: string;
}

export function ActivationKeyModal({ isOpen, onActivate, onClose, error }: ActivationKeyModalProps) {
  const [activationKey, setActivationKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey.trim()) return;

    setIsSubmitting(true);
    try {
      await onActivate(activationKey.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activationKey.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            Lab Activation Required
          </DialogTitle>
          <DialogDescription>
            Enter your 16-character activation key to access the Virtual Chemistry Lab for the first time.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="activation-key" className="text-sm font-medium">
              Activation Key
            </label>
            <Input
              id="activation-key"
              type="text"
              placeholder="Enter 16-character key (e.g., A1B2C3D4E5F6G7H8)"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center tracking-widest font-mono"
              disabled={isSubmitting}
              autoFocus
              maxLength={16}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={!activationKey.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Activating...' : 'Activate Lab Access'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          This activation is valid for 30 days. Keys are 16 characters (letters and numbers).
        </div>
      </DialogContent>
    </Dialog>
  );
}
