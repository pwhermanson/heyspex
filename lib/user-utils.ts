/**
 * Generates user initials from a name string
 * @param name - The user's full name
 * @returns The initials (1-2 characters)
 */
export function getUserInitials(name: string): string {
   if (!name || name.trim().length === 0) {
      return '?';
   }

   const nameParts = name.trim().split(/\s+/);

   if (nameParts.length === 1) {
      // Single name - return first character
      return nameParts[0].charAt(0).toUpperCase();
   }

   // Multiple names - return first character of first and last name
   const firstInitial = nameParts[0].charAt(0).toUpperCase();
   const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

   return firstInitial + lastInitial;
}
