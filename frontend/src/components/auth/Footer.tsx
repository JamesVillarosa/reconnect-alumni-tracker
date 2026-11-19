import React from "react";
import ReConnect from "./ReConnect";
// import Fontdec from "../../assets/font_dec.svg";
// import Fontinc from "../../assets/font_inc.svg";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  // const [fontSize, setFontSize] = useState(16);

  // Function to adjust font size
  // const changeFontSize = (size: number) => {
  //   document.documentElement.style.fontSize = `${size}px`;
  //   setFontSize(size);
  // };

  return (
    <footer className="flex items-center justify-between w-full px-6 py-1 bg-white md:py-2 lg:py-2 ">
      <div className="flex items-center">
        <Link to="/user">
          {" "}
          <ReConnect size="text-xl" />
        </Link>
      </div>

      {/* TODO: add links */}
      <a href="about" className="text-Primary hover:text-blue-600">
        About
      </a>
      <a
        href="user-agreement"
        className="hidden text-Primary hover:text-blue-600 md:block"
      >
        User Agreement
      </a>
      <a
        href="privacy-policy"
        className="hidden text-Primary hover:text-blue-600 md:block"
      >
        Privacy Policy
      </a>

      {/* <div className="flex items-center space-x-1">
        <button
          className="py-2 hover:bg-gray-100"
          onClick={() => changeFontSize(fontSize - 2)}
          aria-label="Decrease font size"
        >
          <img src={Fontdec} alt="Icon" className="w-8 h-8" />
        </button>
        <button
          className="py-2 hover:bg-gray-100"
          onClick={() => changeFontSize(fontSize + 2)}
          aria-label="Increase font size"
        >
          <img src={Fontinc} alt="Icon" className="w-8 h-8" />
        </button>
      </div> */}
    </footer>
  );
};

export default Footer;
