const apiKeyRegex = /sk-[a-zA-Z0-9]{48}/;

const settings = [
  { name: "textCompletion", key: "text-completion" },
  { name: "textImprovement", key: "text-improvement" },
];

function addMessage(message) {
  $("#message-box").append(`<div class="message">${message}</div>`);
}

function addErrorMessage(message) {
  $("#message-box").append(`<div class="error">${message}</div>`);
}

function clearMessages() {
  $("#message-box").empty();
}

async function refreshStorage() {
  chrome.storage.local.get("openAIAPIKey").then(({ openAIAPIKey }) => {
    $("#api-token-form .api-token-status").text(chrome.runtime.lastError || !openAIAPIKey ? "not set" : "set");
  });

  chrome.storage.local.get(settings.map(({ key }) => key)).then((storage) => {
    settings.forEach(({ key }) => {
      $(`#settings-form input[name='${key}']:checkbox`).prop("checked", storage[key]);
    });
  });
}

async function handleAPITokenSet(event) {
  event.preventDefault();
  event.stopPropagation();

  clearMessages();

  const input = $("#api-token-form").find("input[name='api-token']");
  const openAIAPIKey = input.val();
  input.val("");

  if (!openAIAPIKey || !apiKeyRegex.test(openAIAPIKey)) {
    addErrorMessage("Invalid API Token.");
    return;
  }

  try {
    await chrome.storage.local.set({ openAIAPIKey });
  } catch (error) {
    console.log(error);
    addErrorMessage("Failed to set API Token.");
    return;
  }

  await refreshStorage();
}

async function handleAPITokenClear(event) {
  event.preventDefault();
  event.stopPropagation();

  clearMessages();

  try {
    await chrome.storage.local.remove("openAIAPIKey");
  } catch (error) {
    console.log(error);
    addErrorMessage("Failed to remove API Token.");
    return;
  }

  await refreshStorage();
}

function makeHandleSettingChange(name, key) {
  return async (event) => {
    event.preventDefault();
    event.stopPropagation();

    clearMessages();

    const value = event.target.checked;

    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.log(error);
      addErrorMessage(`Failed to set ${name} setting.`);
      return;
    }

    await refreshStorage();
  };
}

$(document).ready(async function () {
  $("#api-token-form .submit").on("click", handleAPITokenSet);
  $("#api-token-form .clear").on("click", handleAPITokenClear);

  settings.forEach(({ name, key }) =>
    $(`#settings-form input[name='${key}']:checkbox`).on("change", makeHandleSettingChange(name, key))
  );
  await refreshStorage();
});
