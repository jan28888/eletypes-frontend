import React from "react";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";
import InputBox from "../features/InputBox";

const Logo = ({ isFocusedMode, isMusicMode, onCostumeDataChange }) => {
  const inputBoxDataChange = (inputBoxData, articalName) => {
    onCostumeDataChange(inputBoxData, articalName);
  }
  return (
    <div className="header" style={{visibility: isFocusedMode ? 'hidden' : 'visible' }}>
      <h1>
        Ele Types <KeyboardAltIcon fontSize="large" />
      </h1>
      <span className="sub-header">
        an elegant typing experience, just start typing
      </span>
      <div>
          <InputBox onInputBoxDataChange={inputBoxDataChange}/>
      </div>
    </div>
  );
};

export default Logo;
