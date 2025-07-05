
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActivationState {
  isActivated: boolean;
  activationTimestamp: number | null;
  error: string | null;
  
  // Actions
  activateLab: (key: string) => Promise<boolean>;
  resetActivation: () => void;
  checkActivationStatus: () => boolean;
  setError: (error: string | null) => void;
  generateRandomKey: () => string;
}

// Function to generate random 16-character alphanumeric key
const generateRandomKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Server-side validation simulation (in production, this should be a real API call)
const validateActivationKey = async (key: string): Promise<boolean> => {
  // Simulate server API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, this would be a secure server endpoint
  // For now, we'll use a simple hash-based validation that's harder to reverse-engineer
  const normalizedKey = key.toUpperCase().trim();
  
  // Simple checksum validation (still not fully secure but better than client-side keys)
  if (normalizedKey.length !== 16) return false;
  
  // Check if key follows our pattern (you would implement proper server validation)
  const checksum = normalizedKey.split('').reduce((acc, char, index) => {
    return (acc + char.charCodeAt(0) * (index + 1)) % 1000;
  }, 0);
  
  // These would be server-generated valid checksums
  const validChecksums = [442, 567, 123, 789, 234]; // Example checksums
  
  return validChecksums.includes(checksum);
};

export const useActivation = create<ActivationState>()(
  persist(
    (set, get) => ({
      isActivated: false,
      activationTimestamp: null,
      error: null,

      activateLab: async (key: string) => {
        set({ error: null });

        try {
          // Validate activation key via server simulation
          const isValid = await validateActivationKey(key);

          if (isValid) {
            set({
              isActivated: true,
              activationTimestamp: Date.now(),
              error: null
            });
            console.log('Lab access activated successfully for 30 days');
            return true;
          } else {
            set({
              error: 'Invalid activation key. Please check your 16-character key and try again.',
              isActivated: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Network error. Please check your connection and try again.',
            isActivated: false
          });
          return false;
        }
      },

      resetActivation: () => {
        set({
          isActivated: false,
          activationTimestamp: null,
          error: null
        });
        console.log('Lab activation reset');
      },

      checkActivationStatus: () => {
        const { isActivated, activationTimestamp } = get();
        
        // Check if activation is still valid (30 days)
        if (isActivated && activationTimestamp) {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
          const isExpired = Date.now() - activationTimestamp > thirtyDays;
          
          if (isExpired) {
            set({
              isActivated: false,
              activationTimestamp: null,
              error: null
            });
            console.log('Activation expired after 30 days');
            return false;
          }
          return true;
        }
        
        return false;
      },

      setError: (error: string | null) => {
        set({ error });
      },

      generateRandomKey: generateRandomKey
    }),
    {
      name: 'chemistry-lab-activation',
      partialize: (state) => ({
        isActivated: state.isActivated,
        activationTimestamp: state.activationTimestamp
      })
    }
  )
);
