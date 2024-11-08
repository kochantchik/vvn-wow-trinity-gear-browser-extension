(() => {
  const itemNodes = document.getElementsByClassName(
    "gear-planner-slots-group-slot"
  );
  const gemsNodes = document.getElementsByClassName(
    "iconsmall gear-planner-slots-group-slot-gem"
  );
  const enchantsNodes = document.getElementsByClassName(
    "iconsmall gear-planner-slots-group-slot-enchant"
  );

  const items = {};
  const addItem = (item) => {
    if (items?.[item]) {
      items[item] += 1;
    } else {
      items[item] = 1;
    }
  };

  Object.values(itemNodes).forEach((itemNode) => {
    const id = itemNode.dataset?.itemId;
    if (id) addItem(id);
  });

  const parseSmallIcons = (nodes, regex) => {
    Object.values(nodes).forEach((node) => {
      const aTag = node.getElementsByTagName("a")?.[0];
      if (aTag && aTag.getAttribute("href")) {
        const id = aTag.getAttribute("href").match(regex);
        if (id) addItem(id);
      }
    });
  };

  const gemRegex = /(?<=item=)\d+/gm;
  const enchRegex = /(?<=spell=)\d+/gm;
  parseSmallIcons(gemsNodes, gemRegex);
  parseSmallIcons(enchantsNodes, enchRegex);
  return JSON.stringify(items);
})();
