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
    const res = await fetch("http://localhost:4000/api/llm-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText: text }),
    });

    const data = await res.json();
    if (!data.success) return;

    const cmd = data.response;

    /* NAVIGATION */
    if (cmd.action === "navigate" && cmd.navigateTo) {
      navigate(cmd.navigateTo);
      speak("Navigating");
      return;
    }

    if (cmd.action === "browser_back") {
      history.back();
      return;
    }

    if (cmd.action === "browser_forward") {
      history.forward();
      return;
    }

    /* SORT */
    if (cmd.action === "sort" && cmd.sort) {
      navigate(`/collection?sort=${cmd.sort}`);
      speak("Sorting");
      return;
    }

    /* FILTER / SEARCH → URL ONLY */
    const params = new URLSearchParams();

    const f = cmd.filters || {};

    if (f.category) params.set("category", f.category.toLowerCase());
    if (f.subCategory) params.set("subCategory", f.subCategory.toLowerCase());
    if (f.price_lte) params.set("price_lte", f.price_lte);
    if (f.price_gte) params.set("price_gte", f.price_gte);

    if (cmd.search) params.set("search", cmd.search);

    navigate(`/collection?${params.toString()}`);
    speak("Here are the results");
  };

  return (
    <span onClick={() => recognition?.start()}>
      {listening ? <FaMicrophone /> : <FaMicrophoneSlash />}
    </span>
  );
};

export default VoiceAssistantIcon;
