use std::collections::HashMap;
use serde::{Deserialize, Serialize};


// Student with results
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Student {
    pub first_name: String,
    pub last_name: String,
    pub individual_number: String,
    pub institution: String,
    pub department: String,
    pub email: String,
    pub final_grade: f64,
    pub subject_grades: HashMap<String, u8>,
}


impl Student {
    // Get current grade for a subject
    pub fn get_grade(&self, subject: &str) -> Option<u8> {
        self.subject_grades.get(subject).copied()
    }

    // Get all subjects of students
    pub fn subjects(&self) -> Vec<String> {
        self.subject_grades.keys().cloned().collect()
    }

    // Get all grades as a vector (for statistics)
    pub fn all_grades(&self) -> Vec<u8> {
        self.subject_grades.values().cloned().collect()
    }

    // AVG grade for all subjects
    pub fn average_grade(&self) -> f64 {
        let grades = self.all_grades();
        if grades.is_empty() {
            return 0.0;
        }
        let sum: u32 = grades.iter().map(|&g| g as u32).sum();
        sum as f64 / grades.len() as f64
    }
}


// API response for a list of students
#[derive(Debug, Serialize)]
pub struct StudentsResponse {
    pub total: usize,
    pub students: Vec<Student>,
    // List of unique subjects
    pub available_subjects: Vec<String>,
}

// Info about a single subject
#[derive(Debug, Serialize)]
pub struct SubjectInfo {
    // All subjects list
    pub subjects: Vec<String>,
    // Subject quantity
    pub total: usize,
}

// API error response
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}


/// Stats models

// General statistics for all students
#[derive(Debug, Serialize)]
pub struct GeneralStats {
    pub total_students: usize,
    pub average_final_grade: f64,
    pub min_final_grade: f64,
    pub max_final_grade: f64,
    pub median_final_grade: f64,
    pub grade_distribution: GradeDistribution,
}

// Distribution of grades (how many students received each grade)
#[derive(Debug, Serialize)]
pub struct GradeDistribution {
    pub grade_2: usize,
    pub grade_3: usize,
    pub grade_4: usize,
    pub grade_5: usize,
}

// Statistics for one subject
#[derive(Debug, Serialize)]
pub struct SubjectStats {
    pub subject_name: String,
    pub student_count: usize,
    pub average_grade: f64,
    pub min_grade: u8,
    pub max_grade: u8,
    pub distribution: HashMap<u8, usize>, // grade -> quantity
}

// All subject statistics
#[derive(Debug, Serialize)]
pub struct AllSubjectsStats {
    pub subjects: Vec<SubjectStats>,
    pub total_subjects: usize,
}

// Institution statistics
#[derive(Debug, Serialize)]
pub struct InstitutionStats {
    pub institution_name: String,
    pub students_count: usize,
    pub average_final_grade: f64,
    pub departments: Vec<String>,
}

// Top students
#[derive(Debug, Serialize)]
pub struct TopStudents {
    pub count: usize,
    pub students: Vec<TopStudent>
}

// Top student
#[derive(Debug, Serialize, Clone)]
pub struct TopStudent {
    pub rank: usize,
    pub first_name: String,
    pub last_name: String,
    pub institution: String,
    pub final_grade: f64,
    pub individual_number: String,
}