import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    title: '',
    videoUrl: '',
    subjectId: '',
    lessonId: ''
  });

  useEffect(() => {
    if (!isOwner) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isOwner, navigate]);

  const fetchData = async () => {
    try {
      // Fetch subjects
      const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
      setSubjects(subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch lessons
      const lessonsSnapshot = await getDocs(collection(db, 'lessons'));
      setLessons(lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch topics
      const topicsSnapshot = await getDocs(collection(db, 'topics'));
      setTopics(topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'subjects') {
        if (editingItem) {
          await updateDoc(doc(db, 'subjects', editingItem.id), {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.imageUrl
          });
          toast.success('Subject updated successfully');
        } else {
          await addDoc(collection(db, 'subjects'), {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.imageUrl
          });
          toast.success('Subject added successfully');
        }
      } else if (activeTab === 'lessons') {
        if (editingItem) {
          await updateDoc(doc(db, 'lessons', editingItem.id), {
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl,
            subjectId: formData.subjectId
          });
          toast.success('Lesson updated successfully');
        } else {
          await addDoc(collection(db, 'lessons'), {
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl,
            subjectId: formData.subjectId
          });
          toast.success('Lesson added successfully');
        }
      } else if (activeTab === 'topics') {
        if (editingItem) {
          await updateDoc(doc(db, 'topics', editingItem.id), {
            title: formData.title,
            videoUrl: formData.videoUrl,
            lessonId: formData.lessonId
          });
          toast.success('Topic updated successfully');
        } else {
          await addDoc(collection(db, 'topics'), {
            title: formData.title,
            videoUrl: formData.videoUrl,
            lessonId: formData.lessonId
          });
          toast.success('Topic added successfully');
        }
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error saving data');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'subjects') {
      setFormData({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl
      });
    } else if (activeTab === 'lessons') {
      setFormData({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        subjectId: item.subjectId
      });
    } else if (activeTab === 'topics') {
      setFormData({
        title: item.title,
        videoUrl: item.videoUrl,
        lessonId: item.lessonId
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        if (activeTab === 'subjects') {
          await deleteDoc(doc(db, 'subjects', id));
          toast.success('Subject deleted successfully');
        } else if (activeTab === 'lessons') {
          await deleteDoc(doc(db, 'lessons', id));
          toast.success('Lesson deleted successfully');
        } else if (activeTab === 'topics') {
          await deleteDoc(doc(db, 'topics', id));
          toast.success('Topic deleted successfully');
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Error deleting data');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      title: '',
      videoUrl: '',
      subjectId: '',
      lessonId: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['subjects', 'lessons', 'topics'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  resetForm();
                }}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add {activeTab.slice(0, -1)}
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'subjects' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'lessons' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subject
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'topics' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Lesson
                    </label>
                    <select
                      name="lessonId"
                      value={formData.lessonId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a lesson</option>
                      {lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lists */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {activeTab === 'subjects' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map(subject => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={subject.imageUrl} alt={subject.name} className="h-10 w-10 rounded-full object-cover" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4">{subject.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'lessons' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lessons.map(lesson => {
                  const subject = subjects.find(s => s.id === lesson.subjectId);
                  return (
                    <tr key={lesson.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={lesson.imageUrl} alt={lesson.title} className="h-10 w-10 rounded-full object-cover" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{lesson.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{subject?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">{lesson.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'topics' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.map(topic => {
                  const lesson = lessons.find(l => l.id === topic.lessonId);
                  return (
                    <tr key={topic.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{topic.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{lesson?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center">
                          <FaYoutube className="mr-1" /> Watch
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(topic)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}