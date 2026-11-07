#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn benchmark_complete(payload: String, app: tauri::AppHandle) {
    let output = std::env::var("BENCH_OUT").unwrap_or_else(|_| "tauri-result.json".to_string());
    std::fs::write(output, payload).expect("failed to write benchmark result");
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![benchmark_complete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
