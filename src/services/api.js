import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api', // Backend API base URL
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token and user information from localStorage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    // Log the retrieved information
    console.log('=============== API Request Interceptor:');
    console.log('=============== Token:', token ? 'Present' : 'Not present');
    console.log('=============== Username:', username);
    console.log('=============== Role:', role);
    console.log('=============== User ID:', userId);

    // If token exists (not null, undefined or empty), add it to the Authorization header
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('=============== Token added to Authorization header');
    } else {
      // Remove Authorization header if token is not valid
      delete config.headers.Authorization;
      console.log('=============== No valid token, Authorization header removed');
    }

    return config;
  },
  (error) => {
    // Handle request error
    console.log('=============== API Request Error:', error);
    return Promise.reject(error);
  }
);

// Helper method to check login status
api.isLoggedIn = () => {
  const token = localStorage.getItem('token');
  console.log('=============== Checking login status:', token ? 'Logged in' : 'Not logged in');
  return !!token;
};

// Update post API
api.updatePost = async (postId, postData) => {
  try {
    console.log('=============== API Update Post Request:', { postId, postData });
    const isLoggedIn = api.isLoggedIn();
    console.log('=============== Is user logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      throw new Error('User not logged in');
    }
    
    const response = await api.put(`/tcm/posts/${postId}`, postData);
    console.log('=============== API Update Post Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Update Post Error:', error);
    if (error.response) {
      console.error('=============== API Update Post Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get post histories API
api.getPostHistories = async (postId) => {
  try {
    console.log('=============== API Get Post Histories Request:', { postId });
    const isLoggedIn = api.isLoggedIn();
    console.log('=============== Is user logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      throw new Error('User not logged in');
    }
    
    const response = await api.get(`/tcm/post-histories/post/${postId}`);
    console.log('=============== API Get Post Histories Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Post Histories Error:', error);
    if (error.response) {
      console.error('=============== API Get Post Histories Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get specific post version API
api.getPostVersion = async (postId, version) => {
  try {
    console.log('=============== API Get Post Version Request:', { postId, version });
    const isLoggedIn = api.isLoggedIn();
    console.log('=============== Is user logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      throw new Error('User not logged in');
    }
    
    const response = await api.get(`/tcm/post-histories/post/${postId}/version/${version}`);
    console.log('=============== API Get Post Version Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Post Version Error:', error);
    if (error.response) {
      console.error('=============== API Get Post Version Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Helper method to get current user ID
api.getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

// Search posts API
api.searchPosts = async (keyword, page = 1, size = 10) => {
  try {
    console.log('=============== API Search Posts Request:', { keyword, page, size });
    const response = await api.get('/tcm/posts/search', {
      params: {
        keyword,
        page,
        size
      }
    });
    console.log('=============== API Search Posts Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Search Posts Error:', error);
    if (error.response) {
      console.error('=============== API Search Posts Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get videos API
api.getVideos = async (page = 1, pageSize = 10, status = 1) => {
  try {
    console.log('=============== API Get Videos Request:', { page, pageSize, status });
    const response = await api.get('/tcm/videos', {
      params: {
        page,
        pageSize,
        status
      }
    });
    console.log('=============== API Get Videos Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Videos Error:', error);
    throw error;
  }
};

// Upload video API
api.uploadVideo = async (formData) => {
  try {
    console.log('=============== API Upload Video Request:', formData);
    const response = await api.post('tcm/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('=============== API Upload Video Response:', response.data);
    return response.data;
  }
  catch (error) {
    console.error('=============== API Upload Video Error:', error);
    if (error.response) {
      console.error('=============== API Upload Video Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get user videos API
api.getUserVideos = async (page = 1, pageSize = 10) => {
  try {
    console.log('=============== API Get User Videos Request:', { page, pageSize });
    const isLoggedIn = api.isLoggedIn();
    console.log('=============== Is user logged in:', isLoggedIn);
    const userId = api.getCurrentUserId();
    console.log('=============== Current user ID:', userId);
    
    if (!userId) {
      throw new Error('User not logged in');
    }
    
    const response = await api.get(`/tcm/videos/user/${userId}`, {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get User Videos Response:', response.data);
    return response.data;
  }
  catch (error) {
    console.error('=============== API Get User Videos Error:', error);
    if (error.response) {
      console.error('=============== API Get User Videos Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

api.getUserForumPosts = async (page = 1, pageSize = 10, userId = null) => {
  try {
    console.log('=============== API Get User Forum Posts Request:', { page, pageSize, userId });
    const isLoggedIn = api.isLoggedIn();
    console.log('=============== Is user logged in:', isLoggedIn);
    
    // If userId is not provided, get it from localStorage
    const actualUserId = userId || api.getCurrentUserId();
    console.log('=============== Actual User ID:', actualUserId);
    
    if (!actualUserId) {
      throw new Error('User not logged in');
    }
    
    const response = await api.get(`/tcm/posts/user/${actualUserId}`, {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get User Forum Posts Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Forum Posts Error:', error);
    if (error.response) {
      console.error('=============== API Get User Forum Posts Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get video details API
api.getVideoDetails = async (videoId) => {
  try {
    console.log('=============== API Get Video Details Request:', { videoId });
    const response = await api.get(`/tcm/videos/${videoId}`);
    console.log('=============== API Get Video Details Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Video Details Error:', error);
    if (error.response) {
      console.error('=============== API Get Video Details Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get video comments API
api.getVideoComments = async (videoId, page = 1, pageSize = 10) => {
  try {
    console.log('=============== API Get Video Comments Request:', { videoId, page, pageSize });
    const response = await api.get(`/tcm/videos/${videoId}/comments`, {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get Video Comments Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Video Comments Error:', error);
    if (error.response) {
      console.error('=============== API Get Video Comments Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Create video comment API
api.createVideoComment = async (commentData) => {
  try {
    console.log('=============== API Create Video Comment Request:', commentData);
    const response = await api.post('/tcm/video-comments', commentData);
    console.log('=============== API Create Video Comment Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Create Video Comment Error:', error);
    if (error.response) {
      console.error('=============== API Create Video Comment Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Response interceptor (optional, but useful for handling common responses)
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('=============== API Response:', response.status);
    return response;
  },
  (error) => {
    // Handle response error
    console.log('=============== API Response Error:', error.response?.status || error.message);
    
    // Handle 401 Unauthorized error (JWT token expired or invalid)
    if (error.response?.status === 401 || error.response?.data?.code === 401) {
      console.log('=============== 401 Unauthorized: Clearing localStorage and redirecting to homepage');
      
      // Clear localStorage
      localStorage.clear();
      
      // Redirect to homepage
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Login API
export const login = async (credentials) => {
  try {
    console.log('=============== API Login Request:', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('=============== API Login Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Login Error:', error);
    // Handle API errors according to the response format
    if (error.response) {
      // Server responded with an error status code
      console.error('=============== API Login Error Response:', error.response.data);
      throw error.response.data;
    } else {
      // Network error or other error
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get email verification code
export const getEmailVerificationCode = async (email) => {
  try {
    console.log('=============== API Get Email Verification Code Request:', { email });
    const response = await api.get('/auth/email/verification-code', {
      params: { email }
    });
    console.log('=============== API Get Email Verification Code Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Email Verification Code Error:', error);
    if (error.response) {
      console.error('=============== API Get Email Verification Code Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get phone verification code
export const getPhoneVerificationCode = async (phone) => {
  try {
    console.log('=============== API Get Phone Verification Code Request:', { phone });
    const response = await api.get('/auth/phone/verification-code', {
      params: { phone }
    });
    console.log('=============== API Get Phone Verification Code Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Phone Verification Code Error:', error);
    if (error.response) {
      console.error('=============== API Get Phone Verification Code Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Register user API
export const register = async (userData) => {
  try {
    console.log('=============== API Register User Request:', userData);
    const response = await api.post('/auth/register', userData);
    console.log('=============== API Register User Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Register User Error:', error);
    if (error.response) {
      console.error('=============== API Register User Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get user information API
export const getUserInfo = async (userId) => {
  try {
    console.log('=============== API Get User Info Request:', { userId });
    const response = await api.get(`/tcm/users/${userId}`);
    console.log('=============== API Get User Info Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Info Error:', error);
    if (error.response) {
      console.error('=============== API Get User Info Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Update user information API
export const updateUserInfo = async (userData) => {
  try {
    // Ensure userData includes id from localStorage
    const id = api.getCurrentUserId();
    if (!id) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    // Merge userData with id
    const updatedUserData = { ...userData, id };
    console.log('=============== API Update User Info Request:', updatedUserData);
    const response = await api.put('/tcm/users/info', updatedUserData);
    console.log('=============== API Update User Info Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Update User Info Error:', error);
    if (error.response) {
      console.error('=============== API Update User Info Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Save watch record API
export const saveWatchRecord = async (videoId) => {
  try {
    // Ensure user is logged in
    const userId = api.getCurrentUserId();
    if (!userId) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    // Prepare watch record data
    const now = new Date();
    const watchRecordData = {
      userId: parseInt(userId),
      videoId: parseInt(videoId),
      watchDate: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    console.log('=============== API Save Watch Record Request:', watchRecordData);
    const response = await api.post('tcm/watch-records', watchRecordData);
    console.log('=============== API Save Watch Record Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Save Watch Record Error:', error);
    // Only log error, don't throw to prevent affecting video playback
    return null;
  }
};

// Like video API
export const likeVideo = async (videoId) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    console.log('=============== API Like Video Request:', videoId);
    const response = await api.post(`/tcm/videos/${videoId}/like`);
    console.log('=============== API Like Video Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Like Video Error:', error);
    throw error;
  }
};

// Get video like and watch history API
export const getVideoLikeAndWatchHistory = async (page = 1, pageSize = 10) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    console.log('=============== API Get Video Like And Watch History Request', { page, pageSize });
    const response = await api.get('/tcm/videos/likeAndWatchHistory', {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get Video Like And Watch History Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Video Like And Watch History Error:', error);
    throw error;
  }
};

// Get post interaction history API (like/watch history)
export const getPostInteractionHistory = async (page = 1, pageSize = 10) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    console.log('=============== API Get Post Interaction History Request', { page, pageSize });
    const response = await api.get('/post/interaction/history', {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get Post Interaction History Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get Post Interaction History Error:', error);
    throw error;
  }
};

// Get user video comments API
export const getUserVideoComments = async (page = 1, pageSize = 10) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    // Get current user ID using the API method instead of direct localStorage access
    const userId = api.getCurrentUserId();
    console.log('=============== API Get User Video Comments - Current User ID:', userId);
    
    // If no user ID found, use the hardcoded 13 as fallback
    const targetUserId = userId || '13';
    
    console.log('=============== API Get User Video Comments Request', { page, pageSize, targetUserId });
    const response = await api.get(`/tcm/users/${targetUserId}/comments`, {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get User Video Comments Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Video Comments Error:', error);
    throw error;
  }
};

// Get user comments API
export const getUserComments = async (page = 1, pageSize = 10) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    const userId = api.getCurrentUserId();
    console.log('=============== API Get User Comments Request', { userId, page, pageSize });
    const response = await api.get(`/tcm/users/${userId}/comments`, {
      params: {
        page,
        pageSize
      }
    });
    console.log('=============== API Get User Comments Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Comments Error:', error);
    throw error;
  }
};

// Get user replies API
export const getUserReplies = async (page = 1, pageSize = 10) => {
  try {
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw {
        code: 401,
        message: 'User not logged in',
        success: false
      };
    }
    
    const userId = api.getCurrentUserId();
    console.log('=============== API Get User Replies Request', { userId, page, pageSize });
    const response = await api.get(`/tcm/replies/user/${userId}`, {
      params: {
        page,
        size: pageSize
      }
    });
    console.log('=============== API Get User Replies Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Replies Error:', error);
    throw error;
  }
};

// Get articles list
export const fetchArticles = async (params = {}) => {
  try {
    const response = await api.get('/tcm/articles/list', { params });
    console.log("=============== API response for fetchArticles:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== Error in fetchArticles:", error);
    throw error;
  }
};

// Get articles by specific user
export const fetchUserArticles = async ({ page = 1, pageSize = 10, userId }) => {
  try {
    const response = await api.get(`/tcm/articles/user/${userId}`, {
      params: {
        page: page,
        pageSize
      }
    });
    console.log("=============== API response for fetchUserArticles:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== Error in fetchUserArticles:", error);
    throw error;
  }
};

// Get article detail
export const fetchArticleDetail = async (articleId) => {
  try {
    console.log("=============== API Get Article Detail Request", { articleId });
    const response = await api.get(`/tcm/articles/${articleId}`);
    console.log("=============== API response for fetchArticleDetail:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== Error in fetchArticleDetail:", error);
    throw error;
  }
};

// Like article API
export const likeArticle = async (articleId) => {
  try {
    console.log("=============== API Like Article Request", { articleId });
    const response = await api.post(`/tcm/articles/${articleId}/like`);
    console.log("=============== API Like Article Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Like Article Error:", error);
    if (error.response) {
      console.error("=============== API Like Article Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 获取文章评论（支持分页）
export const getComments = async (articleId, page = 1, pageSize = 10) => {
  try {
    console.log("=============== API Get Comments Request", { articleId, page, pageSize });
    const response = await api.get(`tcm/article/comments/article/${articleId}`, {
      params: { page, pageSize }
    });
    console.log("=============== API Get Comments Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Get Comments Error:", error);
    if (error.response) {
      console.error("=============== API Get Comments Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 添加文章评论
export const addComment = async (articleId, content, parentId = 0) => {
  try {
    console.log("=============== API Add Comment Request", { articleId, content, parentId });
    const response = await api.post(`tcm/article/comments`, {
      articleId,
      content,
      parentId,
      // 其他字段由后端自动生成或处理
    });
    console.log("=============== API Add Comment Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Add Comment Error:", error);
    if (error.response) {
      console.error("=============== API Add Comment Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 上传文章
export const uploadArticle = async (articleData) => {
  try {
    console.log("=============== API Upload Article Request", articleData);
    const response = await api.post(`/tcm/articles`, articleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("=============== API Upload Article Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Upload Article Error:", error);
    if (error.response) {
      console.error("=============== API Upload Article Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 更新文章
export const updateArticle = async (articleId, articleData) => {
  try {
    console.log("=============== API Update Article Request", { articleId, articleData });
    const response = await api.put(`/tcm/articles/${articleId}`, articleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("=============== API Update Article Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Update Article Error:", error);
    if (error.response) {
      console.error("=============== API Update Article Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 删除视频
export const deleteVideo = async (videoId) => {
  try {
    console.log("=============== API Delete Video Request", { videoId });
    const response = await api.delete(`/tcm/videos/${videoId}`);
    console.log("=============== API Delete Video Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("=============== API Delete Video Error:", error);
    if (error.response) {
      console.error("=============== API Delete Video Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// Get user notifications API
api.getUserNotifications = async (page = 1, pageSize = 10) => {
  try {
    console.log('=============== API Get User Notifications Request:', { page, pageSize });
    
    // Ensure user is logged in
    if (!api.isLoggedIn()) {
      throw { code: 401, message: 'User not logged in', success: false };
    }
    
    const userId = api.getCurrentUserId();
    if (!userId) {
      throw { code: 401, message: 'User not logged in', success: false };
    }
    
    const response = await api.get(`/tcm/notifications/user/${userId}`, {
      params: { page, pageSize }
    });
    console.log('=============== API Get User Notifications Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=============== API Get User Notifications Error:', error);
    if (error.response) {
      console.error('=============== API Get User Notifications Error Response:', error.response.data);
      throw error.response.data;
    } else {
      throw {
        code: 500,
        message: error.message || 'Network error',
        success: false
      };
    }
  }
};

// 将uploadArticle、updateArticle和deleteVideo方法添加到api实例
try {
  api.uploadArticle = uploadArticle;
  api.updateArticle = updateArticle;
  api.deleteVideo = deleteVideo;
  console.log("=============== Upload, update article and delete video methods added to api instance");
} catch (error) {
  console.error("=============== Error adding methods to api instance:", error);
}

export { api };
export default api;
