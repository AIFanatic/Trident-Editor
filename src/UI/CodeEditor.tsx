import React from "react";

import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

export class CodeEditor extends React.Component {
    public render() {
        const code = "this.state.code";
        const options = {
            selectOnLineNumbers: true
        };
        return (
            <Editor
                height="90vh"
                defaultLanguage="javascript"
                defaultValue="// some comment"
                theme="vs-dark"
            />
            );
        }
    }