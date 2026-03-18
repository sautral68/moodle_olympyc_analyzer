use std::process::Command;
use std::sync::Mutex;
use tauri::Manager;
use tauri::Listener;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // В dev режиме ищем бэк рядом с проектом
            // В production — рядом с установленным приложением
            #[cfg(dev)]
            let backend_path = {
                let manifest_dir = env!("CARGO_MANIFEST_DIR");
                
                #[cfg(target_os = "windows")]
                let path = std::path::PathBuf::from(manifest_dir)
                    .join("binaries")
                    .join("backend-x86_64-pc-windows-msvc.exe");
                
                #[cfg(not(target_os = "windows"))]
                let path = std::path::PathBuf::from(manifest_dir)
                    .join("binaries")
                    .join("backend-x86_64-unknown-linux-gnu");
                
                path
            };

            #[cfg(not(dev))]
            let backend_path = {
                let resource_path = app.path().resource_dir()
                    .expect("Failed to get resource dir");

                #[cfg(target_os = "windows")]
                let path = resource_path.join("binaries/backend.exe");

                #[cfg(not(target_os = "windows"))]
                let path = resource_path.join("binaries/backend");

                path
            };

            println!("Starting backend from: {:?}", backend_path);

            let child = Command::new(&backend_path)
                .spawn()
                .expect("Failed to start backend");

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