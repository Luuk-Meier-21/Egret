use std::default;

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
