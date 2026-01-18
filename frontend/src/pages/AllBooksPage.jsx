import { useState } from "react";
import { getReadingGroups } from "@/services/apiBook";
import ReadingGroupContainer from "@/ui_components/ReadingGroupContainer";
import PagePagination from "../ui_components/PagePagination";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";


const AllBooksPage = () => {
  const [page, setPage] = useState(1);
  const numOfBooksPerPage = 9;

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["books", page],
    queryFn: () => getReadingGroups(page),
    placeholderData: keepPreviousData,
  });

  const books = data?.results || [];
  console.log(books);
  const numOfPages = Math.ceil(data?.count / numOfBooksPerPage); // How to make the numOfBooksPerPage work here properly?
  console.log(numOfPages);
  console.log(page);
 

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
    <div className="padding-y  max-container">
      
      
        <div className="flex justify-around items-center gap-4">
          <h2 className="py-6 leading-normal text-2xl md:text-3xl text-[#181A2A] tracking-wide font-semibold dark:text-[#FFFFFF]">
            All books
          </h2>
          <Link to={`/create_book`} className="bg-[#4B6BFB] text-white py-3 px-6 rounded-md flex gap-2">
            Create book
          </Link>
        </div>
      <ReadingGroupContainer isPending={isPending} reading_groups={books} />
      <PagePagination
        increasePageValue={increasePageValue}
        decreasePageValue={decreasePageValue}
        page={page}
        numOfPages={numOfPages}
        handleSetPage={handleSetPage}
      />
    </div>
  );
};

export default AllBooksPage;
