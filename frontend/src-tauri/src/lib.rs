use std::process::Command;
use std::sync::Mutex;
use tauri::Manager;
use tauri::Listener;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Получаем путь к backend бинарнику
            let backend_path = {
                #[cfg(dev)]
                let path = {
                    let manifest_dir = env!("CARGO_MANIFEST_DIR");

                    #[cfg(target_os = "windows")]
                    let p = std::path::PathBuf::from(manifest_dir)
                        .join("binaries")
                        .join("backend-x86_64-pc-windows-msvc.exe");

                    #[cfg(not(target_os = "windows"))]
                    let p = std::path::PathBuf::from(manifest_dir)
                        .join("binaries")
                        .join("backend-x86_64-unknown-linux-gnu");

                    p
                };

                // В production Tauri кладёт externalBin в resource_dir
                // с суффиксом целевой платформы
                #[cfg(not(dev))]
                let path = {
                    let resource_dir = app.path().resource_dir()
                        .expect("Failed to get resource dir");

                    #[cfg(target_os = "windows")]
                    let p = resource_dir.join("binaries")
                        .join("backend-x86_64-pc-windows-msvc.exe");

                    #[cfg(not(target_os = "windows"))]
                    let p = resource_dir.join("binaries")
                        .join("backend-x86_64-unknown-linux-gnu");

                    p
                };

                path
            };

            // Логируем путь — будет видно в консоли при запуске в dev
            eprintln!("[Olympic Analyzer] Backend path: {:?}", backend_path);
            eprintln!("[Olympic Analyzer] Backend exists: {}", backend_path.exists());

            // Запускаем бэкенд — обрабатываем ошибку вместо паники
            match Command::new(&backend_path).spawn() {
                Ok(child) => {
                    let child = Mutex::new(child);
                    let handle = app.handle().clone();
                    handle.listen("tauri://destroyed", move |_| {
                        eprintln!("[Olympic Analyzer] App closing, killing backend...");
                        if let Ok(mut c) = child.lock() {
                            let _ = c.kill();
                        }
                    });
                    eprintln!("[Olympic Analyzer] Backend started successfully");
                }
                Err(e) => {
                    eprintln!("[Olympic Analyzer] ERROR: Failed to start backend: {}", e);
                    eprintln!("[Olympic Analyzer] Tried path: {:?}", backend_path);
                    // Показываем диалог с ошибкой вместо молчаливого краша
                    let _ = tauri::WebviewWindowBuilder::new(
                        app,
                        "error",
                        tauri::WebviewUrl::App("index.html".into()),
                    )
                    .title("Ошибка запуска")
                    .inner_size(600.0, 200.0)
                    .build();
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}