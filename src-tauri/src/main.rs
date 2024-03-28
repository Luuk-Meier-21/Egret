// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[allow(warnings, unused)]
mod prisma;

// #[allow(warnings, unused)]
// mod prisma;

// use prisma_client_rust::{tokio, PrismaClient};
// use specta::{collect_types, Type};
// use tauri_specta::ts;

// #[tauri::command]
// #[specta::specta]
// fn get_users(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// #[tokio::main]
fn main() {
    // let db = PrismaClient::_builder().build().await.unwrap();

    // #[cfg(debug_assertions)]
    // ts::export(collect_types![get_users], "../src/bindings.ts").unwrap();

    // #[cfg(debug_assertions)]
    // db._db_push().await.unwrap();

    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![get_users])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
