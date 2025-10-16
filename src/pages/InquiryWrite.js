import React from 'react';

/* 
    문의사항 페이지
    - 문의 (user 기본값) 
            / 유저에게만 보임
    - 문의 조회 (관리자 기본값)
            / 목록 + 상세 펼침 기능(state로 클릭한 문의의 ID 저장 -> 해당 ID에 해당하는 상세 정보 보여주기)
            / 이용자에게는 본인의 문의만, 관리자에게는 모든 문의함 보임 + 답변 완료된 것과 미완료 된것으로 분류하여 볼 수 있도록 
*/

function App({ user }) {
    return (
        <div>
            InquiryWrite
        </div>);
}

export default App;