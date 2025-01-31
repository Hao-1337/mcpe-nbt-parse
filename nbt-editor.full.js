'use strict';
const line = {
    color: "gray",
    content: "━━╸"
},
dropzoneSytle = {
    bc: "#1B1B1B",
    dc: "#333333"
},
CAPACITY_DEFAULT = 24;

let nbtEditor, nbtEncode, nbtDecode;

const _ = cs => document.getElementById(cs);
const loadLastFile = () => nbtEditor.lastFile();
function dateString(unixTimestamp) {
    const date = new Date(Number(unixTimestamp) * 1000),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
}
//.replace(/(let|const|return|class|static|async|await|throw|return|new)\s|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|\s+/g, (m, g1, g2, g3, g4, g5) => g1 ? g1 + "" : g2 ? g2 : g3 ? g3 : g4 ? g4 : "")
/*Plugin function to handle serialization and deserialization of BigInt values*/
const bigIntJSON = {
  replacer: (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  },
  reviver: (key, value) => {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      return BigInt(value.slice(0, -1));
    }
    return value;
  }
};

class UIController {
    static data = [];
    static toggleD = [];
    static audio;

    static audioPlay() {
        UIController.audio.play();
    }
    static redirectTo(url) {
        window.location.href = url;
    }
    static toggle() {
        return UIController.toggleD.findIndex(v => v.checked);
    }
    static switch() {
        const _ = [
            document.getElementById("generator"),
            document.getElementById("generator1"),
            document.getElementById("generator2")
        ];
        let toggle = UIController.toggle();
        switch (toggle) {
            case -1:
            case 0:
                _.shift().hidden = false;
                _.forEach(e => (e.hidden = true));
                UIController.data[3].refresh();
                break;
            case 1:
                _.shift().hidden = true;
                _[1].hidden = true;
                _[0].hidden = false;
                UIController.data[0].refresh();
                UIController.data[1].refresh();
                UIController.data[2].refresh();
                break;
            case 2:
                _[2].hidden = false;
                _.pop();
                _.forEach(e => (e.hidden = true));
                UIController.data[4].refresh();
                UIController.data[5].refresh();
                break;
        }
    }
    static downloadFile(data, filename, mineType = "application/json") {
        const blob = new Blob([data], {type: mineType});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = `${url}`;
        link.download = filename;
        link.textContent = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    /* Used when clipboard api not here */
    static copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        /*Styling the textarea as transparent and positioning it offscreen*/
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            alert("Can't coppy the data (due to browser issue)");
            throw new Error(e.stack);
        }
        document.body.removeChild(textArea);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // const _0x8gGt6 = {
    //     domain: "choigame123.github.io",
    //     redirectTo: ["https://", "github.com", "/Choigame123"],
    //     beta: true,
    //     current: false
    // };
    // setInterval(() => {
    //     UIController.redirectTo = function (url) {
    //         window.location.href = url;
    //     }
    //     if (_0x8gGt6.domain !== document.domain) _0x8gGt6.current = true;
    //     if (_0x8gGt6.current && !_0x8gGt6.beta) while (true) {
    //         document.querySelector("body").innerHTML = "";
    //         window.location.href = _0x8gGt6.redirectTo.join("");
    //         throw new Error("Code run in invalid domain.");
    //     }
    // }, 5000);
    /*Check for cookie, anyway*/
    _("btn-lf").hidden = storageAvailable("localStorage");
    /*UI setup*/
    const dropzone = [_("dropzone1"), _("dropzone2"), _("dropzone3")];
    UIController.toggleD = [
        _("radio1"),
        _("radio2"),
        _("radio3")
    ];

    /*editor vars*/
    const editor = {
        codemirror: false,
        output: _("editor-output"),
        output1: void 0,
        lastFile: _("last-file-load-label"),
        fileLabel: _("edit-file-label"),
        
        input: _("editor-file-in"),
        preview: {
            root: _("editor-selector"),
            out: _("json-preview"),
            codemirror: void 0,
            indent: _("encode-indent")
        }
    },
    preview = CodeMirror.fromTextArea(editor.preview.out, {
        lineNumbers: true,
        scrollbarStyle: "null",
        hints: true,
        mode: "application/json",
        theme: "tomorrow-night-bright",
        readOnly: 'nocursor'
    });

    /* Editor controller */
    UIController.data[3] = preview;
    editor.preview.codemirror = preview;
    nbtEditor = new NBTEditor(-1, true, editor, true);
    editor.input.addEventListener('change', e => {
        nbtEditor.loadFile(e.target.files[0])
        /**const reader = new FileReader();
        reader.onload = v => {
            const buffer = v.target.result,
                  zlib = require(9);
            //https://github.com/nodeca/pako/blob/master/dist/pako.js
            console.log(buffer instanceof ArrayBuffer);
            zlib.gunzip(buffer, (err, buffer) => {
                if (err) throw err;
                UIController.downloadFile(buffer, "shird.dat", "application/octet-stream");
            });
        };
        reader.readAsArrayBuffer(e.target.files[0]);
        */
    });
    dropzone[0].addEventListener('dragover', e => {
        e.preventDefault();
        dropzone[0].style.background = '${dropzoneSytle.dc}';
    });
    dropzone[0].addEventListener('dragleave', e => {
        e.preventDefault();
        dropzone[0].style.background = '${dropzoneSytle.bc}';
    });
    dropzone[0].addEventListener('drop', e => {
        e.preventDefault();
        dropzone[0].style.background = '${dropzoneSytle.bc}';
        nbtEditor.loadFile(e.dataTransfer.files[0]);
    });

