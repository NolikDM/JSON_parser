const inputFile = document.getElementById("inputJSONFile");
const form = document.getElementById("form");

const inputType = {
    file: "multiple",
    email: "multiple"
};

let masks = {};

function Parser(jsonFile) {
    if (!jsonFile) renderDocument(null, 'Файл не найден!');

    let reader = new FileReader();
    let json;

    if (jsonFile) {
        reader.readAsText(jsonFile);
    } else {
        renderDocument(null, 'Файл не найден!');
    }

    // reader.readAsText(jsonFile);
    // Запуск рендера страницы
    reader.onload = function() {
        json = reader.result;
        createForm(JSON.parse(json));
    };

    // reader.onerror = function() {
    //     alert("Ошибка во время загрузки файла");
    // }
}

// Создание формы
function createForm(content) {
    form.innerHTML = "";
    masks = {};

    Object.keys(content).map(a => {
        switch (a) {
            case "name":
                createTitle(content[a]);
                break;
            case "fields":
                createFields(content[a]);
                break;
            case "references":
                createRefs(content[a]);
                break;
            case "buttons":
                createButtons(content[a]);
                break;
        }
    });
}

// Создание заголовка
function createTitle(name) {
    let title = document.createElement('h1');

    name = name[0].toUpperCase() + name.slice(1);
    name = name.replace(/_/g, " ");

    title.innerHTML = name;
    form.appendChild(title);
}

// Создание полей
function createFields(fields) {
    let id = 0;

    fields.map(obj => {
        let {label, input} = obj;
        let oneField;

        if (label) {
            oneField = document.createElement('label');
            oneField.setAttribute('for', id);
            oneField.innerHTML = label;
            form.appendChild(oneField);
        }

        if (input) {
            oneField = createInput(input, id);
            form.appendChild(oneField);
        }
        id++;
    });

    if (Object.keys(masks).length) addMasks();
}

// Создание полей ввода (input)
function createInput(input, id) {
    if (input.multiple && !(inputType[input.type] === "multiple")) {
        delete input.type;
        return createSelect(input, id);
    }

    if (input.type === "textarea") {
        delete input.type;
        return createTextarea(input, id);

    } else if (input.type === "file") {
        return createInputFile(input, id);
    }

    let inputField = document.createElement('input');
    inputField.setAttribute('id', id);

    for (let attribute in input) {

        if (Array.isArray(input[attribute])) {
            inputField.setAttribute('list', attribute);
            createDataList(attribute, input[attribute]);

        } else if (attribute === 'mask') {
            inputField.setAttribute('type', 'text');
            inputField.setAttribute('placeholder', input[attribute]);
            masks[id] = `${input[attribute]}`

        } else if (input[attribute] === true) {
            inputField.setAttribute(attribute, '');

        } else if (input[attribute] !== 'false') {
            inputField.setAttribute(`${attribute}`, input[attribute]);
        }
    }
    return inputField;
}

// Создание входящего файла
function createInputFile(input, id) {

    let oneField = document.createElement('label');
    oneField.setAttribute('for', id);
    oneField.setAttribute('class', 'label__file');
    oneField.innerHTML = 'Загрузить файл';
    form.appendChild(oneField);

    let inputFileField = document.createElement('input');
    inputFileField.setAttribute('id', id);

    for (let attribute in input) {
        if (attribute === "filetype") {
            let strAccept = "";
            input[attribute].map(type => strAccept += "." + type + ", ");
            inputFileField.setAttribute('accept', strAccept.slice(0, -2));

        } else if (input[attribute] === true) {
            inputFileField.setAttribute(attribute, '');
        } else if (input[attribute] !== 'false') {
            inputFileField.setAttribute(`${attribute}`, input[attribute]);
        }
    }
    return inputFileField;
}

// Создание полей выбора(select)
function createSelect(input, id) {
    let selectField = document.createElement('select');
    selectField.setAttribute('id', id);

    for (let attribute in input) {

        if (Array.isArray(input[attribute])) {
            input[attribute].map(opt => {
                let option = document.createElement('option');
                option.setAttribute('value', opt);
                option.innerHTML = opt;
                selectField.appendChild(option);
            });

        } else if (input[attribute] === true) selectField.setAttribute(attribute, '');
        else if (input[attribute] !== 'false') selectField.setAttribute(`${attribute}`, input[attribute]);
    }
    return selectField;
}

// Создание поля textarea
function createTextarea(input, id) {
    let textField = document.createElement('textarea');
    textField.setAttribute('id', id);
    for (let attribute in input) {

        if (input[attribute] === true) textField.setAttribute(attribute, '');
        else if (input[attribute] !== 'false') textField.setAttribute(`${attribute}`, input[attribute]);
    }
    return textField;
}

// Создание списка значений
function createDataList(attribute, options) {
    let dataList = document.createElement('datalist');
    dataList.setAttribute('id', attribute);
    form.appendChild(dataList);

    options.map (value => {
        let option = document.createElement('option');
        option.setAttribute('value', value);
        dataList.appendChild(option);
    });
}

// Добавление масок
function addMasks() {
    for (let id in masks) {
        $(`#${id}`).mask(`${masks[id]}`);
    }
}

// Создание рекомендаций
function createRefs(refs) {
    let id = 1000;

    refs.map(ref => {
        if (refs[0].input) {
            if (ref.input) {
                let container = document.createElement('div');
                container.setAttribute('id', 'container__refs');
                form.appendChild(container);

                let inputField = createInput(ref.input, id);
                container.appendChild(inputField);
            } else {
                createLink(ref, "container__refs");
            }
        } else {
            createLink(ref);
        }
    });
}

// Создание ссылок
function createLink(ref, containerID) {
    let {text, ref: link} = ref;
    let textWithoutRef = ref['text without ref'];

    let containerRef = document.createElement('div');
    containerRef.setAttribute('class', 'container__ref');

    if (containerID) {
        const container = document.getElementById(containerID);
        container.appendChild(containerRef);
    } else {
        form.appendChild(containerRef);
    }

    if (textWithoutRef) {
        let textField = document.createElement('div');
        textField.innerHTML = textWithoutRef;
        containerRef.appendChild(textField);
    }

    let linkField = document.createElement('a');
    linkField.setAttribute('href', link);
    linkField.innerHTML = text;
    containerRef.appendChild(linkField);
}

// Создание кнопок
function createButtons(buttons) {
    let container = document.createElement('div');
    form.appendChild(container);

    buttons.map(but => {
        let buttonTag = document.createElement('button');
        buttonTag.innerHTML = but.text;
        container.appendChild(buttonTag);
    });
}

inputFile.addEventListener("change", () => Parser(inputFile.files[0]));