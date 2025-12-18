// Debug script to test comments API
import { getUserVideoComments } from './src/services/api';

async function testCommentsAPI() {
  try {
    console.log('Testing getUserVideoComments API...');
    const data = await getUserVideoComments(1, 8);
    console.log('API Response:', data);
    if (data && data.data) {
      console.log('Comments Content:', data.data.content);
      console.log('Number of Comments:', data.data.content.length);
      console.log('Total Pages:', data.data.totalPages);
      console.log('Total Elements:', data.data.totalElements);
    }
  } catch (error) {
    console.error('API Error:', error);
  }
}

testCommentsAPI();