import { useEffect, useState } from "react";
import styled from "@emotion/styled";

function hashCode(str) {
  return str
    .split("")
    .reduce(
      (prevHash, currVal) =>
        ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
      0
    );
}

const backgroundColors = [
  "rgba(212, 105, 212, 0.2)",
  "rgba(255, 138, 0, 0.2)",
  "rgba(0, 0, 128, 0.2)",
];

const PreviewSidebarStyled = styled.div`
  flex-basis: 1;

  display: flex;
  flex-flow: row wrap;
  // width: 40%;
  top: 0;
  right: 0;
  height: 100vh;
  align-content: flex-start;
`;

const PreviewWindowDiv = styled.div`
  background-color: ${(props) => backgroundColors[props.colorIndex]};
  width: 300px;
  margin-top: 16px;
  padding: 8px;
  border-radius: 8px;
`;

const Preview = ({ title, snippet, category, ...props }) => {
  return (
    <div
      class="h-auto"
      style={{
        margin: "4px 8px 4px 8px",
      }}
    >
      <PreviewWindowDiv
        colorIndex={Math.abs(hashCode(snippet) % backgroundColors.length)}
      >
        <p
          style={{ fontFamily: "IBM Plex Serif" }}
          class="font-semibold text-lg"
        >
          {title}
        </p>
        <p class="font-medium text-gray-600 text-sm">{category}</p>
        <hr class="h-px bg-gray-400 mb-1" />
        <p> {snippet}</p>
      </PreviewWindowDiv>
    </div>
  );
};

const PreviewSidebar = ({ suggestions, ...props }) => {
  return (
    <PreviewSidebarStyled>
      {suggestions.length ? (
        suggestions.map((suggestion) => <Preview {...suggestion}></Preview>)
      ) : (
        <div>Take notes to learn more about everything!</div>
      )}
    </PreviewSidebarStyled>
  );
};

export default PreviewSidebar;
