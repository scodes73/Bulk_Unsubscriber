// const fetchBookmarks = () => {
//   return new Promise((resolve) => {
//     chrome.storage.sync.get("channels", (obj) => {
//       resolve(obj["channels"] ? JSON.parse(obj[channels]) : []);
//     });
//   });
// };

// const addNewBookmarkEventHandler = async () => {
//   const currentTime = youtubePlayer.currentTime;
//   const newBookmark = {
//     time: currentTime,
//     desc: "Bookmark at " + getTime(currentTime),
//   };
// };

// chrome.tabs.onUpdated.addListener(() => {
//   console.log("updated");
// });
const channelNames = {};

const ready = function (cb) {
  document.readyState === "loading"
    ? // The document is still loading
      document.addEventListener("DOMContentLoaded", function (e) {
        console.log("ccccccccccc");
        cb();
      })
    : // The document is loaded completely
      cb();
};
const fetchChannelsFromStorage = async () => {
  await chrome.storage.local
    .get("channels")
    .then((val) => Object.assign(channelNames, val["channels"]));
};
const fetchChannelsToPopUp = (response) => {
  fetchChannelsFromStorage();

  if (Object.keys(channelNames).length !== 0) {
    console.log("already  present");
    response(channelNames);
  } else {
    console.log("already not present");

    const channels = Array.from(
      document.getElementsByTagName(`ytd-channel-renderer`)
    );
    console.log(channels);
    Object.assign(
      channelNames,
      channels.reduce((previousObject, currentObject) => {
        console.log(currentObject.getElementsByTagName("a")[0].href.slice(25));
        return Object.assign(previousObject, {
          [currentObject.getElementsByTagName("yt-formatted-string")[1]
            .innerText]: currentObject
            .getElementsByTagName("a")[0]
            .href.slice(25),
        });
      }, {})
    );
    console.log(channelNames);
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
