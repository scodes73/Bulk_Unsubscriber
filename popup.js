import { getActiveTabURL } from "./utils.js";
const activeTab = await getActiveTabURL();
const contentDivElement = document.getElementById("content");
const actionsDivElement = document.getElementById("actions");
// const formContent = document.getElementById("f1");
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
  if (channels) {
    contentDivElement.innerHTML = `Found ${
      Object.keys(channels).length
    } channels
    <form id="f1"></form>`;
    const formContent = document.getElementById("f1");
    contentDivElement.append(formContent);

    for (let i of Object.keys(channels)) {
      addCheckbox(i, channels[i], formContent);
    }
  }
  function addCheckbox(key, value, formContent) {
    const checkbox = document.createElement("input");
    const label = document.createElement("label");
    checkbox.type = "checkbox";
    checkbox.name = key;
    checkbox.className = "channel-checkbox";
    checkbox.value = value;
    checkbox.id = `${key}-${value}`;
    label.htmlFor = `${key}-${value}`;
    label.textContent = value;
    checkbox.addEventListener("change", () => {
      console.log(checkbox.checked, checkbox.value);
    });
    formContent.append(checkbox);
    formContent.append(label);
  }
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

    fetchVals();

    console.log("actual page");
  } else {
    if (!activeTab.url.includes("youtube.com/feed/channels")) {
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML =
        '<div class="title">This is not youtube\'s subscription page.</div>';
    }
  }
}
console.log(document.readyState);
