// Mapping machine names to their corresponding icon files
export const getMachineIcon = (machineName: string): string | null => {
  const name = machineName.toLowerCase();
  
  // Direct name matches
  const directMatches: Record<string, string> = {
    'bicycle': '/icons/bike.png',
    'bike': '/icons/bike.png',
    'treadmill': '/icons/treadmill.png',
    'stairmaster': '/icons/stairmaster.png',
    'bench press': '/icons/benchpress.png',
    'benchpress': '/icons/benchpress.png',
    'chest press': '/icons/chestpress.png',
    'chestpress': '/icons/chestpress.png',
    'dip': '/icons/dip.png',
    'dips': '/icons/dip.png',
    'dumbell rack': '/icons/dumbellrack.png',
    'dumbbell rack': '/icons/dumbellrack.png',
    'hack squat': '/icons/hacksquat.png',
    'hacksquat': '/icons/hacksquat.png',
    'hamstring curl': '/icons/hamstringcurl.png',
    'hamstringcurl': '/icons/hamstringcurl.png',
    'hip thrust': '/icons/hipthrust.png',
    'hipthrust': '/icons/hipthrust.png',
    'lat pull': '/icons/latpull.png',
    'lat pulldown': '/icons/latpull.png',
    'latpull': '/icons/latpull.png',
    'lateral raise': '/icons/latraise.png',
    'lat raise': '/icons/latraise.png',
    'latraise': '/icons/latraise.png',
    'leg extension': '/icons/legextension.png',
    'legextension': '/icons/legextension.png',
    'leg press': '/icons/legpress.png',
    'legpress': '/icons/legpress.png',
    'pec deck': '/icons/pecdeck.png',
    'pecdeck': '/icons/pecdeck.png',
    'preacher curl': '/icons/preachercurl.png',
    'preachercurl': '/icons/preachercurl.png',
    'pull up': '/icons/pullup.png',
    'pullup': '/icons/pullup.png',
    'pull-up': '/icons/pullup.png',
    'seated calf': '/icons/seatedcalf.png',
    'seatedcalf': '/icons/seatedcalf.png',
    'seated row': '/icons/seatedrow.png',
    'seatedrow': '/icons/seatedrow.png',
    'shoulder press': '/icons/shoulderpress.png',
    'shoulderpress': '/icons/shoulderpress.png',
    'squat rack': '/icons/squatrack.png',
    'squatrack': '/icons/squatrack.png',
    'cable': '/icons/cable.png',
    'cable machine': '/icons/cable.png',
  };

  // Check for direct matches first
  if (directMatches[name]) {
    return directMatches[name];
  }

  // Check for partial matches
  if (name.includes('bike') || name.includes('bicycle')) return '/icons/bike.png';
  if (name.includes('treadmill')) return '/icons/treadmill.png';
  if (name.includes('stair')) return '/icons/stairmaster.png';
  if (name.includes('bench') && name.includes('press')) return '/icons/benchpress.png';
  if (name.includes('chest') && name.includes('press')) return '/icons/chestpress.png';
  if (name.includes('dip')) return '/icons/dip.png';
  if (name.includes('dumbbell') || name.includes('dumbell')) return '/icons/dumbellrack.png';
  if (name.includes('hack') && name.includes('squat')) return '/icons/hacksquat.png';
  if (name.includes('hamstring')) return '/icons/hamstringcurl.png';
  if (name.includes('hip') && name.includes('thrust')) return '/icons/hipthrust.png';
  if (name.includes('lat') && (name.includes('pull') || name.includes('down'))) return '/icons/latpull.png';
  if (name.includes('lateral') || (name.includes('lat') && name.includes('raise'))) return '/icons/latraise.png';
  if (name.includes('leg') && name.includes('extension')) return '/icons/legextension.png';
  if (name.includes('leg') && name.includes('press')) return '/icons/legpress.png';
  if (name.includes('pec') && name.includes('deck')) return '/icons/pecdeck.png';
  if (name.includes('preacher')) return '/icons/preachercurl.png';
  if (name.includes('pull') && name.includes('up')) return '/icons/pullup.png';
  if (name.includes('calf')) return '/icons/seatedcalf.png';
  if (name.includes('seated') && name.includes('row')) return '/icons/seatedrow.png';
  if (name.includes('shoulder') && name.includes('press')) return '/icons/shoulderpress.png';
  if (name.includes('squat') && name.includes('rack')) return '/icons/squatrack.png';
  if (name.includes('cable')) return '/icons/cable.png';

  // Default fallback - return null if no match found
  return null;
};