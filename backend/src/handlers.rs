use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
};
use std::sync::{Arc, RwLock};
use crate::models::{Student, StudentsResponse, ErrorResponse, SubjectInfo};

// Global application state
#[derive(Clone)]
pub struct AppState {
    pub students: Arc<RwLock<Vec<Student>>>,
    pub available_subjects: Arc<RwLock<Vec<String>>>,
}

// Get /health - checking server health
pub async fn health_check() -> impl IntoResponse {
    tracing::info!("💚 Health check called");
    Json(serde_json::json!({
        "status": "ok",
        "service": "Olympic Analyzer Backend",
        "version": "0.1.0",
        "features": ["dynamic_subjects", "excel_parsing", "rest_api"]
    }))
}

// GET /students - getting students list
pub async fn get_students(
    State(state): State<AppState>,
) -> Result<Json<StudentsResponse>, (StatusCode, Json<ErrorResponse>)> {
    tracing::info!("List students request");

    let students = state.students.read().unwrap().clone();
    let available_subjects = state.available_subjects.read().unwrap().clone();
    let total = students.len();
    
    Ok(Json(StudentsResponse {
        total,
        students,
        available_subjects,
    }))
}

// GET /students/:id - getting student by individual_number
pub async fn get_student_by_id(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Student>, (StatusCode, Json<ErrorResponse>)> {
    let student = state.students.read().unwrap()
        .iter()
        .find(|s| s.individual_number == id)
        .cloned();

    match student {
        Some(s) => Ok(Json(s)),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "not found".to_string(),
                message: format!("Student with {} id not found", id),
            }),
        )),
    }
}

// GET /subjects - getting list all subjects
pub async fn get_subjects(
    State(state): State<AppState>,
) -> impl IntoResponse {
    tracing::info!("📚 Subjects request");

    let subjects = state.available_subjects.read().unwrap().clone();
    let total = subjects.len();

    Json(SubjectInfo {
        subjects,
        total,
    })
}

// GET /test - test endpoint to checking
pub async fn test_endpoint() -> impl IntoResponse {
    tracing::info!("🧪 Test endpoind called");
    Json(serde_json::json!({
        "message": "Backend is working!",
        "rust_version": "1.91.1",
        "framework": "Axum",
        "features": {
            "dynamic_subjects": true,
            "excel_parsing": true,
            "filexible_grading": true
        },
        "status": "The system is fully functional, items are loaded dynamically"
    }))
}