    /*Encoder vars*/
    const encodeOut = _("encode-output"),
    encodeIn = _("encode-input-area"),
    inputType = _("nbt-interface"),
    fileLabel = _("encode-file-label"),
    fileDownload = _("encode-download-btn"),
    InType = CodeMirror.fromTextArea(inputType, {
        lineNumbers: false,
        scrollbarStyle: "null",
        hints: true,
        readOnly: 'nocursor',
        mode: "text/typescript",
        theme: "tomorrow-night-bright"
    }),
    CMEncodeIn = CodeMirror.fromTextArea(encodeIn, {
        lineNumbers: true,
        scrollbarStyle: "null",
        hints: true,
        foldGutter: true,
        lint: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        mode: "application/ld+json",
        theme: "tomorrow-night-bright",
        matchBrackets: true,
        extraKeys: {
            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            },
            "Ctrl-Space": "autocomplete"
        }
    }),
    CMEncode = CodeMirror.fromTextArea(encodeOut, {
        lineNumbers: true,
        scrollbarStyle: "null",
        hints: true,
        mode: "javascript",
        theme: "tomorrow-night-bright",
        matchBrackets: true,
        extraKeys: {
            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            }
        }
    });
    UIController.data[0] = CMEncodeIn,
    UIController.data[1] = CMEncode;
    UIController.data[2] = InType;

    /*Encoder controller*/
    function InputHandle(file) {
        fileLabel.textContent = file.name;
        const reader = new FileReader();
        reader.onload = e => {
            CMEncodeIn.setValue(e.target.result);
        }
        reader.readAsText(file);
    }
    CMEncodeIn.on("change", () => {
        let raw = CMEncodeIn.getValue(), data;
        try {
            data = JSON.parse(raw.replace(/\n|\ /g, ""), bigIntJSON.reviver);
        } catch (e) {
            fileDownload.hidden = true;
            CMEncode.setValue(JSON.stringify({
                error: true,
                reason: "Not a valid json.",
                domErr: String(e.stack)
            }, bigIntJSON.replacer, 2));
        }
        try {
            const packer = new Packer(data, true);
            if (packer.error) {
                fileDownload.hidden = true;
                return CMEncode.setValue(JSON.stringify({
                    error: true,
                    reason: "Not a valid nbt interface.",
                    encoderErr: packer.err
                }, bigIntJSON.replacer, 2));
            }
            const escapeString = new TextDecoder();
            CMEncode.setValue(escapeString.decode(new Uint8Array(packer.buffer)));
            fileDownload.hidden = false;
            nbtEncode = packer;
        } catch (e) {
            fileDownload.hidden = true;
            CMEncode.setValue(JSON.stringify({
                error: true,
                reason: "Unknown, see `domErr`",
                domErr: String(e.stack)
            }, bigIntJSON.replacer, 2));
        }
    });
    _("encode-file-in").addEventListener('change', e => InputHandle(e.target.files[0]));
    dropzone[1].addEventListener('dragover', e => {
        e.preventDefault();
        dropzone[1].style.background = '${dropzoneSytle.dc}';
    });
    dropzone[1].addEventListener('dragleave', e => {
        e.preventDefault();
        dropzone[1].style.background = '${dropzoneSytle.bc}';
    });
    dropzone[1].addEventListener('drop', e => {
        e.preventDefault();
        dropzone[1].style.background = '${dropzoneSytle.bc}';
        InputHandle(e.dataTransfer.files[0]);
    });

    /*decoder area*/
    const decoder = {
        codemirror: true,
        output: void 0,
        output1: void 0,
        lastFile: void 0,
        fileLabel: _("decode-file-label"),
        
        input: _("decode-file-in"),
        e: {
            json: _("decode-json-output"),
            nbt: _("decode-nbt-output")
        },
        l: {
            json: _("decode-json-download-btn"),
            nbt: _("decode-nbt-download-btn")
        },
        preview: {
            indent: _("decode-indent")
        }
    },
    decodeJSON = CodeMirror.fromTextArea(decoder.e.json, {
        lineNumbers: true,
        scrollbarStyle: "null",
        hints: true,
        mode: "application/json",
        theme: "tomorrow-night-bright",
        matchBrackets: true
    }),
    decodeNBT = CodeMirror.fromTextArea(decoder.e.nbt, {
        lineNumbers: true,
        scrollbarStyle: "null",
        hints: true,
        mode: "application/json",
        theme: "tomorrow-night-bright",
        matchBrackets: true
    });

    /* Decode controller */
    decoder.output = decodeJSON;
    UIController.data[4] = decodeJSON;
    decoder.output1 = decodeNBT;
    UIController.data[5] = decodeNBT;
    nbtDecode = new NBTEditor(-1, true, decoder, false);
    nbtDecode.onChange = ed => (ed._.output.getWrapperElement().style["margin-top"] = "8px", ed._.output1.getWrapperElement().style["margin-top"] = "8px", ed._.l.json.hidden = false, ed._.l.nbt.hidden = false);
    nbtDecode.onError = (er, ed) => (ed._.output.getWrapperElement().style["margin-top"] = "0", ed._.output1.getWrapperElement().style["margin-top"] = "0", ed._.l.json.hidden = true, ed._.l.nbt.hidden = true);
    decoder.input.addEventListener('change', e => nbtDecode.loadFile(e.target.files[0]));
    dropzone[2].addEventListener('dragover', e => {
        e.preventDefault();
        dropzone[2].style.background = '${dropzoneSytle.dc}';
    });
    dropzone[2].addEventListener('dragleave', e => {
        e.preventDefault();
        dropzone[2].style.background = '${dropzoneSytle.bc}';
    });
    dropzone[2].addEventListener('drop', e => {
        e.preventDefault();
        dropzone[2].style.background = '${dropzoneSytle.bc}';
        nbtDecode.loadFile(e.dataTransfer.files[0]);
    });

    /* Init controller */
    UIController.switch();
    UIController.toggleD[0].addEventListener("click", () => UIController.switch());
    UIController.toggleD[1].addEventListener("click", () => UIController.switch());
    UIController.toggleD[2].addEventListener("click", () => UIController.switch());
    UIController.audio = _("audio");
});

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") && storage && storage.length !== 0);
  }
}
function cookiesEnabled() {
    document.cookie = "testcookie=true";
    const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;
    document.cookie = "testcookie=true; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    return cookiesEnabled;
}

