import React, { useCallback, useEffect, useState } from 'react';
import { Flame, Award, Lock, CheckCircle, ChevronDown, ChevronUp, Calendar, Trophy, Star } from 'lucide-react';
import { apiGet } from '../utils/apiClient';
import { getCurrentUser } from '../utils/auth';
import LoadingSkeleton from '../components/LoadingSkeleton';

// --- Reusable Components ---
const StatsCard = ({ Icon, label, value, color }) => (
  <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-4 text-center">
    <Icon className={`h-6 w-6 ${color} mx-auto mb-2`} />
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-[#04080F]">{value}</p>
  </div>
);

const BadgeCard = ({ badge }) => (
  <div className={`rounded-lg p-4 text-center transition-all ${
    badge.earned ? 'bg-white border-2 border-[#A1C6EA] shadow-md' : 'bg-gray-100 border-2 border-gray-300 opacity-50'
  }`}>
    <div className="text-4xl mb-2">{badge.earned ? badge.icon : '🔒'}</div>
    <p className="text-sm font-semibold text-[#04080F]">{badge.name}</p>
    <p className="text-xs text-gray-600">{badge.daysRequired} days</p>
    {badge.earned && <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-2" />}
  </div>
);

const LessonCard = ({ lesson, onToggleExpand, onMarkAsRead, formatDate }) => {
  const isTodayNew = lesson.isToday && !lesson.isRead;
  return (
    <div className={`rounded-lg border-2 overflow-hidden transition-all ${
      isTodayNew ? 'border-[#3E68A3] bg-[#E0E9F6] shadow-lg' :
      lesson.isFuture ? 'border-gray-300 bg-gray-50 opacity-60' : 'border-[#E0E9F6] bg-white hover:shadow-md'
    }`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {lesson.isFuture && <Lock className="h-4 w-4 text-gray-400" />}
              {lesson.isRead && <CheckCircle className="h-4 w-4 text-green-500" />}
              {isTodayNew && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>}
              <span className="text-xs text-gray-600 font-medium">{formatDate(lesson.date)}</span>
            </div>
            <h4 className="text-lg font-bold text-[#04080F]">{lesson.title}</h4>
          </div>
        </div>

        {/* Content */}
        {!lesson.isFuture && (
          <>
            <div className={`text-gray-700 text-sm leading-relaxed ${lesson.isExpanded ? '' : 'line-clamp-2'}`}>
              {lesson.content}
            </div>
            {lesson.isExpanded && lesson.takeaway && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <p className="text-sm text-green-800 font-medium">{lesson.takeaway}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onToggleExpand(lesson.id)}
                className="flex items-center gap-1 px-3 py-2 bg-white border-2 border-[#A1C6EA] text-[#3E68A3] rounded-lg hover:bg-[#E0E9F6] transition-colors text-sm font-semibold"
              >
                {lesson.isExpanded ? <><ChevronUp className="h-4 w-4" /> Show Less</> : <><ChevronDown className="h-4 w-4" /> Read Full Lesson</>}
              </button>

              {isTodayNew && (
                <button
                  onClick={() => onMarkAsRead(lesson.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-[#3E68A3] text-white rounded-lg hover:bg-[#04080F] transition-colors text-sm font-semibold"
                >
                  <CheckCircle className="h-4 w-4" /> Mark as Read
                </button>
              )}
            </div>
          </>
        )}

        {lesson.isFuture && (
          <p className="text-sm text-gray-500 italic flex items-center gap-2">
            <Lock className="h-4 w-4" /> This lesson will be available tomorrow
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
const TipsAndStreaks = () => {
  const user = getCurrentUser();

  // tipStreak/lastTipDate are updated server-side by the daily tip Lambda
  // (backend/functions/async/sendDailyTip.js) - not something the client can
  // increment itself.
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
  const [todayTip, setTodayTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    setError(null);
    try {
      const [tipRes, userRes] = await Promise.all([
        apiGet('/analytics/tips/daily'),
        apiGet(`/users/${user.userId}`),
      ]);
      setTodayTip(tipRes?.tipText || null);
      setCurrentStreak(userRes?.user?.tipStreak || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { load(); }, [load]);

  // Dynamic badge calculation
  const badges = [
    { id: 1, name: 'Week Warrior', daysRequired: 7, icon: '🔥' },
    { id: 2, name: 'Money Master', daysRequired: 14, icon: '💎' },
    { id: 3, name: 'Finance Pro', daysRequired: 21, icon: '👑' },
    { id: 4, name: 'Budget Legend', daysRequired: 30, icon: '🏆' }
  ].map(badge => ({ ...badge, earned: currentStreak >= badge.daysRequired }));

  // Only "today" is backed by the real API (GET /analytics/tips/daily returns a
  // single tip, not a lesson library) - the rest is illustrative placeholder
  // content until the backend has a real lessons endpoint.
  const [lessons, setLessons] = useState([
    { id: 1, date: new Date().toISOString().slice(0, 10), title: "Today's Financial Tip", content: 'Loading...', takeaway: '', isToday: true, isRead: false, isExpanded: false, isFuture: false },
    { id: 2, date: '2025-11-06', title: 'Emergency Fund Essentials', content: 'An emergency fund is...', takeaway: '💡 Key Takeaway: Automate savings...', isToday: false, isRead: true, isExpanded: false, isFuture: false },
    { id: 3, date: '2025-11-05', title: 'Avoid Lifestyle Inflation', content: 'Lifestyle inflation happens...', takeaway: '💡 Key Takeaway: Allocate 50% of raises...', isToday: false, isRead: true, isExpanded: false, isFuture: false },
  ]);

  useEffect(() => {
    if (!todayTip) return;
    setLessons(prev => prev.map(l => (l.isToday ? { ...l, content: todayTip } : l)));
  }, [todayTip]);

  const handleMarkAsRead = (lessonId) => {
    setLessons(prev =>
      prev.map(lesson => {
        if (lesson.id === lessonId && lesson.isToday && !lesson.isRead) {
          setTotalLessonsCompleted(prevTotal => prevTotal + 1);
          return { ...lesson, isRead: true };
        }
        return lesson;
      })
    );
  };

  const toggleExpand = (lessonId) => {
    setLessons(prev =>
      prev.map(lesson => lesson.id === lessonId ? { ...lesson, isExpanded: !lesson.isExpanded } : lesson)
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header & Streak */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#04080F] mb-2">Daily Financial Tips</h1>
            <p className="text-[#3E68A3]">Build your financial knowledge one day at a time</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 shadow-lg lg:min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500 p-2 rounded-full animate-pulse">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#04080F]">{currentStreak} Days 🔥</h2>
                <p className="text-xs text-gray-600">Current Streak</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700">Next Badge</span>
                <span className="text-xs text-[#3E68A3] font-bold">{currentStreak}/21</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStreak / 21) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {loading && <LoadingSkeleton text="Loading your tips..." />}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
            <p className="text-red-600 font-semibold">Unable to load today's tip</p>
            <p className="text-sm text-gray-700">{error.message}</p>
            <div className="mt-3">
              <button onClick={() => load()} className="px-3 py-2 bg-[#3E68A3] text-white rounded-lg">Retry</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard Icon={Calendar} label="Current Streak" value={currentStreak} color="text-[#3E68A3]" />
          <StatsCard Icon={Trophy} label="Badges Earned" value={badges.filter(b => b.earned).length} color="text-yellow-500" />
          <StatsCard Icon={Star} label="Lessons Completed" value={totalLessonsCompleted} color="text-[#A1C6EA]" />
        </div>

        {/* Badges */}
        <div className="bg-[#E0E9F6] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-[#04080F] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" /> Your Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </div>

        {/* Lessons */}
        <div>
          <h3 className="text-xl font-bold text-[#04080F] mb-4">Financial Lessons</h3>
          <div className="space-y-4">
            {lessons.map(lesson =>
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onToggleExpand={toggleExpand}
                onMarkAsRead={handleMarkAsRead}
                formatDate={formatDate}
              />
            )}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 bg-gradient-to-r from-[#A1C6EA] to-[#3E68A3] rounded-lg p-6 text-center text-white">
          <p className="text-lg font-semibold mb-2">"Financial freedom is available to those who learn about it and work for it."</p>
          <p className="text-sm opacity-90">— Robert Kiyosaki</p>
        </div>

      </main>
    </div>
  );
};

export default TipsAndStreaks;
