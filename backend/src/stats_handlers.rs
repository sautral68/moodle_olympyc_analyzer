use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use crate::handlers::AppState;
use crate::stats::*;
use crate::models::{ErrorResponse, TopStudents,};

pub async fn get_general_stats(State(state): State<AppState>) -> impl IntoResponse {
    let students = state.students.read().unwrap().clone();
    Json(calculate_general_stats(&students))
}

pub async fn get_subjects_stats(State(state): State<AppState>) -> impl IntoResponse {
    let students = state.students.read().unwrap().clone();
    let subjects = state.available_subjects.read().unwrap().clone();
    Json(calculate_subjects_stats(&students, &subjects))
}

pub async fn get_institutions_stats(State(state): State<AppState>) -> impl IntoResponse {
    let students = state.students.read().unwrap().clone();
    Json(calculate_institutions_stats(&students))
}

pub async fn get_top_n_students(
    State(state): State<AppState>,
    Path(n): Path<usize>,
) -> Result<Json<TopStudents>, (StatusCode, Json<ErrorResponse>)> {
    let limit = n.min(100);

    if limit == 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "invalid_parameter".to_string(),
                message: "n parameter must be larger than 0".to_string(),
            }),
        ));
    }

    let students = state.students.read().unwrap().clone();
    Ok(Json(get_top_students(&students, limit)))
}

pub async fn get_single_subject_stats(
    State(state): State<AppState>,
    Path(subject_name): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {
    let students = state.students.read().unwrap().clone();
    let subjects = state.available_subjects.read().unwrap().clone();

    if !subjects.contains(&subject_name) {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "not_found".to_string(),
                message: format!("'{}' subject not found", subject_name),
            }),
        ));
    }

    let stats = calculate_subjects_stats(&students, &[subject_name]);
    Ok(Json(stats.subjects.into_iter().next()))
}