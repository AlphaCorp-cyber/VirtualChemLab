
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
}

// Valid activation keys - in production, this should be fetched from a secure backend
const VALID_ACTIVATION_KEYS = [
  'CHEM2024LAB',
  'SCIENCE2024',
  'LABACCESS24',
  'CHEMISTRY2024',
  'VRCHEM2024'
];

export const useActivation = create<ActivationState>()(
  persist(
    (set, get) => ({
      isActivated: false,
      activationTimestamp: null,
      error: null,

      activateLab: async (key: string) => {
        set({ error: null });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validate activation key
        const normalizedKey = key.toUpperCase().trim();
        const isValid = VALID_ACTIVATION_KEYS.includes(normalizedKey);

        if (isValid) {
          set({
            isActivated: true,
            activationTimestamp: Date.now(),
            error: null
          });
          console.log('Lab access activated successfully');
          return true;
        } else {
          set({
            error: 'Invalid activation key. Please check your key and try again.',
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
        
        // Check if activation is still valid (24 hours)
        if (isActivated && activationTimestamp) {
          const twentyFourHours = 24 * 60 * 60 * 1000;
          const isExpired = Date.now() - activationTimestamp > twentyFourHours;
          
          if (isExpired) {
            set({
              isActivated: false,
              activationTimestamp: null,
              error: null
            });
            return false;
          }
          return true;
        }
        
        return false;
      },

      setError: (error: string | null) => {
        set({ error });
      }
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
