use calamine::{Data, DataType, Reader, Xlsx, open_workbook};
use anyhow::{Context, Result, bail};
use std::collections::HashMap;
use crate::models::Student;


/// Parse an Excel file with olimpiad results
pub fn parse_excel(file_path: &str) -> Result<Vec<Student>> {
    tracing::info!("🔍 Starting parse Excel file: {}", file_path);

    // Open the Excel file
    let mut workbook: Xlsx<_> = open_workbook(file_path)
        .context("Cannot open file")?;

    // Get the first sheet
    let sheet_name = workbook.sheet_names()
        .first()
        .context("File is empty")?
        .clone();

    tracing::info!("📄 Using sheet: {}", sheet_name);

    let range = workbook.worksheet_range(&sheet_name)
        .context("Failed to retrieve sheet data")?;

    let rows: Vec<_> = range.rows().collect();

    if rows.is_empty() {
        bail!("No data found in the sheet");
    }

    // Parse header row
    let headers = parse_headers(rows[0])?;
    tracing::info!("📋 Find {} columns", headers.subject_columns.len());
    tracing::info!("📚 Subjects: {:?}", headers.subject_columns);

    // Parse students (from the second row)
    let mut students = Vec::new();

    for (idx, row) in rows.iter().skip(1).enumerate() {
        match parse_student_row(row, &headers, idx + 2) {
            Ok(student) => students.push(student),
            Err(e) => {
                tracing::warn!("❗ Error parsing row {}: {}", idx + 2, e);
                continue; // Skip this row and continue with the next
            },
        }
    }

    tracing::info!("✅ Parsed {} students", students.len());
    Ok(students)
}


// Struct to hold headers
struct Headers {
    subject_columns: Vec<(usize, String)>,
}

// Parse headers
fn parse_headers(header_row: &[Data]) -> Result<Headers> {
    const FIXED_COLUMNS: usize = 7;

    // After 7 fixed columns, we expect subject columns
    let mut subject_columns = Vec::new();

    for (idx, cell) in header_row.iter().enumerate().skip(FIXED_COLUMNS) {
        if let Some(subject_name) = cell.get_string() {
            let subject = subject_name.trim().to_string();
            if !subject.is_empty() && subject != "-" {
                tracing::debug!("   Колонка {}: {}", idx, subject);
                subject_columns.push((idx, subject));
            }
        }
    }

    if subject_columns.is_empty() {
        bail!("No valid subject columns found in the header");
    }

    Ok(Headers { subject_columns })
}

// Parse a single student row
fn parse_student_row(
    row: &[Data],
    headers: &Headers,
    row_num: usize,
) -> Result<Student> {
    // Safely get string
    let get_string = |idx: usize| -> Result<String> {
        row.get(idx)
            .context(format!("Missing column at index {}", idx))?
            .get_string()
            .map(|s| s.to_string())
            .context(format!("Invalid string at column {}", idx))
    };

    // Safely get number
    let get_number = |idx: usize| -> Result<f64> {
        row.get(idx)
            .and_then(|cell| cell.get_float())
            .context(format!("Invalid number at column {}", idx))
    };

    // Parse fixed columns (from 0 to 6)
    let first_name = get_string(0)?;
    let last_name = get_string(1)?;
    let individual_number = get_string(2)?;
    let institution = get_string(3)?;
    let department = get_string(4)?;
    let email = get_string(5)?;
    let final_grade = get_number(6)?;

    // Dynamically parse subject grades
    let mut subject_grades = HashMap::new();

    for (col_idx, subject_name) in &headers.subject_columns {
        // Get grade for this subject
        if let Some(grade_value) = row.get(*col_idx)
            .and_then(|cell| cell.get_float())
            .map(|f| f as u8)
            .filter(|&g| (2..=5).contains(&g))
        {
            subject_grades.insert(subject_name.clone(), grade_value);
        }
    }

    Ok(Student {
        first_name,
        last_name,
        individual_number,
        institution,
        department,
        email,
        final_grade,
        subject_grades,
    })
}

// Getting all unique subjects from students
pub fn get_all_subjects(students: &[Student]) -> Vec<String> {
    let mut subjects = std::collections::HashSet::new();

    for student in students {
        for subject in student.subject_grades.keys() {
            subjects.insert(subject.clone());
        }
    }

    let mut subjects_vec: Vec<String> = subjects.into_iter().collect();
    subjects_vec.sort();
    subjects_vec
}



#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_excel() {
        let result = parse_excel("./olimpiada_test_data.xlsx");
        
        match result {
            Ok(students) => {
                println!("✅ Parsed {} students successfully", students.len());
                assert!(!students.is_empty(), "The list of students must not be empty");
                
                if let Some(first) = students.first() {
                    println!("\n👤 First student:");
                    println!("   Name: {} {}", first.first_name, first.last_name);
                    println!("   Email: {}", first.email);
                    println!("   Final grade: {}", first.final_grade);
                    println!("   Subjects and grades:");
                    for (subject, grade) in &first.subject_grades {
                        println!("      {} → {}", subject, grade);
                    }
                }
                
                // Display all unique items
                let all_subjects = get_all_subjects(&students);
                println!("\n📚 All subjects in system ({}):", all_subjects.len());
                for subject in all_subjects {
                    println!("   - {}", subject);
                }
            }
            Err(e) => {
                println!("❌ Parse error: {}", e);
            }
        }
    }
}