chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const { type } = obj;
  if (type === "FETCH") {
    const channels = Array.from(
      document.getElementsByTagName(`ytd-channel-renderer`)
    );
    const channelNames = channels.reduce((previousObject, currentObject) => {
      return Object.assign(previousObject, {
        [currentObject.getElementsByTagName("yt-formatted-string")[1]
          .innerText]: currentObject
          .getElementsByTagName("a")[0]
          .href.slice(25),
      });
    }, {});

    console.log(channelNames);
    response(channelNames);
  }
});
