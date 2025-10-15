// 이 파일은 설정용 파일
// http://localhost:9000

const API_HOST = "localhost"; // 호스트 컴퓨터 이름(127.0.01)

const API_PORT = "9000"; // 스프링 부트 포트 번호

// export 키워드를 적어 외부 접근 가능하게함
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;