class NBTEditor {
    constructor(file, littleEndian, element, readOnly = false/*On special data like last played*/) {
        const isCodeMirror = element.codemirror || false,
              outputElement = element.output,
              outputElement1 = element.output1,
              fileLabelElement = element.fileLabel,
              lastFileLabelElement = element.lastFile;
        this._ = element;
        this.isCodeMirror = isCodeMirror;
        this.outputElement = outputElement;
        this.outputElement1 = outputElement1;
        this.lastLabelElm = lastFileLabelElement;
        this.fileNameElm = fileLabelElement;
        this.LE = littleEndian;
        this.file = file;
        this.init();
        this.readOnly = readOnly;
        this.db = window.localStorage;
        /*this.writer = new Writer(littleEndian);*/
        return this;
    }
    set onChange(func) {
        this.func = func;
    }
    get onChange() {
        return this.func;
    }
    set onError(func) {
        this.efunc = func;
    }
    get onError() {
        return this.efunc;
    }
    fileLoader(file) {
        /*console.log(file);*/
        return new Promise((r, j) => {
            const reader = new FileReader();
            reader.onload = function(_) {
                let buffer = _.target.result,
                    file = new DataView(buffer);
                r({
                    buffer,
                    file
                });
            }
            reader.readAsArrayBuffer(file);
        });
    }
    async init(set_db) {
        if (this.file === -1) return;
        if (this.file instanceof ArrayBuffer) {
            this.buffer = this.file;
            this.file = new DataView(this.file)
        } else if (this.file instanceof File) {
            let _ = await this.fileLoader(this.file);
            this.file = _.file;
            this.buffer = _.buffer;
        } else if (file instanceof Blob) {
            this.buffer = await file.arrayBuffer();
            this.file = new DataView(this.buffer);
        } else if (!!!this.file instanceof DataView) throw new SyntaxError("Input file must be a: ArrayBuffer, File, DataView, Blob");
        /*Set up is done, now parse*/
        /*console.log(this.buffer);*/
        try {
            this.parser = new Parser(this.file, this.LE, this.buffer);
        } catch (e) {
            /*Parser error*/
            try {
                if (this.efunc) this?.efunc(e, this);
            } catch (_) {
                console.warn(_);
            }
            this.fileNameElm.textContent = this.name;
            if (this.lastLabelElm) this.lastLabelElm.textContent = "";
            if (this.outputElement1 && this.isCodeMirror) this.outputElement1.setValue(e.toString());
            if (this._.preview) this._.preview.root.hidden = true;
            if (this.isCodeMirror) this.outputElement.setValue(e.toString());
            else this.outputElement.innerHTML = `
<br><label style="color: red;">[${this.name}] ${e.toString()}
</label>`;
            return;
        }
        if (this.parser.error) {
            /*File error*/
            try {
                if (this.efunc) this.efunc(this.parser.error, this);
            } catch (_) {
                console.warn(_);
            }
            this.fileNameElm.textContent = this.name;
            if (this.lastLabelElm) this.lastLabelElm.textContent = "";
            if (this.outputElement1 && this.isCodeMirror) this.outputElement1.setValue(JSON.stringify(this.parser.error, bigIntJSON.replacer, 2));
            if (this._.preview) this._.preview.root.hidden = true;
            if (this.isCodeMirror) this.outputElement.setValue(JSON.stringify(this.parser.error, bigIntJSON.replacer, 2));
            else this.outputElement.innerHTML = `
<br><label style="color: red;">[${this.name}] ${JSON.stringify(this.parser.error, bigIntJSON.replacer, 2)}
</label>`;
            return;
        }
        try {
            if (this.func) this.func(this);
        } catch (e) {
            console.error(e);
        }
        if (this.isCodeMirror) {
            this.outputElement.setValue(JSON.stringify(this.parser.output, bigIntJSON.replacer, 2));
            if (!this.outputElement1) throw new Error("Null Pointer");
            this.outputElement1.setValue(JSON.stringify(this.parser.nbt, bigIntJSON.replacer, 2));
            this.data = this.parser.output;
            this.nbt = this.parser.nbt;
        }
        else try {
            this.nbt_tree = new NBTTree(this.parser.nbt, this.readOnly);
            this.outputElement.innerHTML = this.nbt_tree.data;
            this.data = this.parser.output;
            this.nbt = this.parser.nbt;
            Array.from(document.querySelectorAll(".nbt.text")).forEach(el => NBTTree.change(el, -1));
            this.preview();
        } catch (e) {
            /*Internal error*/
            try {
                if (this.efunc) this.efunc(e, this);
            } catch (_) {
                console.warn(_);
            }
            this.fileNameElm.textContent = this.name;
            if (this.lastLabelElm) this.lastLabelElm.textContent = "";
            if (this.outputElement1 && this.isCodeMirror) this.outputElement1.setValue(`\`${String(e.stack)}\``);
            if (this._.preview) this._.preview.root.hidden = true;
            if (this.isCodeMirror) this.outputElement.setValue(`\`${String(e.stack)}\``);
            else this.outputElement.innerHTML = `
<br><label style="color: red;">[${this.name}] ${e.stack}
</label>`;
            return;
        }
        if (set_db) {
            this.db.setItem("last-file-name", this.name);
            this.db.setItem('last-file', JSON.stringify(Array.from(new Uint8Array(this.buffer))));
        }
        return void 0;
    }
    lastFile() {
        let last = this.db.getItem('last-file'),
            last_name = this.db.getItem('last-file-name');
        this.fileNameElm.textContent = last_name;
        this.name = last_name;
        this.file = new Uint8Array(JSON.parse(last)).buffer;
        if (this.lastLabelElm) this.lastLabelElm.innerHTML = "<br><br>The file you imported from the previous session has been restored.";
        this.init();
        return this.file;
    }
    loadFile(new_file) {
        this.file = new_file;
        this.orginal_file = new_file;
        this.name = new_file.name;
        this.fileNameElm.textContent = new_file.name;
        this.init(true);
        return this.file;
    }
    change(htmlElement) {
        let id = htmlElement.id,
            newValue = htmlElement.value,
            path = id.split("#"),
            valueType = +path.pop();
        /*this.parser.nbt.empty_property && path.unshift("");*/
        let {output: jsonData, nbt: nbtData} = this.parser;
        /*console.log(Object.keys(this.parser.nbt), path);*/
        
        const nbtIsNumber = type => type === 2 || type === 3 || type === 4 || type === 5 || type === 6;
        const stringTrim = string => string.replace(/\n|\ /g, "");
        
        function jsonPathFinder(obj, path, value) {
            const newObj = {...obj};
            if (path.length === 1) newObj[path[0]] = nbtIsNumber(valueType) ? +value : valueType === -1 ? stringTrim(value) : value;
            else {
                const [current, ...next] = path;
                newObj[current] = jsonPathFinder(obj[current], next, value);
            }
            return newObj;
        }
        function nbtPathFinder(nbt, path, value, isList = false) {
            /*console.log(arguments);*/
            const newObj = isList ? [...nbt] : {...nbt};
            if (path.length === 1) {
                if (isList) newObj[path[0]] = nbtIsNumber(valueType) ? +value : valueType === -1 ? stringTrim(value) : value;
                else newObj[path[0]].data = nbtIsNumber(valueType) ? +value : valueType === -1 ? stringTrim(value) : value;
            }
            else {
                const [current, ...next] = path;
                newObj[current].data = nbtPathFinder(nbt[current].data, next, value, newObj[current].type === 9);
            }
            return newObj;
        }
        this.nbt = nbtPathFinder(nbtData, path, newValue);
        this.data = jsonPathFinder(jsonData, path, newValue);
        this.preview();
    }
    export() {
        return {nbt: this.nbt, json: this.json};
    }
    preview() {
        if (this._.preview) {
            this._.preview.root.hidden = false;
            this._.preview.codemirror.setValue(JSON.stringify(this.nbt, bigIntJSON.replacer, +this._.preview.indent.value));
        }
    }
    jsonClipboard() {
        try {
            navigator.clipboard.writeText(JSON.stringify(this.data, bigIntJSON.replacer, +this._.preview.indent.value));
        } catch {
            UIController.copyToClipboard(JSON.stringify(this.data, bigIntJSON.replacer, +this._.preview.indent.value));
        }
    }
    nbtClipboard() {
        try {
            navigator.clipboard.writeText(JSON.stringify(this.nbt, bigIntJSON.replacer, +this._.preview.indent.value));
        } catch {
            UIController.copyToClipboard(JSON.stringify(this.nbt, bigIntJSON.replacer, +this._.preview.indent.value));
        }
    }
    download() {
        UIController.downloadFile(JSON.stringify(this.data, bigIntJSON.replacer, +this._.preview.indent.value), "raw-nbt.json", "application/json");
        UIController.downloadFile(JSON.stringify(this.nbt, bigIntJSON.replacer, +this._.preview.indent.value), "encode-nbt.json", "application/json");
    }
    jsonDownload() {
        UIController.downloadFile(JSON.stringify(this.data, bigIntJSON.replacer, +this._.preview.indent.value), "raw-nbt.json", "application/json");
    }
    nbtDownload() {
        UIController.downloadFile(JSON.stringify(this.nbt, bigIntJSON.replacer, +this._.preview.indent.value), "encode-nbt.json", "application/json");
    }
    encodeDownload() {
        try {
            const packer = new Packer(this.nbt, true);
            if (packer.error) throw new Error(JSON.stringify(packer.error));
            UIController.downloadFile(packer.buffer, "nbt.nbt", "application/octet-stream");
        } catch (e) {
            console.error(e);
        }
    }
}
class NBTTree {
    editor = {};
    group = [];
    data = "";
    static change(e, t) {
        let num = +e.value;
        if (!Number.isNaN(num)) switch (t) {
            case 2:
                (num < -32768 || num > 32767) && (alert("Out of number range (-32768 -> 32767)"), e.value = e.value < 0 ? -32768 : 32767);
                break;
            case 3:
                (num < -2147483648 || num > 2147483647) && (alert("Out of number range (-2147483648 -> 2147483647)"), e.value = e.value < 0 ? -2147483648 : 2147483647);
                break;
            case 4:
                (num < -9223372036854775808 || num > 9223372036854775807) && (alert("Out of number range (-9223372036854775808 -> 9223372036854775807)"), e.value = e.value < 0 ? -9223372036854775808 : 9223372036854775807);
                break;
        }
        e.style.width = (e.value.length + 1) * 8 + "px";
    }
    constructor(nbt, readOnly = false) {
        this.readOnly = readOnly;
        this.data = this.compound("", nbt[""].data);
        this.group = [];
        return this;
    }
    compound(key = "main", value, nested = false, s = false) {
            if (nested) value = value.data;
            let f = Object.keys(value ?? {}),
                end = false,
                data = `
<ul class="nbt${nested?1:0}">
    <li>
        ${nested ? `<label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? (!s ? line.content : "┗━━&puncsp;&hairsp;&hairsp;") : "┗━━&puncsp;&hairsp;" }</label>` : ""}
        <img class="nbt img"${key === "" && window.innerWidth > 1024 ? " style=\"transform: translateX(-2.5vw)\"" : ""} src="./app-theme/nbt/compound-icon.png"/>
        <label style="font-size: 1em">${key}</label>
    </li>
</ul>`;
            data += `
<ul class="nbt${s ? "7" : "2"}">`;
            if (!f.length) return (data += `
<ul>Empty</ul></ul>`);
            this.group.push(key);
            for (let i = 0; i < f.length; i++) {
                const k = f[i];
                end = i === f.length - 1;
                if (end) data += `
</ul>
<ul class="nbt${!nested?6:3}">`;
                if (k === "FlatWorldLayers") {
                    data += `
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/string-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <br>
    <textarea class="nbt5" id="${this.group.join("#")}#${k}#-1" onchange="nbtEditor.change(this)">${JSON.stringify(JSON.parse(value[k].data), bigIntJSON.replacer, 2)}</textarea>
`;
                    continue;
                }
                switch (value[k].type) {
                    case 1:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/byte-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input type="checkbox" id="${this.group.join("#")}#${k}#1" onchange="nbtEditor.change(this)" ${value[k].data === 1 ? "checked": ""}/>
</ul>`;
                        break;
                    case 2:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/short-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#2" min="-32768" max="32767" value="${value[k].data}" oninput="NBTTree.change(this, 2)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 3:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/int-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#3" min="-2147483648" max="2147483647" value="${value[k].data}" oninput="NBTTree.change(this, 3)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 4:
                        data += k === "LastPlayed" ? `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/long-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#4" min="-9223372036854775808" max="9223372036854775807" value="${value[k].data}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"${this.readOnly ? "readonly" : ""}/>
    <label style="font-size: 1em; color: gray; font-size: 0.8rem">(${dateString(value[k].data)})</label>
</ul>`:`
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/long-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#4" min="-9223372036854775808" max="9223372036854775807" value="${value[k].data}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 5:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/float-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#5" value="${value[k].data}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 6:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/double-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#6" value="${value[k].data}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 7:
                    case 11:
                    case 12:
                        throw new SyntaxError(`Missing parser for type: ${value[k].type}`);
                        break;
                    case 8:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/string-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="string" id="${this.group.join("#")}#${k}#8" value="${value[k].data}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 9:
                        data += `
${this.list(k, value[k], true, end)}
`
                        break;
                    case 10:
                        data += `
${this.compound(k, value[k], true, end/* && !nested*/)}
`;
                        break;
                    default:
                        throw new Error(`Render type not found: ${value[k].type}`);
                }
            }
            data += `
</ul>`;
            this.group.pop();
            return data;
        }
    list(key = "main", value, nested = false, s = false, value1 = value) {
            value = value.data;
            let f = Object.keys(value ?? {}),
                end = false,
                data = `
<ul class="nbt${nested?1:0}">
    <li>
        ${nested ? `<label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? (!s ? line.content : "┗━━&puncsp;&hairsp;&hairsp;") : "┗━━&puncsp;&hairsp;" }</label>` : ""}
        <img class="nbt img" src="./app-theme/nbt/list-icon.png"/>
        <label style="font-size: 1em">${key}</label>
    </li>
</ul>`;
            data += `
<ul class="nbt${s ? "7" : "2"}">`;
            if (!f.length) return (data += `
<ul>Empty</ul></ul>`);
            this.group.push(key);
            for (let i = 0; i < value1.length; i++) {
                if (i > 50) {
                    data += `
</ul>
<ul class="nbt${!nested?6:3}">
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">┗━━&puncsp;&hairsp;</label>
    <label>... more ${value1.length - i} values</label>
</ul>`;
                    break;
                }
                const k = f[i];
                end = i === f.length - 1;
                if (end) data += `
</ul>
<ul class="nbt${!nested?6:3}">`;
                switch (value1.data_type) {
                    case 1:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/byte-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input type="checkbox" id="${this.group.join("#")}#${k}#1" ${value[k] === 1 ? "checked": ""} onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 2:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/short-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#2" min="-32768" max="32767" value="${value[k]}" oninput="NBTTree.change(this, 2)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 3:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/int-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#3" min="-2147483648" max="2147483647" value="${value[k]}" oninput="NBTTree.change(this, 3)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 4:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/long-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#4" min="-9223372036854775808" max="9223372036854775807" value="${value[k]}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 5:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/float-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#5" value="${value[k]}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 6:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/double-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="number" id="${this.group.join("#")}#${k}#6" value="${value[k]}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 7:
                    case 11:
                    case 12:
                        throw new SyntaxError(`Missing parser for type: ${value1.data_type}`);
                        break;
                    case 8:
                        data += `
<ul>
    <label style="color: ${line.color}; font-size: 1rem; text-decoration: bold;">${!end ? line.content : "┗━━&puncsp;&hairsp;"}</label>
    <img class="nbt img" src="./app-theme/nbt/string-icon.png"/>
    <label style="font-size: 1em">${k}: </label>
    <input class="nbt text" type="string" id="${this.group.join("#")}#${k}#8" value="${value[k]}" oninput="NBTTree.change(this, -1)" onchange="nbtEditor.change(this)"/>
</ul>`;
                        break;
                    case 9:
                        data += `
${this.list(k, value[k], true, end)}
`
                        break;
                    case 10:
                        data += `
${this.compound(k, value[k], true, end/* && !nested*/)}
`;
                        break;
                    default:
                        throw new Error(`Render type not found: ${value1.data_type}`);
                }
            }
            data += `
</ul>`;
            this.group.pop();
            return data;
        }
    }
