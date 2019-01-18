var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JSW;
(function (JSW) {
    var Button = /** @class */ (function (_super) {
        __extends(Button, _super);
        function Button(text) {
            var _this = _super.call(this) || this;
            _this.setMargin(1, 1, 1, 1);
            _this.setAutoSize(true);
            var node = _this.getClient();
            node.dataset.kind = 'JButton';
            var nodeText = document.createElement('span');
            nodeText.style.whiteSpace = 'nowrap';
            node.appendChild(nodeText);
            _this.nodeText = nodeText;
            if (text)
                _this.setText(text);
            return _this;
        }
        Button.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.textContent = text;
            this.layout();
        };
        return Button;
    }(JSW.Window));
    JSW.Button = Button;
    var TextBox = /** @class */ (function (_super) {
        __extends(TextBox, _super);
        function TextBox(text) {
            var _this = _super.call(this) || this;
            var that = _this;
            var node = _this.getClient();
            var nodeText = document.createElement('input');
            nodeText.style.width = '100%';
            nodeText.style.height = '100%';
            node.appendChild(nodeText);
            _this.nodeText = nodeText;
            nodeText.addEventListener('keydown', function (e) {
                if (e.keyCode == 13)
                    that.callEvent('enter', e);
            });
            //デフォルトの高さをinputタグに合わせる
            var size = nodeText.getBoundingClientRect();
            _this.setSize(300, size.top + size.bottom + 1);
            if (text)
                _this.setText(text);
            return _this;
        }
        TextBox.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.value = text;
        };
        TextBox.prototype.getText = function () {
            return this.nodeText.value;
        };
        TextBox.prototype.getTextNode = function () {
            return this.nodeText;
        };
        return TextBox;
    }(JSW.Window));
    JSW.TextBox = TextBox;
})(JSW || (JSW = {}));
//# sourceMappingURL=Button.js.map