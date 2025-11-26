// Minimal frontend example - edit API_URL to your backend
const API_URL = window.API_URL || "https://YOUR_RENDER_BACKEND_URL/api";

const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(sender, text){
  const el = document.createElement("div");
  el.className = sender;
  el.textContent = text;
  chat.appendChild(el);
}

sendBtn.addEventListener("click", async ()=>{
  const prompt = userInput.value.trim();
  if(!prompt) return;
  appendMessage("user", prompt);
  userInput.value = "";
  try{
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const aiText = (data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || data.reply || "Không có phản hồi";
    appendMessage("ai", aiText);
  } catch(e){
    appendMessage("ai","Lỗi kết nối backend: " + e.message);
  }
});
