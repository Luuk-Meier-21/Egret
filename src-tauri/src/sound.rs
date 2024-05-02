use std::{default, process::Command};

#[tauri::command]
#[specta::specta]
pub fn voice_say(message: String) -> () {
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
pub fn system_sound(sound: MacOSSystemSound, speed: f32, volume: f64, time: f64) -> () {
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

// sounds found at: /System/Library/Sounds/

#[derive(strum_macros::Display, serde::Deserialize, specta::Type)]
pub enum MacOSSystemSound {
    Basso,
    Blow,
    Bottle,
    Frog,
    Funk,
    Glass,
    Hero,
    Morse,
    Ping,
    Pop,
    Purr,
    Sosumi,
    Submarine,
    Tink,
}

impl MacOSSystemSound {
    pub fn as_path(self) -> String {
        format!("/System/Library/Sounds/{}.aiff", self.to_string())
    }
}

#[derive(strum_macros::Display, serde::Deserialize, specta::Type)]
pub enum SystemSound {
    Select,
    Fail,
    Blocked,
    Error,
    SuccesSmall,
    SuccesLarge,
}

impl SystemSound {
    pub fn to_macos_sound(self) -> MacOSSystemSound {
        match self {
            self::SystemSound::Fail => MacOSSystemSound::Basso,
            self::SystemSound::Select => MacOSSystemSound::Frog,
            _ => MacOSSystemSound::Basso,
        }
    }
}
