export function getAvatarPlaceholder(userId: string | undefined | null, fullName?: string | null): string {
  // If we have a full name, try to predict gender based on Indonesian name patterns
  if (fullName) {
    const nameLower = fullName.toLowerCase().trim();
    
    // Female indicators in Indonesian names
    const femaleIndicators = [
      'putri', 'wati', 'sari', 'fitri', 'ayu', 'lestari', 'sri', 'diah', 'ani', 'dewi', 
      'kartika', 'lia', 'anita', 'rara', 'wulan', 'indah', 'maria', 'sarah', 'dina', 'siti', 
      'rina', 'nanda', 'nurul', 'amalia', 'rahma', 'widya', 'dwi', 'ika', 'ade', 'bell',
      'chacha', 'clara', 'diana', 'elisa', 'fanny', 'gita', 'hana', 'intan', 'jessica',
      'kristina', 'lisa', 'megawati', 'nadia', 'olivia', 'pratiwi', 'queen', 'ratna',
      'selvi', 'tania', 'ulfa', 'valencia', 'widi', 'yanti', 'zhafira', 'lia', 'marlina',
      'nova', 'windy', 'yuliana'
    ];
    
    // Male indicators in Indonesian names
    const maleIndicators = [
      'putra', 'wawan', 'budi', 'agus', 'andi', 'diki', 'dika', 'reza', 'fajar', 'surya',
      'eka', 'rama', 'hendra', 'tomi', 'arif', 'bambang', 'dadang', 'dodi',
      'eko', 'faisal', 'gunawan', 'hadi', 'irfan', 'joko', 'kurniawan', 'lukman',
      'mulyadi', 'nugroho', 'ony', 'prabowo', 'rifqi', 'setiawan', 'taufik', 'udin',
      'yusuf', 'zainal', 'ahmad', 'muhammad', 'bintang', 'fadhil', 'hidayat', 'abdul',
      'ridwan', 'rizky', 'bagus', 'aditya', 'deni', 'danang', 'galih', 'gilang', 'rio'
    ];

    // Split into individual words
    const words = nameLower.split(/\s+/);
    
    // 1. Check exact word match against indicators
    for (const word of words) {
      if (femaleIndicators.some(indicator => word === indicator || word.endsWith(indicator))) {
        return '/profile/cewek.png';
      }
      if (maleIndicators.some(indicator => word === indicator || word.endsWith(indicator))) {
        return '/profile/cowok.png';
      }
    }

    // 2. Check substring match
    if (femaleIndicators.some(indicator => nameLower.includes(indicator))) {
      return '/profile/cewek.png';
    }
    if (maleIndicators.some(indicator => nameLower.includes(indicator))) {
      return '/profile/cowok.png';
    }

    // 3. Simple suffix heuristic (Indonesian female names often end in 'a' or 'i')
    const lastChar = nameLower.charAt(nameLower.length - 1);
    if (lastChar === 'a' || lastChar === 'i') {
      return '/profile/cewek.png';
    }
  }

  // Fallback to deterministic hash of userId
  if (!userId) return '/profile/cowok.png';
  const cleanId = userId.replace(/-/g, '');
  let sum = 0;
  for (let i = 0; i < cleanId.length; i++) {
    sum += cleanId.charCodeAt(i);
  }
  return sum % 2 === 0 ? '/profile/cowok.png' : '/profile/cewek.png';
}
