use axum::{Router, routing::get};
use tower_http::cors::{Any, CorsLayer};

mod handlers;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/ws", get(handlers::ws_handler))
        .route("/", get(|| async { "Scribble.io backend running!" }))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Backend running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
