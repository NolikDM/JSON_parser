start();

/* Делает первый символ строки заглавным */
function ucFirst(str) {
	if (!str) return str;

	return str[0].toUpperCase() + str.slice(1);
}

/* Генерирует целое число в диапозоне от min до max */
function randomInteger(min, max) {
    let rand = min- 0.5 + Math.random() * (max- min + 1);
    return Math.round(rand);
}

/* Выполняется при загрузке страницы, вызывает остальные функции */
function start() {
    let input = document.querySelector('#mainInput');

    $.jMaskGlobals.watchDataMask = true; 

	input.addEventListener('change', () => {
        readFile(input);
		createMasks();
	})
}

/* Проверка JSON формата */
function checkJSON(str) {
    if(!str) return false;
    if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		return true;
	} else {
		return false;
	}
}

/* Создает маску */
function createMasks() {
	$('.ANY-ANOTHER').mask('');
}

/* Читает загруженный файл */
/* input - (объект) кнопка для загрузки файла */
function readFile(input) {
    let file = input.files[0];
    let reader = new FileReader();

    if(file) {
        reader.readAsText(file);
    } else {
        renderDocument(null, 'Файл не найден!');
    }

    // Запуск рендера страницы
    reader.onload = function() {
        if(checkJSON(reader.result)) {
            renderDocument(reader.result);
        } else {
            renderDocument(null, 'Некорректные данные, формат файла должен быть JSON!');
        }
    }

    reader.onerror = function() {   
        alert("Ошибка во время загрузки файла");
    }
}

/* Рендер формы по полученному JSON */
/*  str - JSON в виде строки  */
function renderDocument(str, error = false) {
    let app = document.querySelector('#customForm');
    // парсинг json-объекта в javascript
    let data = JSON.parse(str);

    if(error) {
        html = '<span class="error">' + error + '</span';
    } else {
        html = '<form method="POST">';
        html += getName(data['name']);
        html += getFields(data['fields']);
        html += getReferences(data['references']);
        html += getBtns(data['buttons']);
    }
    app.innerHTML = html;
    return;
}

/* Рендер всех полей */
function getFields(data) {
    let html = '';

    if (!data) {
        return '';
    }

    for(let i = 0; i < data.length; i++) {
        let str = '';
        id = randomInteger(0, 1000);
        for (let key in data[i]) {
            if(!data[i].hasOwnProperty(key)) continue;
            str += renderTag(key, data[i][key], ('f-' + id), ('f-' + id));
        }
        html += str;
    }
    return html;
}

/* Рендер всех ссылок */
function getReferences(data) {
    let html = '';
    if(!data) {
        return '';
    }

    for(let i = 0; i < data.length; i++) {
        let str = '';
        id = randomInteger(0, 1000);
        for (let key in data[i]) {
            if(!data[i].hasOwnProperty(key)) continue;
            str += renderTag(key, data[i][key], ('r-' + id), ('r-' + id));
        }
        html += str;
    }
    return html;
}

/* Рендер всех кнопок */
function getBtns(data) {
    let html = '';

    if (!data) {
        return '';
    }

    for(let i = 0; i < data.length; i++)
    {
        str = '<input type="submit" class="btn" value="' + data[i]['text'] + '" />';
        html += str;
    }
    return html;
}

/* Рендер имени формы (её может и не быть) */
function getName(name) {
    if(!name) {
        return '';
    }
    return '<h1>' + ucFirst(name) + '</h1>';
}

/* Функция рендерит списки значений для атрибута */
function getList(arr) {
    let html = '';
    
    if(!arr) {
        return '';
    }

    for(let i = 0; i < arr.length; i++) {
        if(i == arr.length - 1) { 
            html += '.' + arr[i];
            break;
        }
        html += '.' + arr[i] + ', ';
    }
    return html;
}

/* Создание текстового поля */
function createTextArea(attribute, id = '', itClass = '') {
    let html = '';

    if ( !attribute ) {
        return 'Невозможно создать форму, не хватает атрибутов!';
    }

	html = '<textarea ';
	Object.keys(attribute).forEach(function(item) {
		if(item == 'type') return;
		html += item + '="' + this[item] + '"';
    }, attribute)
    
	if(id) {
        html += ' id="' + id + '"';
    }
    if(itClass) {
        html += ' class="' + itClass + '"';
    } 
	html += "></textarea>";

	return html; 
}

/* Создание поля с цветами */
function createColor(attribute, id = '', itClass = '') {
    let html = '';
    
    if (!attribute) {
        return 'Невозможно создать цвет, не хватает атрибутов!';
    }

	html = '<input ';
	Object.keys(attribute).forEach(function(item) {
		if (item == 'colors') return;
		html += item + '="' + this[item] + '"';
	}, attribute)
	if (id) {
        html += ' list="' + id + '"';
    }
    html += " />";
    
    if (attribute['colors']) {
		html += '<datalist id="' + id + '">' 
		attribute['colors'].forEach(function(item) {
			html += '<option value="' + item + '">';
		})
		html += '</datalist>';
	}

	return html;
}

/* Создание поля технологии */
function createTech(attribute, id = '', itClass = '') {
    let html = '';

    if (!attribute) {
        return 'Невозможно создать технологию, не хватает атрибутов!';
    }

	html = '<input type="text" ';
	Object.keys(attribute).forEach(function(item) {
		if (item == 'technologies') return;
		html += item + '="' + this[item] + '"';
	}, attribute)
    
    if (id) {
        html += ' list="' + id + '"';
    }
    html += ' /><datalist id="' + id + '">';
	attribute['technologies'].forEach(function(item) {
		html += '<option value="' + item + '">'
	})
	html += '</datalist>';

	return html;
}

/* Функция делает рендер тега */
function renderTag(tag, attribute, id = '', itFor = '', itClass = '') {
    let html = '';

    if (!tag) {
        return '';
    }
    if (!attribute) return '<' + tag + '>' + '</' + tag + '>';

    switch (typeof attribute) {
        case 'object':
            switch (attribute['type']) {
                case 'textarea':
                    html = createTextArea(attribute, id);
                    break;
                case 'color':
                    html = createColor(attribute, id);
                    break;
                case 'technology':
                    html = createTech(attribute, id);
                    break;
                default:
                    html = '<input ';
                    Object.keys(attribute).forEach(function(item) {
                        if(item == 'checked' && this[item] == 'false') return;
                        if(item == 'filetype') {
                            html += ' accept="';
                            html += getList(this[item]);
                            html += '"';
                            return;
                        }
                        if(item == 'mask') {
                            html += ' data-mask="' + this[item] + '"';
                            html += ' class="mask"';
                            html = html.replace(/(type="){1}(\w)*("){1}/, 'type="text" ');
                            return;
                        }
                        html += item + '="' + this[item] + '"';
                    }, attribute)

                    if(id) html += ' id="' + id + '"';
                    html += " />"
                    break;
            }
            break;
        case 'string':
             /* Рендер ссылок */
             if (tag == 'text without reference') {
                html = '<span>' + attribute + '</span>';
                break;
            }
            if(tag == 'text') {
                linkText= attribute;
                break;
            }
            if(tag == 'ref') {
                html = '<a href="' + attribute + '">' + linkText + '</a>';
                break;
            }

            /* Рендер текстовых полей */
            html = '<' + tag;
            if(id && tag != 'label') {
                html += ' id="' + id + '"';
            }
            if(itFor) {
                html += ' for="' + itFor + '"';
            }
            if(itClass) {
                html += ' class="' + itClass + '"';
            }
            html += '>' + attribute + '</' + tag + '>';
            break;

        default:
            return '';
    }
    return html;
}
