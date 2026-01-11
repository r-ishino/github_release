export const calculateNextVersion = (currentVersion: string): string => {
  const hasPrefix = currentVersion.startsWith('v');
  const version = hasPrefix ? currentVersion.slice(1) : currentVersion;

  const parts = version.split('.');
  if (parts.length !== 3) {
    return hasPrefix ? `v${version}.1` : `${version}.1`;
  }

  const majorNum = Number.parseInt(parts[0], 10);
  const minorNum = Number.parseInt(parts[1], 10);
  const patchNum = Number.parseInt(parts[2], 10);

  let nextMajor = majorNum;
  let nextMinor = minorNum;
  let nextPatch = patchNum + 1;

  // patch 99 → minor increment, patch reset to 0
  if (nextPatch > 99) {
    nextPatch = 0;
    nextMinor = minorNum + 1;
  }

  // minor 99 → major increment, minor reset to 0
  if (nextMinor > 99) {
    nextMinor = 0;
    nextMajor = majorNum + 1;
  }

  const nextVersion = `${nextMajor}.${nextMinor}.${nextPatch}`;
  return hasPrefix ? `v${nextVersion}` : nextVersion;
};
