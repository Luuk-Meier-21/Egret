// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sound;

use serde_json::Number;
use sound::{MacOSSystemSound, SystemSound};
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

#[tauri::command]
#[specta::specta]
fn system_sound(sound: MacOSSystemSound, speed: f32, volume: f64, time: f64) -> () {
    let _ = Command::new("afplay")
        .args(vec![
            sound.as_path().as_str(),
            "-r",
            format!("{}", speed).as_str(),
            "-v",
            format!("{}", volume).as_str(),
            "-t",
            format!("{}", time).as_str(),
        ])
        .spawn();
}

fn main() {
    ts::export(collect_types![greet, system_sound], "../src/bindings.ts").unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, system_sound])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
