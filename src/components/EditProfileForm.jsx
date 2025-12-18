import React from 'react';

const EditProfileForm = ({ formData, handleInputChange, handleSubmit, handleCancelEdit, error, success, isExpert }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户名 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        
        {/* 真实姓名 */}
        <div>
          <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
          <input
            type="text"
            id="realName"
            name="realName"
            value={formData.realName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        
        {/* 邮箱 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        
        {/* 电话 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">电话</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        
        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
                className="text-green-600 focus:ring-green-600"
              />
              <span className="ml-2 text-gray-700">男</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
                className="text-green-600 focus:ring-green-600"
              />
              <span className="ml-2 text-gray-700">女</span>
            </label>
          </div>
        </div>
        
        {/* 生日 */}
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">生日</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        
        {/* 专家特有字段 */}
        {isExpert && (
          <>
            {/* 执照编号 */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">执照编号</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            
            {/* 职称 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">职称</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </>
        )}
      </div>
      
      {/* 个人简介 */}
      <div>
        <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
        <textarea
          id="introduction"
          name="introduction"
          value={formData.introduction || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="请输入个人简介"
        ></textarea>
      </div>
      
      {/* 错误和成功提示 */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}
      
      {/* 提交按钮 */}
      <div className="flex justify-end space-x-3">
        <button 
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          onClick={handleCancelEdit}
        >
          取消
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;