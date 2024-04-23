// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sound;

use serde_json::Number;
use sound::{MacOSSystemSound, SystemSound};
use specta::collect_types;
use std::{
    os::{macos::raw::stat, unix::process},
    process::{Child, Command},
};
use tauri::{async_runtime::Mutex, State};
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
fn voice_say(message: String) -> () {
    let script = format!(
        "tell application \"VoiceOver\"
            output \"{}\"
        end tell",
        message
    );
    let args = vec!["-e", script.as_str()];
    let _ = Command::new("osascript").args(args).spawn();
}

#[tauri::command]
#[specta::specta]
fn system_sound(sound: MacOSSystemSound, speed: f32, volume: f64, time: f64) -> () {
    let command = Command::new("afplay")
        .args(vec![
            sound.as_path().as_str(),
            "-r",
            speed.to_string().as_str(),
            "-v",
            volume.to_string().as_str(),
            "-t",
            time.to_string().as_str(),
            "-q",
            1.to_string().as_str(),
        ])
        .spawn()
        .unwrap();
}

pub struct SoundEffect(Mutex<Option<Child>>);

fn main() {
    ts::export(
        collect_types![greet, system_sound, voice_say],
        "../src/bindings.ts",
    )
    .unwrap();

    tauri::Builder::default()
        .manage(SoundEffect(Default::default()))
        .invoke_handler(tauri::generate_handler![greet, system_sound, voice_say])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
