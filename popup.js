import { getActiveTabURL } from "./utils.js";
const activeTab = await getActiveTabURL();
const contentBannerDivElement = document.getElementById("found-banner");
const actionsDivElement = document.getElementById("actions");
const nukeForm = document.getElementById("nuke-form");
const excludeForm = document.getElementById("exclude-form");
const selectedList = [];

async function fetchVals() {
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "FETCH",
    },
    updateVals
  );
  await chrome.storage.local
    .get("selectedList")
    .then((val) => Object.assign(selectedList, val["selectedList"]));
}

function placeCheckboxes(channels) {
  for (let i of Object.keys(channels)) {
    if (selectedList.includes(channels[i])) {
      addCheckbox(i, channels[i], excludeForm, true);
    } else {
      addCheckbox(i, channels[i], nukeForm, false);
    }
  }
}

function updateVals(channels) {
  if (channels) {
    contentBannerDivElement.innerHTML = `Found ${
      Object.keys(channels).length
    } channels
    `;
    placeCheckboxes(channels);
  }
}

function addToCheckList(id) {
  selectedList.push(id);
  chrome.storage.local.set({ selectedList: selectedList });
  var checkbox = nukeForm.querySelector(`input[value = ${id}]`);
  var label = checkbox.nextSibling;
  checkbox.checked = true;
  excludeForm.append(checkbox);
  excludeForm.append(label);
}

function removeFromCheckList(id) {
  const index = selectedList.indexOf(id);
  if (index > -1) {
    selectedList.splice(index, 1);

    chrome.storage.local.set({ selectedList: selectedList });
    var checkbox = excludeForm.querySelector(`input[value = ${id}]`);
    var label = checkbox.nextSibling;
    nukeForm.append(checkbox);
    nukeForm.append(label);
  }
}

function addCheckbox(key, value, formContent, checked) {
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  checkbox.type = "checkbox";
  checkbox.name = key;
  checkbox.className = "channel-checkbox";
  checkbox.value = value;
  checkbox.checked = checked;
  checkbox.id = `${key}-${value}`;
  label.htmlFor = `${key}-${value}`;
  label.textContent = `${key} @ ${value}`;
  checkbox.addEventListener("change", function (e) {
    if (this.checked) {
      addToCheckList(this.value);
    } else {
      removeFromCheckList(this.value);
    }
  });
  formContent.append(checkbox);
  formContent.append(label);
}

// function addPage() {
//   const btn = document.createElement("button");
//   btn.textContent = "Fetch";

//   actionsDivElement.append(btn);

//   btn.addEventListener("click", fetchVals);
// }

if (document.readyState !== "loading") {
  if (activeTab.url.includes("youtube.com/feed/channels")) {
    // addPage();
    // await chrome.storage.local
    //   .get("selectedList")
    //   .then((val) => Object.assign(selectedList, val["selectedList"]));
    fetchVals();
  } else {
    if (!activeTab.url.includes("youtube.com/feed/channels")) {
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML =
        '<div class="title">This is not youtube\'s subscription page.</div>';
    }
  }
}
