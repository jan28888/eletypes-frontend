import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '../utils/IconButton';
import { Input } from '@mui/material';

const InputBox = ({onInputBoxDataChange}) => {
  const [inputText, setInputText] = useState('');
  const [articalName, setArticalName] = useState(["书名", "章节"]);

  const handleFirstNameChange = (event) => {
    setArticalName([event.target.value, articalName[1]]);
  }

  const handleSecondNameChange = (event) => {
    setArticalName([articalName[0], event.target.value]);
  }

  const handleInputTextChange = (event) => {
    setInputText(event.target.value)
  }

  const handleSubmit = (e) => {
    console.log(articalName);
    let inputList = inputText.split(' ').filter(str => !['', ' ', '  ', '  '].includes(str)).map(str => {
      // 将中文单引号替换为英文单引号
      str = str.replace(/’/g, "'");
      
      // 将中文半全角双引号替换为英文双引号
      str = str.replace(/”/g, '"');
      str = str.replace(/“/g, '"');
      return {key:str, val:str}
    })
    console.log('inputListChange:', inputList);
    onInputBoxDataChange(inputList, articalName);
  };



  return (
    <>
    <input className="articalFirstName" type="text" value={articalName[0]} onChange={handleFirstNameChange}></input>
    <input className="articalLastName" type="text" value={articalName[1]} onChange={handleSecondNameChange}></input>
    <input className="content" type="text" value={inputText} onChange={handleInputTextChange}></input>
      <IconButton
          onClick={handleSubmit}
      >
          <span> 提交 </span>
      </IconButton></>
  );
};

export default InputBox;