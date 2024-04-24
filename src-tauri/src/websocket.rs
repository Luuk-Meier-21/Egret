use std::fs;

use futures_util::{SinkExt, StreamExt};
use tauri::{Error, Manager};
use warp::{
    filters::ws::{Message, WebSocket},
    Filter,
};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[specta::specta]
#[tauri::command]
pub async fn start_companion_mode(app: tauri::AppHandle) -> Result<(), Error> {
    fs::write("/tmp/foo", "hi test").expect("Unable to write file");
    println!("starting companion mode");
    tokio::spawn(async move {
        // let app_ref = Arc::new(Mutex::new(app));
        let routes = warp::path("echo")
            // The `ws()` filter will prepare the Websocket handshake.
            .and(warp::ws())
            .map(move |ws: warp::ws::Ws| {
                let app = app.clone();
                // let a = Mutex::new(app.clone());
                app.emit_all(
                    "ws-connect",
                    Payload {
                        message: "Tauri is awesome!".into(),
                    },
                )
                .unwrap();
                // if let Ok(result) = app.lock() {
                //     result
                //         .emit_all(
                //             "ws-connection",
                //             Payload {
                //                 message: "Tauri is awesome!".into(),
                //             },
                //         )
                //         .unwrap();
                // }
                // And then our closure will be called when it  completes...
                ws.on_upgrade(move |websocket| {
                    app.emit_all(
                        "ws-upgrade",
                        Payload {
                            message: "Tauri is awesome!".into(),
                        },
                    )
                    .unwrap();
                    // if let Ok(result) = app {
                    //     result
                    //         .emit_all(
                    //             "ws-upgrate",
                    //             Payload {
                    //                 message: "Tauri is awesome!".into(),
                    //             },
                    //         )
                    //         .unwrap();
                    // }
                    handle_message(websocket)
                })
            });

        warp::serve(routes).try_bind(([0, 0, 0, 0], 2000)).await;
    });

    Ok(())
}

async fn handle_message(websocket: WebSocket) {
    let mut counter = 0;

    let (mut ws_out, mut ws_in) = websocket.split();

    while let Some(result) = ws_in.next().await {
        if let Ok(message) = result {
            let data = message.to_str().unwrap_or("No value found");
            let tag = "Server: ";
            counter += 1;

            println!("Message: {}", data);

            let return_message = Message::text(format!("{tag}{}{data}", counter));

            let _ = ws_out.send(return_message).await;
        }
    }
}
