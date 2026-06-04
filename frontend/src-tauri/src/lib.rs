use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri::Listener;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();

            match handle.shell().sidecar("backend") {
                Ok(sidecar) => {
                    match sidecar.spawn() {
                        Ok((_, child)) => {
                            let child: Arc<Mutex<Option<CommandChild>>> =
                                Arc::new(Mutex::new(Some(child)));
                            let child_clone = child.clone();
                            let handle2 = app.handle().clone();
                            handle2.listen("tauri://destroyed", move |_| {
                                eprintln!("[Olympic Analyzer] App closing, killing backend...");
                                if let Ok(mut guard) = child_clone.lock() {
                                    if let Some(c) = guard.take() {
                                        let _ = c.kill();
                                    }
                                }
                            });
                            eprintln!("[Olympic Analyzer] Backend started successfully");
                        }
                        Err(e) => {
                            eprintln!("[Olympic Analyzer] ERROR: Failed to spawn backend: {}", e);
                            show_error_window(app);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[Olympic Analyzer] ERROR: Failed to find backend sidecar: {}", e);
                    show_error_window(app);
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn show_error_window(app: &mut tauri::App) {
    let _ = tauri::WebviewWindowBuilder::new(
        app,
        "error",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Ошибка запуска")
    .inner_size(600.0, 200.0)
    .build();
}