class Parser {
    constructor(dataView, littleEndian, arrayBuffer) {
        this.reader = new Reader(dataView, littleEndian);
        this.data = Array.from(new Uint8Array(arrayBuffer));
        this.length = dataView.byteLength;
        this.LE = littleEndian || false;
        this.output = {};
        this.nbt = {
            empty_property: false,
            hasHeader: false,
            type: -1,
            isNBT: true
        };
        /* In theory, the first byte of the header is 0x08, but level.dat is usually 0x0a */
        this.special_header =
            this.data[0] !== 0 &&
            this.data[1] === 0 &&
            this.data[2] === 0 &&
            this.data[3] === 0 &&
            this.length !== 4;
        /* Check header */
        if (this.reader.readByte() === 10 && !this.special_header) {
            this.hasHeader = false;
            this.output = this.readCompound(false, true);
            if (this.nbt.empty_property) {
                let bind = this.output;
                this.output = {};
                this.output[""] = bind;
            }
            return this;
        /*console.log(Array.from(new Uint8Array(this.reader.data.buffer)));
            return this;*/
        }
        this.reader.pos -= 1;
        if (this.reader.readByte() === 8 || this.special_header) {
            this.reader.pos -= 1;
            this.nbt.hasHeader = true;
            this.nbt.header = [this.reader.readInt(), this.reader.readInt()];
            this.output = this.readCompound(true, true);
            if (this.nbt.empty_property) {
                let bind = this.output;
                this.output = {};
                this.output[""] = bind;
            }
            return this;
        }
        this.error = {
            error: true,
            reason: "Not a vaild file (can't detect a compound)"
        }
        return this;
    }
    _switcher(type, $) {
        let end = false, nbt, data, list = {};
        switch (type) {
            case 1:
                data = this.reader.readByte();
                break;
            case 2:
                data = this.reader.readShort();
                break;
            case 3:
                data = this.reader.readInt();
                break;
            case 4:
                data = this.reader.readLong();
                break;
            case 5:
                data = this.reader.readFloat();
                break;
            case 6:
                data = this.reader.readDouble();
                break;
            case 7:
                list = this.readByteList();
                break;
            case 8:
                data = this.reader.readString();
                break;
            case 9:
                $ = this.readList();
                list = $.nbt;
                data = $.out;
                break;
            case 10:
                $ = this.readCompound();
                nbt = $.nbt;
                data = $.out;
                break;
            case 11:
                list = this.readIntList();
                break;
            case 12:
                list = this.readLongList();
                break;
            default:
                throw new Error(`Invalid item type: ${type} at position ${this.reader.pos}`);
                return;
        }
        return {data, end, nbt, list};
    }
    readCompound(is_nested = false, write_output = false) {
        let out = {},
            nbt_out = {};
        /*check for empty key*/
        if (is_nested) this.reader.pos += 1;
        if (this.reader.readByte() === 0) {
            if (write_output) {
              this.nbt.empty_property = true;
              //could be a empty string
              this.reader.pos--;
              this.reader.readString();
            }
            else if (write_output && !out.error) {
                this.nbt[""] = {data: nbt_out, type: 10};
                return out;
            }
            else return {out, nbt: nbt_out};
        }
        else this.reader.pos--;
        while (this.data[this.reader.pos] < this.length) {
            const last_pos = this.reader.pos;
            //console.log(`Compound Pos: ${last_pos}`)
            const type = this.reader.readByte();
            //console.log(`Type: ${type}`);
            if (type === 0) {
                //console.log("Break switcher at position " + this.reader.pos);
                break;
            }
            let string;
            try {
                string = this.reader.readString();
            } catch {
                this.error = {
                    error: true,
                    reason: "Not a vaild file (EOF)",
                    position: last_pos
                };
                break;
            }
            //console.log(`Key: ${string}`)
            let {end, data, nbt, list} = this._switcher(type);
            if (end) break;
            //console.log(`[${last_pos}->${this.reader.pos}]${string}<${["EOF", "Bool", "Int16", "Int32", "Int64", "Float", "Double", "ByteList", "String", "List", "Compound", "IntList", "LongList"][type]}>: ${typeof data == "obiect" ? JSON.stringify(data) : data}`);
            out[string] = data;
            if (nbt !== undefined) data = nbt;
            nbt_out[string] = {
                type,
                data,
                ...list
            }
        }
        if (write_output && !out.error) {
            this.nbt[""] = {data: nbt_out, type: 10};
            return out;
        }
        return {out, nbt: nbt_out};
    }
    readList() {
        let type = this.reader.readByte(),
            length = this.reader.readInt(),
            output = [],
            data = [];
        for (let i = 0; i < length; i++) {
            let d = this._switcher(type);
            if (type === 9) {
                output.push(d.data);
                data.push(d.list);
            }
            else if (type === 10) {
                output.push(d.data);
                data.push(d.nbt);
            }
            else {
                output.push(d.data);
                data.push(d.data);
            }
        }
        return {
            out: output,
            nbt: {
                data_type: type,
                data,
                nested: (type === 9),
                length
            }
        }
    }
    readLongList() {
        this.error = {
            error: true,
            reason: `Missing parser for type: 12`,
            position: this.reader.pos
        };
    }
    readIntList() {this.error = {
            error: true,
            reason: `Missing parser for type: 11`,
            position: this.reader.pos
        };
    }
    readByteList() {this.error = {
            error: true,
            reason: `Missing parser for type: 7`,
            position: this.reader.pos
        };
    }
}

