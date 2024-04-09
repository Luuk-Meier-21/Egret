use std::default;

#[derive(strum_macros::Display, serde::Deserialize)]
enum MacOSSystemSound {
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

pub enum SystemSound {
    Fail,
    Blocked,
    Error,
    SuccesSmall,
    SuccesLarge,
}

// pub fn getMacOSSystemSoundPath(sound: MacOSSystemSound) -> &'static str {
//     format!("/System/Library/Sounds/{}.aiff", sound.to_string()).as_str()
// }

// pub fn getSystemSound(sound: SystemSound) -> MacOSSystemSound {
//     match sound {
//         Fail => MacOSSystemSound::Basso,
//         _ => MacOSSystemSound::Basso,
//     }
// }
