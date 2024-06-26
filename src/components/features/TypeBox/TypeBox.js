import React, { useEffect, useState, useMemo } from "react";
// import MD5 from "../../utils/md5";
import useSound from "use-sound";
import {
  wordsGenerator,
  chineseWordsGenerator,
} from "../../../scripts/wordsGenerator";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import IconButton from "../../utils/IconButton";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import useLocalPersistState from "../../../hooks/useLocalPersistState";
import CapsLockSnackbar from "../CapsLockSnackbar";
import { Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import {
  COUNT_DOWN_8640,
  COUNT_DOWN_90,
  COUNT_DOWN_60,
  COUNT_DOWN_30,
  COUNT_DOWN_15,
  DEFAULT_WORDS_COUNT,
  DEFAULT_DIFFICULTY,
  HARD_DIFFICULTY,
  DEFAULT_DIFFICULTY_TOOLTIP_TITLE,
  HARD_DIFFICULTY_TOOLTIP_TITLE,
  ENGLISH_MODE,
  CHINESE_MODE,
  ENGLISH_MODE_TOOLTIP_TITLE,
  CHINESE_MODE_TOOLTIP_TITLE,
  DEFAULT_DIFFICULTY_TOOLTIP_TITLE_CHINESE,
  HARD_DIFFICULTY_TOOLTIP_TITLE_CHINESE,
  RESTART_BUTTON_TOOLTIP_TITLE,
  REDO_BUTTON_TOOLTIP_TITLE,
  PACING_CARET,
  PACING_PULSE,
  PACING_CARET_TOOLTIP,
  PACING_PULSE_TOOLTIP,
} from "../../../constants/Constants";
import { SOUND_MAP } from "../sound/sound";

const TypeBox = ({
  textInputRef,
  isFocusedMode,
  costumeData,
  articalName,
  sentenceData,
  soundMode,
  soundType,
  handleInputFocus,
}) => {
  const [play] = useSound(SOUND_MAP[soundType], { volume: 0.5 });


  // local persist pacing style
  const [pacingStyle, setPacingStyle] = useLocalPersistState(
    PACING_PULSE,
    "pacing-style"
  );

  // local persist difficulty
  const [difficulty, setDifficulty] = useLocalPersistState(
    DEFAULT_DIFFICULTY,
    "difficulty"
  );

  // local persist difficulty
  const [language, setLanguage] = useLocalPersistState(
    ENGLISH_MODE,
    "language"
  );

  // Caps Lock
  const [capsLocked, setCapsLocked] = useState(false);

  // tab-enter restart dialog
  const [openRestart, setOpenRestart] = useState(false);

  const EnterkeyPressReset = (e) => {
    // press enter/or tab to reset;
    if (e.keyCode === 13 || e.keyCode === 9) {
      e.preventDefault();
      setOpenRestart(false);
      reset(difficulty, language, false);
    } // press space to redo
    else if (e.keyCode === 32) {
      e.preventDefault();
      setOpenRestart(false);
      reset(difficulty, language, true);
    } else {
      e.preventDefault();
      setOpenRestart(false);
    }
  };
  const handleTabKeyOpen = () => {
    setOpenRestart(true);
  };

  // set up words state
  const [wordsDict, setWordsDict] = useState(() => {
    if (language === ENGLISH_MODE) {
      // console.log('set up words state:', costumeData);
      return costumeData.length === 0 ? wordsGenerator(DEFAULT_WORDS_COUNT, difficulty, ENGLISH_MODE) : costumeData;
      // return wordsGenerator(DEFAULT_WORDS_COUNT, difficulty, ENGLISH_MODE)
    }
    if (language === CHINESE_MODE) {
      return chineseWordsGenerator(difficulty, CHINESE_MODE);
    }
  });

  const [sentenceList, setSentenceList] =useState([]);

  useEffect(() => {
    setWordsDict(costumeData);
  }, [costumeData]);

  const skipAudioList = () => {
    let skipWordList = ['i', 'me', 'we', 'us', 'you', 'it', 'he', 'him', 'his', 'she', 'they', 'was', 'a' ,'am', 'are', 'in', 'on', 
    'with', 'by', 'for', 'at', 'about', 'under', 'of', 'to', 'the', 'from', 'but', 'had', 'into', 'and', 'then', 'off', 'yes', 
    'no', 'go', 'get', 'if']
    return !skipWordList.includes(words[currWordIndex].toLowerCase().match(/[a-zA-Z]/g).join(''))
  }

  const playAudio = () => {
    const audio = document.getElementById("hiddenAudio");
    if (audio) {
      audio.load();
      audio.play();
    }
  }

  const words = useMemo(() => {
    return wordsDict.map((e) => e.val);
  }, [wordsDict]);

  const wordsKey = useMemo(() => {
    return wordsDict.map((e) => e.key);
  }, [wordsDict]);

  const dealSentenceList = () => {
    let tempList = [];
    let tempStr = '';
    words.forEach((element, index) => {
      tempStr += ` ${element}`;
      if (!element.includes('.')) {
        return;
      }
      tempList.push([index, tempStr.trim()]);
      tempStr = '';
    });
    console.log('sentenceList', tempList);
    return tempList;
  }

  useEffect(() => {
    let str = '';
    words.some(item => {
      str += ` ${item}`;
      return item.includes('.')
    })
    if (sentenceData.length > 0 && sentenceData[0][1] === str.trim()) {
      return
    }
    setSentenceList(dealSentenceList())
  },[words])

  useEffect(() => {
    setSentenceList(sentenceData)
  },[sentenceData])

  function debounce(func, delay) {
    return function() {
      const context = this;
      const args = arguments;
      
      clearTimeout(window.timeoutId);
      
      window.timeoutId = setTimeout(function() {
        func.apply(context, args);
      }, delay);
    };
  }

  function getTranslatorFromPhp(item) {
    let qureText = item[1].replaceAll(';', ',');
    // fetch(`http://192.168.50.115/eleTypes/translate.php?inputText=${qureText}`)
    fetch(`http://192.168.50.115:8001/?text=${qureText}`)
    .then(res=>res.json())
      .then(data => {
        console.log(data);
        item[2] = data;
        articalName.length > 0 && saveHistoryArtical(articalName[0], articalName[1], sentenceList)
        // 在这里处理返回的数据
      })
      .catch(error => {
        console.error(error);
        // 在这里处理错误
      });
  }

  // 防抖
  const getTranslator = debounce(getTranslatorFromPhp, 500);
  const playAudioWithDebounce = debounce(playAudio, 1500);

  function saveHistoryArtical(name, sentence, content) {
    const url = "http://192.168.50.115:8001/postHistoryArtical"
    let articalInfo = {
      "path": `./library/${name}/${sentence}.json`,
      "content": JSON.stringify(content)
    }

    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articalInfo)
    };

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }

  // function getTranslator(item) {
  //   if (document.getElementsByClassName('getTranslator').length) {
  //     return;
  //   }
  //   let qureText = item[1];
  //   var script = document.createElement('script');
  //   script.classList.add('getTranslator');
  //   window.handleResponse = (data) => {
  //     item.push(data.trans_result[0].dst)
  //     console.log(data);
  //   }

    // let secret = 'QE9M_B9TzWbWanDjxL6n';
    // let appId = '20240121001947250';
    // let sign=MD5(`${appId}${qureText}1435660288${secret}`);
    // script.src = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${qureText}&from=en&to=zh&appid=${appId}&salt=1435660288&sign=${sign}&callback=handleResponse`;

    // document.body.appendChild(script);
    // setTimeout(()=>{
    //   let parentElement = script.parentNode;
    //   parentElement.removeChild(script);
    // }, 2000);
  // }

  const wordSpanRefs = useMemo(
    () =>
      Array(words.length)
        .fill(0)
        .map((i) => React.createRef()),
    [words]
  );

  // set up timer state
  const [intervalId, setIntervalId] = useState(null);

  // set up game loop status state
  const [status, setStatus] = useState("waiting");

  // enable menu
  const menuEnabled = !isFocusedMode || status === "finished";

  // set up hidden input input val state
  const [currInput, setCurrInput] = useState("");
  // set up world advancing index
  const [currWordIndex, setCurrWordIndex] = useState(0);
  // set up char advancing index
  const [currCharIndex, setCurrCharIndex] = useState(-1);

  // set up words examine history
  const [wordsInCorrect, setWordsInCorrect] = useState(new Set());
  const [inputWordsHistory, setInputWordsHistory] = useState({});

  // setup stats
  const [rawKeyStrokes, setRawKeyStrokes] = useState(0);
  const [wpmKeyStrokes, setWpmKeyStrokes] = useState(0);

  // set up char examine hisotry
  const [history, setHistory] = useState({});
  const keyString = currWordIndex + "." + currCharIndex;
  const [currChar, setCurrChar] = useState("");

  const getCurrentTranslator = useMemo (() => {
    if (!sentenceList?.some){
      return '';
    }
    let currentItem;
    sentenceList.some(item => currWordIndex <= item[0] && (currentItem = item));
    ((currentItem?.length === 2 && currentItem.push(`${currentItem[1]} 请求中...`)) || (currentItem && currentItem[2].includes(' 请求中...'))) && getTranslator(currentItem);
    return currentItem ? currentItem.length === 2 ? currentItem[1] : currentItem[2] : '';
    // eslint-disable-next-line
  },[currWordIndex, sentenceList])

  useEffect(() => {
    // 暂时不走这个判断
    if (currWordIndex === DEFAULT_WORDS_COUNT - 1 && false) {
      if (language === ENGLISH_MODE) {
        const generatedEng = wordsGenerator(
          DEFAULT_WORDS_COUNT,
          difficulty,
          ENGLISH_MODE
        );
        setWordsDict((currentArray) => [...currentArray, ...generatedEng]);
      }
      if (language === CHINESE_MODE) {
        const generatedChinese = chineseWordsGenerator(
          difficulty,
          CHINESE_MODE
        );
        setWordsDict((currentArray) => [...currentArray, ...generatedChinese]);
      }
    }
    if (
      currWordIndex !== 0 &&
      wordSpanRefs[currWordIndex].current.offsetLeft <
        wordSpanRefs[currWordIndex - 1].current.offsetLeft
    ) {
      wordSpanRefs[currWordIndex - 1].current.scrollIntoView();
    } else {
      return;
    }
  }, [currWordIndex, wordSpanRefs, difficulty, language]);

  const reset = (difficulty, language, isRedo) => {
    setStatus("waiting");
    if (!isRedo) {
      if (language === CHINESE_MODE) {
        setWordsDict(chineseWordsGenerator(difficulty, language));
      }
      if (language === ENGLISH_MODE) {
        setWordsDict(wordsGenerator(DEFAULT_WORDS_COUNT, difficulty, language));
      }
    }
    setDifficulty(difficulty);
    setLanguage(language);
    clearInterval(intervalId);
    setRawKeyStrokes(0);
    setWpmKeyStrokes(0);
    setCurrInput("");
    setIntervalId(null);
    setCurrWordIndex(0);
    setCurrCharIndex(-1);
    setCurrChar("");
    setHistory({});
    setInputWordsHistory({});
    setWordsInCorrect(new Set());
    textInputRef.current.focus();
    // console.log("fully reset waiting for next inputs");
    wordSpanRefs[0].current.scrollIntoView();
  };

  const start = () => {
    if (status === "finished") {
      setCurrInput("");
      setCurrWordIndex(0);
      setCurrCharIndex(-1);
      setCurrChar("");
      setHistory({});
      setInputWordsHistory({});
      setWordsInCorrect(new Set());
      setStatus("waiting");
      textInputRef.current.focus();
    }

    if (status !== "started") {
      setStatus("started");
      // let intervalId = setInterval(() => {
      //   setCountDown((prevCountdown) => {
      //     if (prevCountdown === 0) {
      //       clearInterval(intervalId);
      //       // current total extra inputs char count
      //       const currCharExtraCount = Object.values(history)
      //         .filter((e) => typeof e === "number")
      //         .reduce((a, b) => a + b, 0);

      //       // current correct inputs char count
      //       const currCharCorrectCount = Object.values(history).filter(
      //         (e) => e === true
      //       ).length;

      //       // current correct inputs char count
      //       const currCharIncorrectCount = Object.values(history).filter(
      //         (e) => e === false
      //       ).length;

      //       // current missing inputs char count
      //       const currCharMissingCount = Object.values(history).filter(
      //         (e) => e === undefined
      //       ).length;

      //       // current total advanced char counts
      //       const currCharAdvancedCount =
      //         currCharCorrectCount +
      //         currCharMissingCount +
      //         currCharIncorrectCount;

      //       // When total inputs char count is 0,
      //       // that is to say, both currCharCorrectCount and currCharAdvancedCount are 0,
      //       // accuracy turns out to be 0 but NaN.
      //       const accuracy =
      //         currCharCorrectCount === 0
      //           ? 0
      //           : (currCharCorrectCount / currCharAdvancedCount) * 100;

      //       setStatsCharCount([
      //         accuracy,
      //         currCharCorrectCount,
      //         currCharIncorrectCount,
      //         currCharMissingCount,
      //         currCharAdvancedCount,
      //         currCharExtraCount,
      //       ]);

      //       checkPrev();
      //       setStatus("finished");

      //       return countDownConstant;
      //     } else {
      //       return prevCountdown - 1;
      //     }
      //   });
      // }, 1000);
      // setIntervalId(intervalId);
    }
  };

  const UpdateInput = (e) => {
    if (status === "finished") {
      return;
    }
    setCurrInput(e.target.value.toLowerCase().replace(/"/g, '\''));
    e.target.value.length === 1 && (console.log('current playAudio:', words[currWordIndex]));
    e.target.value.length === 1 && skipAudioList() && playAudioWithDebounce();
    inputWordsHistory[currWordIndex] = e.target.value.trim().toLowerCase().replace(/"/g, '\'');
    setInputWordsHistory(inputWordsHistory);
  };

  const handleKeyUp = (e) => {
    setCapsLocked(e.getModifierState("CapsLock"));
  };

  const handleKeyDown = (e) => {
    if (status !== "finished" && soundMode) {
      play();
    }
    const key = e.key;
    const keyCode = e.keyCode;
    setCapsLocked(e.getModifierState("CapsLock"));

    // keydown count for KPM calculations to all types of operations
    if (status === "started") {
      setRawKeyStrokes(rawKeyStrokes + 1);
      if (keyCode >= 65 && keyCode <= 90) {
        setWpmKeyStrokes(wpmKeyStrokes + 1);
      }
    }

    // disable Caps Lock key
    if (keyCode === 20) {
      e.preventDefault();
      return;
    }

    // disable shift alt ctrl
    if (keyCode >= 16 && keyCode <= 18) {
      e.preventDefault();
      return;
    }

    // disable tab key
    if (keyCode === 9) {
      e.preventDefault();
      handleTabKeyOpen();
      return;
    }

    if (status === "finished") {
      setCurrInput("");
      return;
    }

    // start the game by typing any thing
    if (status !== "started" && status !== "finished") {
      start();
    }

    // up arrow or down arrow for skip sentence.
    if (keyCode === 38) {
      setCurrInput("");
      let currentItemIndex;
      sentenceList.some((item, index) => currWordIndex <= item[0] && (currentItemIndex = index));
      setCurrWordIndex(currentItemIndex > 1 ? sentenceList[currentItemIndex - 2][0] + 1 : 0)
      setCurrCharIndex(-1);
      textInputRef.current.focus();
      return;
    } 
    if (keyCode === 40) {
      setCurrInput("");
      let currentItemIndex;
      sentenceList.some((item, index) => currWordIndex <= item[0] && (currentItemIndex = index));
      setCurrWordIndex(currentItemIndex < sentenceList.length - 1 ? sentenceList[currentItemIndex][0] + 1 : sentenceList[currentItemIndex][0]);
      setCurrCharIndex(-1);
      textInputRef.current.focus();
      return;
    }

    // left arrow bar
    if (keyCode === 37 && currWordIndex > 0) {
      // reset currInput
      setCurrInput("");
      // advance to next
      setCurrWordIndex(currWordIndex - 1);
      // set current word's last char.
      setCurrCharIndex(words[currWordIndex - 1].length - 1);
      return;
    }

    // space bar or right arrow bar
    if ((keyCode === 32 || keyCode === 39) && currWordIndex < words.length - 1) {
      // reset currInput
      setCurrInput("");
      // advance to next
      setCurrWordIndex(currWordIndex + 1);
      setCurrCharIndex(-1);
      return;
      // backspace
    } else if (keyCode === 8) {
      // delete the mapping match records
      delete history[keyString];

      // avoid over delete
      if (currCharIndex < 0) {
        // only allow delete prev word, rewind to previous
        if (wordsInCorrect.has(currWordIndex - 1)) {
          // console.log("detected prev incorrect, rewinding to previous");
          // const prevInputWord = inputWordsHistory[currWordIndex - 1];
          const prevInputWord = words[currWordIndex - 1];
          // console.log(prevInputWord + " ")
          setCurrInput(prevInputWord + " ");
          setCurrCharIndex(prevInputWord.length - 1);
          setCurrWordIndex(currWordIndex - 1);
        }
        return;
      }
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar("");
      return;
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(key.toLowerCase().replace(/"/g, '\''));
      return;
      // if (keyCode >= 65 && keyCode <= 90) {
      //   setCurrCharIndex(currCharIndex + 1);
      //   setCurrChar(key);
      // } else {
      //   return;
      // }
    }
  };

  const getExtraCharClassName = (i, idx, extra) => {
    if (
      pacingStyle === PACING_CARET &&
      currWordIndex === i &&
      idx === extra.length - 1
    ) {
      return "caret-extra-char-right-error";
    }
    return "error-char";
  };

  const getExtraCharsDisplay = (word, i) => {
    let input = inputWordsHistory[i];
    if (!input) {
      // input = currInput.trim();
      return null;
    }
    if (i > currWordIndex) {
      return null;
    }
    if (input.length <= word.length) {
      return null;
    } else {
      const extra = input.slice(word.length, input.length).split("");
      history[i] = extra.length;
      return extra.map((c, idx) => (
        <span key={idx} className={getExtraCharClassName(i, idx, extra)}>
          {c}
        </span>
      ));
    }
  };

  const getWordClassName = (wordIdx) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "word error-word active-word";
        } else {
          return "word error-word active-word-no-pulse";
        }
      }
      return "word error-word";
    } else {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "word active-word";
        } else {
          return "word active-word-no-pulse";
        }
      }
      return "word";
    }
  };

  const getChineseWordKeyClassName = (wordIdx) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currWordIndex === wordIdx) {
        return "chinese-word-key error-chinese active-chinese";
      }
      return "chinese-word-key error-chinese";
    } else {
      if (currWordIndex === wordIdx) {
        return "chinese-word-key active-chinese";
      }
      return "chinese-word-key";
    }
  };

  const getChineseWordClassName = (wordIdx) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "chinese-word error-word active-word";
        } else {
          return "chinese-word error-word active-word-no-pulse";
        }
      }
      return "chinese-word error-word";
    } else {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "chinese-word active-word";
        } else {
          return "chinese-word active-word-no-pulse";
        }
      }
      return "chinese-word";
    }
  };

  const getCharClassName = (wordIdx, charIdx, char, word) => {
    char = char.toLowerCase().replace(/"/g, '\'')
    const keyString = wordIdx + "." + charIdx;
    if (
      pacingStyle === PACING_CARET &&
      wordIdx === currWordIndex &&
      charIdx === currCharIndex + 1 &&
      status !== "finished"
    ) {
      return "caret-char-left";
    }
    if (history[keyString] === true) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-correct";
      }
      return "correct-char";
    }
    if (history[keyString] === false) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-error";
      }
      return "error-char";
    }
    if (
      wordIdx === currWordIndex &&
      charIdx === currCharIndex &&
      currChar &&
      status !== "finished"
    ) {
      if (char === currChar) {
        history[keyString] = true;
        return "correct-char";
      } else {
        history[keyString] = false;
        return "error-char";
      }
    } else {
      if (wordIdx < currWordIndex) {
        // missing chars
        history[keyString] = undefined;
      }

      return "char";
    }
  };

  const getDifficultyButtonClassName = (buttonDifficulty) => {
    if (difficulty === buttonDifficulty) {
      return "active-button";
    }
    return "inactive-button";
  };

  const getPacingStyleButtonClassName = (buttonPacingStyle) => {
    if (pacingStyle === buttonPacingStyle) {
      return "active-button";
    }
    return "inactive-button";
  };

  const getLanguageButtonClassName = (buttonLanguage) => {
    if (language === buttonLanguage) {
      return "active-button";
    }
    return "inactive-button";
  };

  return (
    <div onClick={handleInputFocus}>
      <CapsLockSnackbar open={capsLocked}></CapsLockSnackbar>
      {language === ENGLISH_MODE && (
        <div className="type-box">
          <div className="words">
            {words.map((word, i) => (
              <span
                key={i}
                ref={wordSpanRefs[i]}
                className={getWordClassName(i)}
              >
                {word.split("").map((char, idx) => (
                  <span
                    key={"word" + idx}
                    className={getCharClassName(i, idx, char, word)}
                  >
                    {char}
                  </span>
                ))}
                {getExtraCharsDisplay(word, i)}
              </span>
            ))}
          </div>
        </div>
      )}
      {language === CHINESE_MODE && (
        <div className="type-box-chinese">
          <div className="words">
            {words.map((word, i) => (
              <div key={i + "word"}>
                <span
                  key={i + "anchor"}
                  className={getChineseWordKeyClassName(i)}
                  ref={wordSpanRefs[i]}
                >
                  {" "}
                  {wordsKey[i]}
                </span>
                <span key={i + "val"} className={getChineseWordClassName(i)}>
                  {word.split("").map((char, idx) => (
                    <span
                      key={"word" + idx}
                      className={getCharClassName(i, idx, char, word)}
                    >
                      {char}
                    </span>
                  ))}
                  {getExtraCharsDisplay(word, i)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <input
        key="hidden-input"
        ref={textInputRef}
        type="text"
        className="hidden-input"
        onKeyDown={(e) => handleKeyDown(e)}
        onKeyUp={(e) => handleKeyUp(e)}
        value={currInput}
        onChange={(e) => UpdateInput(e)}
      />
      <div className="stats">
        <div>{getCurrentTranslator}</div>
        <div className="restart-button" key="restart-button">
          <Grid container justifyContent="center" alignItems="center">
            <Box display="flex" flexDirection="row">
              <IconButton
                aria-label="redo"
                color="secondary"
                size="medium"
                onClick={() => {
                  reset(difficulty, language, true);
                }}
              >
                <Tooltip title={REDO_BUTTON_TOOLTIP_TITLE}>
                  <UndoIcon />
                </Tooltip>
              </IconButton>
              <IconButton
                aria-label="restart"
                color="secondary"
                size="medium"
                onClick={() => {
                  reset(difficulty, language, false);
                }}
              >
                <Tooltip title={RESTART_BUTTON_TOOLTIP_TITLE}>
                  <RestartAltIcon />
                </Tooltip>
              </IconButton>
              <div>
                <audio id="hiddenAudio" hidden src={`https://dict.youdao.com/dictvoice?audio=${words[currWordIndex]}&type=2`} preload="none" controls controlsList="nodownload nofullscreen noremoteplayback" />
              </div>
              {menuEnabled && (
                <>
                  <IconButton
                    onClick={() => {
                      reset(COUNT_DOWN_8640, difficulty, language, false);
                    }}
                  >
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(COUNT_DOWN_90, difficulty, language, false);
                    }}
                  >
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(COUNT_DOWN_60, difficulty, language, false);
                    }}
                  >
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(COUNT_DOWN_30, difficulty, language, false);
                    }}
                  >
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(COUNT_DOWN_15, difficulty, language, false);
                    }}
                  >
                  </IconButton>
                </>
              )}
            </Box>
            {menuEnabled && (
              <Box display="flex" flexDirection="row">
                <IconButton
                  onClick={() => {
                    reset(
                      DEFAULT_DIFFICULTY,
                      language,
                      false
                    );
                  }}
                >
                  <Tooltip
                    title={
                      language === ENGLISH_MODE
                        ? DEFAULT_DIFFICULTY_TOOLTIP_TITLE
                        : DEFAULT_DIFFICULTY_TOOLTIP_TITLE_CHINESE
                    }
                  >
                    <span
                      className={getDifficultyButtonClassName(
                        DEFAULT_DIFFICULTY
                      )}
                    >
                      {DEFAULT_DIFFICULTY}
                    </span>
                  </Tooltip>
                </IconButton>
                <IconButton
                  onClick={() => {
                    reset(HARD_DIFFICULTY, language, false);
                  }}
                >
                  <Tooltip
                    title={
                      language === ENGLISH_MODE
                        ? HARD_DIFFICULTY_TOOLTIP_TITLE
                        : HARD_DIFFICULTY_TOOLTIP_TITLE_CHINESE
                    }
                  >
                    <span
                      className={getDifficultyButtonClassName(HARD_DIFFICULTY)}
                    >
                      {HARD_DIFFICULTY}
                    </span>
                  </Tooltip>
                </IconButton>
                <IconButton>
                  {" "}
                  <span className="menu-separator"> | </span>{" "}
                </IconButton>
                <IconButton
                  onClick={() => {
                    reset(difficulty, ENGLISH_MODE, false);
                  }}
                >
                  <Tooltip title={ENGLISH_MODE_TOOLTIP_TITLE}>
                    <span className={getLanguageButtonClassName(ENGLISH_MODE)}>
                      eng
                    </span>
                  </Tooltip>
                </IconButton>
                <IconButton
                  onClick={() => {
                    reset(difficulty, CHINESE_MODE, false);
                  }}
                >
                  <Tooltip title={CHINESE_MODE_TOOLTIP_TITLE}>
                    <span className={getLanguageButtonClassName(CHINESE_MODE)}>
                      chn
                    </span>
                  </Tooltip>
                </IconButton>
              </Box>
            )}
            {menuEnabled && (
              <Box display="flex" flexDirection="row">
                <IconButton
                  onClick={() => {
                    setPacingStyle(PACING_PULSE);
                  }}
                >
                  <Tooltip title={PACING_PULSE_TOOLTIP}>
                    <span
                      className={getPacingStyleButtonClassName(PACING_PULSE)}
                    >
                      {PACING_PULSE}
                    </span>
                  </Tooltip>
                </IconButton>
                <IconButton
                  onClick={() => {
                    setPacingStyle(PACING_CARET);
                  }}
                >
                  <Tooltip title={PACING_CARET_TOOLTIP}>
                    <span
                      className={getPacingStyleButtonClassName(PACING_CARET)}
                    >
                      {PACING_CARET}
                    </span>
                  </Tooltip>
                </IconButton>
              </Box>
            )}
          </Grid>
        </div>
      </div>
      <Dialog
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        open={openRestart}
        onKeyDown={EnterkeyPressReset}
      >
        <DialogTitle>
          <div>
            <span className="key-note"> press </span>
            <span className="key-type">Space</span>{" "}
            <span className="key-note">to redo</span>
          </div>
          <div>
            <span className="key-note"> press </span>
            <span className="key-type">Tab</span>{" "}
            <span className="key-note">/</span>{" "}
            <span className="key-type">Enter</span>{" "}
            <span className="key-note">to restart</span>
          </div>
          <span className="key-note"> press </span>
          <span className="key-type">any key </span>{" "}
          <span className="key-note">to exit</span>
        </DialogTitle>
      </Dialog>
    </div>
  );
};

export default TypeBox;