class Reader {
    constructor(data, littleEndian) {
        if (!!!data instanceof DataView) throw new SyntaxError(`Input data must be a DataView.`);
        this.pos = 0;
        this.data = data;
        this.length = data.byteLength;
        this.littleEndian = littleEndian || false;
    }
    readByte() {
        const v = this.data.getInt8(this.pos);
        this.pos += 1;
        return v;
    }
    readUnsignedByte() {
        const v = this.readByte();
        if (v < 0) {
            throw new Error('EOF');
        }
        return v;
    }
    readShort() {
        const v = this.data.getInt16(this.pos, this.littleEndian);
        this.pos += 2;
        return v;
    }
    readInt() {
        const v = this.data.getInt32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }
    readLong() {
        const v = this.data.getBigInt64(this.pos, this.littleEndian);
        this.pos += 8;
        return v;
    }
    readFloat() {
        const v = this.data.getFloat32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }
    readDouble() {
        const v = this.data.getFloat64(this.pos, this.littleEndian);
        this.pos += 8;
        return v;
    }
    readString() {
        const len = this.readShort();
        if (len <= 0) {
            return '';
        }
        const values = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            values[i] = this.readByte();
        }
        let out = '';
        let c,
        c2,
        c3;
        let i = 0;
        while (i < len) {
            c = values[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    c2 = values[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F));
                    break;
                case 14:
                    c2 = values[i++];
                    c3 = values[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | ((c3 & 0x3F) << 0));
                      break;
            }
        }
        return out;
    }
    toString() {
        return `{ pos: ${this.pos}, length: ${this.length}, littleEndian: ${this.littleEndian} }`;
    }
}

