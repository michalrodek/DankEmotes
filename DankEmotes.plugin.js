/**
 * @name DankEmotes
 * @author Majrik
 * @description Adds support for Twitch Emotes.
 * @version 0.3.6
 */

let emotes = {};

async function getEmotes() {
  const resp = await fetch(
    "https://api.michalrodek.cz/betterdiscord/dankemotes.json",
    {
      cache: "no-cache",
    }
  );
  emotes = await resp.json();
}

getEmotes();

module.exports = () => ({
  start() {},
  stop() {},
  observer({ addedNodes }) {
    if (addedNodes.length > 0) {
      if (typeof addedNodes[0].className !== "string") return;

      if (addedNodes[0].className?.includes("messageListItem-ZZ7v6g")) {
        Array.from(
          addedNodes[0].querySelector(".messageContent-2t3eCI").childNodes
        ).map((node) => {
          replaceNode(node);
        });
      }
    }
  },
  onSwitch() {
    Array.from(document.querySelectorAll(".messageContent-2t3eCI")).map(
      (parentNode) => {
        Array.from(parentNode.childNodes).map((node) => {
          replaceNode(node);
        });
      }
    );
  },
});

const replaceNode = (node) => {
  if (node.nodeType !== 3) return;

  const foundEmotes = Object.keys(emotes.MyEmotes)
    .map((emote) => {
      if (emote.includes(")")) return;

      if (
        emote.length > 3 &&
        node.textContent.match(new RegExp(`\\b${emote}\\b`))
      ) {
        let img = document.createElement("img");
        img.src = emotes.MyEmotes[emote];
        img.setAttribute("emote", emote);
        img.alt = emote;

        return {
          img: img,
          name: emote,
        };
      }
    })
    .filter((emote) => emote != null);

  if (foundEmotes.length === 0) return;

  const nodes = node.textContent.split(" ");

  const newNodes = nodes.map((node) => {
    const found = foundEmotes.find((emote) => {
      if (node === emote.name) {
        return true;
      }

      return false;
    });

    if (found) {
      return found.img;
    }

    return node + " ";
  });

  const onlyEmotes = newNodes.every((node) => node instanceof HTMLElement);

  const frg = document.createDocumentFragment();

  newNodes.map((node) => {
    if (node instanceof HTMLElement) {
      node.style.width = onlyEmotes ? "48px" : "22px";
      const clonedNode = node.cloneNode();

      clonedNode.onmouseover = () => {
        BdApi.UI.createTooltip(clonedNode, clonedNode.getAttribute("emote"), {
          style: "primary",
        });
      };

      frg.append(clonedNode);
      frg.append(" ");
    } else {
      frg.append(node);
    }
  });

  node.replaceWith(frg);
};
