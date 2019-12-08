let fileContents = [];
let calculateResult;

function uploadFile() {
    let files = document.getElementById("uploadFiles").files;
    let index = 0;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();
        reader.onload = function (e) {
            // noinspection JSUnresolvedVariable
            let content = e.target.result;
            let lines = content.split("\n");
            saveLines(file.name, lines);
            index++;
            if (index === files.length) {
                finishRead();
            }
        };
        reader.readAsText(file);
    }
}

function saveLines(name, lines) {
    let points = [];
    lines.forEach(line => {
        let point = {};
        let texts = line.split("\t");
        if (texts.length !== 3) {
            return;
        }
        point.x = parseFloat(texts[0]);
        point.y = parseFloat(texts[1]);
        if (isNaN(point.x) || isNaN(point.y)) {
            return;
        }
        points.push(point);
    });

    let fileContent = new FileContent();
    fileContent.name = name;
    fileContent.points = points;
    fileContents.push(fileContent);
}

function finishRead() {
    document.getElementById("uploadFiles").value = "";
    let table = document.getElementById("fileTable");
    table.innerText = "";
    insertTableHeader(table, ["文件名", "点的个数"]);
    fileContents.forEach(content => {
        insertTableRow(table, [content.name, content.points.length]);
    });
}

function calculate() {
    let x1 = parseFloat(document.getElementById("x1").value);
    let x2 = parseFloat(document.getElementById("x2").value);
    let results = [];
    fileContents.forEach(content => {
        let array1 = [];
        let array2 = [];
        content.points.forEach(p => {
            let x = p.x;
            if (isSame(x, x1)) {
                array1.push({"x": x, "y": p.y});
            }
            if (isSame(x, x2)) {
                array2.push({"x": x, "y": p.y});
            }
        });
        let result = new CalResult();
        result.points1 = array1;
        result.points2 = array2;
        result.name = content.name;
        if (array1.length >= 1 && array2.length >= 1) {
            let x1 = array1[0].x, y1 = array1[0].y;
            let x2 = array2[0].x, y2 = array2[0].y;
            if (x1 !== x2 && y1 !== y2) {
                result.slope = (y2 - y1) / (x2 - x1);
            }
        }
        results.push(result);
    });

    let table = document.getElementById("resultList");
    table.innerText = "";
    calculateResult = "";

    let headers = ["文件名", "x1对应的点", "x2对应的点", "斜率(第一对点)"];
    calculateResult += headers.join(", ");
    calculateResult += "\n";
    insertTableHeader(table, headers);
    results.forEach(r => {
        let rows = [r.name, toPointText(r.points1), toPointText(r.points2), r.slope];
        calculateResult += rows.join(", ").replace(/<br>/g, "");
        calculateResult += "\n";
        insertTableRow(table, rows);
    });
}

function downloadResult() {
    if (calculateResult === null || calculateResult === undefined || calculateResult === '') {
        return;
    }
    let hiddenElement = document.createElement('a');
    let BOM = "\uFEFF";
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(BOM + calculateResult);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'result.csv';
    hiddenElement.click();
}

function insertTableHeader(table, headers) {
    let tr = table.insertRow();
    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement('th');
        th.innerHTML = headers[i];
        tr.append(th);
    }
}

function insertTableRow(table, rows) {
    let tr = table.insertRow();
    for (let i = 0; i < rows.length; i++) {
        let td = document.createElement('td');
        td.innerHTML = rows[i];
        tr.append(td);
    }
}

function isSame(a, b) {
    let threshold = parseFloat(document.getElementById("threshold").value);
    if (isNaN(threshold)) {
        threshold = 0.00000001;
    }
    return Math.abs(a - b) < threshold;
}

function toPointText(points) {
    if (points.length === 0) {
        return "没找到对应的点";
    }
    let s = "";
    let i = 0;
    points.forEach(p => {
        s += "(" + p.x + " : " + p.y + ")";
        if (i++ < points.length - 1) {
            s += "<br>"
        }
    });
    s += "";
    return s;
}

const FileContent = function () {
    this.points = [];
    this.name = "";
};

const CalResult = function () {
    this.points1 = [];
    this.points2 = [];
    this.slope = 0;
    this.name = "";
};