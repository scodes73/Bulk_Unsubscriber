const channelNames = {};

const fetchChannelsFromStorage = async () => {
  await chrome.storage.local
    .get("channels")
    .then((val) => Object.assign(channelNames, val["channels"]));
};
const fetchChannelsToPopUp = (response) => {
  fetchChannelsFromStorage();

  if (Object.keys(channelNames).length !== 0) {
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
    chrome.storage.local.set({ channels: { ...channelNames } });
  }
  response(channelNames);
};

chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
  const { type } = obj;
  if (type === "FETCH") {
    fetchChannelsToPopUp(response);
  }
});
//   }
// });
