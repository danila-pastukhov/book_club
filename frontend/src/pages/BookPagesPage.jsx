// THIS IS TRYING TO DETAIL THE SHOWING OF BOOK PAGES (.../groups/group-name)

// import Badge from "@/ui_components/Badge";
// import BookWriter from "@/ui_components/BookWriter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getBookPage } from "@/services/apiBook";
import Spinner from "@/ui_components/Spinner";
// import { BASE_URL } from "@/api";
// import { HiPencilAlt } from "react-icons/hi";
// import { MdDelete } from "react-icons/md";
// import Modal from "@/ui_components/Modal";
// import CreatePostPage from "./CreatePostPage";
import { useState } from "react";
// import { toast } from "react-toastify";
import { Link } from "react-router-dom";


const BookPagesPage = ({ username, isAuthenticated }) => {
  const { slug } = useParams();
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  function toggleModal(){
    setShowModal(curr => !curr)
  }

  const {
    isPending,
    isError,
    error,
    data: book,
  } = useQuery({
    queryKey: ["books", slug],
    queryFn: () => getBookPage(slug),
  });

  const bookID = book?.id

  console.log(book);




//   function handleDeleteReadingGroup(){
//     const popUp = window.confirm("Are you sure you want to delete this group? Haha group not post")  // REM
//     if(!popUp){
//       return;
//     }

//     deleteMutation.mutate(reading_groupID)



//   }
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 220; // Define how much text per page

  if (isPending) {
    return <Spinner />;
  }





  // Logic to split text into pages
  const words = book.content.split(' ');
  const totalPages = Math.ceil(words.length / wordsPerPage);
  
  const currentText = words
    .slice((currentPage - 1) * wordsPerPage, currentPage * wordsPerPage)
    .join(' ');

  return (
    <>
      <div className="padding-dx max-container py-6">
        <nav className="max-container padding-x py-6 flex justify-between items-center  gap-6 sticky top-0 z-10 bg-[#EEEEEE] dark:bg-[#141624]">
            <Link to="/" className="text-[#141624] text-2xl dark:text-[#FFFFFF]">
              Home
            </Link>
            <h2 className="text-[#141624] text-2xl dark:text-[#FFFFFF]">
              {book.title}
            </h2>
            <Link to="/" className="text-[#141624] text-2xl dark:text-[#FFFFFF]">
              Chapters
            </Link>
        </nav>

        <div className="column-container flex justify-between gap-4">
          <pre className="py-6 leading-normal text-2xl md:text-3xl text-[#181A2A] tracking-wide font-arial dark:text-[#FFFFFF]">
            {currentText}
          </pre>
        </div>

        

        {/* <BookWriter book={book} />  THESE BOOKS I HATE THEM

        <div className="w-full h-[350px] my-9 overflow-hidden rounded-sm">
          <img
            className="w-full h-full object-cover rounded-sm"
            src={`${BASE_URL}${book.featured_image}`}
          />
        </div>
        <p className="text-[16px] leading-[2rem] text-justify text-[#3B3C4A] dark:text-[#BABABF]">
          {book.content}
        </p> */}
      </div>
      <div className="padding-dx lower-buttons-container flex justify-between gap-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                Previous page
            </button>
            <span> Page {currentPage} of {totalPages} </span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                Next page
            </button>
          </div>

     {/* {showModal && <Modal toggleModal={toggleModal}> 
        <CreatePostPage book={book} />
      </Modal>} */}
    </>
  );
};

export default BookPagesPage;
