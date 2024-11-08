const createButton = (text, clickEvent) => {
  const button = document.createElement("button");
  button.appendChild(document.createTextNode(text));
  button.addEventListener("click", clickEvent);
  return button;
};

const getBrowser = () => {
  if (
    typeof browser !== "undefined" &&
    typeof browser.runtime !== "undefined"
  ) {
    return browser;
  } else if (
    typeof chrome !== "undefined" &&
    typeof chrome.runtime !== "undefined"
  ) {
    return chrome;
  }
};

const copyText = (text) => {
  void navigator.clipboard.writeText(text);
};

const convertString = (stringToConvert, browser, node) => {
  if (!stringToConvert.length) return;
  let items = {};
  const addItem = (item) => {
    if (items?.[item]) {
      items[item] += 1;
    } else {
      items[item] = 1;
    }
  };

  let obj;
  try {
    obj = JSON.parse(stringToConvert);

    if (obj?.slots) {
      const slots = Object.values(obj.slots);

      if (slots.length) {
        slots.forEach((slot) => {
          if (slot?.item) {
            addItem(slot.item);
          }
          if (slot?.gems) {
            Object.values(slot.gems).forEach((item) => addItem(item));
          }
          if (slot?.enchant) {
            addItem(slot.enchant);
          }
        });

        browser.storage.local.set({ items: items });
        const macroses = createMacros(items);
        displayMacros(macroses, node);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const gatherItems = (browser, node) => {
  browser.tabs
    .executeScript({
      file: "/getIds.js",
    })
    .then((results) => {
      const items = JSON.parse(results[0]);

      browser.storage.local.set({ items: items });
      const macroses = createMacros(items);
      displayMacros(macroses, node);
    });
};

const createMacros = (items) => {
  const macroses = [""];

  let i = 0;
  let stringLength = 0;

  const additemRow = (id, number) => {
    const row = `.additem ${id}${number ? ` ${number}` : ""}\n`;
    stringLength += row.length;
    if (stringLength > 255) {
      i++;
      stringLength = row.length;
    }
    if (macroses?.[i] === undefined) macroses.push("");
    macroses[i] += row;
  };

  if (items) {
    Object.entries(items).forEach(([id, count]) => {
      additemRow(id, count);
    });
  }
  return macroses;
};

const displayMacros = (macroses, node) => {
  if (macroses.length) {
    const children = [];

    macroses.forEach((macrosGroup, index) => {
      const button = createButton(`Copy macros ${index + 1}`, () =>
        copyText(macroses[index])
      );
      children.push(button);
    });
    node.replaceChildren(...children);
  }
};

const copyBagsCommand = () => {
  copyText(".additem 51809 4");
};

(() => {
  const currentBrowser = getBrowser();
  const getTabUrl = async () => {
    const [tab] = await currentBrowser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab;
  };

  getTabUrl().then((tab) => {
    currentBrowser.storage.local.get("items").then((items) => {
      //elements
      const menu = document.getElementById("main-menu");
      const importString = document.getElementById("import-string");
      const generateFromStringBtn = document.getElementById(
        "generate-from-string"
      );
      const addBagsButton = document.getElementById("add-bags");
      const macrosBtnSpace = document.getElementById("macros-btn");

      //events
      generateFromStringBtn.addEventListener("click", () =>
        convertString(importString.value, currentBrowser, macrosBtnSpace)
      );

      addBagsButton.addEventListener("click", copyBagsCommand);

      const isGearPlanner = new RegExp(
        "www.wowhead.+wotlk/(../gear-planner|gear-planner)"
      ).test(tab.url);

      if (isGearPlanner) {
        menu.appendChild(
          createButton("Generate macros from site", () =>
            gatherItems(browser, macrosBtnSpace)
          )
        );
      }

      if (items?.items) {
        const macroses = createMacros(items.items);
        displayMacros(macroses, macrosBtnSpace);
      }
    });
  });
})();
