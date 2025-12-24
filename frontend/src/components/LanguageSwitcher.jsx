import React from "react";
import i18n from "../i18n";

const LanguageSwitcher = () => {
  const buttonStyle = {
    padding: "2px 6px",
    fontSize: "20px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "absolute", top: "10px", right: "20px" }}>
      <button
        style={{ ...buttonStyle, backgroundColor: "#0d13d8", color: "#ffffff" }}
        onClick={() => {
          i18n.changeLanguage("ja");
          localStorage.setItem("language", "ja");
        }}
      >
        日本語
      </button>
      <button
        style={{ ...buttonStyle, backgroundColor: "#c30831", marginLeft: "8px", color: "#ffffff" }}
        onClick={() => {
          i18n.changeLanguage("zh");
          localStorage.setItem("language", "zh");
        }}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageSwitcher;