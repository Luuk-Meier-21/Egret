use std::sync::{self, mpsc::Receiver, Arc};

use futures_util::{
    lock::Mutex,
    stream::{SplitSink, SplitStream},
    FutureExt, SinkExt, StreamExt,
};
use tauri::{
    async_runtime::{self},
    Error, Manager, State,
};
use tokio::{
    sync::oneshot::{self},
    task::JoinHandle,
};
use warp::{
    filters::ws::{Message, WebSocket},
    reply::Reply,
    Filter,
};

use serde_json::Value;

pub mod emit;

use emit::emit_action_focus;

#[derive(Clone, serde::Serialize, serde::Deserialize, specta::Type)]
struct WsEvent {
    message: String,
}

#[derive(Clone, serde::Serialize, serde::Deserialize, specta::Type, Default, Debug)]
pub struct JSON(pub serde_json::Value);

impl ToString for JSON {
    fn to_string(&self) -> String {
        self.0.to_string()
    }
}

pub struct CompanionProcess {
    pub socket: sync::Mutex<Option<JoinHandle<()>>>,
    pub socket_sender: sync::Mutex<Option<async_runtime::Sender<()>>>,
    pub api_handle: sync::Mutex<Option<oneshot::Sender<()>>>,
    pub api_json: Arc<tokio::sync::Mutex<JSON>>,
}

impl Default for CompanionProcess {
    fn default() -> Self {
        Self {
            socket: Default::default(),
            socket_sender: Default::default(),
            api_handle: Default::default(),
            api_json: Default::default(),
        }
    }
}

#[specta::specta]
#[tauri::command]
pub async fn set_layout_state(
    state: State<'_, CompanionProcess>,
    json: JSON,
) -> Result<JSON, Error> {
    let mut json_state = state.api_json.lock().await;

    *json_state = json.clone();

    Ok(json)
}

#[specta::specta]
#[tauri::command]
pub async fn get_layout_state(state: State<'_, CompanionProcess>) -> Result<JSON, Error> {
    let json_state = state.api_json.lock().await;

    Ok(json_state.clone())
}

#[specta::specta]
#[tauri::command]
pub async fn open_companion_socket(
    app: tauri::AppHandle,
    state: State<'_, CompanionProcess>,
) -> Result<(), Error> {
    let mut socket_state = state.socket.lock().unwrap();
    let json_state = state.api_json.clone();

    if let Some(data) = &mut *socket_state {
        data.abort();
    }

    *socket_state = Some(serve_eventfull_socket(app, json_state, "socket", 2000));

    Ok(())
}

#[specta::specta]
#[tauri::command]
pub async fn close_companion_socket(state: State<'_, CompanionProcess>) -> Result<(), Error> {
    let mut socket_state = state.socket.lock().unwrap();

    if let Some(data) = &mut *socket_state {
        data.abort();
        *socket_state = None;
    }

    Ok(())
}

#[specta::specta]
#[tauri::command]
pub async fn serve_companion_layout(
    state: State<'_, CompanionProcess>,
    json: Value,
) -> Result<(), Error> {
    let mut api_state = state.api_handle.lock().unwrap();

    if let Some(data) = api_state.take() {
        let _ = data.send(());
    }

    *api_state = Some(serve_get("layout", 4600, json));

    Ok(())
}

#[specta::specta]
#[tauri::command]
pub async fn abort_companion_layout(state: State<'_, CompanionProcess>) -> Result<(), Error> {
    let mut api_state = state.api_handle.lock().unwrap();

    if let Some(data) = api_state.take() {
        let _ = data.send(());
    }

    Ok(())
}

fn serve_get(path_segment: &'static str, port: u16, json: Value) -> oneshot::Sender<()> {
    let cors = warp::cors().allow_any_origin().allow_methods(vec!["GET"]);

    let (stx, srx) = oneshot::channel::<()>();

    let routes = warp::path(path_segment)
        .and(warp::get())
        .map(move || {
            // get current data here... instead of rebooting and updating the server
            warp::reply::json(&json)
        })
        .with(cors);

    tokio::spawn(async move {
        warp::serve(routes)
            .bind_with_graceful_shutdown(([0, 0, 0, 0], port), async {
                srx.await.ok();
            })
            .1
            .await
    });

    stx
}

fn serve_eventfull_socket(
    app: tauri::AppHandle,
    json_state: Arc<tokio::sync::Mutex<JSON>>,
    path_segment: &'static str,
    port: u16,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        let clients: Arc<tokio::sync::Mutex<Vec<WebSocket>>> =
            Arc::new(tokio::sync::Mutex::new(Vec::new()));

        let routes = warp::path(path_segment)
            .and(warp::ws())
            .map(move |ws: warp::ws::Ws| {
                let app = app.clone();
                let state = json_state.clone();
                let a = clients.clone();

                ws.on_upgrade(|websocket| async move {
                    // let b = a.lock().await;
                    handle_socket_client(websocket, app, state).await;
                })
            });

        warp::serve(routes).bind(([0, 0, 0, 0], port)).await
    })
}

async fn handle_socket_client(
    websocket: WebSocket,
    app: tauri::AppHandle,
    json_state: Arc<tokio::sync::Mutex<JSON>>,
) {
    app.emit_all(
        "ws-upgrade",
        WsEvent {
            message: "Tauri is awesome!".into(),
        },
    )
    .unwrap();

    let (mut ws_out, ws_in) = websocket.split();

    send_layout_state(&mut ws_out, json_state.clone()).await;
    handle_socket_message(ws_out, ws_in, app, json_state).await;
}

async fn handle_socket_message(
    mut ws_out: SplitSink<WebSocket, Message>,
    mut ws_in: SplitStream<WebSocket>,
    app: tauri::AppHandle,
    json_state: Arc<tokio::sync::Mutex<JSON>>,
) {
    while let Some(result) = ws_in.next().await {
        if let Ok(message) = result {
            let data = message.to_str().unwrap_or("No value found");

            let mut data_split = data.split(":");

            let message_type = data_split.next().unwrap_or("none");
            let message_content = data_split.next().unwrap_or("none");

            send_layout_state(&mut ws_out, json_state.clone()).await;

            let _ = match message_type {
                "focus" => emit_action_focus(app.clone(), message_content),
                _ => Ok(()),
            };
        }
    }
}

pub async fn send_layout_state(
    ws_out: &mut SplitSink<WebSocket, Message>,
    json_state: Arc<tokio::sync::Mutex<JSON>>,
) {
    let json = json_state.lock().await;
    let json_string = json.to_string();

    let clean_option = json.0.get("clean");
    if let Some(serde_json::Value::Bool(is_clean)) = clean_option {
        if *is_clean {
            let _ = ws_out.send(Message::text(json_string)).await;
        } else {
            println!("Passed JSON has specified its uncleanliness, rejected.");
        }
    } else {
        println!("Passed JSON has not specified its cleanliness, rejected.");
    }
}

// let return_message = Message::text(format!("Application: {data}"));
// println!("message");

// let _ = ws_out.send(return_message).await;