class Writer {
    constructor(littleEndian) {
        this.pos = 0;
        this.buff = new ArrayBuffer(CAPACITY_DEFAULT);
        this.view = new Int8Array(this.buff);
        this.data = new DataView(this.buff);
        this.littleEndian = littleEndian || true;
    }

    ensureCapacity(minCapacity) {
        var oldCapacity = this.buff.byteLength;
        if (minCapacity - oldCapacity > 0) {
            let newCapacity = oldCapacity << 1;
            if (newCapacity - minCapacity < 0) {
                newCapacity = minCapacity;
            }
            let oldView = this.view,
                oldData = [],
                newBuff = new ArrayBuffer(newCapacity),
                newView = new Int8Array(newBuff);
            for (let i = 0; i < oldCapacity; i++) {
                oldData.push(oldView[i]);
            }
            newView.set(oldData);
            this.buff = newBuff;
            this.view = newView;
            this.data = new DataView(newBuff);
        }
    }

    writtenView() {
        return this.view;
    }

    writtenLength() {
        return this.pos;
    }

    writeByte(value) {
        this.ensureCapacity(this.pos + 1);
        this.data.setInt8(this.pos, value);
        this.pos += 1;
        return this;
    }

    writeShort(value) {
        this.ensureCapacity(this.pos + 2);
        this.data.setInt16(this.pos, value, this.littleEndian);
        this.pos += 2;
        return this;
    }
    
