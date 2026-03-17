use std::process::Command;
use std::sync::Mutex;
use tauri::Manager;
use tauri::Listener;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app.path().resource_dir()
                .expect("Failed to get resource dir");

            #[cfg(target_os = "windows")]
            let backend_path = resource_path.join("binaries/backend.exe");
            
            #[cfg(not(target_os = "windows"))]
            let backend_path = resource_path.join("binaries/backend");

            println!("Starting backend from: {:?}", backend_path);

            let child = Command::new(&backend_path)
                .spawn()
                .expect("Failed to start backend");

            // Оборачиваем в Mutex чтобы можно было вызвать kill() внутри closure
            let child = Mutex::new(child);

            let handle = app.handle().clone();
            handle.listen("tauri://destroyed", move |_| {
                println!("App closing, killing backend...");
                if let Ok(mut c) = child.lock() {
                    let _ = c.kill();
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}