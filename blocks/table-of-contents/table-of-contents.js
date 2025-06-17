export default function decorate(block) {
  const toc = document.createElement('div');
  const parent = block.closest('.table-of-contents-container');
  const headingFilter = block.querySelector('p')?.textContent?.split(',') || [];
  const headings = parent.querySelectorAll('h2, h3, h4, h5, h6');
  const headingFilterArray = headingFilter.map((heading) => heading.trim().toLowerCase());

  const filteredHeadings = Array.from(headings).filter((heading) => {
    const headingTag = heading.tagName.toLowerCase();
    // Ensure the heading is in the filter and appears after the block in the DOM
    return (
      headingFilterArray.includes(headingTag)
      /* eslint-disable-next-line no-bitwise */
      && block.parentElement.compareDocumentPosition(heading.closest('div')) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  const tocList = document.createElement('ul');
  filteredHeadings.forEach((heading) => {
    const tocItem = document.createElement('li');
    const tocLink = document.createElement('a');
    const headingId = heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-');
    heading.id = headingId;
    tocLink.href = `#${headingId}`;
    tocLink.textContent = heading.textContent;
    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);
  });
  toc.appendChild(tocList);
  block.replaceChildren(toc);
}
