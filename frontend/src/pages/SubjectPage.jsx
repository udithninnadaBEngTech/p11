import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';

export default function SubjectPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      // Fetch subject details
      const subjectDoc = await getDoc(doc(db, 'subjects', id));
      if (subjectDoc.exists()) {
        setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
      }

      // Fetch lessons for this subject
      const lessonsQuery = query(collection(db, 'lessons'), where('subjectId', '==', id));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLessonWindow = (lesson) => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      `/lesson/${lesson.id}`,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject not found</h2>
          <Link to="/#teaching" className="text-blue-600 hover:text-blue-700">
            Back to Teaching
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with background image */}
      <div 
        className="h-64 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${subject.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{subject.name}</h1>
            <p className="text-xl md:text-2xl">{subject.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/#teaching"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <FaArrowLeft className="mr-2" /> Back to Teaching
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-8">Lessons</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => openLessonWindow(lesson)}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1 duration-300"
            >
              <div 
                className="h-48 bg-cover bg-center relative group"
                style={{ backgroundImage: `url(${lesson.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <FaPlay className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
            </div>
          ))}
        </div>

        {lessons.length === 0 && (
          <p className="text-center text-gray-500">No lessons available yet.</p>
        )}
      </div>
    </div>
  );
}