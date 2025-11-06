import React, { useState } from 'react';
import { Flame, Award, Lock, CheckCircle, ChevronDown, ChevronUp, Calendar, Trophy, Star } from 'lucide-react';

const TipsAndStreaks = () => {
  // Sample data - will come from backend
  const [currentStreak, setCurrentStreak] = useState(12);
  const [longestStreak, setLongestStreak] = useState(25);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(45);

  // Badges earned (every 7 days)
  const badges = [
    { id: 1, name: 'Week Warrior', daysRequired: 7, earned: true, icon: '🔥' },
    { id: 2, name: 'Money Master', daysRequired: 14, earned: true, icon: '💎' },
    { id: 3, name: 'Finance Pro', daysRequired: 21, earned: false, icon: '👑' },
    { id: 4, name: 'Budget Legend', daysRequired: 30, earned: false, icon: '🏆' }
  ];

  // Sample lessons - this will come from your backend/SageMaker
  const [lessons, setLessons] = useState([
    {
      id: 1,
      date: '2025-11-07',
      title: 'The 50/30/20 Budget Rule',
      content: 'The 50/30/20 rule is a simple budgeting method that divides your after-tax income into three categories. Allocate 50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment. This framework helps maintain financial balance without feeling overly restrictive. Many financial experts recommend this as a starting point for beginners.',
      takeaway: '💡 Key Takeaway: Start by tracking one week of expenses to see where your money actually goes, then adjust your spending to match the 50/30/20 framework.',
      isToday: true,
      isRead: false,
      isExpanded: false,
      isFuture: false
    },
    {
      id: 2,
      date: '2025-11-06',
      title: 'Emergency Fund Essentials',
      content: 'An emergency fund is money set aside to cover unexpected expenses like medical bills, car repairs, or job loss. Financial experts recommend saving 3-6 months of living expenses. Start small - even KES 1,000 per month adds up. Keep this money in a separate savings account that\'s easy to access but not too convenient for everyday spending.',
      takeaway: '💡 Key Takeaway: Automate your emergency fund savings by setting up an automatic transfer of 10% of your income right after payday.',
      isToday: false,
      isRead: true,
      isExpanded: false,
      isFuture: false
    },
    {
      id: 3,
      date: '2025-11-05',
      title: 'Avoid Lifestyle Inflation',
      content: 'Lifestyle inflation happens when your spending increases as your income grows. You get a raise and immediately upgrade your lifestyle - better apartment, newer car, frequent dining out. While celebrating success is fine, increasing expenses proportionally to income prevents wealth building. The key is to maintain your current lifestyle and direct extra income toward savings and investments.',
      takeaway: '💡 Key Takeaway: When you get a salary increase, immediately allocate at least 50% of the raise to savings before adjusting any spending habits.',
      isToday: false,
      isRead: true,
      isExpanded: false,
      isFuture: false
    },
    {
      id: 4,
      date: '2025-11-08',
      title: 'Understanding Compound Interest',
      content: 'Future lesson - Check back tomorrow!',
      takeaway: '',
      isToday: false,
      isRead: false,
      isExpanded: false,
      isFuture: true
    }
  ]);

  const handleMarkAsRead = (lessonId) => {
    setLessons(lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.isToday && !lesson.isRead) {
        setCurrentStreak(prev => prev + 1);
        setTotalLessonsCompleted(prev => prev + 1);
        return { ...lesson, isRead: true };
      }
      return lesson;
    }));
  };

  const toggleExpand = (lessonId) => {
    setLessons(lessons.map(lesson => 
      lesson.id === lessonId ? { ...lesson, isExpanded: !lesson.isExpanded } : lesson
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Streak Card */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-bold text-[#04080F] mb-2">Daily Financial Tips</h1>
            <p className="text-[#3E68A3]">Build your financial knowledge one day at a time</p>
          </div>

          {/* Right: Streak Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 shadow-lg lg:min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500 p-2 rounded-full animate-pulse">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#04080F]">
                  {currentStreak} Days 🔥
                </h2>
                <p className="text-xs text-gray-600">Current Streak</p>
              </div>
            </div>
            
            {/* Progress to next badge */}
            <div className="bg-white rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700">Next Badge</span>
                <span className="text-xs text-[#3E68A3] font-bold">{currentStreak}/21</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStreak / 21) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-4 text-center">
            <Calendar className="h-6 w-6 text-[#3E68A3] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-[#04080F]">{currentStreak}</p>
          </div>
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Badges Earned</p>
            <p className="text-2xl font-bold text-[#04080F]">{badges.filter(b => b.earned).length}</p>
          </div>
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-4 text-center">
            <Star className="h-6 w-6 text-[#A1C6EA] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
            <p className="text-2xl font-bold text-[#04080F]">{totalLessonsCompleted}</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-[#E0E9F6] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-[#04080F] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id}
                className={`rounded-lg p-4 text-center transition-all ${
                  badge.earned 
                    ? 'bg-white border-2 border-[#A1C6EA] shadow-md' 
                    : 'bg-gray-100 border-2 border-gray-300 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.earned ? badge.icon : '🔒'}</div>
                <p className="text-sm font-semibold text-[#04080F]">{badge.name}</p>
                <p className="text-xs text-gray-600">{badge.daysRequired} days</p>
                {badge.earned && (
                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lessons Section */}
        <div>
          <h3 className="text-xl font-bold text-[#04080F] mb-4">Financial Lessons</h3>
          <div className="space-y-4">
            {lessons.map(lesson => (
              <div 
                key={lesson.id}
                className={`rounded-lg border-2 overflow-hidden transition-all ${
                  lesson.isToday && !lesson.isRead
                    ? 'border-[#3E68A3] bg-[#E0E9F6] shadow-lg'
                    : lesson.isFuture
                    ? 'border-gray-300 bg-gray-50 opacity-60'
                    : 'border-[#E0E9F6] bg-white hover:shadow-md'
                }`}
              >
                <div className="p-5">
                  {/* Lesson Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {lesson.isFuture && <Lock className="h-4 w-4 text-gray-400" />}
                        {lesson.isRead && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {lesson.isToday && !lesson.isRead && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                          </span>
                        )}
                        <span className="text-xs text-gray-600 font-medium">
                          {formatDate(lesson.date)}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[#04080F]">{lesson.title}</h4>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  {!lesson.isFuture && (
                    <>
                      <div className={`text-gray-700 text-sm leading-relaxed ${
                        lesson.isExpanded ? '' : 'line-clamp-2'
                      }`}>
                        {lesson.content}
                      </div>

                      {lesson.isExpanded && lesson.takeaway && (
                        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-sm text-green-800 font-medium">{lesson.takeaway}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => toggleExpand(lesson.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-white border-2 border-[#A1C6EA] text-[#3E68A3] rounded-lg hover:bg-[#E0E9F6] transition-colors text-sm font-semibold"
                        >
                          {lesson.isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Read Full Lesson
                            </>
                          )}
                        </button>

                        {lesson.isToday && !lesson.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(lesson.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-[#3E68A3] text-white rounded-lg hover:bg-[#04080F] transition-colors text-sm font-semibold"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {lesson.isFuture && (
                    <p className="text-sm text-gray-500 italic flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      This lesson will be available tomorrow
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 bg-gradient-to-r from-[#A1C6EA] to-[#3E68A3] rounded-lg p-6 text-center text-white">
          <p className="text-lg font-semibold mb-2">
            "Financial freedom is available to those who learn about it and work for it."
          </p>
          <p className="text-sm opacity-90">— Robert Kiyosaki</p>
        </div>
      </main>
    </div>
  );
};

export default TipsAndStreaks;