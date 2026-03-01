export function applyTrackChipSelection(trackSlug) {
  document.querySelectorAll('.skills-chips .chip').forEach(c => c.classList.remove('chip-selected'));
  document.querySelector(`.skills-chips .chip[data-theme="${trackSlug}"]`)
    ?.classList.add('chip-selected');
}
