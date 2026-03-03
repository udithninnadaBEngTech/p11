import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FaYoutube } from 'react-icons/fa';

export default function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson details
      const lessonDoc = await getDoc(doc(db, 'lessons', id));
      if (lessonDoc.exists()) {
        setLesson({ id: lessonDoc.id, ...lessonDoc.data() });
      }

      // Fetch topics for this lesson
      const topicsQuery = query(collection(db, 'topics'), where('lessonId', '==', id));
      const topicsSnapshot = await getDocs(topicsQuery);
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTopics(topicsData);
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        <p className="text-gray-600 mb-8">{lesson.description}</p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FaYoutube className="text-red-600 mr-2" />
          Topics
        </h2>

        <div className="space-y-8">
          {topics.map((topic, index) => (
            <div key={topic.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                {index + 1}. {topic.title}
              </h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={getYouTubeEmbedUrl(topic.videoUrl)}
                  title={topic.title}
                  className="w-full h-64 md:h-96 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        {topics.length === 0 && (
          <p className="text-center text-gray-500">No topics available yet.</p>
        )}
      </div>
    </div>
  );
}