import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

// Mock lessons for demo
const mockLessons = [
  {
    id: 1,
    date: "2025-11-01",
    content: "Track all your expenses this week. Small daily expenses add up over time.",
    takeaway: "Keep a daily log to understand your spending habits.",
    read: true
  },
  {
    id: 2,
    date: "2025-11-02",
    content: "Prioritize your savings before spending. Automate transfers if possible.",
    takeaway: "Set up automatic savings to hit your goals consistently.",
    read: true
  },
  {
    id: 3,
    date: "2025-11-03",
    content: "Avoid impulse purchases. Plan your shopping list in advance.",
    takeaway: "Stick to your planned expenses to stay within budget.",
    read: false
  },
  {
    id: 4,
    date: "2025-11-04",
    content: "Review subscription services. Cancel those you rarely use.",
    takeaway: "Regularly audit recurring payments to save money.",
    read: false
  },
];

const TipsAndTricks = () => {
  const [lessons, setLessons] = useState(mockLessons);
  const [streak, setStreak] = useState(lessons.filter(l => l.read).length); // current streak
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const badgeThreshold = 30;

  const handleMarkAsRead = (id) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id === id) {
        return { ...lesson, read: true };
      }
      return lesson;
    }));
    setStreak(prev => prev + 1);
  };

  const toggleLesson = (id) => {
    setExpandedLessonId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-softBlue p-6">
      {/* Streak + Badge */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-royalBlue">Daily Tips & Tricks</h1>
          <p className="text-gray-700 mt-2">Current Streak: <span className="font-semibold text-green-600">{streak} day{streak !== 1 ? 's' : ''}</span></p>
        </div>
        {streak >= badgeThreshold && (
          <div className="mt-4 md:mt-0 flex items-center">
            <CheckCircle className="h-12 w-12 text-yellow-400 mr-2" />
            <span className="font-semibold text-yellow-600 text-lg">Reward Badge!</span>
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map(lesson => {
          const isToday = !lesson.read && lesson.date === "2025-11-03"; // demo today lesson
          return (
            <div key={lesson.id} className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">Lesson {lesson.id} ({lesson.date})</p>
                  <p className="text-gray-500">{lesson.read ? "Completed" : isToday ? "Today's lesson" : "Past lesson"}</p>
                </div>
                {isToday && (
                  <button
                    onClick={() => handleMarkAsRead(lesson.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              {/* Toggle full lesson */}
              <button
                onClick={() => toggleLesson(lesson.id)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                {expandedLessonId === lesson.id ? "Hide full lesson" : "Show full lesson"}
              </button>

              {expandedLessonId === lesson.id && (
                <div className="mt-2 text-gray-700">
                  <p>{lesson.content}</p>
                  <p className="mt-1 font-semibold text-green-600">Takeaway: {lesson.takeaway}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TipsAndTricks;
