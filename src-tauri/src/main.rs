// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[allow(warnings, unused)]
mod db;

use db::*;
use prisma_client_rust::tokio;
use specta::collect_types;
use std::sync::Arc;
use tauri::State;
use tauri_specta::ts;

type DbState<'a> = State<'a, Arc<PrismaClient>>;

#[tauri::command]
#[specta::specta]
async fn get_users(db: DbState<'_>) -> Result<Vec<user::Data>, ()> {
    db.user().find_many(vec![]).exec().await.map_err(|_| ())
}

#[tauri::command]
#[specta::specta]
async fn new_user(db: DbState<'_>, email: String) -> Result<user::Data, ()> {
    db.user().create(email, vec![]).exec().await.map_err(|_| ())
}

#[tokio::main]
async fn main() {
    let db = PrismaClient::_builder().build().await.expect("eerrroo");

    #[cfg(debug_assertions)]
    ts::export(collect_types![get_users, new_user], "../src/bindings.ts").unwrap();

    // #[cfg(debug_assertions)]
    // db._db_push().await.unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_users, new_user])
        .manage(Arc::new(db))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
