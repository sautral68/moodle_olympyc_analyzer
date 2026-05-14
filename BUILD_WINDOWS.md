# Инструкция по сборке Olympic Analyzer на Windows

Выполняй шаги строго по порядку. Весь процесс займёт около 30–60 минут (в основном ожидание загрузок и компиляции).

---

## Шаг 1 — Установка Rust

1. Открой браузер, перейди на **https://rustup.rs**
2. Скачай и запусти `rustup-init.exe`
3. В открывшемся чёрном окне терминала нажми `1` и `Enter` (стандартная установка)
4. Жди окончания — появится сообщение `Rust is installed now. Great!`
5. Закрой окно

---

## Шаг 2 — Установка Node.js

1. Перейди на **https://nodejs.org**
2. Нажми большую кнопку **LTS** (левая кнопка — стабильная версия)
3. Запусти скачанный `.msi` файл
4. Жми **Next** везде, ничего не меняй, в конце **Install**
5. Жди окончания установки

---

## Шаг 3 — Установка Visual Studio Build Tools

Без этого Rust не сможет компилировать под Windows.

1. Перейди на **https://visualstudio.microsoft.com/visual-cpp-build-tools/**
2. Нажми **Download Build Tools**
3. Запусти скачанный файл (`vs_BuildTools.exe`)
4. Подожди пока загрузится установщик (откроется окно с плитками)
5. Найди плитку **"Desktop development with C++"** и поставь галочку
6. Нажми **Install** (правый нижний угол)
7. Жди окончания — это может занять 10–20 минут

---

## Шаг 4 — Перезагрузи компьютер

**Обязательно!** После установки Rust и Node.js нужна перезагрузка, иначе они не будут видны в терминале.

---

## Шаг 5 — Подготовка проекта

1. Скопируй папку `moodle_diplom` к себе на рабочий стол (или в любое место без кириллицы и пробелов в пути)
2. Нажми правой кнопкой на кнопку **Пуск** → выбери **"Терминал"** или **"Windows PowerShell"**
3. Перейди в папку проекта (замени путь если положил не на рабочий стол):

```powershell
cd "$env:USERPROFILE\Desktop\moodle_diplom"
```

Проверь что ты в нужном месте — выполни `ls`, должны появиться папки `backend` и `frontend`.

---

## Шаг 6 — Сборка бэкенда

```powershell
cd backend
cargo build --release
```

Первый запуск скачивает все зависимости — **жди 5–15 минут**. В конце должно появиться:
```
Finished `release` profile [optimized] target(s) in ...
```

---

## Шаг 7 — Копирование бэкенда в нужное место

```powershell
cd ..
mkdir frontend\src-tauri\binaries -Force
copy backend\target\release\backend.exe frontend\src-tauri\binaries\backend-x86_64-pc-windows-msvc.exe
```

---

## Шаг 8 — Установка зависимостей фронтенда

```powershell
cd frontend
npm install
```

Жди пока скачаются все пакеты (1–3 минуты).

---

## Шаг 9 — Финальная сборка

### Вариант А — Только `.exe` без установщика (рекомендую для демонстрации)

```powershell
npm run tauri build -- --no-bundle
```

Готовый файл будет здесь:
```
frontend\src-tauri\target\release\Olympic Analyzer.exe
```
Этот `.exe` можно просто запустить — никакой установки не нужно. Работает на Windows 11 и на Windows 10 с обновлениями.

### Вариант Б — Установщик (если нужен `.exe`-инсталлер)

```powershell
npm run tauri build
```

Готовый установщик будет здесь:
```
frontend\src-tauri\target\release\bundle\nsis\Olympic Analyzer_1.0.0_x64-setup.exe
```
Этот установщик уже содержит WebView2 внутри — интернет при установке не нужен.

---

## Если что-то пошло не так

**Ошибка `cargo: command not found` или `npm: command not found`**
→ Не была выполнена перезагрузка после установки. Перезагрузи и попробуй снова.

**Ошибка при `cargo build --release` в папке backend**
→ Убедись что установлены Visual Studio Build Tools (Шаг 3).

**Ошибка `backend-x86_64-pc-windows-msvc.exe not found` при сборке Tauri**
→ Шаг 7 не был выполнен или путь указан неверно. Проверь что файл существует:
```powershell
ls frontend\src-tauri\binaries\
```

**Ошибка с кириллицей или пробелами в пути**
→ Перемести папку `moodle_diplom` в `C:\projects\moodle_diplom` и начни заново с Шага 5.
