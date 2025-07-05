
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

// Local activation keys - random 16-character codes
const VALID_ACTIVATION_KEYS = [
  'K9P3N7M2Q8R5T1W6',
  'X4Z9A1S5D7F3G8H2',
  'B6N8M4V9C3X1Z7Q5',
  'J2L4K6P8Y9U3I5O7',
  'E1R9T3Y6U2I8O4P0',
  'W7Q5A9S1D6F2G8H4',
  'Z3X7C5V1B9N2M6K8',
  'L0J4H7G3F5D9S2A6',
  'T8Y4U6I1O3P7Q9W5',
  'M1N5B7V3C9X2Z4K6'
];

const validateActivationKey = async (key: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const normalizedKey = key.toUpperCase().trim();
  return VALID_ACTIVATION_KEYS.includes(normalizedKey);
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
