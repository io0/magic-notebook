import { useEffect, useState } from "react";
import styled from "@emotion/styled";

const PreviewSidebarStyled = styled.div`
  display: flex;
  flex-flow: row wrap;
  // width: 40%;
  top: 0;
  right: 0;
  height: 100vh;
  flex-basis: 1;
  // background-color: grey;
`;

const PreviewWindowDiv = styled.div`
  background-color: rgba(212, 105, 212, 0.2);
  width: 300px;
  margin-top: 16px;
  padding: 8px;
  border-radius: 8px;
`;

const Preview = ({ title, snippet, category, ...props }) => {
  return (
    <div class="h-auto p-4">
      <PreviewWindowDiv>
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
        <div>Start typing to get more interesting ideas!</div>
      )}
    </PreviewSidebarStyled>
  );
};

export default PreviewSidebar;
