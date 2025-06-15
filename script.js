
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const form = document.getElementById("prompt-form");
const suggestions = document.querySelectorAll(".suggestions-item");
const deleteBtn = document.getElementById("delete-chats-btn");
const themeBtn = document.getElementById("theme-toggle-btn");

// Hide the suggestions area
const hideSuggestions = () => {
  const suggestionsEl = document.querySelector(".suggestions");
  suggestionsEl.style.opacity = "0";
  suggestionsEl.style.pointerEvents = "none";
  setTimeout(() => (suggestionsEl.style.display = "none"), 300);
};

// Parse only **bold** markdown
const parseMarkdown = (text) => {
  if (typeof text !== "string") return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

// Create a chat message bubble
const appendMessage = (text, type, isLoading = false) => {
  const msg = document.createElement("div");
  msg.classList.add("message", `${type}-message`);
  if (isLoading) msg.classList.add("loading");

  const avatar = type === "user" ? "user.jpg" : "bot.jpg";

  msg.innerHTML = `
    <img class="avatar" src="${avatar}" alt="${type}" />
    <div class="message-bubble">
      <p class="message-text">${isLoading ? "" : parseMarkdown(text)}</p>
      ${isLoading ? `
        <div class="loading-indicator">
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
        </div>` : ""
      }
    </div>
  `;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
};

// Main send function
const sendMessage = async (msg) => {
  appendMessage(msg, "user");
  input.value = "";
  appendMessage("", "bot", true);
  document.querySelector(".app-header").style.display = "none";
  hideSuggestions();

  try {
    const res = await puter.ai.chat(msg, { model: "gpt-4o" });
    console.log("🧠 AI raw response:", res);

    // Extract clean response from Puter's GPT-4o response format
    let resultText = "";

    if (typeof res === "string") {
      resultText = res;
    } else if (res?.message?.content) {
      resultText = res.message.content;
    } else if (res?.choices?.[0]?.message?.content) {
      resultText = res.choices[0].message.content;
    } else {
      resultText = JSON.stringify(res);
    }

    // Replace the loading bubble with final response
    const loader = chat.querySelector(".bot-message.loading");
    if (loader) {
      loader.classList.remove("loading");
      const textEl = loader.querySelector(".message-text");
      const bubble = loader.querySelector(".message-bubble");

      if (textEl) textEl.innerHTML = parseMarkdown(resultText);
      const loadingIndicator = bubble?.querySelector(".loading-indicator");
      if (loadingIndicator) loadingIndicator.remove();
    }
  } catch (err) {
    console.error("❌ Error getting response:", err);
    const loader = chat.querySelector(".bot-message.loading");
    if (loader) loader.remove();
    appendMessage("⚠️ Error getting response", "bot");
  }
};

// Handle user prompt form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg) sendMessage(msg);
});

// Handle click on suggestions
suggestions.forEach((item) => {
  item.addEventListener("click", () => {
    const msg = item.querySelector(".text").innerText;
    sendMessage(msg);
  });
});

// Clear all chats
deleteBtn.onclick = () => {
  chat.innerHTML = "";
};

// Toggle light/dark theme
themeBtn.onclick = () => {
  const light = document.body.classList.toggle("light-theme");
  themeBtn.innerText = light ? "dark_mode" : "light_mode";
};
