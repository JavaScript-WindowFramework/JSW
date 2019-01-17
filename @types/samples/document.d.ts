declare namespace TYPEDOC {
    /**
     *TypeDocのJSON処理用
    *
    * @export
    * @interface TypeDoc
    */
    interface TypeDoc {
        id: number;
        name: string;
        kind: number;
        kindString: string;
        flags: Flags;
        originalName?: string;
        children: TypeDoc[];
        groups: Group[];
        sources?: Source[];
        comment?: Comment;
        extendedTypes?: Type[];
        signatures?: Signature[];
        overwrites?: Type;
        type?: Type;
        inheritedFrom?: Type;
        defaultValue?: string;
    }
    interface ElementType {
        type: string;
        name?: string;
        types?: Type[];
    }
    interface Signature {
        id: number;
        name: string;
        kind: number;
        kindString: string;
        flags: Flags;
        type: Type;
        comment?: Comment;
        parameters?: Parameter[];
        overwrites?: Type;
        inheritedFrom?: Type;
    }
    interface Parameter {
        id: number;
        name: string;
        kind: number;
        kindString: string;
        flags: Flags;
        type: Type;
        comment?: Comment;
    }
    interface Group {
        title: string;
        kind: number;
        children: number[];
    }
    interface Type {
        type: string;
        name?: string;
        id?: number;
        types?: Type[];
        value?: string;
        declaration?: Declaration;
        elementType?: ElementType;
    }
    interface Comment {
        text?: string;
        shortText: string;
        tags?: Tag[];
        returns?: string;
    }
    interface Declaration {
        id: number;
        name: string;
        kind: number;
        kindString: string;
        flags: Flags;
        signatures: Signature[];
        sources: Source[];
    }
    interface Source {
        fileName: string;
        line: number;
        character: number;
    }
    interface Flags {
        isOptional?: boolean;
        isStatic?: boolean;
        isExported?: boolean;
    }
    interface Tag {
        tag: string;
        text: string;
    }
}
declare class SearchWindow extends JSW.ListView {
    constructor(treeView: JSW.TreeView, docData: TYPEDOC.TypeDoc, keywords: string);
    findItems(item: JSW.TreeItem, keys: any): void;
    static findKeys(value: string, keys: string[]): boolean;
}
/**
 *TypeDocViewerのメインウインドウ
 *
 * @class TypeDocView
 * @extends {JSW.FrameWindow}
 */
declare class TypeDocView extends JSW.FrameWindow {
    mTreeView: JSW.TreeView;
    mListView: JSW.ListView;
    mDocData: TYPEDOC.TypeDoc;
    constructor();
    loadUrl(url: any): void;
    load(value: TYPEDOC.TypeDoc): void;
    static createTree(item: JSW.TreeItem, value: TYPEDOC.TypeDoc): void;
    static getInheritedFrom(value: TYPEDOC.TypeDoc): string;
    onTreeItem(e: JSW.TREEVIEW_EVENT_SELECT): void;
}
declare function docMain(): void;
