// ThamAI frontend script.js (updated)
const response = await fetch("https://https://thamai.onrender.com/api", ...)

const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const audioPlayer = document.getElementById("audioPlayer");

let useFemaleVoice = true;
let darkMode = false;
let ttsBuffer = "";
let ttsTimer = null;
const TTS_CHUNK_SIZE = 200;

function speakBuffered(text){
    ttsBuffer += text;
    if(ttsBuffer.length >= TTS_CHUNK_SIZE){ playTTS(ttsBuffer); ttsBuffer=""; }
    clearTimeout(ttsTimer);
    ttsTimer = setTimeout(()=>{ if(ttsBuffer.length>0){ playTTS(ttsBuffer); ttsBuffer=""; }},1000);
}
function playTTS(text){
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceList = speechSynthesis.getVoices();
    utterance.voice = voiceList.find(v => useFemaleVoice ? /female|woman|female/i.test(v.name) : /male|man/i.test(v.name)) || voiceList[0] || null;
    speechSynthesis.speak(utterance);
}
window.speechSynthesis.onvoiceschanged = ()=>{ console.log("Voices loaded"); };

function appendMessage(sender,text,isCode=false){
    const msg = document.createElement("div"); msg.className = sender;
    if(isCode){
        const pre=document.createElement("pre"); pre.className="code-block";
        pre.textContent = text;
        const copyBtn=document.createElement("button"); copyBtn.className="copy-btn"; copyBtn.textContent="Copy";
        copyBtn.onclick=()=>navigator.clipboard.writeText(text);
        const wrapper=document.createElement("div"); wrapper.className="ai"; wrapper.appendChild(pre); wrapper.appendChild(copyBtn);
        msg.appendChild(wrapper);
        chat.appendChild(msg);
    } else { const span=document.createElement("span"); span.textContent=text; msg.appendChild(span); chat.appendChild(msg); }
    chat.scrollTop=chat.scrollHeight;
    return msg.querySelector("span");
}

sendBtn.addEventListener("click", ()=>{
    const text=userInput.value.trim();
    if(!text) return;
    appendMessage("user",text);
    userInput.value="";
    getAIResponseStreaming(text);
});

async function getAIResponseStreaming(promptText){
    const span = appendMessage("ai","");
    try{
        const response = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:promptText})});
        if(!response.ok) throw new Error("Backend lỗi " + response.status);
        const data = await response.json();
        let aiText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) 
                    || (data.choices && data.choices[0] && data.choices[0].text) 
                    || data.message || "Backend offline không trả lời";
        let isCode = aiText.includes("```");
        if(isCode){
            const match = aiText.match(/```(?:\w+)?\n([\s\S]*?)```/);
            aiText = match ? match[1] : aiText;
        }
        let i=0;
        const interval=setInterval(()=>{
            if(i<aiText.length){ if(span) span.textContent+=aiText[i]; speakBuffered(aiText[i]); i++; chat.scrollTop=chat.scrollHeight; }
            else clearInterval(interval);
        },20);
    }catch(err){ console.error(err); if(span) span.textContent="Lỗi kết nối backend!"; }
}

voiceBtn.addEventListener("click",()=>{
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ alert("Trình duyệt không hỗ trợ ghi âm."); return; }
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        const mediaRecorder=new MediaRecorder(stream);
        let chunks=[];
        mediaRecorder.ondataavailable=e=>chunks.push(e.data);
        mediaRecorder.onstop=()=>{
            const blob=new Blob(chunks,{type:'audio/wav'});
            audioPlayer.src=URL.createObjectURL(blob); audioPlayer.style.display='block';
        };
        mediaRecorder.start();
        setTimeout(()=>mediaRecorder.stop(),5000);
    });
});

toggleVoiceBtn.addEventListener("click",()=>{ useFemaleVoice=!useFemaleVoice; alert(`Đã chuyển sang giọng ${useFemaleVoice?"nữ":"nam"}`); });
toggleDarkMode.addEventListener("click",()=>{ darkMode=!darkMode; document.body.classList.toggle("dark",darkMode); });

userInput.addEventListener("keydown",function(e){ if(e.key==="Enter"){ sendBtn.click(); e.preventDefault(); } });
