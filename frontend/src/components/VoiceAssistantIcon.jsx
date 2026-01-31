import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceAssistantIcon = () => {
  const navigate = useNavigate();
  const [recognition, setRecognition] = useState(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = navigator.language || "en-US";
    recog.continuous = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);

    recog.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      await handleCommand(text);
    };

    setRecognition(recog);
  }, []);

  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = navigator.language || "en-US";
    speechSynthesis.speak(msg);
  };

  const handleCommand = async (text) => {
    console.log("USER SAID:", text);

    try {
      const res = await fetch("http://localhost:4000/api/llm-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText: text }),
      });

      const data = await res.json();
      if (!data.success) {
        speak("AI error");
        return;
      }

      const cmd = data.response;
      console.log("AI RESPONSE:", cmd);

      // 🔹 NAVIGATION
      if (cmd.action === "navigate" && cmd.navigateTo) {
        navigate(cmd.navigateTo);
        speak("Navigating");
        return;
      }

      if (cmd.action === "browser_back") {
        window.history.back();
        return;
      }

      if (cmd.action === "browser_forward") {
        window.history.forward();
        return;
      }

      if (cmd.action === "checkout") {
      navigate("/place-order");
       return;
      }

if (cmd.action === "filter") {
  navigate(`/collection?category=${cmd.filters.category?.toLowerCase()}`);
  return;
}


      // 🔹 SORT
      if (cmd.action === "sort" && cmd.sort) {
        navigate(`/collection?sort=${cmd.sort}`);
        speak("Sorting products");
        return;
      }

      // 🔹 FILTER / SEARCH
      const params = new URLSearchParams();
      const f = cmd.filters || {};

      if (f.category) params.set("category", f.category.toLowerCase());
      if (f.subCategory) params.set("subCategory", f.subCategory.toLowerCase());
      if (f.price_lte) params.set("price_lte", f.price_lte);
      if (f.price_gte) params.set("price_gte", f.price_gte);
      if (cmd.search) params.set("search", cmd.search);

      // ✅ Only navigate if we have filters/search
      if (params.toString()) {
        navigate(`/collection?${params.toString()}`);
        speak("Here are the results");
      } else {
        // 🔥 Fallback — treat speech as search
        navigate(`/collection?search=${encodeURIComponent(text)}`);
        speak("Showing search results");
      }

    } catch (err) {
      console.error("VOICE ERROR:", err);
      speak("Something went wrong");
    }
  };

  return (
    <span onClick={() => recognition?.start()} style={{ cursor: "pointer" }}>
      {listening ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
    </span>
  );
};

export default VoiceAssistantIcon;
