import { getActiveTabURL } from "./utils.js";
function fetchVals() {
  console.log("aaa");
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "FETCH",
    },
    updateVals
  );
}
function updateVals(channels) {
  console.log(channels);
  contentDivElement.innerHTML = `Found ${Object.keys(channels)}`;
}

const activeTab = await getActiveTabURL();
const actionsDivElement = document.getElementById("actions");
const contentDivElement = document.getElementById("content");
const btn = document.createElement("button");
btn.textContent = "Fetch";

actionsDivElement.append(btn);

btn.addEventListener("click", fetchVals);
