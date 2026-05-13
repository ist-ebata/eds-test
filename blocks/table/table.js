/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(isHeader, scope) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader && scope) cell.setAttribute('scope', scope);
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const rowHeader = block.classList.contains('row-header');
  const colHeader = block.classList.contains('col-header');
  if (rowHeader) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    const isHeaderRow = rowHeader && i === 0;
    if (isHeaderRow) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col, j) => {
      let cell;
      if (isHeaderRow) {
        cell = buildCell(true, 'col');
      } else if (colHeader && j === 0) {
        cell = buildCell(true, 'row');
      } else {
        cell = buildCell(false);
      }
      const align = col.getAttribute('data-align');
      const valign = col.getAttribute('data-valign');
      if (align) cell.style.textAlign = align;
      if (valign) cell.style.verticalAlign = valign;
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);
}