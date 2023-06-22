const channelNames = {};

const fetchChannelsFromStorage = async () => {
  await chrome.storage.local
    .get("channels")
    .then((val) => Object.assign(channelNames, val["channels"]));
};
const fetchChannelsToPopUp = async (response, fresh = false) => {
  if (!fresh) fetchChannelsFromStorage();

  if (Object.keys(channelNames).length !== 0 && !fresh) {
    response(channelNames);
  } else {
    const channels = Array.from(
      document.getElementsByTagName(`ytd-channel-renderer`)
    );
    Object.assign(
      channelNames,
      channels.reduce((previousObject, currentObject) => {
        return Object.assign(previousObject, {
          [currentObject.getElementsByTagName("yt-formatted-string")[1]
            .innerText]: currentObject
            .getElementsByTagName("a")[0]
            .href.slice(25),
        });
      }, {})
    );
    await chrome.storage.local.set({ channels: { ...channelNames } });
  }
  response(channelNames);
};
async function nukeChannels(excludedList, response) {
  const runAfterDelay = (fn, delay) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        fn();
        resolve();
      }, delay);
    });
  const channels = Array.from(
    document.getElementsByTagName(`ytd-channel-renderer`)
  ).filter(
    (e) => !excludedList.includes(e.getElementsByTagName("a")[0].href.slice(25))
  );
  let ctr = 0;
  response(channels.length);
  for (const channel of channels) {
    channel.querySelector(`[aria-label^='Unsubscribe from']`).click();
    await runAfterDelay(() => {
      document
        .getElementsByTagName(`yt-confirm-dialog-renderer`)[0]
        .querySelector(`[aria-label^='Unsubscribe']`)
        .click();
      ctr++;
    }, 150);
  }
}

chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
  const { type } = obj;
  if (type === "FETCH") {
    fetchChannelsToPopUp(response, obj.fresh);
  } else if (type === "NUKE") {
    await nukeChannels(
      obj.vals.map((str) => str.substring(3)),
      response
    );
    response();
  }
});
