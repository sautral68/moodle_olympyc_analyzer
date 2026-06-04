use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use tokio::fs;
use std::env;
use crate::handlers::AppState;
use crate::excel_parser::{parse_excel, get_all_subjects};
use crate::models::ErrorResponse;

pub async fn upload_excel(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {
    tracing::info!("📤 Getting request to upload a file");

    while let Some(field) = multipart.next_field().await.map_err(|e| (
        StatusCode::BAD_REQUEST,
        Json(ErrorResponse {
            error: "multipart_error".to_string(),
            message: format!("Failed to read multipart field: {}", e),
        }),
    ))? {
        let name = field.name().unwrap_or("").to_string();

        if name == "file" {
            let filename = field.file_name().unwrap_or("uploaded.xlsx").to_string();

            let data = field.bytes().await.map_err(|e| (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "read_error".to_string(),
                    message: format!("Failed to read file bytes: {}", e),
                }),
            ))?;

            tracing::info!("📥 Getting file: {} ({} bytes)", filename, data.len());

            // Save to temp dir instead of current directory
            let temp_path = env::temp_dir().join(format!("olympic_{}", filename));
            let temp_path_str = temp_path.to_string_lossy().to_string();

            fs::write(&temp_path, &data).await.map_err(|e| (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "file_save_error".to_string(),
                    message: format!("Saving error: {}", e),
                }),
            ))?;

            match parse_excel(&temp_path_str) {
                Ok(students) => {
                    let subjects = get_all_subjects(&students);
                    let students_count = students.len();
                    let subjects_count = subjects.len();

                    *state.students.write().unwrap() = students;
                    *state.available_subjects.write().unwrap() = subjects;

                    tracing::info!("✅ State updated: {} students, {} subjects", students_count, subjects_count);

                    let _ = fs::remove_file(&temp_path).await;

                    return Ok(Json(serde_json::json!({
                        "success": true,
                        "message": "Файл успешно загружен и обработан.",
                        "students_count": students_count,
                        "subjects_count": subjects_count,
                    })));
                }
                Err(e) => {
                    let _ = fs::remove_file(&temp_path).await;
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: "parse_error".to_string(),
                            message: format!("Parsing error: {}", e),
                        }),
                    ));
                }
            }
        }
    }

    Err((
        StatusCode::BAD_REQUEST,
        Json(ErrorResponse {
            error: "no_file".to_string(),
            message: "File not found".to_string(),
        }),
    ))
}