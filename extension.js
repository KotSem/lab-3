const vscode = require('vscode');

// Структура данных: шаблоны кода для Python, C и JavaScript
const TEMPLATES = {
    python: {
        if: "if {CONDITION}:\n    pass",
        for: "for {VAR} in range({COUNT}):\n    pass",
        while: "while {CONDITION}:\n    pass"
    },
    c: {
        if: "if ({CONDITION}) {\n    // код\n}",
        for: "for (int {VAR} = 0; {VAR} < {COUNT}; {VAR}++) {\n    // код\n}",
        while: "while ({CONDITION}) {\n    // код\n}"
    },
    javascript: {
        if: "if ({CONDITION}) {\n    // код\n}",
        for: "for (let {VAR} = 0; {VAR} < {COUNT}; {VAR}++) {\n    // код\n}",
        while: "while ({CONDITION}) {\n    // код\n}"
    }
};

// Функция сборки: берет шаблон и подставляет значения
function createBlock(language, type, param1, param2) {
    let text = TEMPLATES[language][type];
    if (type === 'for') {
        // replaceAll заменяет все 3 вхождения {VAR} в C и JS (инициализация, условие, шаг)
        text = text.replaceAll('{VAR}', param1);
        text = text.replaceAll('{COUNT}', param2);
    } else {
        text = text.replaceAll('{CONDITION}', param1);
    }
    return text;
}

// Точка входа: регистрация команды плагина в VS Code
function activate(context) {
    let command = vscode.commands.registerCommand('blockGenerator.insertBlock', async function() {
        // Проверяем, открыт ли файл
        let editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // Определяем язык файла (Python, JS или C)
        let id = editor.document.languageId;
        let language = 'c';
        if (id === 'python') {
            language = 'python';
        } else if (id === 'javascript') {
            language = 'javascript';
        } else if (id === 'c' || id === 'cpp') {
            language = 'c';
        }

        // Показываем выпадающее меню с выбором блока
        let type = await vscode.window.showQuickPick(['if', 'for', 'while'], {
            placeHolder: 'Выберите тип блока'
        });
        if (!type) return;

        // Запрашиваем параметры у пользователя
        let result = '';
        if (type === 'for') {
            let variable = await vscode.window.showInputBox({ prompt: 'Имя переменной', value: 'i' });
            let count = await vscode.window.showInputBox({ prompt: 'Количество повторений', value: '10' });
            if (!variable || !count) return;
            result = createBlock(language, type, variable, count);
        } else {
            let condition = await vscode.window.showInputBox({ prompt: `Условие для ${type}`, value: 'x > 0' });
            if (!condition) return;
            result = createBlock(language, type, condition);
        }

        // Вставляем сгенерированный код на место курсора
        editor.edit(function(editBuilder) {
            let position = editor.selection.active;
            editBuilder.insert(position, result + '\n');
        });
    });

    context.subscriptions.push(command);
}

function deactivate() {}

module.exports = {
    activate: activate,
    deactivate: deactivate
};
