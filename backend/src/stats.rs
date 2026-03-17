use std::collections::HashMap;
use crate::models::{
    Student, GeneralStats, GradeDistribution, 
    SubjectStats, AllSubjectsStats, InstitutionStats, 
    TopStudents, TopStudent
};


// Calculate general statistics
pub fn calculate_general_stats(students: &[Student]) -> GeneralStats {
    if students.is_empty() {
        return GeneralStats { 
            total_students: 0, 
            average_final_grade: 0.0, 
            min_final_grade: 0.0, 
            max_final_grade: 0.0, 
            median_final_grade: 0.0, 
            grade_distribution:  GradeDistribution { 
                grade_2: 0, 
                grade_3: 0, 
                grade_4: 0, 
                grade_5: 0 
            },
        };
    }

    let total = students.len();

    // Collecting all final grades
    let mut final_grades: Vec<f64> = students.iter().map(|s| s.final_grade).collect();
    final_grades.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let sum: f64 = final_grades.iter().sum();
    let average = sum / total as f64;
    let min = *final_grades.first().unwrap();
    let max = *final_grades.last().unwrap();

    // Median
    let median = if total % 2 == 0 {
        (final_grades[total / 2 - 1] + final_grades[total / 2]) / 2.0
    } else {
        final_grades[total / 2]
    };

    // Distribution of grades (rounding the final grade to the nearest whole number)
    let mut grade_2 = 0;
    let mut grade_3 = 0;
    let mut grade_4 = 0;
    let mut grade_5 = 0;

    for grade in &final_grades {
        let rounded = grade.round() as u8;
        match rounded {
            2 => grade_2 += 1,
            3 => grade_3 += 1,
            4 => grade_4 += 1,
            5 => grade_5 += 1,
            _ => {}
        }
    }

    GeneralStats {
        total_students: total,
        average_final_grade: (average * 100.0).round() / 100.0,
        min_final_grade: (min * 100.0).round() / 100.0,
        max_final_grade: (max * 100.0).round() / 100.0,
        median_final_grade: (median * 100.0).round() / 100.0,
        grade_distribution: GradeDistribution {
            grade_2,
            grade_3,
            grade_4,
            grade_5,
        },
    }
}

// Calculate statistics for all subjects
pub fn calculate_subjects_stats(students: &[Student], subjects: &[String]) -> AllSubjectsStats {
    let mut subject_stats = Vec::new();

    for subject in subjects {
        let stats = calculate_single_subject_stats(students, subject);
        subject_stats.push(stats);
    }

    AllSubjectsStats {
        total_subjects: subject_stats.len(),
        subjects: subject_stats,
    }
}

// Calculate single subject stats
pub fn calculate_single_subject_stats(students: &[Student], subject: &str) -> SubjectStats {
    let mut grades = Vec::new();

    // Collecting all grades for this subject
    for student in students {
        if let Some(&grade) = student.subject_grades.get(subject) {
            grades.push(grade);
        }
    }

    if grades.is_empty() {
        return  SubjectStats {
            subject_name: subject.to_string(),
            student_count: 0,
            average_grade: 0.0,
            min_grade: 0,
            max_grade: 0,
            distribution: HashMap::new(),
        };
    }

    let count = grades.len();
    let sum: u32 = grades.iter().map(|&g| g as u32).sum();
    let average = sum as f64 / count as f64;
    let min = *grades.iter().min().unwrap();
    let max = *grades.iter().max().unwrap();

    // Distribution
    let mut distribution = HashMap::new();
    for &grade in &grades {
        *distribution.entry(grade).or_insert(0) += 1;
    }

    SubjectStats {
        subject_name: subject.to_string(),
        student_count: count,
        average_grade: (average * 100.0).round() / 100.0,
        min_grade: min,
        max_grade: max,
        distribution,
    }
}

// Calculates statistics for institutions
pub fn calculate_institutions_stats(students: &[Student]) -> Vec<InstitutionStats> {
    let mut institution_map: HashMap<String, Vec<&Student>> = HashMap::new();

    // Grouping students by institutions
    for student in students {
        institution_map
            .entry(student.institution.clone())
            .or_insert_with(Vec::new)
            .push(student);
    }

    let mut stats = Vec::new();

    for (institution_name, inst_students) in institution_map {
        let count = inst_students.len();
        let sum: f64 = inst_students.iter().map(|s| s.final_grade).sum();
        let average = sum / count as f64;

        // Collecting unique departments
        let mut departments: Vec<String> = inst_students
            .iter()
            .map(|s| s.department.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();
        departments.sort();

        stats.push(InstitutionStats {
            institution_name,
            students_count: count,
            average_final_grade: (average * 100.0).round() / 100.0,
            departments,
        });
    }

    // Sorting by average grades (top first)
    stats.sort_by(|a, b| b.average_final_grade.partial_cmp(&a.average_final_grade).unwrap());

    stats
}

// Getting top N students by final grade
pub fn get_top_students(students: &[Student], n: usize) -> TopStudents {
    let mut sorted: Vec<&Student> = students.iter().collect();

    // Sorting by final grade (from largest to smallest)
    sorted.sort_by(|a, b| b.final_grade.partial_cmp(&a.final_grade).unwrap());

    let top_n = sorted.iter().take(n).enumerate().map(|(idx, student)| {
        TopStudent {
            rank: idx + 1,
            first_name: student.first_name.clone(),
            last_name: student.last_name.clone(),
            institution: student.institution.clone(),
            final_grade: student.final_grade,
            individual_number: student.individual_number.clone(),
        }
    }).collect();

    TopStudents { 
        count: n.min(students.len()), 
        students: top_n, 
    }
}