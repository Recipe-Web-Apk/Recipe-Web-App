import axiosInstance from './axiosInstance';

export async function fetchRecommendations(userId, token) {
  const { data } = await axiosInstance.get(`/recommendations/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
} 