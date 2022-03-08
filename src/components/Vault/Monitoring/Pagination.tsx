import React from "react";
import Pagination from "react-bootstrap/Pagination";
import { PaginationType } from "./types";

type props = {
  pagination: PaginationType;
  onPageSelected: (pageNumber: number) => void;
};

export const VaultPagination = ({ pagination, onPageSelected }: props) => {
  const pag = Array.from(Array(pagination.pages).keys());
  const activePag = pagination.current;

  const VaultPages = () => {
    const midPages = Array.from(Array(5).keys());
    const midPage = Math.floor(pagination.pages / 2);
    midPages[0] = midPage - 2;
    midPages[1] = midPage - 1;
    midPages[2] = midPage;
    midPages[3] = midPage + 1;
    midPages[4] = midPage + 2;

    return (
      <>
        <Pagination.Item active={pagination.current === 1}>{1}</Pagination.Item>
        {pagination.current >= 3 && pagination.current < midPages[0] && <Pagination.Ellipsis />}
        {pagination.current > 1 && pagination.current < midPages[0] && (
          <Pagination.Item active>{pagination.current}</Pagination.Item>
        )}
        <Pagination.Ellipsis />
        {midPages.map((item) => (
          <Pagination.Item
            key={item}
            active={pagination.current === item}
            onClick={() => onPageSelected(item)}
          >
            {item}
          </Pagination.Item>
        ))}
        <Pagination.Ellipsis />
        {pagination.current < pagination.pages && pagination.current > midPages[4] && (
          <Pagination.Item active>{pagination.current}</Pagination.Item>
        )}
        {pagination.current < pagination.pages - 1 && pagination.current > midPages[4] && (
          <Pagination.Ellipsis />
        )}
        <Pagination.Item
          active={pagination.current === pagination.pages}
          onClick={() => onPageSelected(pagination.pages)}
        >
          {pagination.pages}
        </Pagination.Item>
      </>
    );
  };

  return (
    <Pagination>
      {pagination.pages >= 10 && (
        <Pagination.First onClick={() => onPageSelected(1)} disabled={pagination.previous === 0} />
      )}
      <Pagination.Prev
        onClick={() => onPageSelected(pagination.previous)}
        disabled={pagination.previous === 0}
      />
      {pagination.pages >= 10 ? (
        <VaultPages />
      ) : (
        pag.map((item) => (
          <Pagination.Item
            key={item}
            active={activePag === item + 1}
            onClick={() => onPageSelected(item + 1)}
          >
            {item + 1}
          </Pagination.Item>
        ))
      )}
      <Pagination.Next
        onClick={() => onPageSelected(pagination.next)}
        disabled={pagination.current === pagination.pages}
      />
      {pagination.pages >= 10 && (
        <Pagination.Last
          onClick={() => onPageSelected(pagination.pages)}
          disabled={pagination.next === 0}
        />
      )}
    </Pagination>
  );
};
