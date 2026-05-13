/**
 * loads and decorates the alternating block
 * Each row contains two columns: text (heading + body) and image.
 * Rows alternate left/right placement on desktop.
 * Add "reverse" variant to start with image-left, text-right.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) {
        col.classList.add('alternating-img');
      } else {
        col.classList.add('alternating-text');
      }
    });
  });
}
