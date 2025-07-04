import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  // decorateBlock,
  // loadBlock,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

// const tabElementMap = {};

// function calculateTabSectionCoordinate(main, lastTabBeginningIndex, targetTabSourceSection) {
//   if (!tabElementMap[lastTabBeginningIndex]) {
//     tabElementMap[lastTabBeginningIndex] = [];
//   }
//   tabElementMap[lastTabBeginningIndex].push(targetTabSourceSection);
// }

// function calculateTabSectionCoordinates(main) {
//   let lastTabIndex = -1;
//   let foldedTabsCounter = 0;
//   const mainSections = [...main.childNodes];
//   main.querySelectorAll('div.section[data-tab-title]')
//     .forEach((section) => {
//       const currentSectionIndex = mainSections.indexOf(section);
//       if (lastTabIndex < 0 || (currentSectionIndex - foldedTabsCounter) !== lastTabIndex) {
//         // we construct a new tabs component, at the currentSectionIndex
//         lastTabIndex = currentSectionIndex;
//         foldedTabsCounter = 0;
//       }
//       foldedTabsCounter += 2;
//       calculateTabSectionCoordinate(main, lastTabIndex, section);
//     });
// }

// async function autoBlockTabComponent(main, targetIndex, tabSections) {
//   // the display none will prevent a major CLS penalty.
//   // franklin will remove this once the blocks are loaded.
//   const section = document.createElement('div');
//   section.setAttribute('class', 'section');
//   section.setAttribute('style', 'display:none');
//   section.dataset.sectionStatus = 'loading';
//   const tabsBlock = document.createElement('div');
//   tabsBlock.setAttribute('class', 'tabs');

//   const tabContentsWrapper = document.createElement('div');
//   tabContentsWrapper.setAttribute('class', 'contents-wrapper');

//   tabsBlock.appendChild(tabContentsWrapper);

//   tabSections.forEach((tabSection) => {
//     tabSection.classList.remove('section');
//     tabSection.classList.add('contents');
//     // remove display: none
//     tabContentsWrapper.appendChild(tabSection);
//     tabSection.style.display = null;
//   });
//   main.insertBefore(section, main.childNodes[targetIndex]);
//   section.append(tabsBlock);
//   decorateBlock(tabsBlock);
//   await loadBlock(tabsBlock);

//   // unset display none manually.
//   // somehow in some race conditions it won't be picked up by lib-franklin.
//   // CLS is not affected
//   section.style.display = null;
// }

// function aggregateTabSectionsIntoComponents(main) {
//   calculateTabSectionCoordinates(main);

//   // when we aggregate tab sections into a tab autoblock, the index get's lower.
//   // say we have 3 tabs starting at index 10, 12 and 14. and then 3 tabs at 18, 20 and 22.
//   // when we fold the first 3 into 1, those will start at index 10. But the other 3 should now
//   // start at 6 instead of 18 because 'removed' 2 sections.
//   let sectionIndexDelta = 0;
//   Object.keys(tabElementMap).map(async (tabComponentIndex) => {
//     const tabSections = tabElementMap[tabComponentIndex];
//     await autoBlockTabComponent(main, tabComponentIndex - sectionIndexDelta, tabSections);
//     sectionIndexDelta = tabSections.length - 1;
//   });
// }

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    // aggregateTabSectionsIntoComponents(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
