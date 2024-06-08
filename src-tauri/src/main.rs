// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod companion;
mod sound;
use std::fs;
use std::process::Command;

use specta::collect_types;

use tauri_specta::{self, ts};

use sound::{system_sound, voice_say};

use companion::CompanionProcess;
use companion::{
    abort_companion_layout, close_companion_socket, get_layout_state, open_companion_socket,
    serve_companion_layout, set_layout_state,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
#[specta::specta]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug)]
pub enum CustomError {
    CustomError { message: String },
}

// ipconfig getifaddr en0

#[tauri::command]
#[specta::specta]
fn get_mac_network_ip() -> Result<String, String> {
    let result = Command::new("ipconfig")
        .args(vec!["getifaddr", "en0"])
        .output();

    if let Ok(output) = result {
        return match String::from_utf8(output.stdout) {
            Ok(data) => Ok(data),
            Err(e) => Err(e.to_string()),
        };
    }

    Err(String::from("Failed"))
}

#[tokio::main]
async fn main() {
    std::panic::set_hook(Box::new(|info| {
        println!("Panic! {:?}", info);
        let data = format!("{:?}", info);
        fs::write("/tmp/egret-panic-log", data).expect("Unable to write file");
    }));

    #[cfg(debug_assertions)]
    ts::export(
        collect_types![
            greet,
            system_sound,
            voice_say,
            open_companion_socket,
            close_companion_socket,
            serve_companion_layout,
            abort_companion_layout,
            set_layout_state,
            get_layout_state,
            get_mac_network_ip
        ],
        "../src/bindings.ts",
    )
    .unwrap();

    #[cfg(debug_assertions)]
    println!("DEV MODE");

    tauri::Builder::default()
        .manage(CompanionProcess::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            system_sound,
            voice_say,
            serve_companion_layout,
            open_companion_socket,
            close_companion_socket,
            abort_companion_layout,
            set_layout_state,
            get_layout_state,
            get_mac_network_ip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
