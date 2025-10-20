import axios from "axios";
import { API_BASE_URL } from "./url";

export const fetchInquiries = async (productId) => {
  const res = await axios.get(`${API_BASE_URL}/inquiry/${productId}`);
  return res.data;
};

export const createInquiry = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/inquiry`, data);
  return res.data;
};

export const createInquiryComment = async (inquiryId, data) => {
  const res = await axios.post(`${API_BASE_URL}/inquiry/${inquiryId}/comment`, data);
  return res.data;
};