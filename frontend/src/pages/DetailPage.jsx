// THIS DETAILS THE SHOWING OF POSTS (.../posts/book-name)

import Badge from "@/ui_components/Badge";
import BookWriter from "@/ui_components/BookWriter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { deleteBook, getBook } from "@/services/apiBook";
import Spinner from "@/ui_components/Spinner";
import { BASE_URL } from "@/api";
import { HiPencilAlt } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import Modal from "@/ui_components/Modal";
import CreatePostPage from "./CreatePostPage";
import { useState } from "react";
import { toast } from "react-toastify";

const DetailPage = ({ username, isAuthenticated }) => {
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
    queryFn: () => getBook(slug),
  });

  const bookID = book?.id

  console.log(book);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBook(id),
    onSuccess: () => {
      toast.success("Your post has been deleted successfully!")
      navigate("/")
    },

    onError: (err) => {
      console.log(err)
      toast.error(err.message)
    }
  })

  function handleDeleteBook(){
    const popUp = window.confirm("Are you sure you want to delete this post?")
    if(!popUp){
      return;
    }

    deleteMutation.mutate(bookID)



  }

  

  if (isPending) {
    return <Spinner />;
  }

  return (
    <>
      <div className="padding-dx max-container py-9">
        <Badge book={book} />

        <div className="flex justify-between items-center gap-4">
          <h2 className="py-6 leading-normal text-2xl md:text-3xl text-[#181A2A] tracking-wide font-semibold dark:text-[#FFFFFF]">
            {book.title}
          </h2>

          {isAuthenticated && username === book.author.username && (
            <span className="flex justify-between items-center gap-2">
              <HiPencilAlt onClick={toggleModal} className="dark:text-white text-3xl cursor-pointer" />

              <MdDelete onClick={handleDeleteBook} className="dark:text-white text-3xl cursor-pointer" />
            </span>
          )}
        </div>

        <BookWriter book={book} />

        <div className="w-full h-[350px] my-9 overflow-hidden rounded-sm">
          <img
            className="w-full h-full object-cover rounded-sm"
            src={`${BASE_URL}${book.featured_image}`}
          />
        </div>
        <p className="text-[16px] leading-[2rem] text-justify text-[#3B3C4A] dark:text-[#BABABF]">
          {book.content}
        </p>
      </div>

     {showModal && <Modal toggleModal={toggleModal}> 
        <CreatePostPage book={book} />
      </Modal>}
    </>
  );
};

export default DetailPage;
