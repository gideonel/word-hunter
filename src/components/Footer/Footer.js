import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <hr style={{ width: "90%", marginTop: 20 }} />
      <span className="name">
        Made by{" "}
          Lord Gideonel
      </span>
      <div className="iconContainer">
      <a aria-label="Chat on WhatsApp" href=" https://wa.me/2347085971914?text=I'm%20interested%20in%20your%20Projects%20on%20react" target="__blank">
        <img alt="Chat on WhatsApp" src={require("./WhatsAppButtonWhiteSmall.png")} />
       <a />
        </a>
        {/* */}
        <a href="#" target="__blank">
          <i className="fab fa-instagram-square fa-2x"></i>
        </a>
        <a href="#" target="__blank">
          <i className="fab fa-linkedin fa-2x"></i>
        </a>
        <a href="#" target="__blank">
          <i className="fab fa-youtube fa-2x"></i>
        </a> 
      </div>
    </div>
  );
};

export default Footer;
