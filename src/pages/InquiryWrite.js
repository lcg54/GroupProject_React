import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';

/* 
    문의사항 페이지
    - 문의 (user 기본값) 
            / 유저에게만 보임
    - 문의 조회 (관리자 기본값)
            / 목록 + 상세 펼침 기능(state로 클릭한 문의의 ID 저장 -> 해당 ID에 해당하는 상세 정보 보여주기)
            / 이용자에게는 본인의 문의만, 관리자에게는 모든 문의함 보임 + 답변 완료된 것과 미완료 된것으로 분류하여 볼 수 있도록 
*/

function App({ user }) {

    const [loading, setLoading] = useState(true);
    const [inquiry, setInquiry] = useState('');
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState("");

    useEffect(() => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate(-1); // 로그인 페이지로 이동
            return;
        }

        axios.get(`${API_BASE_URL}/inquiry/write`, { withCredentials: true })
            .then(response => {
                setInquiry(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);

                if (error.response && error.response.status === 401) {
                    alert('로그인이 필요한 서비스입니다.');
                    navigate(-1);
                } else {
                    alert('상품 정보를 불러 오는 중에 오류가 발생하였습니다.');
                    navigate(-1);
                }
            })

    }, [user]);

    return (
        <div>
            InquiryWrite
        </div>);
}

export default App;