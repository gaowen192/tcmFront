import React from 'react';
import { useTranslation } from 'react-i18next';
import VideoList from '../components/VideoList';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-5xl p-4" style={{ backgroundColor: '#fcfbf7', color: '#1e293b' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('home.tcm.welcomeTitle')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('home.tcm.todayInfo')}</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>

      {/* Function Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* AI Consultation */}
        <div className="bg-green-500 text-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1">{t('home.tcm.aiConsultation')}</h3>
          <p className="text-sm opacity-90">{t('home.tcm.aiConsultationDesc')}</p>
        </div>

        {/* Professional Courses */}
        <div className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1 text-gray-800">{t('home.tcm.professionalCourses')}</h3>
          <p className="text-sm text-gray-600">{t('home.tcm.professionalCoursesDesc')}</p>
        </div>

        {/* Professional Articles */}
        <div className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1 text-gray-800">{t('home.tcm.professionalArticles')}</h3>
          <p className="text-sm text-gray-600">{t('home.tcm.professionalArticlesDesc')}</p>
        </div>

        {/* Participate in Discussions */}
        <div className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1 text-gray-800">{t('home.tcm.participateDiscussions')}</h3>
          <p className="text-sm text-gray-600">{t('home.tcm.participateDiscussionsDesc')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Left Column - Video and Discussions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Video */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('home.tcm.recommendedVideos')}</h2>
              <a href="#" className="text-sm text-green-600 hover:underline">{t('home.tcm.viewMore')}</a>
            </div>
            <div className="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
              <div className="flex">
                <div className="w-48 h-48 bg-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-600 mt-2">中藥食材圖示</p>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{t('home.tcm.videoTitle')}</h3>
                  <p className="text-sm text-gray-600 mb-3">{t('home.tcm.videoDesc')}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{t('home.tcm.videoViews')}</span>
                    <span className="mx-2">•</span>
                    <span>{t('home.tcm.videoDate')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Discussions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('home.tcm.popularDiscussions')}</h2>
              <a href="#" className="text-sm text-green-600 hover:underline">{t('home.tcm.viewMore')}</a>
            </div>
            <div className="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-start">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-3">熱門</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">{t('home.tcm.discussionTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('home.tcm.discussionContent')}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-3">
                    <span>{t('home.tcm.discussionDate')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Health Clock */}
        <div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-800">{t('home.tcm.healthClock')}</h2>
            </div>
            <div className="text-center py-6">
              <h3 className="text-4xl font-bold text-green-800 mb-2">{t('home.tcm.timePeriod')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('home.tcm.timeRange')}</p>
              <p className="text-sm text-gray-700">{t('home.tcm.timeAdvice')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video List Section */}
      <VideoList />
    </div>
  );
};

export default HomePage;