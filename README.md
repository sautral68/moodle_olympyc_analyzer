### 📋 Инструкция по сборке Olympic Analyzer
#### Шаг 1 — Установка Rust

Открой браузер и перейди на https://rustup.rs/
Нажми на ссылку скачать rustup-init.exe
Запусти скачанный файл
В появившемся окне терминала нажми цифру 1 и Enter
Жди окончания установки (5-10 минут)
Закрой терминал


#### Шаг 2 — Установка Node.js

Открой браузер и перейди на https://nodejs.org/
Нажми большую кнопку "LTS" (рекомендуемая версия)
Запусти скачанный .msi файл
Жми Next везде, оставляй всё по умолчанию
Жди окончания установки


#### Шаг 3 — Установка Visual Studio Build Tools
Это нужно для компиляции — без этого ничего не соберётся.

Перейди на https://visualstudio.microsoft.com/visual-cpp-build-tools/
Нажми "Download Build Tools"
Запусти скачанный файл
В открывшемся окне найди "Desktop development with C++" и поставь галочку
Нажми Install справа внизу
Жди окончания (может занять 10-20 минут)


#### Шаг 4 — Перезагрузи компьютер
Это важно! После установки Rust и Node нужно перезагрузиться чтобы они заработали.

#### Шаг 5 — Сборка проекта

Открой флешку
Скопируй папку moodle_diplom к себе на рабочий стол
Нажми правой кнопкой на кнопку Пуск → выбери "Windows PowerShell" или "Терминал"
Выполни команды по одной — копируй каждую строку и жди окончания перед следующей:
```powershell
cd "$env:USERPROFILE\Desktop\moodle_diplom"
```

```powershell
cd backend
cargo build --release
```

⏳ Это займёт 5-15 минут — жди пока не появится строка Finished

```powershell
cd ..
mkdir frontend\src-tauri\binaries
```

```powershell
copy backend\target\release\backend.exe frontend\src-tauri\binaries\backend-x86_64-pc-windows-msvc.exe
```

```powershell
cd frontend
npm install
```

⏳ Это займёт 2-5 минут

```powershell
npm run tauri build
```

⏳ Это самый долгий шаг — 10-20 минут. Жди пока не появится `Finished` или `Bundle`

---

#### Шаг 6 — Забрать готовый файл

После успешной сборки готовый установщик находится здесь:

```
Рабочий стол\moodle_diplom\frontend\src-tauri\target\release\bundle\nsis\
```

Там будет файл с названием примерно:
```
Olympic Analyzer_1.0.0_x64-setup.exe
```
Скопируй этот файл на флешку и забирай! 🎉

❗ Если что-то пошло не так
Ошибка "cargo не найден" → Rust не установился, повтори Шаг 1 и перезагрузись
Ошибка "npm не найден" → Node.js не установился, повтори Шаг 2 и перезагрузись
Ошибка "link.exe not found" → Visual Studio Build Tools не установились, повтори Шаг 3
Любая другая ошибка → Сфотографируй экран с ошибкой