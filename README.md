# JSW
JavaScript用ウインドウフレームワーク<br>
[ドキュメント](https://javascript-windowframework.github.io/JSW/Samples/Document.html)<br>
<br>
[基本サンプル](https://javascript-windowframework.github.io/JSW/dist/) [ソース](https://github.com/JavaScript-WindowFramework/JSW)<br>
<br>
[GoogleDrive操作サンプル](https://gdriveexplorer.github.croud.jp/) [ソース](https://github.com/JavaScript-WindowFramework/GDriveExplorer)<br>
[TypeDocViewerサンプル](https://javascript-windowframework.github.io/TypeDocViewer/) [ソース](https://github.com/JavaScript-WindowFramework/TypeDocViewer)<br>

## 作成者
[空雲](https://croud.jp/)

## 内容
JavaScriptでウインドウシステムを扱うためのフレームワーク<br>
可動式のフレームウインドウ、ListView、TreeView、分割バーなどの機能をサポート<br>
素のJavaScriptから使えることを前提としているため、あえてパッケージ化はしていない<br>

## 使い方
・JavaScriptとして使う場合<br>
　distに入っている「css」と[js」をターゲット環境にコピーし、HTMLファイルから以下のような形で呼び出す<br>
 
　```

    <link rel="stylesheet" href="css/jsw.css"/>
    <script type="text/javascript" src="js/jsw.js"></script>
　```
 

・TypeScriptとして使う場合<br>
　基本的にはJavaScriptと同じだが、型宣言は以下のように利用する<br>
	定義だけ必要な場合はソースコード中に以下の参照設定を入れる(パスは適宜修正)<br>
		///<reference path="js/jsw.d.ts"/><br>
	自分のプロジェクトに組み込む場合は、以下のファイルをコピー<br>
		"src/jsw.ts"<br>

・webpackのようなパッケージバンドラとimportを前提とする場合<br>
　"src/jsw.ts"の以下の行にexportを入れるとモジュール化される<br>
　export namespace JSW {<br>

## ターゲット
TypeScript+ES5(JavaScript)<br>
IE11で動作するレベルのDOM<br>

## ライセンス
[MIT License](https://opensource.org/licenses/mit-license.php)
