// Firebase configuration disabled for local testing
console.log('🔧 Firebase disabled - running in local mode');

export const checkFirebaseAvailability = (): boolean => {
  return false; // Always return false to use localStorage fallback
};

export const auth = null;
export const db = null;
export const storage = null;
export default null;