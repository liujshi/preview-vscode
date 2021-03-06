"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil, SourceType} from "./utils/htmlUtil";


var _instance: CssDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new CssDocumentContentManager();
    }

    return _instance;
}
class CssDocumentContentManager implements DocumentContentManagerInterface {


    private COMMAND: string = "vscode.previewHtml";
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);
    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a CSS document - no properties to preview.`;
    }
    private CSSSampleFullSnippet(properties: string): string {
        return HtmlUtil.createRemoteSource(SourceType.CUSTOM_STYLE_SAMPLE, properties);

    }

    private getSelectedCSSProperity(editor: TextEditor): string {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfCSSProperty = text.lastIndexOf('{', startPosOfSelectionText);
        let endPosOfCSSProperty = text.indexOf('}', startPosOfCSSProperty);

        if (startPosOfCSSProperty === -1 || endPosOfCSSProperty === -1) {
            return HtmlUtil.errorSnippet("Cannot determine the rule's properties.");
        }

        var properties = text.slice(startPosOfCSSProperty + 1, endPosOfCSSProperty);
        return properties;
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        var cssProperty = this.getSelectedCSSProperity(editor);
        if (!cssProperty || cssProperty.length <= 0) {
            return undefined;
        }

        return this.CSSSampleFullSnippet(cssProperty);
    }

}
