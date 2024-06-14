import React from "react";
import "./Definitions.css";

const Definitions = ({ word, category, meanings, LightTheme }) => {
  return (
    <div className="meanings">
      
      <div className="audio">
      {/* Audio element for pronunciation, only when category is "en" */}
      {category === "en" && meanings[0] && meanings[0].phonetics && meanings[0].phonetics[0] && meanings[0].phonetics[0].audio && (
              <audio 
                src={meanings[0].phonetics[0].audio}
                style={{ backgroundColor:LightTheme ? "#000" : "#fff", color:LightTheme ? "#000" : "#fff"}} 
                controls
              >
                Your browser doesn't support the audio element.
              </audio>
            )}
      </div>
      {word === "" ? (
        <span className="subTitle">Start By Typing A Word In Search</span>
      ) : (
        meanings.map((mean, index) => (
          mean.meanings.map((item, idx) => (
            item.definitions.map((def, i) => (
              <div key={`${index}-${idx}-${i}`} className="singleMean" style={{ backgroundColor:LightTheme ? "#3b5360" : "#fff", color:LightTheme ? "white" : "black" }}>
                <b>{def.definition}</b>
                <hr style={{ backgroundColor:LightTheme ? "#000" : "#fff", width: "100%" }} />
                {def.example && (
                  <span>
                    <b>Example: </b>{def.example}
                  </span>
                )}
                {def.synonyms && def.synonyms.length > 0 && (
                  <span>
                    <b>Synonyms: </b>{def.synonyms.join(", ")}
                  </span>
                )}
              </div>
            ))
          ))
        ))
      )}
    </div>
  );
};

export default Definitions;
