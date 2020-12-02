import "./App.css";
import TextEditor from "./TextEditor";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import PreviewSidebar from "./PreviewSidebar.jsx";

const NotePad = styled.div`
  max-width: 500px;
  height: 85vh;
  overflow-y: scroll;
  padding: 15px;
  font-size: 13px;
  background-color: white;
  // position: fixed;
  // top: 0;
  // left: 0;
  margin: 0 5% 0 5%;

  flex-basis: 2;
`;

const URL = "http://1af9e2a00dec.ngrok.io/inference?text=";

const App = () => {
  const [currentText, setCurrentText] = useState("");
  const [counter, setCounter] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState(initialValue);

  const onKeystroke = (newValue) => {
    const current =
      newValue[newValue.length - 1].children[
        newValue[newValue.length - 1].children.length - 1
      ].text;
    setValue(newValue);
    setCurrentText(current);
    setCounter(current.length);
  };
  useEffect(() => {
    if (suggestions.length) {
      const currentNumSuggestions = suggestions[suggestions.length - 1].length;
      // if new suggestions are available, go through and highlight text
      if (currentNumSuggestions) {
        const highlightedValue = JSON.parse(JSON.stringify(value));
        const entry =
          highlightedValue[highlightedValue.length - 1].children[
            highlightedValue[highlightedValue.length - 1].children.length - 1
          ];
        entry.highlight = true;
        entry.numSuggestions = currentNumSuggestions;
        setValue(highlightedValue);
      }
    }
  }, [suggestions.length]);
  useEffect(() => {
    const getWikiResults = async () => {
      const response = await fetch(URL + currentText, {
        mode: "cors",
        method: "GET",
      });
      if (response.ok) {
        const {
          categories,
          titles,
          paragraphs,
          similarity,
        } = await response.json();
        console.log(similarity);
        const arr = [];
        similarity.map((el, idx) => {
          if (el > 0.9) {
            arr.push({
              title: titles[idx],
              snippet: paragraphs[idx],
              category: categories[idx],
            });
          }
        });
        setSuggestions(arr);
      }
    };
    if (counter % 10 === 0 && counter > 10) {
      getWikiResults();
    }
  }, [counter]);
  console.log(suggestions);
  return (
    <div className="App flex flex-row">
      <NotePad>
        <TextEditor onKeystroke={onKeystroke} value={value} />
      </NotePad>
      <PreviewSidebar suggestions={suggestions} />
    </div>
  );
};

export default App;

const initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text:
          ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  // {
  //   type: "paragraph",
  //   children: [{ text: "The art of scientific pursuits", highlight: true }],
  // },
];
