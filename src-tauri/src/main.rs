// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sound;

use serde_json::Number;
use specta::collect_types;
use std::process::Command;
use tauri_specta::{self, ts};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
#[specta::specta]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// #[specta::specta]
// fn system_sound(sound: SystemSound, speed: Number) -> () {
//     let _ = Command::new("afplay")
//         .args(vec![
//             getMacOSSystemSoundPath(getSystemSound(sound)),
//             "-r",
//             format!("{}", speed).as_str(),
//         ])
//         .spawn();
// }

fn main() {
    ts::export(collect_types![greet], "../src/bindings.ts").unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
