use tauri::{Error, Manager};

use super::WsEvent;

#[derive(Clone, serde::Serialize, serde::Deserialize, specta::Type)]
struct FocusEvent<'a> {
    column_id: &'a str,
    row_id: &'a str,
}

pub fn emit_action_focus(app: tauri::AppHandle, contents: &str) -> Result<(), Error> {
    let mut contents_split = contents.split(".");
    let column_id = contents_split.next().unwrap_or("0");
    let row_id = contents_split.next().unwrap_or("0");

    app.emit_all(
        "focus",
        FocusEvent {
            column_id: column_id,
            row_id: row_id,
        },
    )
    .unwrap();

    Ok(())
}
