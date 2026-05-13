/**
 * Merges PC and SP picture elements into a single responsive picture.
 * PC sources get a min-width media query; SP sources serve as mobile default.
 * @param {HTMLPictureElement} pcPicture
 * @param {HTMLPictureElement} spPicture
 */
function mergeResponsivePictures(pcPicture, spPicture) {
  const pcSources = [...pcPicture.querySelectorAll('source')];
  pcSources.forEach((source) => {
    source.setAttribute('media', '(min-width: 900px)');
  });

  const firstSpSource = spPicture.querySelector('source');
  pcSources.forEach((source) => {
    spPicture.insertBefore(source, firstSpSource);
  });

  pcPicture.remove();
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const pictures = [...block.querySelectorAll('picture')];

  if (pictures.length >= 2) {
    const [pcPicture, spPicture] = pictures;
    mergeResponsivePictures(pcPicture, spPicture);
  }
}
