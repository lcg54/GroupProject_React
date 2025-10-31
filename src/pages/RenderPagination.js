import { Pagination } from "react-bootstrap";

export default function RenderPagination({ currentPage, setCurrentPage, totalPages }) {
  const blockSize = 10;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);
  const items = [];
  items.push(
    <Pagination.First key="first" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />,
    <Pagination.Prev key="prev" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
  );
  for (let page = startPage; page <= endPage; page++) {
    items.push(
      <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
        {page}
      </Pagination.Item>
    );
  }
  items.push(
    <Pagination.Next key="next" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />,
    <Pagination.Last key="last" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
  );
  return <Pagination className="justify-content-center">{items}</Pagination>;
};