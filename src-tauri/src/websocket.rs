use std::{fs, future, sync::Mutex};

use futures_util::{future::Join, Future, SinkExt, StreamExt};
use tauri::{Error, Manager, State};
use tokio::task::JoinHandle;
use warp::{
    filters::ws::{Message, WebSocket},
    reply::Reply,
    Filter,
};

#[derive(Clone, serde::Serialize, serde::Deserialize, specta::Type)]
struct WsEvent {
    message: String,
}

pub struct CompanionProcess(pub Mutex<Option<JoinHandle<()>>>);

impl CompanionProcess {
    fn new(handle: JoinHandle<()>) -> CompanionProcess {
        CompanionProcess(Mutex::new(Some(handle)))
    }
}

#[specta::specta]
#[tauri::command]
pub async fn start_companion_mode(
    app: tauri::AppHandle,
    state: State<'_, CompanionProcess>,
) -> Result<bool, Error> {
    let mut companion_state = state.0.lock().unwrap();

    let is_active = match &mut *companion_state {
        Some(data) => {
            data.abort();
            *companion_state = None;
            false
        }
        None => {
            *companion_state = Some(serve_companion_mode(app));
            true
        }
    };

    Ok(is_active)
}

fn serve_companion_mode(app: tauri::AppHandle) -> JoinHandle<()> {
    tokio::spawn(async move {
        let routes = warp::path("echo")
            .and(warp::ws())
            .map(move |ws: warp::ws::Ws| {
                let app = app.clone();
                handle_ws_connect(ws, app)
            });

        warp::serve(routes).try_bind(([0, 0, 0, 0], 2000)).await;
    })
}

fn handle_ws_connect(ws: warp::ws::Ws, app: tauri::AppHandle) -> impl Reply {
    app.emit_all(
        "ws-connect",
        WsEvent {
            message: "Tauri is awesome!".into(),
        },
    )
    .unwrap();

    ws.on_upgrade(move |websocket| {
        app.emit_all(
            "ws-upgrade",
            WsEvent {
                message: "Tauri is awesome!".into(),
            },
        )
        .unwrap();
        handle_message(websocket, app)
    })
}

async fn handle_message(websocket: WebSocket, app: tauri::AppHandle) {
    let (mut ws_out, mut ws_in) = websocket.split();

    while let Some(result) = ws_in.next().await {
        if let Ok(message) = result {
            let data = message.to_str().unwrap_or("No value found");

            let mut dataSplit = data.split(":");

            let message_type = dataSplit.next().unwrap_or("none");
            let message_content = dataSplit.next().unwrap_or("none");

            println!("{} - {}", message_type, message_content);

            let _ = match message_type {
                "focus" => handle_action_focus(app.clone(), message_content),
                _ => Ok(()),
            };
        }
    }
}

fn handle_action_focus(app: tauri::AppHandle, contents: &str) -> Result<(), Error> {
    app.emit_all(
        "action-focus",
        WsEvent {
            message: contents.into(),
        },
    )
    .unwrap();

    Ok(())
}

// let return_message = Message::text(format!("Application: {data}"));
// println!("message");

// let _ = ws_out.send(return_message).await;
