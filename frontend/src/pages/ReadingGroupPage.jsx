// THIS IS TRYING TO DETAIL THE SHOWING OF GROUPS (.../groups/group-name)

import Badge from "@/ui_components/Badge";
import BookWriter from "@/ui_components/BookWriter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { deleteReadingGroup, getReadingGroup } from "@/services/apiBook";
import Spinner from "@/ui_components/Spinner";
import { BASE_URL } from "@/api";
import { HiPencilAlt } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import Modal from "@/ui_components/Modal";
import CreatePostPage from "./CreatePostPage";
import { useState } from "react";
import { toast } from "react-toastify";

const ReadingGroupPage = ({ username, isAuthenticated }) => {
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
    data: reading_group,
  } = useQuery({
    queryKey: ["groups", slug],
    queryFn: () => getReadingGroup(slug),
  });

  const reading_groupID = reading_group?.id

  console.log(reading_group);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReadingGroup(id),
    onSuccess: () => {
      toast.success("Your group has been deleted successfully! I think?")  // REM
      navigate("/")
    },

    onError: (err) => {
      console.log(err)
      toast.error(err.message)
    }
  })

  function handleDeleteReadingGroup(){
    const popUp = window.confirm("Are you sure you want to delete this group? Haha group not post")  // REM
    if(!popUp){
      return;
    }

    deleteMutation.mutate(reading_groupID)



  }

  

  if (isPending) {
    return <Spinner />;
  }

  return (
    <>
      <div className="padding-dx max-container py-9">
        <Badge reading_group={reading_group} />

        <div className="flex justify-between items-center gap-4">
          <h2 className="py-6 leading-normal text-2xl md:text-3xl text-[#181A2A] tracking-wide font-semibold dark:text-[#FFFFFF]">
            {reading_group.name}
          </h2>

          {/* {isAuthenticated && username === reading_group.creator.username && (
            <span className="flex justify-between items-center gap-2">
              <HiPencilAlt onClick={toggleModal} className="dark:text-white text-3xl cursor-pointer" />

              <MdDelete onClick={handleDeleteReadingGroup} className="dark:text-white text-3xl cursor-pointer" />
            </span>
          )} */}
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

     {showModal && <Modal toggleModal={toggleModal}> 
        <CreatePostPage book={book} />
      </Modal>}
    </>
  );
};

export default ReadingGroupPage;
