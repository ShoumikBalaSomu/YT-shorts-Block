// Protocol Alpha: requestIdleCallback DOM Mutation Offloading
// Offloads heavy DOM scanning to the browser's idle thread, preventing video stuttering

const observeDOM = () => {
  const observer = new MutationObserver((mutations) => {
    window.requestIdleCallback(() => {
      // Find all shorts shelves and destroy them
      const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer');
      shortsShelves.forEach(shelf => shelf.remove());
    }, { timeout: 1000 });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

observeDOM();
