/**
 * given a string, abbreviate to the first letter of each provided word, up to the given limit
 * @param s - the string to abbreviate
 * @param limit - the number of letters to abbreviate down to. default: 2.
 */
export function abbreviate(s: string, limit: number = 2): string {
  let abbreviation = '';
  if (s) {
    const reservedWords = ['and', 'or'];
    const words = s.split(/\s/).filter(word => {
      return reservedWords.indexOf(word.toLowerCase()) === -1;
    });
    for (let i = 0; i < words.length; i += 1) {
      const letter = words[i][0];
      if (/[a-zA-Z]/.test(letter)) {
        abbreviation += letter.toUpperCase();
        if (abbreviation.length === limit) {
          break;
        }
      }
    }
  }
  return abbreviation;
}
