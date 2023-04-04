class OpenAIAPI {
  static defaultModel = "text-curie-001";

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  query(endpoint, data) {
    return new Promise((resolve, reject) => {
      const url = `https://api.openai.com/v1/${endpoint}`;

      if (!data.model) data.model = OpenAIAPI.defaultModel;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${this.apiKey}`);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) return reject("Failed to query OpenAI API.");

        const jsonResponse = JSON.parse(xhr.responseText);

        if (!jsonResponse.choices) return reject("Failed to query OpenAI API.");

        return resolve(jsonResponse.choices);
      };

      xhr.send(JSON.stringify(data));
    });
  }

  async improveText(text) {
    const data = {
      model: "code-davinci-edit-001",
      input: text,
      instruction:
        "Correct any spelling mistakes, grammar mistakes, and improve the overall style of the (latex) text.",
      n: 1,
      temperature: 0.5,
    };

    const result = await this.query("edits", data);

    return result[0].text;
  }
}

(function () {
  const apiKey = "";
  const openAI = new OpenAIAPI(apiKey);

  function replaceSelectedText(replacementText) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(replacementText));
    }
  }

  async function onKeyPress(event) {
    if (!event.ctrlKey || event.key !== " ") return;

    const selectedText = window.getSelection().toString();

    if (!selectedText) return;

    event.preventDefault();
    const editedText = await openAI.improveText(selectedText);

    replaceSelectedText(editedText);
  }

  document.addEventListener("keydown", onKeyPress, false);
})();
