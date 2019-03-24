# JSW
JavaScript用ウインドウフレームワーク
[基本サンプル](https://javascript-windowframework.github.io/JSW/Samples/)
[基本サンプルのソース](https://github.com/JavaScript-WindowFramework/JSW)
[ドキュメント](https://javascript-windowframework.github.io/TypeDocViewer/)

# アプリケーションの例
[GoogleDrive操作サンプル](https://gdriveexplorer.github.croud.jp/)
　[ソース](https://github.com/JavaScript-WindowFramework/GDriveExplorer)
[TypeDocViewerサンプル](https://javascript-windowframework.github.io/TypeDocViewer/)
　[ソース](https://github.com/JavaScript-WindowFramework/TypeDocViewer)

## 作成者
[空雲](https://croud.jp/)

## 内容
JavaScriptでウインドウシステムを扱うためのフレームワーク
可動式のフレームウインドウ、ListView、TreeView、分割バーなどの機能をサポート
素のJavaScriptから使えることを前提としているため、あえてパッケージ化はしていない

## 使い方
・JavaScriptとして使う場合
　distに入っている「css」と[js」をターゲット環境にコピーし、HTMLファイルから以下のような形で呼び出す

　```

    <link rel="stylesheet" href="css/jsw.css"/>
    <script type="text/javascript" src="js/jsw.js"></script>
　```


・TypeScriptとして使う場合
　基本的にはJavaScriptと同じだが、型宣言は以下のように利用する<br>
	定義だけ必要な場合はソースコード中に以下の参照設定を入れる(パスは適宜修正)

	///<reference path="js/jsw.d.ts"/>
	自分のプロジェクトに組み込む場合は、以下のファイルをコピー
		"src/jsw.ts"

・webpackのようなパッケージバンドラとimportを前提とする場合
　"src/jsw.ts"の以下の行にexportを入れるとモジュール化される

export namespace JSW {

## ターゲット
TypeScript+ES5(JavaScript)
IE11で動作するレベルのDOM

## ライセンス
[MIT License](https://opensource.org/licenses/mit-license.php)
