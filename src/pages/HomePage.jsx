import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import VideoList from '../components/VideoList';
import HealthClock from '../components/HealthClock';
import api from '../services/api';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [popularPosts, setPopularPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const carouselRef = useRef(null);
  const [recommendedVideo, setRecommendedVideo] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Fetch popular posts
  useEffect(() => {
    const fetchPopularPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const params = {
          page: 1,
          pageSize: 5,
          hotpost: 1,
          isNew: 0
        };
        
        const response = await api.get('/tcm/posts/all', { params });
        
        if (response.data && response.data.code === 200) {
          const postsData = response.data.data.content || [];
          const formattedPosts = postsData.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : '',
            author: `用户${post.userId}`,
            date: new Date(post.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            replies: post.replyCount || 0,
            likes: post.likeCount || 0,
            views: post.viewCount || 0
          }));
          setPopularPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Failed to fetch popular posts:', error);
        setPopularPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPopularPosts();
  }, []);

  // Fetch recommended video (second video from first page)
  useEffect(() => {
    const fetchRecommendedVideo = async () => {
      setIsLoadingVideo(true);
      try {
        const response = await api.getVideos(1, 10, 1);
        if (response && response.code === 200) {
          const videos = response.data?.content || response.data?.videos || [];
          // Get the second video (index 1)
          if (videos.length > 1) {
            setRecommendedVideo(videos[1]);
          } else if (videos.length === 1) {
            // If only one video, use it
            setRecommendedVideo(videos[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching recommended video:', error);
      } finally {
        setIsLoadingVideo(false);
      }
    };

    fetchRecommendedVideo();
  }, []);

  // Auto-scroll carousel with smooth animation
  useEffect(() => {
    if (popularPosts.length <= 1 || !carouselRef.current) return;

    const carousel = carouselRef.current;
    let animationId = null;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let isPaused = false;

    const animate = () => {
      if (isPaused) return;
      
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      
      if (maxScroll > 0) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0; // Reset to start for seamless loop
        }
        
        carousel.scrollLeft = scrollPosition;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    const startAnimation = () => {
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const handleMouseLeave = () => {
      isPaused = false;
      scrollPosition = carousel.scrollLeft; // Resume from current position
      startAnimation();
    };

    startAnimation();
    carousel.addEventListener('mouseenter', handleMouseEnter);
    carousel.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isPaused = true;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      carousel.removeEventListener('mouseenter', handleMouseEnter);
      carousel.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [popularPosts]);

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
        <div 
          className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            const videoListElement = document.getElementById('video-list-section');
            if (videoListElement) {
              videoListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1 text-gray-800">{t('home.tcm.professionalCourses')}</h3>
          <p className="text-sm text-gray-600">{t('home.tcm.professionalCoursesDesc')}</p>
        </div>

        {/* Professional Articles */}
        <div 
          className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/professional-articles')}
        >
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-1 text-gray-800">{t('home.tcm.professionalArticles')}</h3>
          <p className="text-sm text-gray-600">{t('home.tcm.professionalArticlesDesc')}</p>
        </div>

        {/* Participate in Discussions */}
        <div 
          className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/forum')}
        >
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
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('home.tcm.recommendedVideos')}</h2>
            </div>
            {isLoadingVideo ? (
              <div className="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
                <div className="flex">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : recommendedVideo ? (
              <div 
                className="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/video/${recommendedVideo.id}`)}
              >
                <div className="flex">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {recommendedVideo.thumbnailPath ? (
                      <img 
                        src={`/api/uploads/${recommendedVideo.thumbnailPath.includes('uploads/') ? recommendedVideo.thumbnailPath.split('uploads/')[1] : recommendedVideo.thumbnailPath}`}
                        alt={recommendedVideo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                      <div className="text-white text-xs bg-black/60 px-2 py-1 rounded">
                        播放量: {recommendedVideo.viewCount || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{recommendedVideo.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recommendedVideo.description || ''}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>播放量: {recommendedVideo.viewCount || 0}</span>
                      {recommendedVideo.createTime && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{new Date(recommendedVideo.createTime).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
                <div className="flex">
                  <div className="w-48 h-48 bg-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-600 mt-2">暂无推荐视频</p>
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
            )}
          </div>

        </div>

        {/* Right Column - Health Clock */}
        <HealthClock />
      </div>

      {/* Popular Discussions Carousel - Full Width */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('home.tcm.popularDiscussions')}</h2>
          <Link to="/forum" className="text-sm text-green-600 hover:underline">{t('home.tcm.viewMore')}</Link>
        </div>
        <div className="bg-white border border-green-100 rounded-lg shadow-sm overflow-hidden w-full">
              {isLoadingPosts ? (
                <div className="p-24 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-sm text-gray-500">加载中...</p>
                </div>
              ) : popularPosts.length > 0 ? (
                <div 
                  ref={carouselRef}
                  className="flex gap-4 p-4 overflow-x-hidden w-full"
                  style={{ 
                    scrollBehavior: 'auto',
                    cursor: 'grab',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onMouseDown={(e) => {
                    const carousel = carouselRef.current;
                    if (!carousel) return;
                    carousel.style.cursor = 'grabbing';
                    const startX = e.pageX - carousel.offsetLeft;
                    const scrollLeft = carousel.scrollLeft;
                    let isDown = true;

                    const handleMouseMove = (e) => {
                      if (!isDown) return;
                      e.preventDefault();
                      const x = e.pageX - carousel.offsetLeft;
                      const walk = (x - startX) * 2;
                      carousel.scrollLeft = scrollLeft - walk;
                    };

                    const handleMouseUp = () => {
                      isDown = false;
                      if (carousel) {
                        carousel.style.cursor = 'grab';
                      }
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  {popularPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="flex-shrink-0 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-105"
                      style={{ width: '320px', minWidth: '320px' }}
                    >
                      <div className="flex items-start">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-3 flex-shrink-0">
                          熱門
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">{post.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.replies} 回复</span>
                            <span>•</span>
                            <span>{post.likes} 点赞</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {/* Duplicate first item for seamless loop */}
                  {popularPosts.length > 1 && (
                    <Link
                      to={`/post/${popularPosts[0].id}`}
                      className="flex-shrink-0 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-105"
                      style={{ width: '320px', minWidth: '320px' }}
                    >
                      <div className="flex items-start">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-3 flex-shrink-0">
                          熱門
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">{popularPosts[0].title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{popularPosts[0].content}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span>{popularPosts[0].date}</span>
                            <span>•</span>
                            <span>{popularPosts[0].replies} 回复</span>
                            <span>•</span>
                            <span>{popularPosts[0].likes} 点赞</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>暂无热门讨论</p>
                </div>
              )}
        </div>
      </div>
      
      {/* Video List Section */}
      <div id="video-list-section">
        <VideoList />
      </div>
    </div>
  );
};

export default HomePage;