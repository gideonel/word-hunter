import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin, faYoutube, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <hr style={{ width: "90%", marginTop: 20 }} />
      <span className="name">
        Made by Lord Gideonel
      </span>
      <div className="iconContainer">
        <a
          aria-label="Chat on WhatsApp"
          href="https://wa.me/2347085971914?text=I'm%20interested%20in%20your%20Projects%20on%20react"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FontAwesomeIcon icon={faLinkedin} size="2x" />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <FontAwesomeIcon icon={faYoutube} size="2x" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
