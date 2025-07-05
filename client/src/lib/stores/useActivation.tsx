
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

// Generate valid activation keys - in production, this should be fetched from a secure backend
const VALID_ACTIVATION_KEYS = [
  'CHEM2024LAB',
  'SCIENCE2024',
  'LABACCESS24',
  'CHEMISTRY2024',
  'VRCHEM2024',
  // Generate some random keys for testing
  generateRandomKey(),
  generateRandomKey(),
  generateRandomKey(),
  'A1B2C3D4E5F6G7H8', // Example 16-char key
  '9Z8Y7X6W5V4U3T2S', // Example 16-char key
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
          console.log('Lab access activated successfully for 30 days');
          return true;
        } else {
          set({
            error: 'Invalid activation key. Please check your 16-character key and try again.',
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
