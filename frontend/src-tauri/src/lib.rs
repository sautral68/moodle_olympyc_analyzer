use std::process::Command;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app.path().resource_dir()
                .expect("Failed to get resource dir");

            // Путь к бэкенду
            #[cfg(target_os = "windows")]
            let backend_path = resource_path.join("binaries/backend.exe");
            
            #[cfg(not(target_os = "windows"))]
            let backend_path = resource_path.join("binaries/backend");

            // Запускаем бэкенд как дочерний процесс
            let mut child = Command::new(&backend_path)
                .spawn()
                .expect("Failed to start backend");

            // Убиваем бэкенд когда закрывается приложение
            app.listen("tauri://destroyed", move |_| {
                let _ = child.kill();
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}