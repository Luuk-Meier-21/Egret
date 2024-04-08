// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rodio::source::SineWave;
use rodio::Sink;
use rodio::{source::Source, Decoder, OutputStream};
use std::io::BufReader;
use std::os::unix::process::CommandExt;
use std::process::Command;
use std::{fs::File, io::sink};
use tauri::{AppHandle, Manager, Menu, Window, WindowBuilder};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn sound() -> () {
    Command::new("afplay")
        .args(vec!["/System/Library/Sounds/Funk.aiff", "-r", "2.0"])
        .spawn();
}

fn main() {
    let menu = Menu::new();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, sound])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
