import { getActiveTabURL, runAfterDelay } from "./utils.js";
const activeTab = await getActiveTabURL();
const contentBannerDivElement = document.getElementById("found-banner");
const actionsDivElement = document.getElementById("actions");
const nukeForm = document.getElementById("nuke-form");
const excludeForm = document.getElementById("exclude-form");
const selectedList = [];
//TODO: checkup if we actually need this
let allChannels = {};

async function fetchVals(fresh = false) {
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "FETCH",
      fresh: fresh,
    },
    updateVals
  );
}

function nukeVals() {
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "NUKE",
      vals: selectedList,
    },
    reloadPage
    // () => {}
  );
}
function placeCheckboxes(channels) {
  nukeForm.innerHTML = ` <form id="nuke-form">Nuke list</form>`;
  excludeForm.innerHTML = ` <form id="exclude-form">Excluded list</form>`;
  for (let i of Object.keys(channels)) {
    if (selectedList.includes(`id-${channels[i]}`)) {
      addCheckbox(i, channels[i], excludeForm, true);
    } else {
      addCheckbox(i, channels[i], nukeForm, false);
    }
  }
}

function reloadPage(ctr) {
  runAfterDelay(() => {
    console.log(
      (Object.keys(allChannels).length - selectedList.length) * 160 + 10
    );
    chrome.tabs.reload();
    //figuring out a way to refresh the popup on reload
  }, 1500 + ctr * 160 + 10);
}

async function updateVals(channels) {
  console.log(channels);
  await chrome.storage.local
    .get("selectedList")
    .then((val) => Object.assign(selectedList, val["selectedList"]));
  if (channels) {
    contentBannerDivElement.innerHTML = `Found ${
      Object.keys(channels).length
    } channels
    `;
    placeCheckboxes(channels);
    allChannels = channels;
  }
}

async function addToCheckList(id) {
  selectedList.push(id);
  await chrome.storage.local.set({ selectedList: selectedList });
  var checkbox = nukeForm.querySelector(`[id = ${id}]`);
  var label = checkbox.nextSibling;
  checkbox.checked = true;
  excludeForm.append(checkbox);
  excludeForm.append(label);
}

function removeAllFromCheckList() {
  while (selectedList.length > 0) {
    const id = selectedList[0];
    removeFromCheckList(id);
  }
}

async function removeFromCheckList(id) {
  const index = selectedList.indexOf(id);
  if (index > -1) {
    selectedList.splice(index, 1);
    await chrome.storage.local.set({ selectedList: selectedList });
    var checkbox = excludeForm.querySelector(`[id = ${id}]`);
    checkbox.checked = false;
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
  checkbox.id = `id-${value}`;
  label.htmlFor = `id-${value}`;
  label.textContent = `${key} @ ${value}`;
  checkbox.addEventListener("change", function (e) {
    if (this.checked) {
      addToCheckList(this.id);
    } else {
      removeFromCheckList(this.id);
    }
  });
  formContent.append(checkbox);
  formContent.append(label);
}

function addPage() {
  actionsDivElement.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = "Nuke";
  actionsDivElement.append(btn);
  btn.addEventListener("click", nukeVals);
  const btn1 = document.createElement("button");
  btn1.textContent = "clear excluded";
  actionsDivElement.append(btn1);
  btn1.addEventListener("click", async () => {
    removeAllFromCheckList();
  });
}

if (document.readyState !== "loading") {
  if (activeTab.url.includes("youtube.com/feed/channels")) {
    addPage();
    fetchVals();
  } else {
    if (!activeTab.url.includes("youtube.com/feed/channels")) {
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML =
        '<div class="title">This is not youtube\'s subscription page.</div>';
      const redirectButton = document.createElement("button");
      redirectButton.textContent = "Take me there";
      container.append(redirectButton);
      redirectButton.addEventListener("click", () => {
        chrome.tabs.update(activeTab.id, {
          url: "https://www.youtube.com/feed/channels",
        });
      });
    }
  }
}
