export const getSportEmoji = (sportType: string): string => {
  const normalizedSport = sportType.toLowerCase()

  const emojiMap: Record<string, string> = {
    // Cycling
    ride: '🚴',
    ebikeride: '⚡',
    virtualride: '💻', // Zwift, etc.
    velomobile: '🚗', // Closest approximation
    handcycle: '♿',

    // Running
    run: '🏃',
    virtualrun: '🏃‍♀️',
    trailrun: '🌲',

    // Swimming
    swim: 'Mf',

    // Hiking / Walking
    hike: '🥾',
    walk: '🚶',

    // Winter Sports
    alpineski: '⛷️',
    backcountryski: '🎿',
    nordicski: '🎿',
    snowboard: '🏂',
    snowshoe: '❄️',
    iceskate: '⛸️',

    // Water Sports
    kayaking: '🛶',
    canoeing: '🛶',
    rowing: '🚣',
    standuppaddling: '🏄', // SUP
    surfing: '🏄',
    kitesurf: '🪁',
    windsurf: '⛵',

    // Gym / Indoor
    weighttraining: '🏋️',
    workout: '💪',
    crosfit: '🏋️‍♀️',
    elliptical: '🏃', // Elliptical trainer
    rockclimbing: '🧗',
    stairstepper: '🪜',
    yoga: '🧘',

    // Other
    golf: '⛳',
    soccer: '⚽',
    tennis: '🎾',
    racquetball: '🎾',
    squash: '🎾',
    badminton: '🏸',
    tabletennis: '🏓',
    pickleball: '🎾',
    basketball: '🏀',
    baseball: '⚾',
    football: '🏈',
    rugby: '🏉',
    volleyball: '🏐',
    cricket: '🏏',
    skateboard: '🛹',
    rollerblade: '🛼',
    wheelchair: '🦽',
    sailing: '⛵',
  }

  // Check for exact match first
  if (emojiMap[normalizedSport]) {
    return emojiMap[normalizedSport]
  }

  // Check for partial matches (e.g., "gravel ride" -> "ride")
  if (normalizedSport.includes('ride')) return '🚴'
  if (normalizedSport.includes('run')) return '🏃'
  if (normalizedSport.includes('ski')) return '⛷️'
  if (normalizedSport.includes('swim')) return 'Mf'

  // Default
  return '🏅'
}