    writeHeaderInt(pos, value) {
        this.data.setInt32(pos, value, this.littleEndian);
        return this;
    }

    writeInt(value) {
        this.ensureCapacity(this.pos + 4);
        this.data.setInt32(this.pos, value, this.littleEndian);
        this.pos += 4;
        return this;
    }

    writeLong(value) {
        this.ensureCapacity(this.pos + 8);
        if (typeof value !== 'bigint') {
            value = BigInt(value);
        }
        this.data.setBigInt64(this.pos, value, this.littleEndian);
        this.pos += 8;
        return this;
    }

    writeFloat(value) {
        this.ensureCapacity(this.pos + 4);
        this.data.setFloat32(this.pos, value, this.littleEndian);
        this.pos += 4;
        return this;
    }

    writeDouble(value) {
        this.ensureCapacity(this.pos + 8);
        this.data.setFloat64(this.pos, value, this.littleEndian);
        this.pos += 8;
        return this;
    }

    writeString(value) {
        let len = value.length,
            utflen = 0;
        for (let i = 0; i < len; i++) {
            let c = value.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) utflen += 1;
            else if (c > 0x07FF) utflen += 3;
            else utflen += 2;
        }
        if (utflen > 0xFFFF) throw new Error(`Encoded string too long: ${utflen} bytes. (max: 65535)`);
        this.writeShort(utflen);
        for (let i = 0; i < len; i++) {
            let c = value.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) this.writeByte(c);
            else if (c > 0x07FF) {
                this.writeByte((0xE0 | ((c >> 12) & 0x0F)))
                .writeByte((0x80 | ((c >> 6) & 0x3F)))
                .writeByte((0x80 | ((c >> 0) & 0x3F)));
            } else {
            this.writeByte((0xC0 | ((c >> 6) & 0x1F)))
                .writeByte((0x80 | ((c >> 0) & 0x3F)));
            }
        }
        return this;
    }

    toString() {
        return `NBTWriter { pos: ${this.pos}, littleEndian: ${this.littleEndian} }`;
    }
}

