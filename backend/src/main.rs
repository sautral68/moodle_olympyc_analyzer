mod models;
mod excel_parser;
mod handlers;
mod stats;
mod stats_handlers;
mod upload_handler;

use axum::{
    Router, routing::{get, post}
};
use std::sync::{Arc, RwLock};
use tower_http::cors::CorsLayer;
use tracing_subscriber;

use handlers::{AppState, health_check, get_students, get_student_by_id, get_subjects, test_endpoint};
use stats_handlers::{get_general_stats, get_subjects_stats, get_institutions_stats, get_top_n_students, get_single_subject_stats};
use excel_parser::{parse_excel, get_all_subjects};
use upload_handler::upload_excel;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    println!("\n ═══════════════════════════════════════════════════════");
    println!("   Olympic Analyzer Backend - Rust Edition");
    println!(" ═══════════════════════════════════════════════════════\n");

    // Starting with empty data
    let students = match std::env::var("EXCEL_PATH") {
        Ok(path) => {
            tracing::info!("📊 Loading data from: {}", path);
            parse_excel(&path).unwrap_or_else(|e| {
                tracing::warn!("⚠️ Failed to load Excel: {}", e);
                vec![]
            })
        }
        Err(_) => {
            tracing::info!("📊 No EXCEL_PATH set — starting with empty data");
            vec![]
        }
    };

    tracing::info!("✅ Loaded {} students", students.len());

    let subjects = get_all_subjects(&students);
    tracing::info!("📚 Found {} unique subjects", subjects.len());

    let state = AppState {
        students: Arc::new(RwLock::new(students)),
        available_subjects: Arc::new(RwLock::new(subjects)),
    };

    let cors = CorsLayer::permissive();

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/test", get(test_endpoint))
        .route("/students", get(get_students))
        .route("/students/{id}", get(get_student_by_id))
        .route("/subjects", get(get_subjects))
        .route("/stats", get(get_general_stats))
        .route("/stats/subjects", get(get_subjects_stats))
        .route("/stats/subject/{name}", get(get_single_subject_stats))
        .route("/stats/institutions", get(get_institutions_stats))
        .route("/top/{name}", get(get_top_n_students))
        .route("/upload", post(upload_excel))
        .layer(cors)
        .with_state(state);

    let addr = "127.0.0.1:3000";

    println!("\n🚀 Server is running on http://{}\n", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}