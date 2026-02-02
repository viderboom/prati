import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './StudentsPage.css';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsCol = collection(db, 'students');
        const snapshot = await getDocs(studentsCol);
        const studentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsList);
      } catch (error) {
        console.error('שגיאה בטעינת תלמידים:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // סינון תלמידים לפי שם או שם משפחה
  const filteredStudents = students.filter(student => {
    const searchText = filter.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchText) ||
      student.familyName.toLowerCase().includes(searchText)
    );
  });

  if (loading) return <p className="loading">טוען...</p>;

  return (
    <div className="students-container page-layout">
      <h1 className="students-header">תלמידים</h1>
      <input
        type="text"
        placeholder="חיפוש לפי שם או שם משפחה"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="search-input"
      />
      <div className="students-list">
        {filteredStudents.map(student => (
          <Link key={student.id} to={`/students/${student.id}`} className="student-item">
            {student.name} {student.familyName}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;
