import { useState } from "react";
import { getBooks } from "@/services/apiBook";
import BookContainer from "@/ui_components/BookContainer";
import Header from "@/ui_components/Header";
import PagePagination from "../ui_components/PagePagination";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const HomePage = () => {
  const [page, setPage] = useState(1);
  const numOfBooksPerPage = 3;

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["books", page],
    queryFn: () => getBooks(page),
    placeholderData: keepPreviousData,
  });

  const books = data?.results || [];
  const numOfPages = Math.ceil(data?.count / numOfBooksPerPage);

  function handleSetPage(val) {
    setPage(val);
  }

  function increasePageValue() {
    setPage((curr) => curr + 1);
  }

  function decreasePageValue() {
    setPage((curr) => curr - 1);
  }

  return (
    <>
      <Header />
      <BookContainer isPending={isPending} books={books} />
      <PagePagination
        increasePageValue={increasePageValue}
        decreasePageValue={decreasePageValue}
        page={page}
        numOfPages={numOfPages}
        handleSetPage={handleSetPage}
      />
    </>
  );
};

export default HomePage;
