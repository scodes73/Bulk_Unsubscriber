async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

const runAfterDelay = (fn, delay) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      fn();
      resolve();
    }, delay);
  });

export { runAfterDelay, getActiveTabURL };