class Packer {
    constructor(nbt, LE) {
        try {
            if (!nbt.isNBT) return {
                error: true,
                reason: "Not a nbt"
            };
            this.writer = new Writer(LE);
            this.LE = LE;
            if (nbt.hasHeader) {
                this.writer.writeInt(nbt.header[0]);
                this.writer.writeInt(0);
            }
            this.writer.writeByte(10);
            if (nbt.empty_property) {
                this.writer.writeByte(0);
                this.writer.writeByte(0);
            }
            this.compound(nbt[""]);
            this.writer.writeByte(0);
            const realLength = this.writer.writtenLength();
            if (nbt.hasHeader) {
                const lengthNoHeader = realLength - 8;
                this.writer.writeHeaderInt(4, lengthNoHeader);
            }
            const buffer = this.writer.data.buffer,
            newBuffer = new ArrayBuffer(realLength),
            sourceView = new Int8Array(buffer, 0, realLength),
            targetView = new Int8Array(newBuffer);
            targetView.set(sourceView);
            this.buffer = newBuffer;
            return this;
        } catch (e) {
            return {
                error: true,
                reason: "Invalid nbt - input not follow the interface.",
                domErr: String(e.stack)
            };
        }
    }
    compound(nbt) {
        const data = nbt.data;
        /*console.log(nbt);*/
        for (let key in data) {
            try {data[key].type} catch {continue}
            /*console.log(data[key]);*/
            /*if (key === "MinimumCompatibleClientVersion") console.log(data[key]);*/
            this.writeProperty(data[key].type, key, data[key], false);
        }
        return this;
    }
    list(nbt) {
        /*console.log(nbt);*/
        const { data_type, length, data, nested } = nbt;
        this.writer.writeByte(data_type).writeInt(length);
        for (let d of data) this.writeProperty(data_type, void 0, (nested ? d : {data: d}), true);
        return this;
    }
    writeProperty(type, key, value, isList = false) {
        /*console.log(arguments);*/
        if (!isList) this.writer.writeByte(type).writeString(key);
        switch (type) {
            case 1:
                this.writer.writeByte(value.data);
                break;
            case 2:
                this.writer.writeShort(value.data);
                break;
            case 3:
                this.writer.writeInt(value.data);
                break;
            case 4:
                this.writer.writeLong(value.data);
                break;
            case 5:
                this.writer.writeFloat(value.data);
                break;
            case 6:
                this.writer.writeDouble(value.data);
                break;
            case 7:
            case 11:
            case 12:
                break;
            case 8:
                this.writer.writeString(value.data);
                break;
            case 9:
                this.list(value);
                break;
            case 10:
                this.compound(value);
                this.writer.writeByte(0);
                break;
            default:
                throw new Error(`Unsupported nbt type id: ${type}`);
        }
        return this;
    }
    download(name = "level.dat") {
        UIController.downloadFile(this.buffer, name, "application/octet-stream");
    }
}