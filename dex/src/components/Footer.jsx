import React from "react";
import "./../styles/Footer.css";

const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <div className="footer">
      <p>Copyright &copy; {date} Dmytro Soroka - All Rights Reserved</p>
    </div>
  );
};

export default Footer;
