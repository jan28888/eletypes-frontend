import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '../utils/IconButton';


const InputBox = ({onInputBoxDataChange}) => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    console.log('handleInputChange:', e.target.value);
  };

  const handleSubmit = (e) => {
    let inputList = inputText.split(' ').filter(str => !['', ' ', '  ', '  '].includes(str)).map(str => {
      // 将中文单引号替换为英文单引号
      str = str.replace(/’/g, "'");
      
      // 将中文半全角双引号替换为英文双引号
      str = str.replace(/”/g, '"');
      str = str.replace(/“/g, '"');
      return {key:str, val:str}
    })
    console.log('inputListChange:', inputList);
    onInputBoxDataChange(inputList);
  };



  return (
    <><TextField
          value={inputText}
          onChange={handleInputChange}
          id="standard-basic"
          label="Standard"
          variant="standard" />
      <IconButton
          onClick={handleSubmit}
      >
          <span> 提交 </span>
      </IconButton></>
  );
};

export default InputBox;